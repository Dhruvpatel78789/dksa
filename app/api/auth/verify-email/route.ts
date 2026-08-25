import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { normalizeEmail, normalizePhone } from "@/lib/normalize";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account?error=Invalid+verification+request`
      );
    }

    const emailNormalized = normalizeEmail(email);

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne({
      email: emailNormalized,
      emailVerificationToken: token,
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account?error=Invalid+or+expired+verification+token`
      );
    }

    if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account?error=Verification+token+has+expired`
      );
    }

    // Mark email as verified
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: "",
        },
      }
    );

    // Link previous guest orders matching verified email
    // Fetch all guest orders matching normalized email or phone
    const verifiedEmail = emailNormalized;
    const verifiedPhone = user.isPhoneVerified ? normalizePhone(user.phone || "") : null;

    const guestOrders = await db
      .collection("orders")
      .find({
        userId: null,
        isGuestOrder: true,
        $or: [
          { "customer.emailNormalized": verifiedEmail },
          ...(verifiedPhone ? [{ "customer.phoneNormalized": verifiedPhone }] : []),
        ],
      })
      .toArray();

    // Filter out orders with identity conflicts
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

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/account?verified=email`
    );
  } catch (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/account?error=Server+error+during+verification`
    );
  }
}
