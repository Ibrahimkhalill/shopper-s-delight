import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { FeaturedGrid } from "@/components/site/FeaturedGrid";
import { TrustStrip } from "@/components/site/TrustStrip";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSlider />
        <CategoryStrip />
        <FeaturedGrid />
        <TrustStrip />
      </main>
      <Footer />
    </div>
  );
}
