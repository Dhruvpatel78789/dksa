import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = String(body.code || "").trim().toUpperCase();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!code) {
      return Response.json({ error: "Coupon code is required" }, { status: 400 });
    }

    if (items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const coupon = await db.collection("discountCoupons").findOne({
      code,
      isActive: true,
    });

    if (!coupon) {
      return Response.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const now = new Date();

    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return Response.json({ error: "Coupon is not active yet" }, { status: 400 });
    }

    if (coupon.endsAt && new Date(coupon.endsAt) < now) {
      return Response.json({ error: "Coupon has expired" }, { status: 400 });
    }

    const eligibleItems =
      coupon.appliesTo === "selected"
        ? items.filter((item: any) => coupon.productIds?.includes(item.productId))
        : items;

    if (eligibleItems.length === 0) {
      return Response.json(
        { error: "Coupon is not applicable to these products" },
        { status: 400 }
      );
    }

    const eligibleTotal = eligibleItems.reduce((sum: number, item: any) => {
      const discountedPrice =
        Number(item.price || 0) -
        (Number(item.price || 0) * Number(item.discountPercentage || 0)) / 100;

      return sum + discountedPrice * Number(item.quantity || 1);
    }, 0);

    const discountAmount =
      coupon.discountType === "percentage"
        ? (eligibleTotal * Number(coupon.discountValue || 0)) / 100
        : Number(coupon.discountValue || 0);

    const finalDiscount = Math.min(discountAmount, eligibleTotal);

    return Response.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(finalDiscount),
      },
    });
  } catch (error) {
    console.error("VALIDATE COUPON ERROR:", error);

    return Response.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}