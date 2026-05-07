import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { FeaturedGrid } from "@/components/site/FeaturedGrid";
import { TrendingSection } from "@/components/site/TrendingSection";
import { OffersSection } from "@/components/site/OffersSection";
import { CategorySection } from "@/components/site/CategorySection";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <Layout>
      <HeroSlider />
      <CategoryStrip />
      <FeaturedGrid />
      <OffersSection />
      <CategorySection
        titleKey="sec.fashion.title"
        eyebrowKey="sec.fashion.eyebrow"
        slug="fashion"
        ids={["cotton-tshirt", "plaid-coat", "sport-shoes", "cotton-top", "smart-watch"]}
      />
      <TrendingSection />
      <CategorySection
        titleKey="sec.gadgets.title"
        eyebrowKey="sec.gadgets.eyebrow"
        slug="gadgets"
        ids={["wireless-headphones", "smart-watch", "sport-shoes", "plaid-coat", "cotton-tshirt"]}
      />
    </Layout>
  );
}
