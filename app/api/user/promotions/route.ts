import clientPromise from "@/lib/mongodb";
import { cacheLife, cacheTag } from "next/cache";

async function getCachedPromotions() {
  "use cache";
  cacheLife("hours");
  cacheTag("promotions");

  const client = await clientPromise;
  const db = client.db("medtech");

  return await db
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
}

export async function GET() {
  try {
    const products = await getCachedPromotions();

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