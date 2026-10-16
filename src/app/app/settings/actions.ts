"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getChama, logActivity, saveChama } from "@/lib/data";

const schema = z.object({
  name: z.string().min(2).max(120),
  registrationNumber: z.string().max(60).optional().default(""),
  county: z.string().min(2).max(60),
  contributionAmount: z.coerce.number().int().min(100).max(1_000_000),
  meetingDay: z.string().min(3).max(20),
  whatsappNumber: z.string().min(9).max(20),
  interestRate: z.coerce.number().min(0).max(100),
});

export type SettingsInput = z.infer<typeof schema>;

/**
 * Server action rather than a new API route: the brief fixes the API surface,
 * and settings is the one write that is naturally a form post.
 */
export async function updateChamaSettings(input: SettingsInput) {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Sign in to continue." };
  if (session.user.role !== "ADMIN") {
    return { ok: false, message: "Only an administrator can change group settings." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the settings and try again.",
    };
  }

  const chama = await getChama(session.user.chamaId || undefined);
  chama.settings = { ...chama.settings, ...parsed.data };
  await logActivity(chama, "report", "Group settings updated.");
  await saveChama(chama);

  revalidatePath("/app/settings");
  revalidatePath("/app");

  return { ok: true, message: "Settings saved." };
}
