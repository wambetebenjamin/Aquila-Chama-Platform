import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, verifyCaptcha } from "@/lib/captcha";
import { getChama, logActivity, memberById, saveChama } from "@/lib/data";
import { makeId } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";
import { badRequest, guard } from "../_lib/guard";
import type { Member } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(9).max(20),
  idNumber: z.string().min(4).max(20),
  joinDate: z.string().min(8).max(12),
  captchaToken: z.string().nullable().optional(),
});

/** GET /api/members — chama member register (protected). */
export async function GET() {
  const access = await guard();
  if (!access.ok) return access.response;

  const chama = await getChama(access.session.user.chamaId || undefined);
  return NextResponse.json({ ok: true, members: chama.members });
}

/** POST /api/members — add a member (admin or treasurer). */
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
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Check the member details.");
  }

  const captcha = await verifyCaptcha(parsed.data.captchaToken, clientIp(request));
  if (!captcha.ok) {
    return badRequest(
      "Security check failed. Please complete the challenge.",
      captcha.challengeRequired,
    );
  }

  const chama = await getChama(access.session.user.chamaId || undefined);

  if (chama.members.some((m) => m.phone === parsed.data.phone)) {
    return badRequest("A member with that phone number is already registered.");
  }

  const member: Member = {
    id: makeId("mem"),
    name: parsed.data.name,
    phone: parsed.data.phone,
    idNumber: parsed.data.idNumber,
    joinDate: parsed.data.joinDate,
    status: "ACTIVE",
    role: "MEMBER",
  };

  chama.members.push(member);
  await logActivity(chama, "member", `${parsed.data.name} joined ${chama.settings.name}.`);
  await saveChama(chama);

  const invite =
    `Jambo ${parsed.data.name}, you have been added to ${chama.settings.name} on Aquila Chama Platform. ` +
    `Monthly contribution is KES ${chama.settings.contributionAmount}.`;

  return NextResponse.json({
    ok: true,
    message: `${parsed.data.name} added to the register.`,
    member,
    inviteLink: waLink(invite, parsed.data.phone),
  });
}

/** DELETE /api/members?id=... — remove a member (admin only). */
export async function DELETE(request: Request) {
  const access = await guard(["ADMIN"]);
  if (!access.ok) return access.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("A member id is required.");

  const chama = await getChama(access.session.user.chamaId || undefined);
  const member = memberById(chama, id);
  if (!member) return badRequest("Member not found.");

  chama.members = chama.members.filter((m) => m.id !== id);
  await logActivity(chama, "member", `${member.name} was removed from the register.`);
  await saveChama(chama);

  return NextResponse.json({ ok: true, message: `${member.name} removed.` });
}
