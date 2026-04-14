import BannerSection from "@/components/sections/BannerSection";
import { getSql, isDatabaseConfigured } from "@/lib/postgres";

type Career = {
  id: string;
  title: string;
  description?: string;
  isActive?: boolean;
};

async function getCareersFromDb(): Promise<Career[]> {
  if (!isDatabaseConfigured) {
    return [];
  }

  try {
    const sql = getSql();
    const settings = await sql`
      SELECT
        "universityCareers" AS "universityCareers"
      FROM
        "SystemSettings"
      ORDER BY
        "updatedAt" DESC
      LIMIT 1
    `;

    const rawCareers = settings?.[0]?.universityCareers ?? settings?.[0]?.universitycareers;
    let careers: unknown = rawCareers;

    if (typeof rawCareers === "string") {
      try {
        careers = JSON.parse(rawCareers);
      } catch {
        careers = undefined;
      }
    }

    if (!Array.isArray(careers)) {
      return [];
    }

    return careers.filter((career: unknown) => {
      return (
        typeof career === "object" &&
        career !== null &&
        ("isActive" in career ? Boolean((career as any).isActive) : true)
      );
    }) as Career[];
  } catch (error) {
    console.error("[careers/page] Failed to load careers from DB", error);
    return [];
  }
}

export default async function CareersPage() {
  const careers = await getCareersFromDb();
  const email = "admissions@staustin.edu";

  return (
    <>
      <BannerSection
        title="Career Opportunities"
        description="Explore our current openings and apply by email for a smooth, direct process."
        bgImg="/bannerImg.jpg"
      >
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <a
            href={`mailto:${email}?subject=Application%20Inquiry&body=Hello%2C%0A%0AI%20am%20interested%20in%20learning%20more%20about%20your%20career%20opportunities.%20Please%20send%20details.%0A%0AThank%20you.`}
            className="inline-flex rounded-[5px] bg-white text-[#1E73BE] px-6 py-2 text-sm font-medium transition hover:opacity-90"
          >
            Email Admissions
          </a>
          <p className="text-sm text-white/80 max-w-xl text-center sm:text-left">
            Send your application inquiry to <strong>{email}</strong> with the role you are interested in.
          </p>
        </div>
      </BannerSection>

      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Available Career Opportunities</h2>
            <p className="text-lg text-[#5F5F5F] mb-10">Below are the roles currently listed in our system. Click any role to open your email application with the title pre-filled.</p>

            {careers.length === 0 ? (
              <div className="rounded-3xl border border-[#E6E8F0] bg-[#F8FAFF] p-10 text-center">
                <p className="text-xl font-semibold mb-4">No open roles are available right now.</p>
                <p className="text-base text-[#5F5F5F] mb-6">If you would like to apply, email us at <strong>{email}</strong> and we will share the next available opportunities.</p>
                <a
                  href={`mailto:${email}?subject=Career%20Opportunity%20Inquiry`}
                  className="inline-flex rounded-[5px] bg-[#1E73BE] text-white px-6 py-2 text-sm font-medium transition hover:opacity-90"
                >
                  Contact Admissions
                </a>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {careers.map((career) => (
                  <div key={career.id} className="rounded-3xl border border-[#E6E8F0] bg-white p-8 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-semibold mb-2">{career.title}</h3>
                        <p className="text-sm text-[#6B7280]">{career.description ?? "No description available."}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${career.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {career.isActive ? "Open" : "Inactive"}
                      </span>
                    </div>

                        <div className="mt-6 flex flex-col gap-3">
                      <a
                        href={`mailto:${email}?subject=Application%20for%20${encodeURIComponent(career.title)}&body=Hello%2C%0A%0AI%20would%20like%20to%20apply%20for%20the%20${encodeURIComponent(career.title)}%20position.%20Please%20share%20the%20next%20steps.%0A%0AThank%20you.`}
                        className="inline-flex rounded-[5px] bg-[#1E73BE] text-white px-6 py-2 text-sm font-medium transition hover:opacity-90"
                      >
                        Apply by Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
