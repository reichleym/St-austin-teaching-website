import FooterClient from "./FooterClient";
import { getFooterContent } from "@/lib/footer-content";
import { getServerLanguage } from "@/lib/i18n/server";

export default async function Footer() {
  const lang = await getServerLanguage();
  const data = await getFooterContent(lang);

  return <FooterClient data={data} />;
}