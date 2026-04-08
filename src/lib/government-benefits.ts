export const GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT = 20;

export const GOVERNMENT_EMPLOYEE_GROUPS = [
    "Civil Service Employees",
    "Veterans and Active-Duty Personnel",
    "Public Safety Personnel",
    "Public Health and Education Workers",
] as const;

export type GovernmentEmployeeGroup = (typeof GOVERNMENT_EMPLOYEE_GROUPS)[number];

export function normalizeGovernmentEmployeeGroup(
    value: string | null | undefined
): GovernmentEmployeeGroup | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim();
    if (!normalized) {
        return null;
    }

    const match = GOVERNMENT_EMPLOYEE_GROUPS.find((group) => group === normalized);
    return match ?? null;
}
