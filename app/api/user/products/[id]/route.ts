import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { slugify } from "@/lib/normalize";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    const client = await clientPromise;
    const db = client.db("medtech");

    let query: any = { slug: decodedId };

    if (ObjectId.isValid(decodedId)) {
      query = {
        $or: [{ _id: new ObjectId(decodedId) }, { slug: decodedId }],
      };
    }

    let product = await db.collection("products").findOne(query, {
      projection: {
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
      },
    });

    if (!product) {
      // Fallback: search all products for matching slugified name
      const allProducts = await db.collection("products").find({}).toArray();
      product = allProducts.find(
        (p) => p.slug === decodedId || slugify(p.name || "") === decodedId
      ) || null;
    }

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const computedSlug = product.slug || slugify(product.name || "");

    return Response.json({
      product: {
        ...product,
        _id: product._id.toString(),
        slug: computedSlug,
      },
    });
  } catch (error) {
    console.error("GET USER PRODUCT ERROR:", error);

    return Response.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}