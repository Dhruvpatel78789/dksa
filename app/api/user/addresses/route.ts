import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ addresses: [] }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const client = await clientPromise;
    const db = client.db("medtech");

    const addresses = await db
      .collection("addresses")
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      addresses: addresses.map((address) => ({
        ...address,
        _id: address._id.toString(),
      })),
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

    return Response.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const line1 = String(body.line1 || "").trim();
    const line2 = String(body.line2 || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const pincode = String(body.pincode || "").trim();

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      return Response.json(
        { error: "Required address fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const result = await db.collection("addresses").insertOne({
      userId: decoded.userId,
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({
      success: true,
      addressId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("POST ADDRESS ERROR:", error);

    return Response.json(
      { error: "Failed to save address" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid address id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    await db.collection("addresses").deleteOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return Response.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}