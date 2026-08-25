import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { normalizeEmail, normalizePhone } from "@/lib/normalize";

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
    let userId: string | null = null;
    let user: any = null;

    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.userId;
      } catch (err) {
        // treat as guest
      }
    }

    const body = await request.json();

    const address = body.address;
    const discountCode = String(body.discountCode || "").trim().toUpperCase();

    if (!address) {
      return Response.json({ error: "Address is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    // Guest vs. Logged in customer checks
    if (userId) {
      user = await db.collection("users").findOne({
        _id: new ObjectId(userId),
      });

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      // Backend validation of guest fields
      const { fullName, email, phone, line1, city, state, pincode } = address;
      if (!fullName || !String(fullName).trim()) {
        return Response.json({ error: "Full Name is required" }, { status: 400 });
      }
      if (!email || !String(email).trim()) {
        return Response.json({ error: "Email is required" }, { status: 400 });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email).trim())) {
        return Response.json({ error: "Invalid email format" }, { status: 400 });
      }
      if (!phone || !String(phone).trim()) {
        return Response.json({ error: "Phone number is required" }, { status: 400 });
      }
      if (!line1 || !String(line1).trim()) {
        return Response.json({ error: "Address Line 1 is required" }, { status: 400 });
      }
      if (!city || !String(city).trim()) {
        return Response.json({ error: "City is required" }, { status: 400 });
      }
      if (!state || !String(state).trim()) {
        return Response.json({ error: "State is required" }, { status: 400 });
      }
      if (!pincode || !String(pincode).trim()) {
        return Response.json({ error: "Pincode is required" }, { status: 400 });
      }
    }

    let cart = null;
    let guestCartId: string | null = null;

    if (userId) {
      cart = await db.collection("carts").findOne({
        userId,
      });
    } else {
      guestCartId = (await cookies()).get("guest_cart_id")?.value || null;
      if (!guestCartId) {
        return Response.json({ error: "Cart is empty" }, { status: 400 });
      }
      cart = await db.collection("carts").findOne({
        guestCartId,
      });
    }

    const items = cart?.items || [];

    if (items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
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

    const isGuestOrder = !userId;
    const customerEmail = userId ? user.email : address.email;
    const customerName = userId ? user.name : address.fullName;
    const customerPhone = address.phone;

    const emailNormalized = normalizeEmail(customerEmail);
    const phoneNormalized = normalizePhone(customerPhone);

    const customer = {
      name: customerName,
      email: customerEmail,
      emailNormalized,
      phone: customerPhone,
      phoneNormalized,
    };

    const shippingAddress = {
      name: address.fullName || address.name || customerName,
      phone: address.phone || customerPhone,
      addressLine1: address.line1 || address.addressLine1 || "",
      addressLine2: address.line2 || address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    };

    const result = await db.collection("orders").insertOne({
      userId: userId || null,
      guestCartId: userId ? null : guestCartId,
      isGuestOrder,
      customer,
      shippingAddress,

      userName: customerName || "",
      userEmail: customerEmail || "",

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

    const cartQuery = userId ? { userId } : { guestCartId };
    await db.collection("carts").updateOne(
      cartQuery,
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