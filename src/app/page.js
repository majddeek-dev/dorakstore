import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import LatestProducts from "@/components/home/LatestProducts";
import FlashSale from "@/components/home/FlashSale";
import Features from "@/components/home/Features";
import ContactProducts from "@/components/home/ContactProducts";
import CategoriesSection from "@/components/home/CategoriesSection";
import OffersSection from "@/components/home/OffersSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <CategoriesSection />
      <OffersSection />
      <ContactProducts />
      <LatestProducts />
      <BestSellers />
      <FlashSale />
      <Features />
    </div>
  );
}
