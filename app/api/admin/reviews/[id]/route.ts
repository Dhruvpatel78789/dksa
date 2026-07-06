import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: Params) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (decoded.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const result = await db.collection("reviews").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return Response.json({ error: "Review not found" }, { status: 404 });
    }

    return Response.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}