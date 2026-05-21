import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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

    const body = await request.json();

    const items = Array.isArray(body.items)
      ? body.items
      : [];

    const client = await clientPromise;
    const db = client.db("medtech");

    await db.collection("carts").updateOne(
      {
        userId: decoded.userId,
      },
      {
        $set: {
          items,
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}