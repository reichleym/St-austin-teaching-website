"use client";

import { LearnSomethingSection } from "@/lib/home-page";
import { useTranslations } from "@/lib/useTranslations";

const valueCards = [
  {
    value: "15,000+",
    titleKey: "learnSomething.cardGraduates",
  },
  {
    value: "92%",
    titleKey: "learnSomething.cardPlacementRate",
  },
  {
    value: "50+",
    titleKey: "learnSomething.cardPrograms",
  },
  {
    value: "4.8/5",
    titleKey: "learnSomething.cardSatisfaction",
  },
];
type LearnSomethingProps = {
  learningSomething?: LearnSomethingSection;
};

export default function LearnSomething({
  learningSomething,
}: LearnSomethingProps) {
  const { t } = useTranslations();

  const title = learningSomething?.title || t("learnSomething.title");
  const description = learningSomething?.desc || t("learnSomething.desc");

  const cards = learningSomething?.cards;

  return (
    <div className="bg-[#F9F9F9] md:py-25 py-15">
      <div className="container">
        <div className="">
          <div className="">
            <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">
              {title}
            </h2>
            <p className="mb-7">{description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 mt-10 md:gap-6 gap-4">
            {cards &&
              cards?.length > 0 &&
              cards?.map((card, index) => (
                <div
                  className="text-center px-2 py-8 bg-white rounded-[10px] border-b-6 border-[#1E73BE]"
                  key={index}
                >
                  <div className="lg:text-6xl text-4xl text-[#1E73BE] font-semibold mb-4 italic">
                    {card.title}
                  </div>
                  <p className="text-xl font-medium">{card.desc}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
