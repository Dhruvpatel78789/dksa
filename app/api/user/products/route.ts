import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("medtech");

    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .project({
        name: 1,
        description: 1,
        howToUse: 1,
        photos: 1,
        ingredients: 1,
        sizes: 1,
        price: 1,
        category: 1,
        discountPercentage: 1,
      })
      .toArray();

    return Response.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
      })),
    });
  } catch (error) {
    console.error("GET USER PRODUCTS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}