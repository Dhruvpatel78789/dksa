import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/mail";

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

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    await db.collection("orders").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updateData,
      }
    );

    // Send transactional status emails
    if (order.userEmail) {
      if (body.orderStatus === "out_for_delivery") {
        sendEmail({
          to: order.userEmail,
          subject: "Your Order is Out for Delivery!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d8ce; border-radius: 14px;">
              <h2 style="color: #3a5a40;">Your Order is Out for Delivery!</h2>
              <p>Hi ${order.userName || "Customer"},</p>
              <p>Good news! Your package is out for delivery today.</p>
              
              <div style="border-top: 1px solid #e1d8ce; border-bottom: 1px solid #e1d8ce; padding: 14px 0; margin: 18px 0;">
                <h3 style="margin: 0 0 10px;">Shipment Details</h3>
                <p style="margin: 4px 0;"><strong>Courier:</strong> ${body.shipment?.courierName || order.shipment?.courierName || "Standard Partner"}</p>
                <p style="margin: 4px 0;"><strong>Tracking ID:</strong> ${body.shipment?.trackingId || order.shipment?.trackingId || "N/A"}</p>
                ${
                  (body.shipment?.trackingUrl || order.shipment?.trackingUrl)
                    ? `<p style="margin: 12px 0;"><a href="${body.shipment?.trackingUrl || order.shipment?.trackingUrl}" style="background-color: #3a5a40; color: white; padding: 10px 18px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">Track Package</a></p>`
                    : ""
                }
              </div>
              
              <p>Please ensure someone is available at your delivery address to receive the package.</p>
              <p>Thanks,<br/>MedTech Support Team</p>
            </div>
          `,
        }).catch(err => console.error("Failed to send out for delivery email:", err));
      } else if (body.orderStatus === "delivered") {
        sendEmail({
          to: order.userEmail,
          subject: "Your Order Has Been Delivered!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d8ce; border-radius: 14px;">
              <h2 style="color: #3a5a40;">Order Delivered!</h2>
              <p>Hi ${order.userName || "Customer"},</p>
              <p>Your package has been successfully delivered. We hope you enjoy your purchase!</p>
              
              <div style="border-top: 1px solid #e1d8ce; border-bottom: 1px solid #e1d8ce; padding: 14px 0; margin: 18px 0;">
                <p style="margin: 4px 0;"><strong>Order ID:</strong> ${order._id.toString()}</p>
              </div>
              
              <p>Thank you for shopping with us! If you have any questions or feedback, please reach out to our support team.</p>
              <p>Thanks,<br/>MedTech Support Team</p>
            </div>
          `,
        }).catch(err => console.error("Failed to send delivery email:", err));
      }
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