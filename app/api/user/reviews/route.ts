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
    const { name, review, product } = body;

    if (!name || !name.trim() || !review || !review.trim() || !product || !product.trim()) {
      return Response.json(
        { error: "Name, review text, and product are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    await db.collection("reviews").insertOne({
      name: name.trim(),
      review: review.trim(),
      product: product.trim(),
      type: "text",
      mediaUrl: null,
      isSelectedForHome: false,
      createdAt: new Date(),
    });

    return Response.json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("USER POST REVIEW ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}