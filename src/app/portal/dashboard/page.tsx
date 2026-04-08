import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/lib/auth/server";
import Button from "@/components/Button";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
    const user = await getCurrentSessionUser();

    if (!user) {
        redirect("/portal?auth=login&redirect=/portal/dashboard");
    }

    if (!user.isEnrolled) {
        redirect("/apply");
    }

    return (
        <section className="py-16 md:py-24">
            <div className="container max-w-3xl">
                <div className="rounded-[14px] border border-[#33333340] bg-white p-8 shadow-sm md:p-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1E73BE]">Student Portal</p>
                    <h1 className="mt-4 text-3xl font-semibold text-[#333333] md:text-4xl">
                        Welcome back, {user.fullName}
                    </h1>
                    <p className="mt-4 text-lg text-[#333333]">
                        You are signed in as <span className="font-semibold">{user.email}</span>.
                    </p>
                    <p className="mt-3 text-base text-[#666666]">
                        This is your protected portal entry point. You can now connect courses, assignments, and
                        messaging modules behind this authenticated route.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/portal">
                            <Button variant="outline">Back to Portal Overview</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
