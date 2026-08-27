import BestSellerSection from "@/components/home/BestSellerSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import PromoBanner from "@/components/home/PromoBanner";
import PromoGrid from "@/components/home/PromoGrid";
import ReviewSection from "@/components/home/ReviewSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Thoughtfully crafted clothing for the modern wardrobe. Minimalist designs, premium materials, and enduring style.",
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Landing - Light Warm Atmosphere */}
      <HeroSection />

      {/* 2. New Arrivals - Pure Crisp White grid */}
      <NewArrivalsSection />

      {/* 3. Core Promises - Elegant Glassmorphic cards divider */}
      <FeaturesSection />

      {/* 4. Category Visuals - Asymmetrical High-Fashion Grid */}
      <CategorySection />

      {/* 5. Curated Spotlight - Image-rich Editorial Grid */}
      <PromoGrid />

      {/* 6. Limited release Banner - OLED High-Contrast dark break */}
      <PromoBanner />

      {/* 7. Best Sellers - Soft Sandy Contrast backdrop */}
      <BestSellerSection />

      {/* 8. Verified Reviews Carousel - Auto-sliding (5s) with custom spacing */}
      <ReviewSection />

      {/* 9. Newsletter CTA - Luxury Dark Closing signature ("Stay in the Loop") */}
      <NewsletterSection />
    </>
  );
}
