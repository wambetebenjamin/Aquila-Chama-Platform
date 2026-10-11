import Link from "next/link";
import { auth } from "@/lib/auth";
import { getChama, loanBalance, paidCount } from "@/lib/data";
import AddMemberForm from "@/components/dashboard/AddMemberForm";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/ui";
import { formatDate, formatKES } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);
  const canManage = ["ADMIN", "TREASURER"].includes(session?.user?.role ?? "");

  return (
    <>
      <PageHeader
        title="Members"
        subtitle={`${chama.members.length} people on the register`}
      />

      {canManage && (
        <div className="mb-6">
          <Panel title="Add a member">
            <AddMemberForm chamaName={chama.settings.name} />
          </Panel>
        </div>
      )}

      <Panel title="Member register">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Phone</th>
                <th scope="col">Contributions paid</th>
                <th scope="col">Loan balance</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chama.members.map((member) => {
                const balance = loanBalance(chama, member.id);
                const invite =
                  `Jambo ${member.name}, you are on the register of ${chama.settings.name}. ` +
                  `Monthly contribution is KES ${chama.settings.contributionAmount}.`;
                return (
                  <tr key={member.id}>
                    <td>
                      <Link
                        href={`/app/members/${member.id}`}
                        style={{ fontWeight: 600, color: "var(--color-black)" }}
                      >
                        {member.name}
                      </Link>
                      <br />
                      <span style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
                        Joined {formatDate(member.joinDate)}
                      </span>
                    </td>
                    <td>{member.phone}</td>
                    <td>{paidCount(chama, member.id)} months</td>
                    <td style={{ color: balance > 0 ? "var(--color-danger)" : "inherit" }}>
                      {formatKES(balance)}
                    </td>
                    <td>
                      <StatusBadge status={member.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={waLink(invite, member.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Invite on WhatsApp
                        </a>
                        <Link
                          href={`/app/members/${member.id}`}
                          className="btn btn-sm btn-secondary"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
