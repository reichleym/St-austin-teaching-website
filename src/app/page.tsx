import ExplorePrograms from "@/components/sections/ExplorePrograms";
import FeaturedPrograms from "@/components/sections/FeaturedPrograms";
import HeroSection from "@/components/sections/HeroSection";
import CtaSection from "@/components/CtaSection";
import FeaturedStories from "@/components/sections/FeaturedStories";
import LearningExp from "@/components/sections/LearningExp";
import LearnSomething from "@/components/sections/LearnSomething";
import NewsAnnouncements from "@/components/sections/NewsAnnouncements";
import WhyAustin from "@/components/sections/WhyAustin";
import Testimonial from "@/components/sections/Testimonial";
import { getServerLanguage } from "@/lib/i18n/server";
import { getHomePageContent } from "@/lib/home-page";
import Link from "next/link";
import Button from "@/components/Button";

export default async function Home() {
  const lang = await getServerLanguage();
  const data = await getHomePageContent(lang);
console.log("data>>",data)
  return (
    <div>
      <main className="flex-1">
        <HeroSection {...data.hero} />

        <ExplorePrograms {...data.explorePrograms} />

        <FeaturedPrograms {...data.featuredPrograms} />

        <WhyAustin
          secTitle={data?.whyAustin?.title}
          whyAustinDesc={data?.whyAustin?.whyAustinDesc}
          // whiteCards={data?.whyAustin?.items}
          button={
            data.whyAustin?.button ? (
              <Link href={data.whyAustin.button.href || "#"}>
                <Button variant="white">{data.whyAustin.button.label}</Button>
              </Link>
            ) : undefined
          }
        />

        <LearnSomething learningSomething={data?.learnSomething} />

        <Testimonial testimonials={data?.testimonial?.testimonials} />

        <LearningExp learningExp={data.learningExp} />

        <NewsAnnouncements {...data.newsAnnouncements} />

        <CtaSection
          title={data?.cta?.title}
          desc={data?.cta?.description}
          button={data?.cta?.button}
          className="pt-25"
        />
      </main>
    </div>
  );
}
