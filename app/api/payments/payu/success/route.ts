import clientPromise from "@/lib/mongodb";

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