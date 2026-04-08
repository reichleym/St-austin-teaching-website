import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { setCurrentUserApplicationStatus } from "@/lib/auth/server";

type SubmitApplicationBody = {
    program?: string;
    batchStart?: string;
    studentType?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    highestEducation?: string;
    interestLevel?: string;
    interestArea?: string;
    payment?: {
        method?: string;
        amountUsd?: number;
        cardLast4?: string;
    };
};

const ALLOWED_BATCHES = new Set(["September", "January", "May"]);

function serviceUnavailableResponse() {
    return NextResponse.json(
        {
            ok: false,
            error: "Database is not configured.",
            expectedEnvKeys: databaseEnvKeys,
        },
        { status: 503 }
    );
}

function getInstructionChecklistForProgram(program: string): string[] {
    const normalizedProgram = program.trim().toLowerCase();

    if (normalizedProgram.includes("data")) {
        return [
            "Most recent transcript",
            "Current resume/CV",
            "Short statement of learning goals",
            "Proof of identity document",
        ];
    }

    if (normalizedProgram.includes("business")) {
        return [
            "Most recent transcript",
            "Current resume/CV",
            "Personal statement",
            "Proof of identity document",
        ];
    }

    if (normalizedProgram.includes("public")) {
        return [
            "Most recent transcript",
            "Current resume/CV",
            "Statement of purpose",
            "Proof of identity document",
        ];
    }

    return [
        "Most recent transcript",
        "Current resume/CV",
        "Personal statement",
        "Proof of identity document",
    ];
}

function hasRequiredString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    try {
        const body = (await request.json().catch(() => ({}))) as SubmitApplicationBody;
        const {
            program,
            batchStart,
            studentType,
            firstName,
            lastName,
            email,
            phoneNumber,
            highestEducation,
            interestLevel,
            interestArea,
            payment,
        } = body;

        if (
            !hasRequiredString(program) ||
            !hasRequiredString(batchStart) ||
            !hasRequiredString(studentType) ||
            !hasRequiredString(firstName) ||
            !hasRequiredString(lastName) ||
            !hasRequiredString(email) ||
            !hasRequiredString(phoneNumber) ||
            !hasRequiredString(highestEducation) ||
            !hasRequiredString(interestLevel) ||
            !hasRequiredString(interestArea)
        ) {
            return NextResponse.json(
                { ok: false, error: "Missing required application fields." },
                { status: 400 }
            );
        }

        if (!ALLOWED_BATCHES.has(batchStart.trim())) {
            return NextResponse.json(
                { ok: false, error: "Invalid batch start selection." },
                { status: 400 }
            );
        }

        if (!isValidEmail(email.trim())) {
            return NextResponse.json(
                { ok: false, error: "Invalid email address." },
                { status: 400 }
            );
        }

        if (
            payment?.method !== "card" ||
            typeof payment.amountUsd !== "number" ||
            !Number.isFinite(payment.amountUsd) ||
            payment.amountUsd <= 0 ||
            !hasRequiredString(payment.cardLast4) ||
            payment.cardLast4.trim().length < 4
        ) {
            return NextResponse.json(
                { ok: false, error: "Application fee payment is required before submission." },
                { status: 400 }
            );
        }

        const instructionChecklist = getInstructionChecklistForProgram(program);

        await setCurrentUserApplicationStatus("under_review");

        console.log("[Apply Submit]", {
            program: program.trim(),
            batchStart: batchStart.trim(),
            studentType: studentType.trim(),
            applicant: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
            },
            profile: {
                highestEducation: highestEducation.trim(),
                interestLevel: interestLevel.trim(),
                interestArea: interestArea.trim(),
            },
            payment: {
                method: payment.method,
                amountUsd: Number(payment.amountUsd.toFixed(2)),
                cardLast4: payment.cardLast4.trim().slice(-4),
            },
            emailsQueued: ["confirmation", "instruction"],
            instructionChecklist,
        });

        return NextResponse.json({
            ok: true,
            status: "under_review",
            emails: {
                confirmationEmail: email.trim(),
                instructionProgram: program.trim(),
                instructionChecklist,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to submit application.";
        const statusCode = message === "Unauthorized." ? 401 : 400;
        return NextResponse.json({ ok: false, error: message }, { status: statusCode });
    }
}
