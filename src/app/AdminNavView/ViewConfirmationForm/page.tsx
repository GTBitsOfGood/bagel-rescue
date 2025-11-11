import { Suspense } from "react";
import PostShiftForm from "./PostShiftForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostShiftForm />
    </Suspense>
  );
}