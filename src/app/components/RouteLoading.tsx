import LoadingFallback from "@/app/components/LoadingFallback";

export default function RouteLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingFallback />
    </div>
  );
}
