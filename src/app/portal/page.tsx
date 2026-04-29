import { redirect } from "next/navigation";
import PortalEntryClient from "@/components/PortalEntryClient";
import { getCurrentSessionUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const user = await getCurrentSessionUser();

  // If user is signed in, send them to the apply flow per request.
  if (user) {
    redirect("/apply");
  }

  // For guests, render a small client component that adds ?auth=login
  // to the current /portal URL — the Header listens for this and opens
  // the sign-in modal.
  return <PortalEntryClient />;
}
