import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("medtech");

    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
      })),
    });
  } catch (error) {
    console.error("GET ADMIN PRODUCTS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

if (!token) {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const decoded: any = verifyToken(token);

if (decoded.role !== "admin") {
  return Response.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
    const body = await request.json();

    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const description = String(body.description || "").trim();
    const howToUse = String(body.howToUse || "").trim();

    const photos = Array.isArray(body.photos) ? body.photos : [];
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    const sizes = Array.isArray(body.sizes) ? body.sizes : [];

    const price = Number(body.price);
    const discountPercentage = Number(body.discountPercentage || 0);

    if (!name) {
      return Response.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        { error: "Product category is required" },
        { status: 400 }
      );
    }

    if (!description) {
      return Response.json(
        { error: "Product description is required" },
        { status: 400 }
      );
    }

    if (!howToUse) {
      return Response.json(
        { error: "How to use is required" },
        { status: 400 }
      );
    }

    if (photos.length === 0) {
      return Response.json(
        { error: "At least one product photo is required" },
        { status: 400 }
      );
    }

    if (Number.isNaN(price) || price <= 0) {
      return Response.json(
        { error: "Valid product price is required" },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(discountPercentage) ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      return Response.json(
        { error: "Discount percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (sizes.length === 0) {
      return Response.json(
        { error: "At least one size is required" },
        { status: 400 }
      );
    }

    const cleanSizes = sizes.map((item: any) => ({
      size: String(item.size || "").trim(),
      qty: Number(item.qty || 0),
    }));

    const hasInvalidSize = cleanSizes.some(
      (item: { size: string; qty: number }) =>
        !item.size || Number.isNaN(item.qty) || item.qty < 0
    );

    if (hasInvalidSize) {
      return Response.json(
        { error: "Each size must have valid size and quantity" },
        { status: 400 }
      );
    }

    const cleanIngredients = ingredients
      .map((item: any) => ({
        name: String(item.name || "").trim(),
        imageUrl: String(item.imageUrl || "").trim(),
      }))
      .filter(
        (item: { name: string; imageUrl: string }) =>
          item.name || item.imageUrl
      );

    const client = await clientPromise;
    const db = client.db("medtech");

    const result = await db.collection("products").insertOne({
      name,
      category,
      description,
      howToUse,
      photos,

      price,
      discountPercentage,

      ingredients: cleanIngredients,
      sizes: cleanSizes,

      isPromoted: false,
      promoDescription: "",

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({
      message: "Product added successfully",
      productId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("POST ADMIN PRODUCT ERROR:", error);

    return Response.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}