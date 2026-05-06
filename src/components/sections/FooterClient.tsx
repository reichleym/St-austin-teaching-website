// "use client";

// import {
//   FaFacebookF,
//   FaLinkedin,
//   FaInstagram,
//   FaYoutube,
// } from "react-icons/fa";
// import { FaXTwitter } from "react-icons/fa6";
// import { useTranslations } from "@/lib/useTranslations";

// export default function Footer() {
//   const { t } = useTranslations();

//   const campusMenuItems = [
//     { label: t("header.menu.programs"), href: "/program" },
//     { label: t("header.menu.admissions"), href: "/admissions" },
//     { label: t("header.menu.tuition"), href: "/tuition" },
//     { label: t("header.menu.studentExperience"), href: "/studentExperience" },
//     { label: t("header.menu.about"), href: "/about" },
//   ];
//   const recordMenuItems = [
//     { label: t("footer.requestInfo"), href: "/request-info" },
//     // { label: t('footer.talkToAdvisor'), href: '#' },
//     { label: t("footer.governmentEmployee"), href: "/government-employees" },
//   ];

//   return (
//     <>
//       <footer className="bg-[#333333] text-white">
//         <div className="container">
//           <div className="grid grid-cols-1 md:grid-cols-6 md:gap-20 gap-10 items-center md:py-25 py-15">
//             <div className="md:col-span-2">
//               <div className="">
//                 <img src="/logo-white.png" width={210} alt="Austin Logo" />
//                 <p className="py-10 leading-tight">{t("footer.desc")}</p>

//                 <div className="flex">
//                   <a
//                     href="#"
//                     className=" hover:opacity-80 transition-colors duration-200 me-4"
//                   >
//                     <FaFacebookF size={24} />
//                   </a>
//                   <a
//                     href="#"
//                     className=" hover:opacity-80 transition-colors duration-200 me-4"
//                   >
//                     <FaInstagram size={24} />
//                   </a>
//                   <a
//                     href="#"
//                     className=" hover:opacity-80 transition-colors duration-200 me-4"
//                   >
//                     <FaLinkedin size={24} />
//                   </a>
//                   <a
//                     href="#"
//                     className=" hover:opacity-80 transition-colors duration-200 me-4"
//                   >
//                     <FaXTwitter size={24} />
//                   </a>
//                   <a
//                     href="#"
//                     className=" hover:opacity-80 transition-colors duration-200 me-4"
//                   >
//                     <FaYoutube size={24} />
//                   </a>
//                 </div>
//               </div>
//             </div>
//             <div className="md:col-span-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                 <div>
//                   <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">
//                     {t("footer.campus")}
//                   </div>

//                   <ul className="space-y-1">
//                     {campusMenuItems.map((item) => (
//                       <li key={item.label}>
//                         <a
//                           href={item.href}
//                           className="  hover:opacity-80 transition-colors duration-200"
//                         >
//                           {item.label}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div>
//                   <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">
//                     {t("footer.resources")}
//                   </div>

//                   <ul className="space-y-1">
//                     {recordMenuItems.map((item) => (
//                       <li key={item.label}>
//                         <a
//                           href={item.href}
//                           className="  hover:opacity-80 transition-colors duration-200"
//                         >
//                           {item.label}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div>
//                   <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">
//                     {t("footer.contactUs")}
//                   </div>
//                   <p className=" ">{t("footer.address")}</p>
//                   <p className=" ">{t("footer.phone")}</p>
//                   <p className=" ">{t("footer.email")}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="md:flex items-center md:space-y-0 space-y-5 justify-between border-t border-[#FFFFFF80] py-5 text-[16px]">
//             <p className="">{t("footer.copyright")}</p>
//             <ul className="flex gap-3">
//               <li>
//                 <a
//                   href="#"
//                   className="hover:opacity-80 transition-colors duration-200"
//                 >
//                   {t("footer.privacyPolicy")}
//                 </a>
//               </li>
//               <li aria-hidden="true" className="">
//                 |
//               </li>
//               <li>
//                 <a
//                   href="#"
//                   className="hover:opacity-80 transition-colors duration-200"
//                 >
//                   {t("footer.termsOfService")}
//                 </a>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </footer>
//     </>
//   );
// }

"use client";

import {
  FaFacebookF,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useTranslations } from "@/lib/useTranslations";

type FooterSocial = {
  label?: string;
  url?: string;
  icon?: string;
};

