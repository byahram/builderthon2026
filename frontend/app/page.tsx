
import { MainLayout } from "@/components/layout/MainLayout";
import { DisclaimerPopup } from "@/components/ui/DisclaimerPopup";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <MainLayout />
      <DisclaimerPopup />
    </main>
  );
}
