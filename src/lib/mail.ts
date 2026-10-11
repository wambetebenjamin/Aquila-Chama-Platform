import nodemailer from "nodemailer";

/**
 * Transactional email for /api/contact.
 * Without SMTP credentials the message is logged instead of sent, so the form
 * still succeeds in local development and preview.
 */

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface MailResult {
  delivered: boolean;
  via: "smtp" | "log";
  detail: string;
}

export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

export async function sendContactEmail(payload: ContactPayload): Promise<MailResult> {
  const to = process.env.CONTACT_TO_EMAIL ?? "hello@aquilachama.co.ke";
  const from =
    process.env.MAIL_FROM ?? "Aquila Chama Platform <no-reply@aquilachama.co.ke>";

  const text = [
    `Name:    ${payload.name}`,
    `Email:   ${payload.email}`,
    `Phone:   ${payload.phone ?? "not provided"}`,
    `Subject: ${payload.subject}`,
    "",
    payload.message,
  ].join("\n");

  if (!mailConfigured()) {
    console.info("[contact] SMTP not configured. Enquiry payload:\n" + text);
    return {
      delivered: false,
      via: "log",
      detail: "SMTP not configured; enquiry recorded in the server log",
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: Number.parseInt(process.env.SMTP_PORT ?? "587", 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.email,
    subject: `[Aquila Enquiry] ${payload.subject}`,
    text,
    html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${text.replace(/</g, "&lt;")}</pre>`,
  });

  return { delivered: true, via: "smtp", detail: `Delivered to ${to}` };
}
