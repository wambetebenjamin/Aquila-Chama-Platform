import { formatKES } from "./format";

/**
 * WhatsApp integration.
 *
 * Every outbound message degrades gracefully to a wa.me deep link when the
 * WhatsApp Cloud API is not configured, so the feature works on day one.
 */

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254112272061";

export const WHATSAPP_REGISTER_URL =
  "https://wa.me/254112272061?text=Hello!%20I%20would%20like%20to%20register%20my%20chama%20on%20Aquila%20Platform.";

export function waLink(message: string, phone?: string): string {
  const target = phone ? phone.replace(/[^0-9]/g, "") : WHATSAPP_NUMBER;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppResult {
  delivered: boolean;
  via: "cloud-api" | "wa.me";
  link: string;
  detail: string;
}

async function sendViaCloudApi(phone: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  const to = phone.replace(/[^0-9]/g, "");
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { preview_url: false, body: message },
        }),
        cache: "no-store",
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendWhatsApp(
  phone: string,
  message: string,
): Promise<WhatsAppResult> {
  const link = waLink(message, phone);
  const sent = await sendViaCloudApi(phone, message);
  return {
    delivered: sent,
    via: sent ? "cloud-api" : "wa.me",
    link,
    detail: sent
      ? "Delivered through the WhatsApp Cloud API"
      : "Cloud API not configured, returning a wa.me link instead",
  };
}

/* ------------------------------------------------------------------ */
/* Message templates                                                    */
/* ------------------------------------------------------------------ */

export function contributionReminderMessage(input: {
  chamaName: string;
  memberName: string;
  amount: number;
  month: string;
}): string {
  return (
    `Jambo ${input.memberName}, this is a reminder from ${input.chamaName} on Aquila Chama Platform. ` +
    `Your contribution of ${formatKES(input.amount)} for ${input.month} is not yet recorded. ` +
    `Please pay via M-Pesa and share the confirmation code. Asante!`
  );
}

export function guarantorNotificationMessage(input: {
  chamaName: string;
  guarantorName: string;
  applicantName: string;
  amount: number;
  purpose: string;
  voteUrl: string;
}): string {
  return (
    `Jambo ${input.guarantorName}, ${input.applicantName} has named you as a guarantor for a loan of ` +
    `${formatKES(input.amount)} (${input.purpose}) in ${input.chamaName}. ` +
    `Please approve or reject it here: ${input.voteUrl}`
  );
}

export function meetingMinutesMessage(input: {
  chamaName: string;
  meetingDate: string;
  minutes: string;
}): string {
  return (
    `${input.chamaName} meeting minutes for ${input.meetingDate}:\n\n${input.minutes}\n\n` +
    `Sent from Aquila Chama Platform.`
  );
}

export function reportDeliveryMessage(input: {
  chamaName: string;
  period: string;
  totalSavings: number;
  loansOutstanding: number;
  reportUrl?: string;
}): string {
  return (
    `${input.chamaName} statement for ${input.period}.\n` +
    `Total savings: ${formatKES(input.totalSavings)}\n` +
    `Loans outstanding: ${formatKES(input.loansOutstanding)}` +
    `${input.reportUrl ? `\nDownload: ${input.reportUrl}` : ""}\n\n` +
    `Sent from Aquila Chama Platform.`
  );
}
