import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

function generatePayUHash({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  salt,
}: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
}) {
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

  return crypto.createHash("sha512").update(hashString).digest("hex");
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const body = await request.json();

    const address = body.address;
    const discountCode = String(body.discountCode || "").trim().toUpperCase();

    if (!address) {
      return Response.json({ error: "Address is required" }, { status: 400 });
    }

    const key = process.env.PAYU_KEY!;
    const salt = process.env.PAYU_SALT!;
    const payuUrl = process.env.PAYU_BASE_URL!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (!key || !salt || !payuUrl || !appUrl) {
      return Response.json(
        { error: "PayU environment variables missing" },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const cart = await db.collection("carts").findOne({
      userId: decoded.userId,
    });

    const items = cart?.items || [];

    if (items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate stock availability for each item in the cart before initiating payment
    for (const item of items) {
      if (!ObjectId.isValid(item.productId)) {
        return Response.json({ error: `Invalid product id for ${item.name}` }, { status: 400 });
      }
      const dbProduct = await db.collection("products").findOne({
        _id: new ObjectId(item.productId),
      });
      if (!dbProduct) {
        return Response.json({ error: `Product ${item.name} not found` }, { status: 400 });
      }
      const sizeObj = dbProduct.sizes?.find((s: any) => s.size === item.size);
      if (!sizeObj) {
        return Response.json(
          { error: `Size ${item.size} not found for product ${item.name}` },
          { status: 400 }
        );
      }
      if (sizeObj.qty < item.quantity) {
        return Response.json(
          { error: `Insufficient stock for ${item.name} (Size: ${item.size}). Only ${sizeObj.qty} items left.` },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      const discountedPrice =
        item.discountedPrice !== undefined
          ? item.discountedPrice
          : item.price - (item.price * (item.discountPercentage || 0)) / 100;

      return sum + discountedPrice * item.quantity;
    }, 0);

    let safeDiscountAmount = 0;

    if (discountCode) {
      const coupon = await db.collection("discountCoupons").findOne({
        code: discountCode,
        isActive: true,
      });

      if (!coupon) {
        return Response.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      const now = new Date();

      if (coupon.startsAt && new Date(coupon.startsAt) > now) {
        return Response.json(
          { error: "Coupon is not active yet" },
          { status: 400 }
        );
      }

      if (coupon.endsAt && new Date(coupon.endsAt) < now) {
        return Response.json({ error: "Coupon has expired" }, { status: 400 });
      }

      const eligibleItems =
        coupon.appliesTo === "selected"
          ? items.filter((item: any) =>
              coupon.productIds?.includes(item.productId)
            )
          : items;

      if (eligibleItems.length === 0) {
        return Response.json(
          { error: "Coupon is not applicable to this cart" },
          { status: 400 }
        );
      }

      const eligibleTotal = eligibleItems.reduce((sum: number, item: any) => {
        const discountedPrice =
          item.discountedPrice !== undefined
            ? item.discountedPrice
            : item.price - (item.price * (item.discountPercentage || 0)) / 100;

        return sum + discountedPrice * item.quantity;
      }, 0);

      const rawDiscount =
        coupon.discountType === "percentage"
          ? (eligibleTotal * Number(coupon.discountValue || 0)) / 100
          : Number(coupon.discountValue || 0);

      safeDiscountAmount = Math.round(Math.min(rawDiscount, eligibleTotal));
    }

    const total = Math.max(0, subtotal - safeDiscountAmount);
    const amount = total.toFixed(2);

    const orderResult = await db.collection("orders").insertOne({
      userId: decoded.userId,
      userName: user.name || "",
      userEmail: user.email || "",

      items,
      address,

      subtotal,
      discountCode,
      discountAmount: safeDiscountAmount,
      total,

      paymentStatus: "pending",
      orderStatus: "created",

      shipment: {
        courierName: "",
        trackingId: "",
        trackingUrl: "",
        note: "",
      },

      paymentGateway: "payu",
      payuTxnId: "",

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const orderId = orderResult.insertedId.toString();
    const txnid = `ORD${orderId}`;

    await db.collection("orders").updateOne(
      { _id: orderResult.insertedId },
      {
        $set: {
          payuTxnId: txnid,
          updatedAt: new Date(),
        },
      }
    );

    const productinfo = items.map((item: any) => item.name).join(", ");
    const firstname = user.name || address.fullName || "Customer";
    const email = user.email || "customer@example.com";
    const phone = address.phone || "9999999999";

    const hash = generatePayUHash({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      salt,
    });

    const payuPayload = {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${appUrl}/api/payments/payu/success`,
      furl: `${appUrl}/api/payments/payu/failure`,
      hash,
      service_provider: "payu_paisa",
    };

    return Response.json({
      success: true,
      payuUrl,
      payload: payuPayload,
      orderId,
    });
  } catch (error) {
    console.error("PAYU INITIATE ERROR:", error);

    return Response.json(
      { error: "Failed to initiate PayU payment" },
      { status: 500 }
    );
  }
}