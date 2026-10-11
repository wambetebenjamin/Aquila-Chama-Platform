"use client";

import { useRef, useState } from "react";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { site } from "@/lib/site";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import CaptchaChallenge from "@/components/site/CaptchaChallenge";
import Reveal from "@/components/site/Reveal";

export default function ContactSection() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [challenge, setChallenge] = useState(false);
  const v2TokenRef = useRef<string | null>(null);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function submit(tokenOverride?: string) {
    setStatus("sending");
    setFeedback("");

    const captchaToken =
      tokenOverride ?? v2TokenRef.current ?? (await executeRecaptcha("contact"));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message: string;
        challengeRequired?: boolean;
      };

      if (json.challengeRequired && !v2TokenRef.current) {
        setChallenge(true);
        setStatus("error");
        setFeedback("Please complete the security check, then send again.");
        return;
      }
      if (!json.ok) {
        setStatus("error");
        setFeedback(json.message);
        return;
      }
      setStatus("done");
      setFeedback(json.message);
      setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Please try again or message us on WhatsApp.");
    }
  }

  return (
    <section className="site-section bg-light" id="contact-section">
      <div className="container">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="section-sub-title">Contact</span>
            <h2 className="section-title">Speak to our team</h2>
          </div>
        </Reveal>

        <div className="mb-12 grid gap-8 text-center md:grid-cols-3">
          <Reveal>
            <p className="mb-0">
              <MapPin
                size={28}
                className="mx-auto mb-3 text-primary"
                aria-hidden="true"
              />
              <span style={{ color: "var(--color-gray-700)" }}>{site.address}</span>
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mb-0">
              <Phone
                size={28}
                className="mx-auto mb-3 text-primary"
                aria-hidden="true"
              />
              <a href={site.phoneHref} style={{ color: "var(--color-gray-700)" }}>
                {site.phone}
              </a>
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mb-0">
              <Mail
                size={28}
                className="mx-auto mb-3 text-primary"
                aria-hidden="true"
              />
              <a href={`mailto:${site.email}`} style={{ color: "var(--color-gray-700)" }}>
                {site.email}
              </a>
            </p>
          </Reveal>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
              className="bg-white"
              style={{ padding: "2rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card-sm)" }}
            >
              <h3 className="h4 text-black mb-4" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                General enquiry
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    className="form-control"
                    value={form.firstName}
                    onChange={update("firstName")}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="lastName">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    className="form-control"
                    value={form.lastName}
                    onChange={update("lastName")}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label" htmlFor="contact-email">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={update("email")}
                  required
                />
              </div>

              <div className="mt-4">
                <label className="form-label" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  className="form-control"
                  value={form.subject}
                  onChange={update("subject")}
                  required
                />
              </div>

              <div className="mt-4">
                <label className="form-label" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  className="form-control"
                  rows={5}
                  value={form.message}
                  onChange={update("message")}
                  required
                />
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
                className="btn btn-primary mt-4"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={18} aria-hidden="true" />
                )}
                {status === "sending" ? "Sending" : "Send Message"}
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

          <Reveal delay={0.1}>
            <div
              className="overflow-hidden"
              style={{ borderRadius: "var(--radius)", border: "1px solid var(--color-border)", height: "100%", minHeight: 420 }}
            >
              <iframe
                title="Aquila Chama Platform office location on Google Maps"
                src={site.mapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 420 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
