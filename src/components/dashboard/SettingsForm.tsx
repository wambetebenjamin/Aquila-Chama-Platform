"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { updateChamaSettings } from "@/app/app/settings/actions";
import type { ChamaSettings } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Give your chama a name."),
  registrationNumber: z.string().max(60).optional().or(z.literal("")),
  county: z.string().min(2, "Which county does your group meet in?"),
  contributionAmount: z.coerce
    .number({ invalid_type_error: "Enter a whole number." })
    .int()
    .min(100, "Minimum contribution is KES 100.")
    .max(1_000_000),
  meetingDay: z.string().min(3),
  whatsappNumber: z.string().min(9, "Use the format 254712345678."),
  interestRate: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof schema>;

const COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu",
  "Machakos", "Kilifi", "Kakamega", "Bungoma", "Meru", "Nyeri",
  "Kericho", "Kajiado", "Trans Nzoia", "Garissa", "Other",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SettingsForm({ settings }: { settings: ChamaSettings }) {
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      name: settings.name,
      registrationNumber: settings.registrationNumber,
      county: settings.county,
      contributionAmount: settings.contributionAmount,
      meetingDay: settings.meetingDay,
      whatsappNumber: settings.whatsappNumber,
      interestRate: settings.interestRate,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFeedback(null);

    // Validated with zod rather than a resolver package, so the dependency
    // list stays exactly as specified in the brief.
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setFeedback({
        text: parsed.error.issues[0]?.message ?? "Check the settings and try again.",
        ok: false,
      });
      return;
    }

    const result = await updateChamaSettings({
      ...parsed.data,
      registrationNumber: parsed.data.registrationNumber ?? "",
    });
    setFeedback({
      text: result.message,
      ok: result.ok,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="form-label" htmlFor="settings-name">
          Chama name
        </label>
        <input id="settings-name" className="form-control" {...register("name")} />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      <div>
        <label className="form-label" htmlFor="settings-reg">
          Registration number
        </label>
        <input
          id="settings-reg"
          className="form-control"
          {...register("registrationNumber")}
        />
        {errors.registrationNumber && (
          <p className="form-error">{errors.registrationNumber.message}</p>
        )}
      </div>

      <div>
        <label className="form-label" htmlFor="settings-county">
          County
        </label>
        <select id="settings-county" className="form-control" {...register("county")}>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.county && <p className="form-error">{errors.county.message}</p>}
      </div>

      <div>
        <label className="form-label" htmlFor="settings-amount">
          Monthly contribution (KES)
        </label>
        <input
          id="settings-amount"
          type="number"
          className="form-control"
          {...register("contributionAmount")}
        />
        {errors.contributionAmount && (
          <p className="form-error">{errors.contributionAmount.message}</p>
        )}
      </div>

      <div>
        <label className="form-label" htmlFor="settings-day">
          Meeting day
        </label>
        <select id="settings-day" className="form-control" {...register("meetingDay")}>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="settings-whatsapp">
          WhatsApp number for report delivery
        </label>
        <input
          id="settings-whatsapp"
          className="form-control"
          {...register("whatsappNumber")}
        />
        {errors.whatsappNumber && (
          <p className="form-error">{errors.whatsappNumber.message}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="form-label" htmlFor="settings-rate">
          Interest rate on loans (%)
        </label>
        <input
          id="settings-rate"
          type="number"
          step="0.5"
          className="form-control"
          {...register("interestRate")}
        />
        {errors.interestRate && (
          <p className="form-error">{errors.interestRate.message}</p>
        )}
      </div>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}
          {isSubmitting ? "Saving" : "Save settings"}
        </button>
        <span className="form-hint">Only an administrator can change these.</span>
      </div>

      {feedback && (
        <p
          role="status"
          className="sm:col-span-2"
          style={{
            margin: 0,
            fontSize: "var(--text-meta)",
            color: feedback.ok ? "var(--color-success)" : "var(--color-danger)",
          }}
        >
          {feedback.text}
        </p>
      )}
    </form>
  );
}
