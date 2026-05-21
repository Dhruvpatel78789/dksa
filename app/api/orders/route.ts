import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ orders: [] }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const client = await clientPromise;
    const db = client.db("medtech");

    const orders = await db
      .collection("orders")
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
      })),
    });
  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
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

    const subtotal = items.reduce((sum: number, item: any) => {
  const discountedPrice =
    item.price - (item.price * (item.discountPercentage || 0)) / 100;

  return sum + discountedPrice * item.quantity;
}, 0);

let safeDiscountAmount = 0;

if (discountCode) {
  const coupon = await db.collection("discountCoupons").findOne({
    code: discountCode,
    isActive: true,
  });

  if (!coupon) {
    return Response.json(
      { error: "Invalid coupon code" },
      { status: 400 }
    );
  }

  const now = new Date();

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return Response.json(
      { error: "Coupon is not active yet" },
      { status: 400 }
    );
  }

  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    return Response.json(
      { error: "Coupon has expired" },
      { status: 400 }
    );
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
      item.price - (item.price * (item.discountPercentage || 0)) / 100;

    return sum + discountedPrice * item.quantity;
  }, 0);

  const rawDiscount =
    coupon.discountType === "percentage"
      ? (eligibleTotal * Number(coupon.discountValue || 0)) / 100
      : Number(coupon.discountValue || 0);

  safeDiscountAmount = Math.round(Math.min(rawDiscount, eligibleTotal));
}

const total = Math.max(0, subtotal - safeDiscountAmount);

    const result = await db.collection("orders").insertOne({
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

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection("carts").updateOne(
      { userId: decoded.userId },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({
      success: true,
      orderId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}