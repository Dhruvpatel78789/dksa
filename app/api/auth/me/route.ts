import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ user: null });
    }

    const decoded: any = verifyToken(token);

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne(
      {
        _id: new ObjectId(decoded.userId),
      },
      {
        projection: {
          passwordHash: 0,
        },
      }
    );

    if (!user) {
      return Response.json({ user: null });
    }

    return Response.json({
      user: {
        ...user,
        _id: user._id.toString(),
      },
    });
  } catch {
    return Response.json({ user: null });
  }
}