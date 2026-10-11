import { NextResponse } from "next/server";
import { z } from "zod";
import { getChama, logActivity, saveChama } from "@/lib/data";
import { makeId } from "@/lib/store";
import { meetingMinutesMessage, sendWhatsApp, waLink } from "@/lib/whatsapp";
import { formatDate } from "@/lib/format";
import { badRequest, guard } from "../_lib/guard";
import type { Meeting } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(3).max(8),
  agenda: z.string().min(3).max(600),
});

const updateSchema = z.object({
  id: z.string().min(1),
  minutes: z.string().max(8000).optional(),
  presentMemberIds: z.array(z.string()).optional(),
  share: z.boolean().optional(),
});

/** GET /api/meetings — meeting log (protected). */
export async function GET() {
  const access = await guard();
  if (!access.ok) return access.response;

  const chama = await getChama(access.session.user.chamaId || undefined);
  return NextResponse.json({ ok: true, meetings: chama.meetings });
}

/** POST /api/meetings — schedule a meeting. */
export async function POST(request: Request) {
  const access = await guard(["ADMIN", "TREASURER"]);
  if (!access.ok) return access.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) return badRequest("Give the meeting a date, time and agenda.");

  const chama = await getChama(access.session.user.chamaId || undefined);

  const meeting: Meeting = {
    id: makeId("mtg"),
    date: parsed.data.date,
    time: parsed.data.time,
    agenda: parsed.data.agenda,
    minutes: "",
    presentMemberIds: [],
  };

  chama.meetings.push(meeting);
  await logActivity(
    chama,
    "meeting",
    `Meeting scheduled for ${formatDate(parsed.data.date)} at ${parsed.data.time}.`,
  );
  await saveChama(chama);

  return NextResponse.json({
    ok: true,
    message: `Meeting scheduled for ${formatDate(parsed.data.date)}.`,
    meeting,
  });
}

/**
 * PATCH /api/meetings — record attendance, save minutes, and optionally share
 * the minutes with every member on WhatsApp.
 */
export async function PATCH(request: Request) {
  const access = await guard(["ADMIN", "TREASURER"]);
  if (!access.ok) return access.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) return badRequest("Check the meeting details.");

  const chama = await getChama(access.session.user.chamaId || undefined);
  const meeting = chama.meetings.find((m) => m.id === parsed.data.id);
  if (!meeting) return badRequest("Meeting not found.");

  if (parsed.data.minutes !== undefined) meeting.minutes = parsed.data.minutes;
  if (parsed.data.presentMemberIds) {
    meeting.presentMemberIds = parsed.data.presentMemberIds;
  }

  let shared = 0;
  let sharedLink: string | null = null;

  if (parsed.data.share && meeting.minutes) {
    const message = meetingMinutesMessage({
      chamaName: chama.settings.name,
      meetingDate: formatDate(meeting.date),
      minutes: meeting.minutes,
    });

    const results = await Promise.all(
      chama.members
        .filter((m) => m.status === "ACTIVE")
        .map((m) => sendWhatsApp(m.phone, message)),
    );
    shared = results.filter((r) => r.delivered).length;
    sharedLink = waLink(message);
    await logActivity(
      chama,
      "meeting",
      `Minutes for ${formatDate(meeting.date)} shared with ${chama.members.length} members.`,
    );
  }

  await saveChama(chama);

  return NextResponse.json({
    ok: true,
    message: parsed.data.share
      ? `Minutes shared with the group.${shared > 0 ? "" : " Open the link to send them manually."}`
      : "Meeting updated.",
    meeting,
    shared,
    link: sharedLink,
  });
}
