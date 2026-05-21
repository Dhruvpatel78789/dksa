import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
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
    const { selectedIds } = await req.json();

    if (!Array.isArray(selectedIds)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    if (selectedIds.length > 10) {
      return Response.json(
        { error: "Max 10 reviews allowed" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");
    const collection = db.collection("reviews");

    await collection.updateMany({}, { $set: { isSelectedForHome: false } });

    await collection.updateMany(
      { _id: { $in: selectedIds.map((id) => new ObjectId(id)) } },
      { $set: { isSelectedForHome: true } }
    );

    return Response.json({ message: "Updated successfully" });
  } catch (error) {
    console.error("SELECT REVIEWS ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}