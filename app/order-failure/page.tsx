import { Suspense } from "react";
import OrderFailureContent from "./OrderFailureContent";

export default function OrderFailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderFailureContent />
    </Suspense>
  );
}