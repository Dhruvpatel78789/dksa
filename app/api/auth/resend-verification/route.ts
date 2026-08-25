import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function POST() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return Response.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: expires,
        },
      }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    const previewUrl = await sendEmail({
      to: user.email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d8ce; border-radius: 14px;">
          <h2 style="color: #3a5a40;">Verify Your Email Address</h2>
          <p>Please verify your email address to secure your account and link your previous guest orders. Click the button below:</p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #3a5a40; color: white; padding: 14px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p>This link is valid for 24 hours.</p>
          <p>Thanks,<br/>MedTech Support Team</p>
        </div>
      `,
    });

    return Response.json({
      success: true,
      message: previewUrl
        ? `Verification link generated: ${verifyUrl} (Sent via Ethereal: ${previewUrl})`
        : "Verification link has been sent to your email.",
    });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);
    return Response.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
