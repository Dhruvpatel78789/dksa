import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("medtech");

    const products = await db
      .collection("products")
      .find({ isPromoted: true })
      .sort({ updatedAt: -1 })
      .project({
        name: 1,
        photos: 1,
        promoDescription: 1,
        promoRating: 1,
      })
      .toArray();

    return Response.json({
      promotions: products.map((product) => ({
        _id: product._id.toString(),
        name: product.name,
        image: product.photos?.[0] || "",
        promoDescription: product.promoDescription || "",
        promoRating: product.promoRating || 5.0,
      })),
    });
  } catch (error) {
    console.error("GET USER PROMOTIONS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}