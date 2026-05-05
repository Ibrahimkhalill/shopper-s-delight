import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { FeaturedGrid } from "@/components/site/FeaturedGrid";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <Layout>
      <HeroSlider />
      <CategoryStrip />
      <FeaturedGrid />
    </Layout>
  );
}
