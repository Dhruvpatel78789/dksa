import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const txnid = String(formData.get("txnid") || "");

    const client = await clientPromise;
    const db = client.db("medtech");

    const order = await db.collection("orders").findOne({
      payuTxnId: txnid,
    });

    if (order) {
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
    }

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/order-failure?orderId=${
        order?._id?.toString() || ""
      }`
    );
  } catch (error) {
    console.error("PAYU FAILURE ERROR:", error);

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/order-failure?reason=payment-failed`
    );
  }
}