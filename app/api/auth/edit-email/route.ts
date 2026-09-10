import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";
import { normalizeEmail } from "@/lib/normalize";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const body = await request.json();
    const newEmailInput = String(body.email || "").trim();

    if (!newEmailInput) {
      return Response.json({ error: "Email address is required" }, { status: 400 });
    }

    const emailNormalized = normalizeEmail(newEmailInput);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the email already belongs to another account
    const existingUser = await db.collection("users").findOne({
      email: emailNormalized,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return Response.json(
        { error: "This email is already associated with another account." },
        { status: 409 }
      );
    }

    // Generate token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          pendingEmail: emailNormalized,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: expires,
        },
      }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(emailNormalized)}`;

    const previewUrl = await sendEmail({
      to: emailNormalized,
      subject: "Verify Your New Email Address",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d8ce; border-radius: 14px;">
          <h2 style="color: #3a5a40;">Email Change Request</h2>
          <p>Please verify your new email address to complete the change. Click the button below:</p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #3a5a40; color: white; padding: 14px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">Verify New Email</a>
          </div>
          <p>This link is valid for 24 hours. If you did not make this request, you can safely ignore this email.</p>
          <p>Thanks,<br/>MedTech Support Team</p>
        </div>
      `,
    });

    return Response.json({
      success: true,
      message: previewUrl
        ? `Verification link generated: ${verifyUrl} (Sent via Ethereal: ${previewUrl})`
        : "Verification email has been sent to the new email address.",
    });
  } catch (error) {
    console.error("EDIT EMAIL ERROR:", error);
    return Response.json({ error: "Failed to request email change" }, { status: 500 });
  }
}
