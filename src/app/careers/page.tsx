"use client";

import { useState, useEffect } from 'react';
import BannerSection from "@/components/sections/BannerSection";
import { useTranslations } from "@/lib/useTranslations";

type Career = {
  id: string;
  title: string;
  description?: string;
  isActive?: boolean;
};

export default function CareersPage() {
  const { t } = useTranslations();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCareers = async () => {
      try {
        const response = await fetch('/api/careers');
        if (response.ok) {
          const data = await response.json();
          setCareers(Array.isArray(data?.data) ? data.data : []);
        } else {
          setCareers([]);
        }
      } catch (error) {
        console.error('Failed to load careers', error);
        setCareers([]);
      } finally {
        setLoading(false);
      }
    };
    loadCareers();
  }, []);
  const email = "career@st-austin.org";

  return (
    <>
      <BannerSection
        title={t('careers.title')}
        description={t('careers.desc')}
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
                {careers.map((career, idx) => {
                  const key = String(career.id ?? career.title ?? `career_${idx}`);
                  const titlePath = `system.universityCareers.${key}.title`;
                  const descPath = `system.universityCareers.${key}.description`;
                  const translatedTitle = t(titlePath);
                  const translatedDesc = t(descPath);
                  const title = translatedTitle !== titlePath ? translatedTitle : career.title;
                  const description = translatedDesc !== descPath ? translatedDesc : career.description;

                  return (
                    <div key={key} className="rounded-3xl border border-[#E6E8F0] bg-white p-8 shadow-sm">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-semibold mb-2">{title}</h3>
                          <p className="text-sm text-[#6B7280]">{description ?? "No description available."}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${career.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {career.isActive ? "Open" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-6 flex flex-col gap-3">
                        <a
                          href={`mailto:${email}?subject=Application%20for%20${encodeURIComponent(title || '')}&body=Hello%2C%0A%0AI%20would%20like%20to%20apply%20for%20the%20${encodeURIComponent(title || '')}%20position.%20Please%20share%20the%20next%20steps.%0A%0AThank%20you.`}
                          className="inline-flex rounded-[5px] bg-[#1E73BE] text-white px-6 py-2 text-sm font-medium transition hover:opacity-90"
                        >
                          Apply by Email
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
