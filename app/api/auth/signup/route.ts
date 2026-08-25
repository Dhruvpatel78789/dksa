import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

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

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    const result = await db.collection("users").insertOne({
      name,
      email,
      passwordHash,
      role: "user",
      isEmailVerified: false,
      isPhoneVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
      createdAt: new Date(),
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d8ce; border-radius: 14px;">
          <h2 style="color: #3a5a40;">Welcome to MedTech!</h2>
          <p>Please verify your email address to secure your account and link your previous guest orders. Click the button below:</p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #3a5a40; color: white; padding: 14px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p>This link is valid for 24 hours.</p>
          <p>Thanks,<br/>MedTech Support Team</p>
        </div>
      `,
    }).catch((err: any) => console.error("Failed to send verification email on signup:", err));

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