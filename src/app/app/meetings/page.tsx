import { auth } from "@/lib/auth";
import { getChama } from "@/lib/data";
import MeetingsWorkspace, { type MeetingRow } from "@/components/dashboard/MeetingsWorkspace";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);
  const canManage = ["ADMIN", "TREASURER"].includes(session?.user?.role ?? "");

  const meetings: MeetingRow[] = chama.meetings
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((meeting) => ({
      meeting,
      presentCount: meeting.presentMemberIds.length,
    }));

  return (
    <>
      <PageHeader
        title="Meetings"
        subtitle={`Meetings are held every ${chama.settings.meetingDay}`}
      />

      <MeetingsWorkspace
        meetings={meetings}
        members={chama.members.map((m) => ({ id: m.id, name: m.name }))}
        canManage={canManage}
      />
    </>
  );
}
