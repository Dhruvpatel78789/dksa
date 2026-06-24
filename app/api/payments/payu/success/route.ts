import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const txnid = String(formData.get("txnid") || "");
    const status = String(formData.get("status") || "");
    const mihpayid = String(formData.get("mihpayid") || "");

    const mode = String(formData.get("mode") || "");
    const bankRefNum = String(formData.get("bank_ref_num") || "");

    const client = await clientPromise;
    const db = client.db("medtech");

    const order = await db.collection("orders").findOne({
      payuTxnId: txnid,
    });

    if (!order) {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/order-failure?reason=order-not-found`
      );
    }

    if (status === "success") {
      await db.collection("orders").updateOne(
        { payuTxnId: txnid },
        {
          $set: {
            paymentStatus: "confirmed",
            orderStatus: "ordered",

            payuPaymentId: mihpayid,
            paymentType: mode,
            bankReferenceNumber: bankRefNum,

            updatedAt: new Date(),
          },
        }
      );

      // Send Order Confirmation Email
      if (order.userEmail) {
        sendEmail({
          to: order.userEmail,
          subject: "Order Confirmation",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d8ce; border-radius: 14px;">
              <h2 style="color: #3a5a40;">Order Confirmed!</h2>
              <p>Hi ${order.userName || "Customer"},</p>
              <p>Thank you for your order! We have received your payment and are preparing your package.</p>
              <div style="border-top: 1px solid #e1d8ce; border-bottom: 1px solid #e1d8ce; padding: 14px 0; margin: 18px 0;">
                <h3 style="margin: 0 0 10px;">Order Summary</h3>
                <p style="margin: 4px 0;"><strong>Order ID:</strong> ${order._id.toString()}</p>
                <p style="margin: 4px 0;"><strong>Total Paid:</strong> ₹${Math.round(order.total)}</p>
              </div>
              <p>We will update you as soon as your order ships.</p>
              <p>Thanks,<br/>MedTech Support Team</p>
            </div>
          `,
        }).catch(err => console.error("Failed to send confirmation email:", err));
      }

      // Decrement matched product size inventory for each ordered item
      for (const item of order.items || []) {
        if (item.size && ObjectId.isValid(item.productId)) {
          await db.collection("products").updateOne(
            {
              _id: new ObjectId(item.productId),
              "sizes.size": item.size
            },
            {
              $inc: { "sizes.$.qty": -item.quantity }
            }
          );
        }
      }

      await db.collection("carts").updateOne(
        { userId: order.userId },
        {
          $set: {
            items: [],
            updatedAt: new Date(),
          },
        }
      );

      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/order-success?orderId=${order._id.toString()}`
      );
    }

    await db.collection("orders").updateOne(
      { payuTxnId: txnid },
      {
        $set: {
          paymentStatus: "rejected",
          orderStatus: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/order-failure?orderId=${order._id.toString()}`
    );
  } catch (error) {
    console.error("PAYU SUCCESS ERROR:", error);

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/order-failure?reason=server-error`
    );
  }
}