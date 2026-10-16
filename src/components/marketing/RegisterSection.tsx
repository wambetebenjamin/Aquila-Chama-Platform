"use client";

import { useRef, useState } from "react";
import { Loader2, MessageCircle, UserPlus } from "lucide-react";
import { site } from "@/lib/site";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import CaptchaChallenge from "@/components/site/CaptchaChallenge";
import Reveal from "@/components/site/Reveal";

const COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu",
  "Machakos", "Kilifi", "Kakamega", "Bungoma", "Meru", "Nyeri",
  "Kericho", "Kajiado", "Trans Nzoia", "Garissa", "Other",
];

const MEETING_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

export default function RegisterSection() {
  const [form, setForm] = useState({
    chamaName: "",
    registrationNumber: "",
    county: "Nairobi",
    contributionAmount: "5000",
    meetingDay: "Saturday",
    whatsappNumber: "",
    adminName: "",
    adminPhone: "",
    adminEmail: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [challenge, setChallenge] = useState(false);
  const v2TokenRef = useRef<string | null>(null);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function submit(tokenOverride?: string) {
    setStatus("sending");
    setFeedback("");

    const captchaToken =
      tokenOverride ?? v2TokenRef.current ?? (await executeRecaptcha("register"));

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message: string;
        challengeRequired?: boolean;
        whatsappLink?: string;
      };

      if (json.challengeRequired && !v2TokenRef.current) {
        setChallenge(true);
        setStatus("error");
        setFeedback("Please complete the security check, then submit again.");
        return;
      }
      if (!json.ok) {
        setStatus("error");
        setFeedback(json.message);
        return;
      }
      setStatus("done");
      setFeedback(
        json.whatsappLink
          ? `${json.message} We have opened WhatsApp to confirm your details.`
          : json.message,
      );
      if (json.whatsappLink) window.open(json.whatsappLink, "_blank", "noopener");
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Please try again or message us on WhatsApp.");
    }
  }

  return (
    <section className="site-section" id="register">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <div>
              <span className="section-sub-title">Register your chama</span>
              <h2 className="section-title">Live in five minutes</h2>
              <p className="lead" style={{ color: "var(--color-body)" }}>
                Tell us about your group and we will set up your contribution
                book, member register and WhatsApp delivery. No card required on
                the Starter plan.
              </p>

              <ul className="ul-check success mb-6">
                <li>Free for groups of up to 20 members</li>
                <li>Monthly contributions, loans and voting from day one</li>
                <li>WhatsApp statements delivered to every member</li>
                <li>Kenya Data Protection Act 2019 compliant</li>
              </ul>

              <a
                href={site.whatsappRegisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
                style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "15px" }}
              >
                <MessageCircle size={18} aria-hidden="true" />
                Prefer WhatsApp? Register there instead
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
              className="bg-white"
              style={{ padding: "2rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card-sm)" }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="chamaName">
                    Chama name
                  </label>
                  <input
                    id="chamaName"
                    className="form-control"
                    value={form.chamaName}
                    onChange={update("chamaName")}
                    placeholder="Maendeleo Investment Group"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="registrationNumber">
                    Registration number (optional)
                  </label>
                  <input
                    id="registrationNumber"
                    className="form-control"
                    value={form.registrationNumber}
                    onChange={update("registrationNumber")}
                    placeholder="SOC/2024/KE/88412"
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="county">
                    County
                  </label>
                  <select
                    id="county"
                    className="form-control"
                    value={form.county}
                    onChange={update("county")}
                  >
                    {COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="contributionAmount">
                    Monthly contribution (KES)
                  </label>
                  <input
                    id="contributionAmount"
                    type="number"
                    min={100}
                    step={100}
                    className="form-control"
                    value={form.contributionAmount}
                    onChange={update("contributionAmount")}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="meetingDay">
                    Meeting day
                  </label>
                  <select
                    id="meetingDay"
                    className="form-control"
                    value={form.meetingDay}
                    onChange={update("meetingDay")}
                  >
                    {MEETING_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="whatsappNumber">
                    WhatsApp number for reports
                  </label>
                  <input
                    id="whatsappNumber"
                    className="form-control"
                    value={form.whatsappNumber}
                    onChange={update("whatsappNumber")}
                    placeholder="254712345678"
                    required
                  />
                </div>
              </div>

              <hr style={{ margin: "1.5rem 0", borderColor: "var(--color-gray-200)" }} />

              <p
                style={{
                  fontSize: "var(--text-meta)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-gray-600)",
                  marginBottom: "0.75rem",
                }}
              >
                Group administrator
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="adminName">
                    Your name
                  </label>
                  <input
                    id="adminName"
                    className="form-control"
                    value={form.adminName}
                    onChange={update("adminName")}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="adminPhone">
                    Your phone
                  </label>
                  <input
                    id="adminPhone"
                    className="form-control"
                    value={form.adminPhone}
                    onChange={update("adminPhone")}
                    placeholder="254712345678"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label" htmlFor="adminEmail">
                    Your email
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    className="form-control"
                    value={form.adminEmail}
                    onChange={update("adminEmail")}
                    required
                  />
                </div>
              </div>

              {challenge && (
                <div className="mt-4">
                  <CaptchaChallenge
                    onVerify={(token) => {
                      if (!token) return;
                      v2TokenRef.current = token;
                      void submit(token);
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary mt-4 w-full"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <UserPlus size={18} aria-hidden="true" />
                )}
                {status === "sending" ? "Registering" : "Register Your Chama"}
              </button>

              {feedback && (
                <p
                  role="status"
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "var(--text-meta)",
                    color:
                      status === "error" ? "var(--color-danger)" : "var(--color-success)",
                  }}
                >
                  {feedback}
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
