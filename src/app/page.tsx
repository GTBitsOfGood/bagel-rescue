import Image from "next/image";
import LocationDashboardPage from "./LocationPage/page";
import Analytics from "./Analytics";

export default function Home() {
  return (
    // <Analytics></Analytics>
    <div style={{ display: "flex" }}>
      <div style={{ width: "20%" }}></div>
      <Analytics />
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <LocationDashboardPage />
    </main>
  );
}