type SocialKey = "facebook" | "instagram" | "linkedin" | "twitter" | "youtube";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function normalizeSocials(value: unknown): FooterSocial[] {
  if (!Array.isArray(value)) return [];

  const items: FooterSocial[] = [];
  for (const entry of value) {
    const obj = normalizeObject(entry);
    if (!obj) continue;

    const label = asString(obj.label);
    const url = asString(obj.url);
    const icon = asString(obj.icon);
    if (!label && !url && !icon) continue;

    items.push({ label, url, icon });
  }
  return items;
}

function normalizeHref(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  if (/^(https?:)?\/\//i.test(value)) {
    return value.startsWith("//") ? `https:${value}` : value;
  }

  if (/^(mailto:|tel:)/i.test(value)) return value;

  return `https://${value}`;
}

function inferSocialKey(input: { url?: string; label?: string }): SocialKey | null {
  const url = (input.url ?? "").toLowerCase();
  const label = (input.label ?? "").toLowerCase();
  const combined = `${label} ${url}`;

  if (combined.includes("facebook.com") || combined.includes("fb.com") || combined.includes("facebook"))
    return "facebook";
  if (combined.includes("instagram.com") || combined.includes("instagram")) return "instagram";
  if (combined.includes("linkedin.com") || combined.includes("linkedin")) return "linkedin";
  if (combined.includes("twitter.com") || combined.includes("x.com") || combined.includes("twitter"))
    return "twitter";
  if (combined.includes("youtube.com") || combined.includes("youtu.be") || combined.includes("youtube"))
    return "youtube";

  return null;
}

export default function FooterClient({ data }: { data: unknown }) {
  const { t } = useTranslations();
  const dataObj = normalizeObject(data) ?? {};
  const description = asString(dataObj.description) ?? "";
  const address = asString(dataObj.address) ?? "";
  const socials = normalizeSocials(dataObj.socials);

  const campusMenuItems = [
    { label: t("header.menu.programs"), href: "/program" },
    { label: t("header.menu.admissions"), href: "/admissions" },
    { label: t("header.menu.tuition"), href: "/tuition" },
    { label: t("header.menu.studentExperience"), href: "/studentExperience" },
    { label: t("header.menu.about"), href: "/about" },
  ];

  const recordMenuItems = [
    { label: t("footer.requestInfo"), href: "/request-info" },
    { label: t("footer.governmentEmployee"), href: "/government-employees" },
  ];

  const iconMap: Record<SocialKey, IconType> = {
    facebook: FaFacebookF,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
    twitter: FaXTwitter,
    youtube: FaYoutube,
  };

  return (
    <footer className="bg-[#333333] text-white">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-6 md:gap-20 gap-10 items-center md:py-25 py-15">
          
          {/* LEFT */}
          <div className="md:col-span-2">
            <img src="/logo-white.png" width={210} alt="Austin Logo" />

            {/* ✅ Dynamic description */}
            <p className="py-10 leading-tight">
              {description}
            </p>

            {/* ✅ Dynamic socials */}
            <div className="flex">
              {socials.map((item: FooterSocial, idx: number) => {
                const href = normalizeHref(item.url);
                if (!href) return null;

                const socialKey = inferSocialKey({ url: href, label: item.label });
                if (!socialKey) return null;

                const Icon = iconMap[socialKey];

                return (
                  <a
                    key={`${socialKey}-${idx}`}
                    href={href}
                    className="me-4 hover:opacity-80"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label || socialKey}
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-4">
            <div className="grid md:grid-cols-3 gap-5">
              
              {/* Static (t) */}
              <div>
                <div className="font-semibold text-[22px] mb-5 uppercase">
                  {t("footer.campus")}
                </div>
                <ul className="space-y-1">
                  {campusMenuItems.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="hover:opacity-80">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-[22px] mb-5 uppercase">
                  {t("footer.resources")}
                </div>
                <ul className="space-y-1">
                  {recordMenuItems.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="hover:opacity-80">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ✅ Dynamic address */}
              <div>
                <div className="font-semibold text-[22px] mb-5 uppercase">
                  {t("footer.contactUs")}
                </div>

                <p>{address}</p>

                {/* <p>{t("footer.phone")}</p>
                <p>{t("footer.email")}</p> */}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="md:flex justify-between border-t border-[#FFFFFF80] py-5 text-[16px]">
          <p>{t("footer.copyright")}</p>
          {/* <ul className="flex gap-3">
            <li>
              <a href="#" className="hover:opacity-80">
                {t("footer.privacyPolicy")}
              </a>
            </li>
            <li>|</li>
            <li>
              <a href="#" className="hover:opacity-80">
                {t("footer.termsOfService")}
              </a>
            </li>
          </ul> */}
        </div>
      </div>
    </footer>
  );
}
