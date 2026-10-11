"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarPlus, Loader2, Share2, Save } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export interface MeetingRow {
  meeting: Meeting;
  presentCount: number;
}

export default function MeetingsWorkspace({
  meetings,
  members,
  canManage,
}: {
  meetings: MeetingRow[];
  members: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; text: string; ok: boolean } | null>(
    null,
  );

  async function save(meeting: Meeting, share: boolean) {
    setBusy(meeting.id + (share ? "share" : "save"));
    setFeedback(null);
    try {
      const res = await fetch("/api/meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: meeting.id,
          minutes: meeting.minutes,
          presentMemberIds: meeting.presentMemberIds,
          share,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message: string;
        link?: string | null;
        shared?: number;
      };
      setFeedback({ id: meeting.id, text: json.message, ok: json.ok });
      if (share && json.link && !json.shared) {
        window.open(json.link, "_blank", "noopener");
      }
      router.refresh();
    } catch {
      setFeedback({ id: meeting.id, text: "Could not save the meeting.", ok: false });
    } finally {
      setBusy(null);
    }
  }

  const [draft, setDraft] = useState<Record<string, Meeting>>(() =>
    Object.fromEntries(meetings.map((m) => [m.meeting.id, m.meeting])),
  );

  const upcoming = draft
    ? meetings.filter((m) => m.meeting.date >= "2026-10-11")
    : [];
  const past = meetings.filter((m) => m.meeting.date < "2026-10-11");

  return (
    <div className="grid gap-6">
      {canManage && <ScheduleMeetingForm />}

      <section className="card-surface" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
          Upcoming meetings
        </h2>

        {upcoming.length === 0 && <p>No meetings scheduled. Add one above.</p>}

        <div className="grid gap-4">
          {upcoming.map(({ meeting }) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              members={members}
              canManage={canManage}
              busy={busy}
              onSave={(m, share) => void save(m, share)}
              onChange={(next) => setDraft((d) => ({ ...d, [next.id]: next }))}
            />
          ))}
        </div>
      </section>

      <section className="card-surface" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
          Meeting log
        </h2>

        {past.length === 0 && <p>No past meetings recorded.</p>}

        <div className="grid gap-4">
          {past.map(({ meeting }) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              members={members}
              canManage={canManage}
              busy={busy}
              onSave={(m, share) => void save(m, share)}
              onChange={(next) => setDraft((d) => ({ ...d, [next.id]: next }))}
            />
          ))}
        </div>

        {feedback && (
          <p
            role="status"
            style={{
              marginTop: "1rem",
              fontSize: "var(--text-meta)",
              color: feedback.ok ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {feedback.text}
          </p>
        )}
      </section>
    </div>
  );
}

function MeetingCard({
  meeting,
  members,
  canManage,
  busy,
  onSave,
  onChange,
}: {
  meeting: Meeting;
  members: { id: string; name: string }[];
  canManage: boolean;
  busy: string | null;
  onSave: (meeting: Meeting, share: boolean) => void;
  onChange: (meeting: Meeting) => void;
}) {
  const [local, setLocal] = useState<Meeting>(meeting);

  const toggle = (memberId: string) => {
    const next: Meeting = {
      ...local,
      presentMemberIds: local.presentMemberIds.includes(memberId)
        ? local.presentMemberIds.filter((id) => id !== memberId)
        : [...local.presentMemberIds, memberId],
    };
    setLocal(next);
    onChange(next);
  };

  return (
    <article
      className="rounded border p-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--color-black)" }}>
            {formatDate(local.date)} at {local.time}
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
            {local.presentMemberIds.length} of {members.length} present
          </p>
        </div>
        <span className="chip">{local.agenda.slice(0, 48)}</span>
      </div>

      <p style={{ fontSize: "15px", color: "var(--color-gray-700)" }}>{local.agenda}</p>

      <fieldset className="mt-3" disabled={!canManage}>
        <legend
          style={{
            fontSize: "var(--text-meta)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-gray-600)",
            padding: 0,
          }}
        >
          Attendance
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-2"
              style={{ fontSize: "15px", minHeight: 44, cursor: canManage ? "pointer" : "default" }}
            >
              <input
                type="checkbox"
                checked={local.presentMemberIds.includes(member.id)}
                onChange={() => toggle(member.id)}
                style={{ width: 18, height: 18, accentColor: "#007bff" }}
              />
              {member.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-3">
        <label className="form-label" htmlFor={`minutes-${local.id}`}>
          Meeting minutes
        </label>
        <textarea
          id={`minutes-${local.id}`}
          className="form-control"
          rows={5}
          disabled={!canManage}
          value={local.minutes}
          onChange={(e) => {
            const next = { ...local, minutes: e.target.value };
            setLocal(next);
            onChange(next);
          }}
          placeholder="What was discussed, what was agreed, who is doing what."
        />
      </div>

      {canManage && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={busy !== null}
            onClick={() => onSave(local, false)}
          >
            <Save size={14} aria-hidden="true" />
            {busy === local.id + "save" ? "Saving" : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={busy !== null || !local.minutes}
            onClick={() => onSave(local, true)}
          >
            <Share2 size={14} aria-hidden="true" />
            {busy === local.id + "share" ? "Sharing" : "Share minutes on WhatsApp"}
          </button>
        </div>
      )}
    </article>
  );
}

function ScheduleMeetingForm() {
  const router = useRouter();
  const [form, setForm] = useState({ date: "", time: "14:00", agenda: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit() {
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { ok: boolean; message: string };
      if (!json.ok) {
        setStatus("error");
        setMessage(json.message);
        return;
      }
      setStatus("done");
      setMessage(json.message);
      setForm({ date: "", time: "14:00", agenda: "" });
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not schedule the meeting.");
    }
  }

  return (
    <section className="card-surface" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
        Schedule a meeting
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div>
          <label className="form-label" htmlFor="meeting-date">
            Date
          </label>
          <input
            id="meeting-date"
            type="date"
            className="form-control"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="meeting-time">
            Time
          </label>
          <input
            id="meeting-time"
            type="time"
            className="form-control"
            value={form.time}
            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
            required
          />
        </div>
        <div className="sm:col-span-3">
          <label className="form-label" htmlFor="meeting-agenda">
            Agenda
          </label>
          <input
            id="meeting-agenda"
            className="form-control"
            value={form.agenda}
            onChange={(e) => setForm((p) => ({ ...p, agenda: e.target.value }))}
            placeholder="October contributions, loan application from Faith Wambui, year-end payout plan"
            required
          />
        </div>
        <div className="sm:col-span-3">
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {status === "sending" ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <CalendarPlus size={18} aria-hidden="true" />
            )}
            {status === "sending" ? "Scheduling" : "Schedule meeting"}
          </button>
        </div>
        {message && (
          <p
            role="status"
            className="sm:col-span-3"
            style={{
              margin: 0,
              fontSize: "var(--text-meta)",
              color: status === "error" ? "var(--color-danger)" : "var(--color-success)",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
