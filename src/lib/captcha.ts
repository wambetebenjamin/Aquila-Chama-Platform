/**
 * Google reCAPTCHA server-side verification.
 *
 * v3 (invisible) on every form; if the score falls below RECAPTCHA_MIN_SCORE
 * (brief: 0.5) the caller escalates to the visible v2 challenge.
 * RECAPTCHA_SECRET_KEY is read here only — never bundled for the browser.
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export interface CaptchaResult {
  ok: boolean;
  score: number | null;
  action?: string;
  success: boolean;
  challengeRequired: boolean;
  errorCodes: string[];
  reason: string;
}

const MIN_SCORE = Number.parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

function devBypass(reason: string): CaptchaResult {
  return {
    ok: true,
    score: 1,
    success: true,
    challengeRequired: false,
    errorCodes: [],
    reason,
  };
}

export async function verifyCaptcha(
  token: string | undefined | null,
  remoteip?: string,
): Promise<CaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // No secret configured: local/dev/preview. Fail open so the platform stays
  // usable, and say so loudly in the response.
  if (!secret) return devBypass("RECAPTCHA_SECRET_KEY not configured");
  if (!token) {
    return {
      ok: false,
      score: null,
      success: false,
      challengeRequired: true,
      errorCodes: ["missing-input-response"],
      reason: "No reCAPTCHA token supplied",
    };
  }

  const threshold = Number.isFinite(MIN_SCORE) ? MIN_SCORE : 0.5;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteip) body.append("remoteip", remoteip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    const score = typeof data.score === "number" ? data.score : null;
    const errorCodes = data["error-codes"] ?? [];

    if (!data.success) {
      return {
        ok: false,
        score,
        action: data.action,
        success: false,
        challengeRequired: true,
        errorCodes,
        reason: "reCAPTCHA rejected the token",
      };
    }

    if (score !== null && score < threshold) {
      return {
        ok: false,
        score,
        action: data.action,
        success: true,
        challengeRequired: true,
        errorCodes,
        reason: `Score ${score} below threshold ${threshold}`,
      };
    }

    return {
      ok: true,
      score,
      action: data.action,
      success: true,
      challengeRequired: false,
      errorCodes,
      reason: "Verified",
    };
  } catch (error) {
    // The sandbox has no egress to google.com. In production a network failure
    // must fail closed; outside production we keep the app clickable.
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        score: null,
        success: false,
        challengeRequired: true,
        errorCodes: ["network-error"],
        reason: `reCAPTCHA verification failed: ${(error as Error).message}`,
      };
    }
    return devBypass(`reCAPTCHA unreachable (${(error as Error).message})`);
  }
}

/** Reads the client IP the way Next 15 exposes it on a route request. */
export function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") ?? undefined;
}
