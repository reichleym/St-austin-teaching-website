"use client";

import { LearningExpSection } from "@/lib/home-page";
import { useTranslations } from "@/lib/useTranslations";
type LearningExpProps = {
  learningExp?: LearningExpSection;
};

export default function LearningExp({ learningExp }: LearningExpProps) {
  const { t } = useTranslations();

  const title = learningExp?.title || t("learningExperience.title");
  const description = learningExp?.desc || t("learningExperience.desc");
  const image = learningExp?.image || "/learning-exp-img.jpg";
  const cards = learningExp?.cards;

  return (
    <div className="bg-[#1E73BE] md:flex flex-wrap">
      {/* RIGHT IMAGE */}
      <div className="flex-1 md:order-2">
        <img src={image} className="h-full object-cover" alt={title} />
      </div>

      {/* LEFT CONTENT */}
      <div className="container md:py-25 py-15 flex-1">
        <div className="max-w-xl mx-auto">
          <div className="text-white mb-10">
            <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">
              {title}
            </h2>
            <p className="leading-tight">{description}</p>
          </div>

          <div className="space-y-5">
            {cards &&
              cards.length > 0 &&
              cards.map((item, index) => {
                const src = (item as any).icon || (item as any).image || "/assignments.svg";
                const cardTitle = (item as any).title || "";
                const cardDesc = (item as any).desc || "";

                return (
                  <div className="bg-white p-5 rounded-[10px]" key={index}>
                    <div className="flex items-center">
                      <div className="text-4xl mr-5">
                        <img src={src} alt={cardTitle} />
                      </div>
                      <div>
                        <div className="font-semibold text-xl mb-2 leading-tight">
                          {cardTitle}
                        </div>
                        <p className="leading-tight">{cardDesc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
