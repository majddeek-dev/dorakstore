import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import LatestProducts from "@/components/home/LatestProducts";
import FlashSale from "@/components/home/FlashSale";
import Features from "@/components/home/Features";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <LatestProducts />
      <BestSellers />
      <FlashSale />
    </div>
  );
}
