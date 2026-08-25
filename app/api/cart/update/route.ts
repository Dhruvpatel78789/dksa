import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    let userId: string | null = null;
    let guestCartId: string | null = null;

    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.userId;
      } catch (err) {
        // treat as guest
      }
    }

    if (!userId) {
      guestCartId = (await cookies()).get("guest_cart_id")?.value || null;
      if (!guestCartId) {
        return Response.json(
          { error: "Guest cart not found" },
          { status: 404 }
        );
      }
    }

    const body = await request.json();

    const items = Array.isArray(body.items)
      ? body.items
      : [];

    const client = await clientPromise;
    const db = client.db("medtech");

    const query = userId ? { userId } : { guestCartId };
    const updateObj = userId ? { userId, items, updatedAt: new Date() } : { guestCartId, items, updatedAt: new Date() };

    await db.collection("carts").updateOne(
      query,
      {
        $set: updateObj,
      },
      {
        upsert: true,
      }
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}