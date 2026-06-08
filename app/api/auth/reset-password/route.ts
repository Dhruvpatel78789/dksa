import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const token = String(body.token || "");
    const password = String(body.password || "");

    if (!email || !token || !password) {
      return Response.json(
        { error: "Email, token, and new password are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return Response.json({ error: "Invalid request or user not found" }, { status: 400 });
    }

    // Verify token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (user.resetPasswordToken !== tokenHash) {
      return Response.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Verify expiration
    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
      return Response.json({ error: "Reset token has expired" }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password and clear reset fields
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      }
    );

    return Response.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return Response.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
