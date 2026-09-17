import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    if (decoded.role !== "admin") {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return Response.json({ error: "Invalid updates array" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const bulkOps = updates.map((update: any) => ({
      updateOne: {
        filter: { _id: new ObjectId(update.productId) },
        update: {
          $set: {
            isPromoted: Boolean(update.isPromoted),
            promoDescription: String(update.promoDescription || "").trim(),
            promoRating: Number(update.promoRating || 5.0),
            updatedAt: new Date(),
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await db.collection("products").bulkWrite(bulkOps);
      
      const { updateTag } = await import("next/cache");
      updateTag("products");
      updateTag("promotions");
    }

    return Response.json({ message: "Bulk promotion updated successfully" });
  } catch (error) {
    console.error("POST ADMIN BULK PROMOTE ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
