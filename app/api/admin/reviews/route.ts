import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("medtech");

    const reviews = await db
      .collection("reviews")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ reviews });
  } catch (error) {
    console.error("ADMIN GET REVIEWS ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

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
    const { name, review, mediaUrl, type, product } = body;

    if (!type || !["text", "image", "video"].includes(type)) {
      return Response.json({ error: "Invalid review type" }, { status: 400 });
    }

    if (type === "text" && (!name || !review)) {
      return Response.json(
        { error: "Name and review are required for text review" },
        { status: 400 }
      );
    }

    if ((type === "image" || type === "video") && !mediaUrl) {
      return Response.json(
        { error: "Media file is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    await db.collection("reviews").insertOne({
      name: type === "text" ? name.trim() : null,
      review: type === "text" ? review.trim() : null,
      product: product?.trim() || null,
      type,
      mediaUrl: mediaUrl || null,
      isSelectedForHome: false,
      createdAt: new Date(),
    });

    return Response.json({ message: "Review added successfully" });
  } catch (error) {
    console.error("ADMIN POST REVIEW ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}