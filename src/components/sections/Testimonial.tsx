"use client";

import { RxQuote } from "react-icons/rx";
import { useTranslations } from "@/lib/useTranslations";

type Props = {
  title?: string;
  description?: string;
  testimonials?: {
    image?: string;
    quote?: string;
    author?: string;
    authorRole?: string;
  }[];
};

const fallbackTestimonials = [
  {
    nameKey: "testimonial.card1.name",
    roleKey: "testimonial.card1.role",
    contentKey: "testimonial.card1.content",
    img: "/testimonial-img.jpg",
  },
  {
    nameKey: "testimonial.card2.name",
    roleKey: "testimonial.card2.role",
    contentKey: "testimonial.card2.content",
    img: "/testimonial-img.jpg",
  },
  {
    nameKey: "testimonial.card3.name",
    roleKey: "testimonial.card3.role",
    contentKey: "testimonial.card3.content",
    img: "/testimonial-img.jpg",
  },
  {
    nameKey: "testimonial.card4.name",
    roleKey: "testimonial.card4.role",
    contentKey: "testimonial.card4.content",
    img: "/testimonial-img.jpg",
  },
];

export default function Testimonial({
  title,
  description,
  testimonials,
}: Props) {
  const { t } = useTranslations();

  const resolvedTitle = title || t("testimonial.title");
  const resolvedDescription = description || t("testimonial.description");

  const isDynamic = testimonials && testimonials.length > 0;

  return (
    <section className="md:py-25 py-15">
      <div className="container">
        <div className="mb-12">
          <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">
            {resolvedTitle}
          </h2>
          <p className="leading-tight">{resolvedDescription}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {isDynamic &&
            testimonials.map((item, index) => (
              <div
                key={index}
                className="bg-[#F2F5FA] p-5 rounded-[10px] min-h-[340px] flex flex-col justify-between"
              >
                <div>
                  <RxQuote size={40} className="mb-5 text-[#1E73BE]" />
                  <p className="text-xl leading-tight italic">{item.quote}</p>
                </div>

                <div className="flex gap-4 items-center mt-4 border-t pt-5">
                  <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                    <img
                      src={item.image || "/testimonial-img.jpg"}
                      alt={item.author}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="font-semibold text-lg">{item.author}</div>
                    <p className="text-[16px]">{item.authorRole}</p>
                  </div>
                </div>
              </div>
            ))}
          {!isDynamic &&
            fallbackTestimonials.map((item, index) => (
              <div
                key={index}
                className="bg-[#F2F5FA] p-5 rounded-[10px] min-h-[340px]"
              >
                <RxQuote size={40} className="mb-5 text-[#1E73BE]" />
                <p className="text-xl italic">{t(item.contentKey)}</p>

                <div className="flex gap-4 items-center mt-4 border-t pt-5">
                  <img
                    src={item.img}
                    className="w-[48px] h-[48px] rounded-full"
                  />
                  <div>
                    <div>{t(item.nameKey)}</div>
                    <p>{t(item.roleKey)}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
