import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const existing = await db.collection("users").findOne({ email });

    if (existing) {
      return Response.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.collection("users").insertOne({
      name,
      email,
      passwordHash,
      role: "user",
      createdAt: new Date(),
    });

    const token = signToken({
      userId: result.insertedId.toString(),
      email,
      role: "user",
    });

    const response = Response.json({
      success: true,
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );

    return response;
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}