import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
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

    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

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
    console.error("GET ADMIN PRODUCT ERROR:", error);

    return Response.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) {
      updateData.name = String(body.name || "").trim();
    }
    if (body.category !== undefined) {
      updateData.category = String(body.category || "").trim();
    }
    if (body.description !== undefined) {
      updateData.description = String(body.description || "").trim();
    }

    if (body.howToUse !== undefined) {
      updateData.howToUse = String(body.howToUse || "").trim();
    }

    if (body.photos !== undefined) {
      updateData.photos = Array.isArray(body.photos) ? body.photos : [];
    }

    if (body.price !== undefined || body.discountedPrice !== undefined || body.sizes !== undefined) {
      const sizes = Array.isArray(body.sizes) ? body.sizes : [];
      const cleanSizes = sizes.map((item: any) => ({
        size: String(item.size || "").trim(),
        qty: Number(item.qty || 0),
        price: Number(item.price || 0),
        discountedPrice: Number(item.discountedPrice || 0),
      })).filter((item: any) => item.size);

      if (cleanSizes.length > 0) {
        const hasInvalidSize = cleanSizes.some(
          (item: { size: string; qty: number; price: number; discountedPrice: number }) =>
            !item.size || Number.isNaN(item.qty) || item.qty < 0 || Number.isNaN(item.price) || item.price <= 0 || Number.isNaN(item.discountedPrice) || item.discountedPrice <= 0 || item.discountedPrice > item.price
        );

        if (hasInvalidSize) {
          return Response.json(
            { error: "Each size must have valid size, quantity, original price, and discounted price (which cannot exceed the original price)" },
            { status: 400 }
          );
        }

        updateData.sizes = cleanSizes;
        updateData.price = 0;
        updateData.discountedPrice = 0;
      } else {
        const price = Number(body.price || 0);
        const discountedPrice = Number(body.discountedPrice || 0);

        if (Number.isNaN(price) || price <= 0) {
          return Response.json(
            { error: "Valid product original price is required when no sizes are defined" },
            { status: 400 }
          );
        }
        if (Number.isNaN(discountedPrice) || discountedPrice <= 0 || discountedPrice > price) {
          return Response.json(
            { error: "Valid product discounted price is required and cannot exceed original price" },
            { status: 400 }
          );
        }

        updateData.sizes = [];
        updateData.price = price;
        updateData.discountedPrice = discountedPrice;
      }
    }

    if (body.ingredients !== undefined) {
      updateData.ingredients = Array.isArray(body.ingredients)
        ? body.ingredients.map((item: any) => ({
            name: String(item.name || "").trim(),
            imageUrl: String(item.imageUrl || "").trim(),
          }))
        : [];
    }

    if (body.discountPercentage !== undefined) {
      updateData.discountPercentage = Number(body.discountPercentage || 0);
    }

    if (body.isPromoted !== undefined) {
      updateData.isPromoted = Boolean(body.isPromoted);
    }

    if (body.promoDescription !== undefined) {
      updateData.promoDescription = String(body.promoDescription || "").trim();
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("PATCH ADMIN PRODUCT ERROR:", error);

    return Response.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid product id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADMIN PRODUCT ERROR:", error);

    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}