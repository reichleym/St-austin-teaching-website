"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplyEntryClient() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      const authView = params.get("auth");
      if (authView === "login" || authView === "signup") {
        return;
      }

      const requested = `${url.pathname}${url.search}`;
      params.set("auth", "login");
      params.set("redirect", requested);
      url.search = params.toString();

      window.history.replaceState({}, "", url.toString());
      router.replace(url.pathname + url.search);
    } catch {
      // ignore URL parsing errors
    }
  }, [router]);

  return null;
}
