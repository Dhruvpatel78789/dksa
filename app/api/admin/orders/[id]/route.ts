import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    if (decoded.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid order id" }, { status: 400 });
    }

    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date(),
    };

    const allowedPaymentStatuses = ["pending", "confirmed", "rejected"];
    const allowedOrderStatuses = [
      "created",
      "ordered",
      "shipping",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (body.paymentStatus !== undefined) {
      if (!allowedPaymentStatuses.includes(body.paymentStatus)) {
        return Response.json(
          { error: "Invalid payment status" },
          { status: 400 }
        );
      }

      updateData.paymentStatus = body.paymentStatus;
    }

    if (body.orderStatus !== undefined) {
      if (!allowedOrderStatuses.includes(body.orderStatus)) {
        return Response.json(
          { error: "Invalid order status" },
          { status: 400 }
        );
      }

      updateData.orderStatus = body.orderStatus;
    }

    if (body.shipment !== undefined) {
      updateData.shipment = {
        courierName: String(body.shipment.courierName || "").trim(),
        trackingId: String(body.shipment.trackingId || "").trim(),
        trackingUrl: String(body.shipment.trackingUrl || "").trim(),
        note: String(body.shipment.note || "").trim(),
      };
    }

    const client = await clientPromise;
    const db = client.db("medtech");

    const result = await db.collection("orders").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("PATCH ADMIN ORDER ERROR:", error);

    return Response.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}