'use client';

import { useTranslations } from '@/lib/useTranslations';

export default function NoCoursesFound() {
  const { t } = useTranslations();

  return (
    <p className="text-center text-lg">
      {t('featuredPrograms.noCourses')}
    </p>
  );
}
