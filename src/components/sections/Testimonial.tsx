"use client";

import { RxQuote } from "react-icons/rx";
import { useTranslations } from "@/lib/useTranslations";

const testimonialItems = [
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

export default function CarouselDemo() {
    const { t } = useTranslations();

    return (
        <section className="md:py-25 py-15">
            <div className="container">
                <div className="mb-12">
                    <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">{t('testimonial.title')}</h2>
                    <p className="leading-tight">{t('testimonial.description')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {testimonialItems.map((item, index) => (
                        <div className="bg-[#F2F5FA] p-5 rounded-[10px] mb-5 min-h-[340px] flex flex-col justify-between" key={index}>
                            <div>
                                <RxQuote size={40} className="mb-5 text-[#1E73BE]" />
                                <p className="text-xl leading-tight italic">{t(item.contentKey)}</p>
                            </div>
                            <div className="flex gap-4 items-center mt-4 border-t border-[#33333340] pt-5">
                                <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                                    <img src={item.img} alt={t(item.nameKey)} className="h-full w-full object-cover object-center" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg mb-1 leading-tight">{t(item.nameKey)}</div>
                                    <p className="text-[16px]">{t(item.roleKey)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
