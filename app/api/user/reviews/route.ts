import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get("product");

    const client = await clientPromise;
    const db = client.db("medtech");

    const query = product
      ? {
          product: {
            $regex: `^${product}$`,
            $options: "i",
          },
        }
      : { isSelectedForHome: true };

    const reviews = await db
      .collection("reviews")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(product ? 30 : 10)
      .project({
        name: 1,
        review: 1,
        type: 1,
        mediaUrl: 1,
        product: 1,
        createdAt: 1,
      })
      .toArray();

    return Response.json({
      reviews: reviews.map((review) => ({
        ...review,
        _id: review._id.toString(),
      })),
    });
  } catch (error) {
    console.error("USER GET REVIEWS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, review, product, type, mediaUrl } = body;

    const reviewType = type || "text";
    if (!["text", "image", "video"].includes(reviewType)) {
      return Response.json({ error: "Invalid review type" }, { status: 400 });
    }

    if (!product || !product.trim()) {
      return Response.json({ error: "Product name is required" }, { status: 400 });
    }

    if (reviewType === "text" && (!name || !name.trim() || !review || !review.trim())) {
      return Response.json(
        { error: "Name and review text are required for text reviews." },
        { status: 400 }
      );
    }

    if ((reviewType === "image" || reviewType === "video") && !mediaUrl) {
      return Response.json(
        { error: "Media URL is required for image or video reviews." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    await db.collection("reviews").insertOne({
      name: name?.trim() || null,
      review: review?.trim() || null,
      product: product.trim(),
      type: reviewType,
      mediaUrl: mediaUrl || null,
      isSelectedForHome: false,
      createdAt: new Date(),
    });

    return Response.json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("USER POST REVIEW ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}