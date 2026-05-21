import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("medtech");

    const discounts = await db
      .collection("discountCoupons")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      discounts: discounts.map((discount) => ({
        ...discount,
        _id: discount._id.toString(),
      })),
    });
  } catch (error) {
    console.error("GET DISCOUNTS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = String(body.code || "").trim().toUpperCase();
    const discountType = body.discountType;
    const discountValue = Number(body.discountValue);
    const appliesTo = body.appliesTo || "all";
    const productIds = Array.isArray(body.productIds) ? body.productIds : [];

    if (!code) {
      return Response.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (discountType !== "percentage" && discountType !== "fixed") {
      return Response.json(
        { error: "Invalid discount type" },
        { status: 400 }
      );
    }

    if (Number.isNaN(discountValue) || discountValue <= 0) {
      return Response.json(
        { error: "Valid discount value is required" },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && discountValue > 100) {
      return Response.json(
        { error: "Percentage discount cannot exceed 100" },
        { status: 400 }
      );
    }

    if (appliesTo !== "all" && appliesTo !== "selected") {
      return Response.json(
        { error: "Invalid coupon application setting" },
        { status: 400 }
      );
    }

    if (appliesTo === "selected" && productIds.length === 0) {
      return Response.json(
        { error: "Select at least one product for this coupon" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const existingCoupon = await db.collection("discountCoupons").findOne({
      code,
    });

    if (existingCoupon) {
      return Response.json(
        { error: "Coupon code already exists" },
        { status: 409 }
      );
    }

    const result = await db.collection("discountCoupons").insertOne({
      code,
      discountType,
      discountValue,
      appliesTo,
      productIds,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({
      message: "Coupon created successfully",
      discountId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("POST DISCOUNT ERROR:", error);

    return Response.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}