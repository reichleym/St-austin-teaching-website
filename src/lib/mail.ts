import "server-only";

import nodemailer from "nodemailer";

type SmtpConfig = {
    host: string;
    port: number;
    secure: boolean;
    service: string;
    user: string;
    pass: string;
    from: string;
};

type SendEmailInput = {
    to: string;
    subject: string;
    text: string;
    html: string;
};

declare global {
    var __stAustinMailTransporter: nodemailer.Transporter | undefined;
}

function normalizeEnv(value: string | undefined): string {
    return (value || "").trim();
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
    const normalized = normalizeEnv(value).toLowerCase();
    if (!normalized) {
        return fallback;
    }

    if (normalized === "true" || normalized === "1" || normalized === "yes") {
        return true;
    }

    if (normalized === "false" || normalized === "0" || normalized === "no") {
        return false;
    }

    return fallback;
}

function getSmtpConfig(): SmtpConfig {
    return {
        service: normalizeEnv(process.env.SMTP_SERVICE),
        host: normalizeEnv(process.env.SMTP_HOST),
        port: Number.parseInt(normalizeEnv(process.env.SMTP_PORT) || "465", 10),
        secure: parseBooleanEnv(process.env.SMTP_SECURE, true),
        user: normalizeEnv(process.env.SMTP_USER),
        pass: normalizeEnv(process.env.SMTP_PASS),
        from:
            normalizeEnv(process.env.MAIL_FROM) ||
            normalizeEnv(process.env.SMTP_FROM) ||
            normalizeEnv(process.env.SMTP_FROM_EMAIL),
    };
}

export function isSmtpConfigured(): boolean {
    const config = getSmtpConfig();
    const hasServerConfig = Boolean(config.service || config.host);
    return hasServerConfig && Boolean(config.user && config.pass && config.from);
}

