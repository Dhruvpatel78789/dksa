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

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (Number.isNaN(price) || price <= 0) {
        return Response.json(
          { error: "Valid product price is required" },
          { status: 400 }
        );
      }

      updateData.price = price;
    }

    if (body.discountPercentage !== undefined) {
      const discountPercentage = Number(body.discountPercentage || 0);

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

      updateData.discountPercentage = discountPercentage;
    }

    if (body.ingredients !== undefined) {
      updateData.ingredients = Array.isArray(body.ingredients)
        ? body.ingredients.map((item: any) => ({
            name: String(item.name || "").trim(),
            imageUrl: String(item.imageUrl || "").trim(),
          }))
        : [];
    }

    if (body.sizes !== undefined) {
      updateData.sizes = Array.isArray(body.sizes)
        ? body.sizes.map((item: any) => ({
            size: String(item.size || "").trim(),
            qty: Number(item.qty || 0),
          }))
        : [];
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