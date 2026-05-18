'use client';

import CtaSection from '@/components/CtaSection';
import BannerSection from '@/components/sections/BannerSection';
import Button from '@/components/Button';
import Link from 'next/link';
import { useTranslations } from '@/lib/useTranslations';
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageProvider';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import type { CourseCardItem } from '@/lib/course-catalog';

interface ProgramDetailClientProps {
  program: CourseCardItem;
  bannerBadge: string[];
  programContentJson?: string;
  programOverviewContent?: string;
  tuitionAndFees?: string;
  curriculum?: string[];
  admissionRequirements?: string[];
  careerOpportunities?: string[];
}

function getNonEmptyString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
}

function parseLooseList(text: string): string[] {
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[-*•\u2022]\s+/, '').trim())
    .filter((line) => line.length > 0);
}

function getStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    const asString = getNonEmptyString(value);
    return asString ? parseLooseList(asString) : [];
  }

  return value
    .map((item) => getNonEmptyString(item))
    .filter((item): item is string => item !== null);
}

interface LanguageSpecificContent {
  overview?: unknown;
  tuitionAndFees?: unknown;
  curriculum?: unknown;
  admissionRequirements?: unknown;
  careerOpportunities?: unknown;
}

function extractLanguageContent(programContentJson: string | undefined, language: string): LanguageSpecificContent {
  if (!programContentJson || programContentJson.trim().length === 0) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(programContentJson);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const allContent = parsed as Record<string, unknown>;
      const languageContent = allContent[language];

      if (languageContent && typeof languageContent === 'object' && !Array.isArray(languageContent)) {
        return languageContent as LanguageSpecificContent;
      }
    }
  } catch {
    // Fall back to empty content
  }

  return {};
}

export default function ProgramDetailClient({
  program,
  bannerBadge,
  programContentJson,
  programOverviewContent,
  tuitionAndFees,
  curriculum,
  admissionRequirements,
  careerOpportunities,
}: ProgramDetailClientProps) {
  const { t } = useTranslations();
  const context = useContext(LanguageContext);
  const currentLanguage = context?.lang ?? 'en';

  // Extract language-specific content from programContentJson
  const languageContent = programContentJson
    ? extractLanguageContent(programContentJson, currentLanguage)
    : {};

  const EMPTY_CONTENT_MESSAGE = t('programDetail.emptyContent');

  // Use language-specific content if available, otherwise fall back to passed props
  const finalOverviewContent =
    getNonEmptyString(languageContent.overview) ?? 
    programOverviewContent ?? 
    EMPTY_CONTENT_MESSAGE;

  const finalTuitionAndFees =
    getNonEmptyString(languageContent.tuitionAndFees) ?? 
    tuitionAndFees ?? 
    EMPTY_CONTENT_MESSAGE;

  const finalCurriculum =
    getStringList(languageContent.curriculum).length > 0
      ? getStringList(languageContent.curriculum)
      : curriculum ?? [];

  const finalAdmissionRequirements =
    getStringList(languageContent.admissionRequirements).length > 0
      ? getStringList(languageContent.admissionRequirements)
      : admissionRequirements ?? [];

  const finalCareerOpportunities =
    getStringList(languageContent.careerOpportunities).length > 0
      ? getStringList(languageContent.careerOpportunities)
      : careerOpportunities ?? [];

  return (
    <>
      <BannerSection title={program.title} description={program.description ?? ''} bgImg="/bannerImg.jpg">
        <div className="flex gap-2.5 -order-1 mb-2.5">
          {bannerBadge.map((badge, index) => (
            <span
              className="bg-[#fff] border border-[#1E73BE] text-[#1E73BE] text-sm font-semibold px-2 py-1 rounded"
              key={index}
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="flex gap-5 mt-11">
          <Link href="/apply" className="inline-flex">
            <Button variant="primary">{t('careers.applyNow')}</Button>
          </Link>
          <Button variant="outline">{t('requestInfo.title')}</Button>
        </div>
      </BannerSection>

      <section className="md:py-25 py-15">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-5 lg:gap-25 md:gap-12 gap-8">
            <div className="md:col-span-3 space-y-12">
              <div>
                <h2 className="md:text-4xl text-3xl font-bold mb-5">{t('programDetail.overviewHeading')}</h2>
                <p className="whitespace-pre-line">{finalOverviewContent}</p>
              </div>
              <div>
                <h2 className="md:text-4xl text-3xl font-bold mb-5">{t('programDetail.curriculumHeading')}</h2>
                {finalCurriculum.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finalCurriculum.map((item, index) => (
                      <li className="flex gap-4 items-start" key={`${item}-${index}`}>
                        <span className="bg-[#1E73BE] font-semibold text-white w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{EMPTY_CONTENT_MESSAGE}</p>
                )}
              </div>
              <div>
                <h2 className="md:text-4xl text-3xl font-bold mb-5">{t('programDetail.careerOpportunitiesHeading')}</h2>
                {finalCareerOpportunities.length > 0 ? (
                  <div className="flex flex-wrap gap-5">
                    {finalCareerOpportunities.map((tag, index) => (
                      <span
                        className="bg-[#1E73BE1A] p-3 border border-[#1E73BE] font-semibold flex items-start gap-2.5 leading-relaxed"
                        key={`${tag}-${index}`}
                      >
                        <IoIosCheckmarkCircleOutline size={24} className="text-[#1E73BE] shrink-0 mt-0.5" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>{EMPTY_CONTENT_MESSAGE}</p>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-10">
              <div className="bg-[#F2F5FA] p-7 rounded-lg space-y-5">
                <h4 className="font-semibold text-[22px] leading-tight">{t('programDetail.tuitionHeading')}</h4>
                <div className="leading-tight">
                  <span className="md:text-[50px] text-4xl font-bold">{finalTuitionAndFees}</span>
                </div>
                <Link href="/tuition" className="hover:underline">
                  {t('programDetail.viewFinancialAid')}
                </Link>
              </div>
              <div className="bg-[#F2F5FA] p-7 rounded-lg">
                <h4 className="font-semibold text-[22px] mb-4">{t('programDetail.admissionRequirementsHeading')}</h4>
                {finalAdmissionRequirements.length > 0 ? (
                  <ul className="space-y-3">
                    {finalAdmissionRequirements.map((item, index) => (
                      <li className="flex gap-2.5 items-start" key={`${item}-${index}`}>
                        <IoIosCheckmarkCircleOutline size={24} className="text-[#1E73BE] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{EMPTY_CONTENT_MESSAGE}</p>
                )}
              </div>
              <div className="bg-[#1E73BE] p-7 rounded-lg text-white text-center">
                <h3 className="font-semibold text-[28px] leading-tight mb-5">{t('programDetail.startApplicationTitle')}</h3>
                <p>{t('programDetail.nextCohort')}</p>
                <Link href="/apply" className="inline-flex w-full">
                  <Button variant="white" className="mt-10 w-full">
                    {t('careers.applyNow')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
