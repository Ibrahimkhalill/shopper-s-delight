"use client";

import { Layout } from "@/components/site/Layout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { FeaturedGrid } from "@/components/site/FeaturedGrid";
import { TrendingSection } from "@/components/site/TrendingSection";
import { OffersSection } from "@/components/site/OffersSection";
import { CategorySection } from "@/components/site/CategorySection";
import { SubcategorySection } from "@/components/site/SubcategorySection";
import { PromoSection } from "@/components/site/PromoSection";

function Index() {
  return (
    <Layout>
      <HeroSlider />
      <CategoryStrip />
      <FeaturedGrid />
      <PromoSection />

      {/* Fashion */}
      <SubcategorySection slug="fashion" title="Fashion" />
      <OffersSection />
      <CategorySection
        titleKey="sec.fashion.title"
        eyebrowKey="sec.fashion.eyebrow"
        slug="fashion"
        ids={["cotton-tshirt", "plaid-coat", "sport-shoes", "cotton-top", "denim-jacket", "formal-shirt"]}
      />

      {/* Gadgets */}
      <SubcategorySection slug="gadgets" title="Gadgets & Electronics" />
      <CategorySection
        titleKey="sec.gadgets.title"
        eyebrowKey="sec.gadgets.eyebrow"
        slug="gadgets"
        ids={["wireless-headphones", "smart-watch", "smartphone-pro", "laptop-slim", "earbuds-tws", "tablet-hd"]}
      />

      <TrendingSection />

      {/* Home & Living */}
      <SubcategorySection slug="home" title="Home & Living" />
      <CategorySection
        titleKey="sec.home.title"
        eyebrowKey="sec.home.eyebrow"
        slug="home"
        ids={["bedsheet-set", "desk-lamp", "sofa-cushion", "cookware-set"]}
      />

      {/* Beauty */}
      <SubcategorySection slug="beauty" title="Beauty & Personal Care" />
      <CategorySection
        titleKey="sec.beauty.title"
        eyebrowKey="sec.beauty.eyebrow"
        slug="beauty"
        ids={["skincare-kit", "lipstick-set", "perfume-bd"]}
      />
    </Layout>
  );
}

export default Index;
