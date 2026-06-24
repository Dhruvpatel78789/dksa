import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      // For security, do not expose whether user exists or not
      return Response.json({
        success: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: tokenHash,
          resetPasswordExpires: expires,
        },
      }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/account?mode=reset&token=${token}&email=${encodeURIComponent(email)}`;

    const previewUrl = await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d8ce; border-radius: 14px;">
          <h2 style="color: #3a5a40;">Password Reset Request</h2>
          <p>You requested a password reset for your account. Please click the button below to reset your password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #3a5a40; color: white; padding: 14px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>This link is valid for 1 hour. If you did not make this request, you can safely ignore this email.</p>
          <p>Thanks,<br/>MedTech Support Team</p>
        </div>
      `,
    });

    return Response.json({
      success: true,
      message: previewUrl
        ? `Reset link generated: ${resetUrl} (Sent via Ethereal: ${previewUrl})`
        : "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return Response.json({ error: "Failed to send reset link" }, { status: 500 });
  }
}
