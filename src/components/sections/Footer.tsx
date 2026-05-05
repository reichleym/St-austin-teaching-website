import FooterClient from "./FooterClient";
import { getFooterContent } from "@/lib/footer-content";

export default async function Footer() {
  const data = await getFooterContent("en"); // later make dynamic lang if needed

  return <FooterClient data={data} />;
}