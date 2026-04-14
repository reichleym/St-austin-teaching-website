'use client';

import { FaFacebookF, FaLinkedin, FaInstagram, FaYoutube} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useTranslations } from "@/lib/useTranslations";

export default function Footer() {
    const { t } = useTranslations();

    const campusMenuItems = [
        { label: t('header.menu.programs'), href: '#' },
        { label: t('header.menu.admissions'), href: '#' },
        { label: t('header.menu.tuition'), href: '#' },
        { label: t('header.menu.studentExperience'), href: '#' },
        { label: t('header.menu.about'), href: '#' },
    ];
       const recordMenuItems = [
        { label: t('footer.requestInfo'), href: '/request-info' },
        { label: t('footer.talkToAdvisor'), href: '#' },
        { label: t('footer.governmentEmployee'), href: '#' },
    ];

    return (
        <>
            <footer className="bg-[#333333] text-white">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-6 md:gap-20 gap-10 items-center md:py-25 py-15">
                        <div className="md:col-span-2">
                            <div className="">
                                <img src="/logo-white.png" width={210} alt="Austin Logo" />
                                <p className="py-10 leading-tight">{t('footer.desc')}</p>

                                <div className="flex">
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaFacebookF size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaInstagram size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaLinkedin size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaXTwitter size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaYoutube size={24} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">{t('footer.campus')}</div>

                                    <ul className="space-y-1">
                                        {campusMenuItems.map((item) =>
                                            <li key={item.label}>
                                                <a href={item.href} className="  hover:opacity-80 transition-colors duration-200">{item.label}</a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">{t('footer.resources')}</div>

                                    <ul className="space-y-1">
                                        {recordMenuItems.map((item) =>
                                            <li key={item.label}>
                                                <a href={item.href} className="  hover:opacity-80 transition-colors duration-200">{item.label}</a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">{t('footer.contactUs')}</div>
                                    <p className=" ">{t('footer.address')}</p>
                                    <p className=" ">{t('footer.phone')}</p>
                                    <p className=" ">{t('footer.email')}</p>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:flex items-center md:space-y-0 space-y-5 justify-between border-t border-[#FFFFFF80] py-5 text-[16px]">
                        <p className="">{t('footer.copyright')}</p>
                        <ul className="flex gap-3">
                            <li><a href="#" className="hover:opacity-80 transition-colors duration-200">{t('footer.privacyPolicy')}</a></li>
                            <li aria-hidden="true" className="">|</li>
                            <li><a href="#" className="hover:opacity-80 transition-colors duration-200">{t('footer.termsOfService')}</a></li>
                        </ul>

                    </div>
                </div>
            </footer>
        </>
    );
}
