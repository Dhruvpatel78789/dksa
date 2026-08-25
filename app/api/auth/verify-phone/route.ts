import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { normalizePhone, normalizeEmail } from "@/lib/normalize";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const body = await request.json();
    const action = String(body.action || "");

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "request") {
      const phoneInput = String(body.phone || "").trim();
      if (!phoneInput) {
        return Response.json({ error: "Phone number is required" }, { status: 400 });
      }

      const phoneNormalized = normalizePhone(phoneInput);

      // Generate a 6-digit verification code
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            tempPhone: phoneNormalized,
            phoneVerificationCode: code,
            phoneVerificationExpires: expires,
          },
        }
      );

      console.log("\n=========================================");
      console.log(`PHONE VERIFICATION CODE (MOCK SMS):`);
      console.log(`To: ${phoneNormalized}`);
      console.log(`Code: ${code}`);
      console.log("=========================================\n");

      return Response.json({
        success: true,
        message: `OTP sent successfully. (Testing Code: ${code})`,
      });
    }

    if (action === "verify") {
      const codeInput = String(body.code || "").trim();

      if (!codeInput) {
        return Response.json({ error: "Verification code is required" }, { status: 400 });
      }

      if (user.phoneVerificationCode !== codeInput) {
        return Response.json({ error: "Invalid verification code" }, { status: 400 });
      }

      if (user.phoneVerificationExpires && new Date(user.phoneVerificationExpires) < new Date()) {
        return Response.json({ error: "Verification code has expired" }, { status: 400 });
      }

      const verifiedPhone = user.tempPhone;

      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            phone: verifiedPhone,
            isPhoneVerified: true,
            phoneVerifiedAt: new Date(),
          },
          $unset: {
            tempPhone: "",
            phoneVerificationCode: "",
            phoneVerificationExpires: "",
          },
        }
      );

      // Link previous guest orders matching verified phone (or verified email if email is verified)
      const verifiedEmail = user.isEmailVerified ? normalizeEmail(user.email) : null;

      const guestOrders = await db
        .collection("orders")
        .find({
          userId: null,
          isGuestOrder: true,
          $or: [
            { "customer.phoneNormalized": verifiedPhone },
            ...(verifiedEmail ? [{ "customer.emailNormalized": verifiedEmail }] : []),
          ],
        })
        .toArray();

      // Enforce the conservative identity conflict resolution rule
      const ordersToLink = guestOrders.filter((order: any) => {
        // Check for email conflict
        if (verifiedEmail && order.customer?.emailNormalized) {
          if (order.customer.emailNormalized !== verifiedEmail) {
            return false; // conflict (different email)
          }
        }
        // Check for phone conflict
        if (verifiedPhone && order.customer?.phoneNormalized) {
          if (order.customer.phoneNormalized !== verifiedPhone) {
            return false; // conflict (different phone)
          }
        }
        return true;
      });

      if (ordersToLink.length > 0) {
        const orderIds = ordersToLink.map((o: any) => o._id);
        await db.collection("orders").updateMany(
          { _id: { $in: orderIds } },
          {
            $set: {
              userId: user._id.toString(),
              isGuestOrder: false,
              updatedAt: new Date(),
            },
          }
        );
      }

      return Response.json({
        success: true,
        message: "Phone number verified successfully! Previous orders have been linked.",
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("VERIFY PHONE ERROR:", error);
    return Response.json({ error: "Failed to process verification" }, { status: 500 });
  }
}
