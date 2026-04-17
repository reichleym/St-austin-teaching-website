'use client';

import BannerSection from '@/components/sections/BannerSection';
import Accreditation from '@/components/sections/Accreditation';
import IconCard from '@/components/IconCard';
import ProgramCard from '@/components/ProgramCard';
import CtaSection from '@/components/CtaSection';
import Button from '@/components/Button';
import Link from 'next/link';
import { useTranslations } from '@/lib/useTranslations';
import type { CourseCardItem } from '@/lib/course-catalog';

interface PortalOverviewClientProps {
  dynamicPrograms: CourseCardItem[];
}

export default function PortalOverviewClient({ dynamicPrograms }: PortalOverviewClientProps) {
  const { t } = useTranslations();

  const blockContent = [
    {
      cardTitle: t('portal.blocks.students.title'),
      cardDescription: t('portal.blocks.students.description'),
      icon: '/awards-icon.png',
    },
    {
      cardTitle: t('portal.blocks.faculty.title'),
      cardDescription: t('portal.blocks.faculty.description'),
      icon: '/business-icon.png',
    },
    {
      cardTitle: t('portal.blocks.administrators.title'),
      cardDescription: t('portal.blocks.administrators.description'),
      icon: '/business-icon.png',
    },
  ];

  const featureContent = [
    {
      cardTitle: t('portal.features.courseManagement.title'),
      cardDescription: t('portal.features.courseManagement.description'),
      icon: '/awards-icon.png',
    },
    {
      cardTitle: t('portal.features.messaging.title'),
      cardDescription: t('portal.features.messaging.description'),
      icon: '/business-icon.png',
    },
    {
      cardTitle: t('portal.features.progressTracking.title'),
      cardDescription: t('portal.features.progressTracking.description'),
      icon: '/nursing-icon.png',
    },
    {
      cardTitle: t('portal.features.assignmentSystem.title'),
      cardDescription: t('portal.features.assignmentSystem.description'),
      icon: '/awards-icon.png',
    },
    {
      cardTitle: t('portal.features.virtualClassrooms.title'),
      cardDescription: t('portal.features.virtualClassrooms.description'),
      icon: '/business-icon.png',
    },
    {
      cardTitle: t('portal.features.collaboration.title'),
      cardDescription: t('portal.features.collaboration.description'),
      icon: '/nursing-icon.png',
    },
  ];

  return (
    <>
      <BannerSection
        titleKey="portal.bannerTitle"
        descriptionKey="portal.bannerDescription"
        bgImg="/bannerImg.jpg"
      />

      <section className="md:py-25 py-15">
        <div className="container-fluid max-w-[950px]">
          <IconCard blockContent={blockContent} classNameCard="border border-[#33333340] p-[20px] items-center text-center" className="" />
        </div>
      </section>

      <Accreditation
        blockContent={featureContent}
        title={t('portal.features.title')}
        description={t('portal.features.description')}
        className="bg-[#F5F5F5] py-25"
        classNameCard="items-center text-center md:gap-x-15"
      />

      <section className="py-25">
        <div className="container">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">{t('portal.programsSectionTitle')}</h2>
            <p className="mt-2 text-lg text-[#333333CC]">{t('portal.programsSectionDescription')}</p>
          </div>
          <ProgramCard programCardContent={dynamicPrograms.length > 0 ? dynamicPrograms : undefined} />
        </div>
      </section>

      <section className="py-25">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="md:col-span-1">
              <h2 className="text-3xl font-bold mb-[10px]">{t('portal.intuitiveTitle')}</h2>
              <p className="text-lg">{t('portal.intuitiveDescription')}</p>
              <Link href="/portal/dashboard" className="inline-flex">
                <Button className="mt-6" variant="primary">{t('portal.goToPortal')}</Button>
              </Link>
            </div>
            <div className="md:col-span-1">
              <img src="cta-img.png" className="max-w-[500px] ml-auto h-full max-h-[400px] object-cover rounded-[8px]" alt={t('portal.intuitiveTitle')} />
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
