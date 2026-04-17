'use client';

import { useTranslations } from '@/lib/useTranslations';
import Button from '@/components/Button';
import Link from 'next/link';
import type { AuthUser } from '@/lib/auth/server';

interface PortalDashboardClientProps {
  user: AuthUser;
}

function formatTranslation(text: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce((next, [key, value]) => next.replace(`{${key}}`, String(value)), text);
}

export default function PortalDashboardClient({ user }: PortalDashboardClientProps) {
  const { t } = useTranslations();

  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="rounded-[14px] border border-[#33333340] bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1E73BE]">{t('portal.dashboard.studentPortal')}</p>
          <h1 className="mt-4 text-3xl font-semibold text-[#333333] md:text-4xl">
            {formatTranslation(t('portal.dashboard.welcomeBack'), { name: user.fullName })}
          </h1>
          <p className="mt-4 text-lg text-[#333333]">
            {formatTranslation(t('portal.dashboard.signedInAs'), { email: user.email })}
          </p>
          <p className="mt-3 text-base text-[#666666]">{t('portal.dashboard.protectedIntro')}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/portal">
              <Button variant="outline">{t('portal.dashboard.backToPortalOverview')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
