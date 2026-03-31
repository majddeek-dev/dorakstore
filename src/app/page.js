import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import FlashSale from "@/components/home/FlashSale";
import Features from "@/components/home/Features";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <BestSellers />
      <FlashSale />
    </div>
  );
}
