'use client';

import Button from "@/components/Button";
import { useTranslations } from "@/lib/useTranslations";

export default function MatchingGiftSection() {
    const { t } = useTranslations();

    return (
        <section className="py-15 md:py-25">
            <div className="container">
                <div className="mx-auto text-center">
                    <h2 className="text-3xl font-bold leading-tight text-[#333333] md:text-[50px]">
                        {t("employerMatchingGift.title")}
                    </h2>
                    <p className="mx-auto mt-5 max-w-[760px] text-base leading-relaxed text-[#555555]">
                        {t("employerMatchingGift.desc")}
                    </p>

                    <form className="mx-auto mt-10 max-w-[520px]">
                        <label className="mb-2 block text-left text-sm font-medium text-[#333333]">
                            {t("employerMatchingGift.searchLabel")}
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                placeholder={t("employerMatchingGift.searchPlaceholder")}
                                className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none"
                            />
                            <Button className="min-w-[120px] sm:w-auto" type="submit">
                                {t("employerMatchingGift.searchButton")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}