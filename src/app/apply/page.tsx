import ApplyPageContent from "./apply";
import {
  getCurrentUserApplicationStatus,
  getCurrentUserGovernmentBenefit,
  type ApplicationStatus,
  type GovernmentBenefit,
} from "@/lib/auth/server";
import { isDatabaseConfigured } from "@/lib/postgres";
import { getCourses } from "@/lib/course-catalog";

const FALLBACK_PROGRAM_OPTIONS = ["Data Science", "Business Administration", "Public Health"];

export default async function ApplyPage() {
  let initialApplicationStatus: ApplicationStatus = "not_started";
  let programOptions = FALLBACK_PROGRAM_OPTIONS;
  let initialGovernmentBenefit: GovernmentBenefit = {
    isGovernmentEmployee: false,
    governmentEmployeeGroup: null,
    governmentDiscountPercent: 0,
  };

  if (isDatabaseConfigured) {
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
        governmentDiscountPercent: 0,
      };
    }

    try {
      const courses = await getCourses({});
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
      initialGovernmentBenefit={initialGovernmentBenefit}
    />
  );
}
