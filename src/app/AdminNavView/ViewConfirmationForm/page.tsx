import { Suspense } from "react";
import PostShiftForm from "./PostShiftForm";
import LoadingFallback from "@/app/components/LoadingFallback";

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PostShiftForm />
    </Suspense>
  );
}
