import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid product id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const product = await db.collection("products").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
        name: 1,
        description: 1,
        howToUse: 1,
        photos: 1,
        ingredients: 1,
        sizes: 1,
        price: 1,
        category: 1,
        discountPercentage: 1,
      },
      }
    );

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({
      product: {
        ...product,
        _id: product._id.toString(),
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