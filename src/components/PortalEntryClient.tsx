"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalEntryClient() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      // If auth param is already present, nothing to do.
      if (params.get("auth") === "login") {
        return;
      }

      params.set("auth", "login");
      url.search = params.toString();

      // Replace history (avoid extra back entry) and ensure router state updates.
      window.history.replaceState({}, "", url.toString());
      // Also use next/router replace to ensure app-router notices the change.
      router.replace(url.pathname + url.search);
    } catch (e) {
      // ignore
    }
  }, [router]);

  return null;
}
