import Header from "@/components/Header";
import CtaSection from "@/components/sections/CtaSection";
import ExplorePrograms from "@/components/sections/ExplorePrograms";
import FeaturedPrograms from "@/components/sections/FeaturedPrograms";
import FeaturedStories from "@/components/sections/FeaturedStories";
import Footer from "@/components/sections/Footer";
import HeroSection from "@/components/sections/HeroSection";
import LearningExp from "@/components/sections/LearningExp";
import LearnSomething from "@/components/sections/LearnSomething";
import NewsAnnouncements from "@/components/sections/NewsAnnouncements";
import WhyAustin from "@/components/sections/WhyAustin";
import Testimonial from "@/components/sections/Testimonial";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ExplorePrograms />
        <FeaturedPrograms />
        <WhyAustin />
        <LearnSomething />
        <Testimonial />
        <LearningExp />
        <FeaturedStories />
        <NewsAnnouncements />
        <CtaSection />
        <Footer />
      </main>
    </div>
  );
}
