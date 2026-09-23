import clientPromise from "@/lib/mongodb";
import { slugify } from "@/lib/normalize";
import { cacheLife, cacheTag } from "next/cache";

async function getCachedProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const client = await clientPromise;
  const db = client.db("medtech");

  return await db
    .collection("products")
    .find({})
    .sort({ createdAt: -1 })
    .project({
      name: 1,
      slug: 1,
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
}

export async function GET() {
  try {
    const products = await getCachedProducts();

    return Response.json(
      {
        products: products.map((product) => ({
          ...product,
          _id: product._id.toString(),
          slug: product.slug || slugify(product.name || ""),
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("GET USER PRODUCTS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}