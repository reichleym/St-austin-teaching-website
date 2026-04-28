"use client";
import Button from "../Button";
import { FaAngleRight } from "react-icons/fa6";
import Link from "next/link";
import { useTranslations } from "@/lib/useTranslations";

export default function HeroSection({
  title,
  description,
  bgImg,
}: {
  title?: string;
  description?: string;
  bgImg?: string;
}) {
  const { t } = useTranslations();

  return (
    <>
      <section
        className="relative max-h-[calc(100vh - 150px)] h-full md:min-h-[700px] text-white bg-black py-20 flex items-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${bgImg || "/hero-banner.png"})` }}
      >
        <div className="container mx-auto">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-[55px] font-bold mb-5 leading-tight">
              {title ?? t("hero.title")}
            </h1>
            <p className="mb-10">{description ?? t("hero.desc")}</p>
            <div className="flex gap-4">
              <Link href="/apply" className="inline-flex">
                <Button>{t("header.applyNow")}</Button>
              </Link>
              {/* <Link href="/apply" className="inline-flex">
                                <Button variant="icon" icon={<FaAngleRight />}>{t('header.applyNow')}</Button>
                            </Link> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
