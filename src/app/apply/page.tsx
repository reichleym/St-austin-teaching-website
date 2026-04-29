import ApplyPageContent from "./apply";
import {
  getCurrentSessionUser,
  getCurrentUserApplicationStatus,
  getCurrentUserGovernmentBenefit,
  type ApplicationStatus,
  type AuthUser,
  type GovernmentBenefit,
} from "@/lib/auth/server";
import { isDatabaseConfigured } from "@/lib/postgres";
import { getCourses } from "@/lib/course-catalog";
import { getServerLanguage } from "@/lib/i18n/server";
import ApplyEntryClient from "@/components/ApplyEntryClient";

const FALLBACK_PROGRAM_OPTIONS = ["Data Science", "Business Administration", "Public Health"];

export default async function ApplyPage() {
  const lang = await getServerLanguage();
  let initialApplicationStatus: ApplicationStatus = "not_started";
  let programOptions = FALLBACK_PROGRAM_OPTIONS;
  let initialSessionUser: AuthUser | null = null;
  let initialGovernmentBenefit: GovernmentBenefit = {
    isGovernmentEmployee: false,
    governmentEmployeeGroup: null,
    governmentEmployeeId: null,
    governmentVerificationStatus: "not_submitted",
    governmentDiscountPercent: 0,
  };

  if (isDatabaseConfigured) {
    try {
      initialSessionUser = await getCurrentSessionUser();
    } catch {
      initialSessionUser = null;
    }

    if (!initialSessionUser) {
      return (
        <>
          <ApplyEntryClient />
          <section className="py-25">
            <div className="container">
              <h1 className="text-3xl md:text-[40px] font-bold">Sign in to apply</h1>
              <p className="mt-3 text-[#333333]">Please sign in first to continue your application.</p>
            </div>
          </section>
        </>
      );
    }

    try {
      initialApplicationStatus = await getCurrentUserApplicationStatus();
    } catch {
      initialApplicationStatus = "not_started";
    }

    try {
      initialGovernmentBenefit = await getCurrentUserGovernmentBenefit();
    } catch {
      initialGovernmentBenefit = {
        isGovernmentEmployee: false,
        governmentEmployeeGroup: null,
        governmentEmployeeId: null,
        governmentVerificationStatus: "not_submitted",
        governmentDiscountPercent: 0,
      };
    }

    try {
      const courses = await getCourses({ language: lang });
      const dynamicOptions = Array.from(
        new Set(
          courses
            .map((course) => course.title.trim())
            .filter((title) => title.length > 0)
        )
      );

      if (dynamicOptions.length > 0) {
        programOptions = dynamicOptions;
      }
    } catch {
      programOptions = FALLBACK_PROGRAM_OPTIONS;
    }
  }

  return (
    <ApplyPageContent
      initialApplicationStatus={initialApplicationStatus}
      programOptions={programOptions}
      initialSessionUser={initialSessionUser}
      initialGovernmentBenefit={initialGovernmentBenefit}
    />
  );
}
