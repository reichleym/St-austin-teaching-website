'use client';

import { IoMdTime } from "react-icons/io";
import Button from "../Button";
import { useTranslations } from "@/lib/useTranslations";

type Props = {
  title?: string;
  items?: {
    tag?: string;
    date?: string;
    image?: string;
    title?: string;
    excerpt?: string;
  }[];
};

export default function NewsAnnouncements({ title, items }: Props) {
  const { t } = useTranslations();

  return (
    <section className="md:py-25 py-15">
      <div className="container">
        <div className="mb-8 flex flex-wrap gap-5 items-center justify-between">
          <h2 className="font-semibold md:text-[50px] text-4xl leading-tight">
            {title || t("newsAnnouncements.title")}
          </h2>

          <Button variant="outline">
            {t("newsAnnouncements.readMore")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-5 gap-10">
          {items?.map((item, index) => (
            <div key={index}>
              <div className="relative">
                <img
                  src={item.image || "/news-card-img.png"}
                  alt={item.title}
                  className="w-full h-[200px] object-cover mb-4 rounded-[10px]"
                />

                {item.tag && (
                  <span className="absolute bottom-2 left-2 bg-[#1E73BE] text-white text-sm font-medium px-2 py-1 rounded">
                    {item.tag}
                  </span>
                )}
              </div>

              <div>
                <div className="font-semibold text-xl mb-2 leading-tight">
                  {item.title}
                </div>

                <p className="leading-tight">{item.excerpt}</p>

                {item.date && (
                  <div className="flex items-center justify-between mt-5">
                    <span className="text-sm text-[#33333380] flex items-center gap-2">
                      <IoMdTime size={18} />
                      {item.date}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}