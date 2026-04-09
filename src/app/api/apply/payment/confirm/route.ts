import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { setCurrentUserApplicationStatus } from "@/lib/auth/server";
import { getCampayTransactionStatus } from "@/lib/campay";
import { isSmtpConfigured, sendApplicationInstructionEmail } from "@/lib/mail";

type ConfirmPaymentBody = {
    reference?: string;
    application?: {
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
    };
};

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

function hasRequiredString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    try {
        const body = (await request.json().catch(() => ({}))) as ConfirmPaymentBody;
        const reference = body.reference?.trim() || "";
        const application = body.application || {};

        if (!reference) {
            return NextResponse.json(
                { ok: false, error: "Payment reference is required." },
                { status: 400 }
            );
        }

        if (!hasRequiredString(application.program) || !hasRequiredString(application.email)) {
            return NextResponse.json(
                { ok: false, error: "Missing application details for confirmation." },
                { status: 400 }
            );
        }

        const transaction = await getCampayTransactionStatus(reference);
        const paymentStatus = String(transaction.status || "").toUpperCase();
        const successfulStatuses = new Set(["SUCCESSFUL", "SUCCESS", "COMPLETED", "PAID"]);
        const pendingStatuses = new Set(["PENDING", "PROCESSING", "INITIATED"]);

        if (!successfulStatuses.has(paymentStatus)) {
            return NextResponse.json(
                {
                    ok: false,
                    error:
                        pendingStatuses.has(paymentStatus)
                            ? "Your payment is still pending confirmation. Please wait and try again."
                            : "Payment was not successful. Please try again.",
                    paymentStatus,
                    transaction,
                },
                { status: 409 }
            );
        }

        try {
            await setCurrentUserApplicationStatus("under_review");
        } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (message !== "Unauthorized.") {
                throw error;
            }
        }

        const instructionChecklist = getInstructionChecklistForProgram(application.program);
        const applicantFullName = `${application.firstName?.trim() || ""} ${application.lastName?.trim() || ""}`.trim();

        let instructionEmailMessage = "Instruction email has been sent.";

        try {
            if (!isSmtpConfigured()) {
                instructionEmailMessage =
                    "Payment confirmed. Instruction email is temporarily unavailable.";
            } else {
                await sendApplicationInstructionEmail({
                    toEmail: application.email.trim(),
                    studentName: applicantFullName || "Applicant",
                    program: application.program.trim(),
                    batchStart: hasRequiredString(application.batchStart)
                        ? application.batchStart.trim()
                        : undefined,
                    checklist: instructionChecklist,
                });
            }
        } catch (emailError) {
            console.error("[api/apply/payment/confirm] instruction email failed", emailError);
            instructionEmailMessage =
                "Payment confirmed. We could not send the instruction email right now.";
        }

        return NextResponse.json({
            ok: true,
            status: "under_review",
            paymentStatus,
            transaction,
            emails: {
                confirmationEmail: application.email.trim(),
                instructionProgram: application.program.trim(),
                instructionChecklist,
                instructionEmailMessage,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to confirm payment.";
        const statusCode = message === "Unauthorized." ? 401 : 400;
        return NextResponse.json({ ok: false, error: message }, { status: statusCode });
    }
}
