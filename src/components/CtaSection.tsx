'use client';
import Button from "./Button";
import Link from "next/link";
import { useTranslations } from "@/lib/useTranslations";


export default function CtaSection({ className }: { className?: string }) {
    const { t } = useTranslations();

    return (
        <>
            <section className={`md:pb-25 pb-15 ${className || ""}`}>
                <div className="container">
                    <div className="bg-[#1E73BE] text-white rounded-lg grid md:grid-cols-10 gap-7 items-center">
                        <div className="md:col-span-6">
                            <div className="lg:max-w-[90%] py-6 px-6 mx-auto">
                                <h2 className="font-semibold text-4xl md:text-[50px] leading-tight mb-[10px]">{t('cta.title')}</h2>
                                <p className="text-[15px] mb-6 md:w-[80%]">{t('cta.desc')}</p>
                                <div className="flex flex-wrap gap-5">
                                    <Link href="/apply" className="inline-flex">
                                        <Button variant="white">{t('cta.applyNow')}</Button>
                                    </Link>
                                    <Link href="/request-info" className="inline-flex">
                                        <Button variant="whiteOutline">{t('cta.requestInfo')}</Button>
                                    </Link>
                                    <Button variant="whiteOutline">{t('cta.talkToAdvisor')}</Button>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4 relative h-full">
                            <div className="absolute h-full w-full inset-0 bg-[linear-gradient(360deg,rgba(30,115,190,0)_50%,#1E73BE_100%)] md:bg-[linear-gradient(270deg,rgba(30,115,190,0)_50%,#1E73BE_100%)]"></div>
                            <img src="/cta-img.png" alt={t('cta.title')} className="w-full h-full rounded-lg object-cover" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

