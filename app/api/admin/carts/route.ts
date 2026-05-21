import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
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

    const client = await clientPromise;
    const db = client.db("medtech");

    const carts = await db
      .collection("carts")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return Response.json({
      carts: carts.map((cart) => ({
        ...cart,
        _id: cart._id.toString(),
      })),
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to fetch carts" },
      { status: 500 }
    );
  }
}