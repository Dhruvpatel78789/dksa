import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import crypto from "crypto";

type CartItem = {
  productId: string;
  name: string;
  photo: string;
  price: number;
  discountPercentage: number;
  discountedPrice?: number;
  quantity: number;
  size: string;
  addedAt: Date;
};

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    let userId: string | null = null;

    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.userId;
      } catch (err) {
        // Ignore and treat as guest
      }
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    if (userId) {
      const cart = await db.collection("carts").findOne({
        userId,
      });

      return Response.json({
        items: cart?.items || [],
      });
    } else {
      const guestCartId = (await cookies()).get("guest_cart_id")?.value;
      if (!guestCartId) {
        return Response.json({ items: [] });
      }

      const cart = await db.collection("carts").findOne({
        guestCartId,
      });

      return Response.json({
        items: cart?.items || [],
      });
    }
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return Response.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    let userId: string | null = null;
    let guestCartId: string | null = null;
    let newGuestCartSet = false;

    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.userId;
      } catch (err) {
        // Ignore and treat as guest
      }
    }

    if (!userId) {
      guestCartId = (await cookies()).get("guest_cart_id")?.value;
      if (!guestCartId) {
        guestCartId = crypto.randomUUID();
        newGuestCartSet = true;
      }
    }

    const body = await request.json();

    const productId = String(body.productId || "");
    const quantity = Number(body.quantity || 1);
    const size = String(body.size || "");

    if (!ObjectId.isValid(productId)) {
      return Response.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      return Response.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const product = await db.collection("products").findOne({
      _id: new ObjectId(productId),
    });

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const query = userId ? { userId } : { guestCartId };
    const existingCart = await db.collection("carts").findOne(query);

    const items: CartItem[] = Array.isArray(existingCart?.items)
      ? existingCart.items
      : [];

    const existingIndex = items.findIndex(
      (item) => item.productId === productId && item.size === size
    );

    const selectedSizeObj = product.sizes?.find((s: any) => s.size === size);
    const targetQuantity = existingIndex >= 0 ? items[existingIndex].quantity + quantity : quantity;
    
    if (selectedSizeObj && selectedSizeObj.qty < targetQuantity) {
      return Response.json(
        { error: `Insufficient stock. Only ${selectedSizeObj.qty} items left for size ${size}.` },
        { status: 400 }
      );
    }

    const itemPrice = selectedSizeObj && selectedSizeObj.price !== undefined
      ? Number(selectedSizeObj.price)
      : Number(product.price || 0);

    let itemDiscountedPrice = itemPrice;
    if (selectedSizeObj) {
      if (selectedSizeObj.discountedPrice !== undefined) {
        itemDiscountedPrice = Number(selectedSizeObj.discountedPrice);
      } else if (product.discountPercentage) {
        itemDiscountedPrice = itemPrice - (itemPrice * Number(product.discountPercentage)) / 100;
      }
    } else {
      if (product.discountedPrice !== undefined && Number(product.discountedPrice) > 0) {
        itemDiscountedPrice = Number(product.discountedPrice);
      } else if (product.discountPercentage) {
        itemDiscountedPrice = itemPrice - (itemPrice * Number(product.discountPercentage)) / 100;
      }
    }

    if (existingIndex >= 0) {
      items[existingIndex].quantity = targetQuantity;
      items[existingIndex].price = itemPrice;
      items[existingIndex].discountedPrice = itemDiscountedPrice;
    } else {
      items.push({
        productId,
        name: String(product.name || ""),
        photo: product.photos?.[0] || "",
        price: itemPrice,
        discountPercentage: Number(product.discountPercentage || 0),
        discountedPrice: itemDiscountedPrice,
        quantity,
        size,
        addedAt: new Date(),
      });
    }

    const updateFields: any = {
      items,
      updatedAt: new Date(),
    };
    if (userId) {
      updateFields.userId = userId;
    } else {
      updateFields.guestCartId = guestCartId;
    }

    await db.collection("carts").updateOne(
      query,
      {
        $set: updateFields,
      },
      {
        upsert: true,
      }
    );

    const response = Response.json({
      success: true,
      items,
    });

    if (newGuestCartSet && guestCartId) {
      response.headers.set(
        "Set-Cookie",
        `guest_cart_id=${guestCartId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      );
    }

    return response;
  } catch (error) {
    console.error("POST CART ERROR:", error);

    return Response.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}