function getTransporter(): nodemailer.Transporter {
    if (globalThis.__stAustinMailTransporter) {
        return globalThis.__stAustinMailTransporter;
    }

    const config = getSmtpConfig();
    if (!isSmtpConfigured()) {
        throw new Error(
            "SMTP is not configured. Set SMTP_HOST/SMTP_PORT/SMTP_SECURE/SMTP_USER/SMTP_PASS and MAIL_FROM."
        );
    }

    const transporter = config.service
        ? nodemailer.createTransport({
              service: config.service,
              auth: {
                  user: config.user,
                  pass: config.pass,
              },
          })
        : nodemailer.createTransport({
              host: config.host,
              port: config.port,
              secure: config.secure,
              auth: {
                  user: config.user,
                  pass: config.pass,
              },
          });

    globalThis.__stAustinMailTransporter = transporter;
    return transporter;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

async function sendEmail(input: SendEmailInput): Promise<void> {
    const config = getSmtpConfig();
    const transporter = getTransporter();

    await transporter.sendMail({
        from: config.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
    });
}

function getGreetingName(fullName: string | undefined, fallback: string): string {
    const normalized = (fullName || "").trim();
    return normalized || fallback;
}

export async function sendApplicationInstructionEmail(input: {
    toEmail: string;
    studentName?: string;
    program: string;
    batchStart?: string;
    checklist: string[];
}): Promise<void> {
    const recipient = input.toEmail.trim();
    const studentName = getGreetingName(input.studentName, "Applicant");
    const safeProgram = input.program.trim();
    const safeBatch = (input.batchStart || "").trim();
    const checklist = input.checklist.map((item) => item.trim()).filter(Boolean);

    const checklistText = checklist.map((item, index) => `${index + 1}. ${item}`).join("\n");
    const checklistHtml = checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

    await sendEmail({
        to: recipient,
        subject: "Application fee received: next steps",
        text: [
            `Hello ${studentName},`,
            "",
            "Your application fee has been received successfully.",
            `Program: ${safeProgram}`,
            safeBatch ? `Intake batch: ${safeBatch}` : "",
            "",
            "Your application is now under review.",
            "Please prepare the required documents below:",
            checklistText,
            "",
            "We will contact you soon with the next update.",
            "",
            "St. Austin Admissions Team",
        ]
            .filter(Boolean)
            .join("\n"),
        html: `
            <p>Hello ${escapeHtml(studentName)},</p>
            <p>Your application fee has been received successfully.</p>
            <p><strong>Program:</strong> ${escapeHtml(safeProgram)}</p>
            ${safeBatch ? `<p><strong>Intake batch:</strong> ${escapeHtml(safeBatch)}</p>` : ""}
            <p>Your application is now under review.</p>
            <p>Please prepare the required documents below:</p>
            <ol>${checklistHtml}</ol>
            <p>We will contact you soon with the next update.</p>
            <p>St. Austin Admissions Team</p>
        `,
	});
}

export async function sendAdminApplicationSubmittedEmail(input: {
	toEmail: string;
	applicantName: string;
	applicantEmail: string;
	phoneNumber: string;
	program: string;
	batchStart: string;
	studentType: string;
	highestEducation: string;
	interestLevel: string;
	interestArea: string;
}): Promise<void> {
	const recipient = input.toEmail.trim();
	const safeApplicantName = (input.applicantName || "").trim() || "Applicant";
	const safeApplicantEmail = input.applicantEmail.trim();
	const safePhone = input.phoneNumber.trim();
	const safeProgram = input.program.trim();
	const safeBatchStart = input.batchStart.trim();
	const safeStudentType = input.studentType.trim();
	const safeHighestEducation = input.highestEducation.trim();
	const safeInterestLevel = input.interestLevel.trim();
	const safeInterestArea = input.interestArea.trim();

	await sendEmail({
		to: recipient,
		subject: `New application submitted: ${safeApplicantName} - ${safeProgram}`,
		text: [
			"New application submitted",
			"",
			`Applicant: ${safeApplicantName}`,
			`Email: ${safeApplicantEmail}`,
			`Phone: ${safePhone}`,
			"",
			`Program: ${safeProgram}`,
			`Intake batch: ${safeBatchStart}`,
			`Student type: ${safeStudentType}`,
			`Highest education: ${safeHighestEducation}`,
			`Interest level: ${safeInterestLevel}`,
			`Area of interest: ${safeInterestArea}`,
			"",
			"St. Austin Admissions Portal",
		]
			.filter(Boolean)
			.join("\n"),
		html: `
      <p><strong>New application submitted</strong></p>
      <p><strong>Applicant:</strong> ${escapeHtml(safeApplicantName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(safeApplicantEmail)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>
      <hr />
      <p><strong>Program:</strong> ${escapeHtml(safeProgram)}</p>
      <p><strong>Intake batch:</strong> ${escapeHtml(safeBatchStart)}</p>
      <p><strong>Student type:</strong> ${escapeHtml(safeStudentType)}</p>
      <p><strong>Highest education:</strong> ${escapeHtml(safeHighestEducation)}</p>
      <p><strong>Interest level:</strong> ${escapeHtml(safeInterestLevel)}</p>
      <p><strong>Area of interest:</strong> ${escapeHtml(safeInterestArea)}</p>
      <p>St. Austin Admissions Portal</p>
    `,
	});
}

export async function sendRequestInfoNotificationEmail(input: {
	toEmail: string;
	fullName: string;
	email: string;
	phone: string;
	program: string;
	message?: string;
}): Promise<void> {
	const recipient = input.toEmail.trim();
	const safeFullName = (input.fullName || "").trim() || "Prospective Student";
	const safeEmail = input.email.trim();
	const safePhone = input.phone.trim();
	const safeProgram = input.program.trim();
	const safeMessage = (input.message || "").trim();

	await sendEmail({
		to: recipient,
		subject: `Request info: ${safeFullName} - ${safeProgram}`,
		text: [
			"New Request Info submission",
			"",
			`Name: ${safeFullName}`,
			`Email: ${safeEmail}`,
			`Phone: ${safePhone}`,
			`Program interest: ${safeProgram}`,
			safeMessage ? `Message: ${safeMessage}` : "",
			"",
			"St. Austin Website",
		]
			.filter(Boolean)
			.join("\n"),
		html: `
      <p><strong>New Request Info submission</strong></p>
      <p><strong>Name:</strong> ${escapeHtml(safeFullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>
      <p><strong>Program interest:</strong> ${escapeHtml(safeProgram)}</p>
      ${safeMessage ? `<p><strong>Message:</strong><br/>${escapeHtml(safeMessage).replaceAll("\n", "<br/>")}</p>` : ""}
      <p>St. Austin Website</p>
    `,
	});
}

export async function sendPasswordResetEmail(input: {
	toEmail: string;
	fullName?: string;
	resetLink: string;
}): Promise<void> {
    const recipient = input.toEmail.trim();
    const studentName = getGreetingName(input.fullName, "there");
    const link = input.resetLink.trim();

    await sendEmail({
        to: recipient,
        subject: "Reset your St. Austin portal password",
        text: [
            `Hello ${studentName},`,
            "",
            "We received a request to reset your password.",
            "Use the link below to set a new password:",
            link,
            "",
            "If you did not request this, you can safely ignore this email.",
            "",
            "St. Austin Support",
        ].join("\n"),
        html: `
            <p>Hello ${escapeHtml(studentName)},</p>
            <p>We received a request to reset your password.</p>
            <p><a href="${escapeHtml(link)}">Click here to reset your password</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
            <p>St. Austin Support</p>
        `,
    });
}

export async function sendEmailVerificationEmail(input: {
    toEmail: string;
    fullName?: string;
    verificationLink: string;
}): Promise<void> {
    const recipient = input.toEmail.trim();
    const studentName = getGreetingName(input.fullName, "there");
    const link = input.verificationLink.trim();

    await sendEmail({
        to: recipient,
        subject: "Verify your St. Austin account email",
        text: [
            `Hello ${studentName},`,
            "",
            "Please verify your email address to secure your account.",
            "Verification link:",
            link,
            "",
            "If you did not create this account, you can ignore this email.",
            "",
            "St. Austin Support",
        ].join("\n"),
        html: `
            <p>Hello ${escapeHtml(studentName)},</p>
            <p>Please verify your email address to secure your account.</p>
            <p><a href="${escapeHtml(link)}">Click here to verify your email</a></p>
            <p>If you did not create this account, you can ignore this email.</p>
            <p>St. Austin Support</p>
        `,
    });
}
