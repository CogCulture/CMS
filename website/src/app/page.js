import Hero from "@/components/home/Hero";
import PremiumProperties from "@/components/home/PremiumProperties";
import DiscoverSection from "@/components/home/DiscoverSection";
import LandmarkDevelopments from "@/components/home/LandmarkDevelopments";
import MobileHomeActions from "@/components/MobileHomeActions";


export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center gap-8 py-0 lg:gap-12">
      <Hero />
      <MobileHomeActions/>
      <PremiumProperties /> 
      <DiscoverSection />
      <LandmarkDevelopments />
    </main>
  );
}