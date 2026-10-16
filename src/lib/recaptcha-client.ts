/**
 * reCAPTCHA v3 (invisible) + v2 (visible challenge) browser helpers.
 * Only the public site keys are used here; the secret never leaves the server.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      render: (
        container: HTMLElement | string,
        opts: Record<string, unknown>,
      ) => number;
      reset: (id?: number) => void;
    };
    aquilaRecaptchaV2Onload?: () => void;
  }
}

export const V3_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
export const V2_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? "";

let v3Loader: Promise<void> | null = null;

export function loadRecaptchaV3(): Promise<void> {
  if (!V3_SITE_KEY) return Promise.resolve();
  if (v3Loader) return v3Loader;

  v3Loader = new Promise<void>((resolve) => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => resolve());
      return;
    }
    const existing = document.getElementById("g-recaptcha-v3");
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "g-recaptcha-v3";
    script.src = `https://www.google.com/recaptcha/api.js?render=${V3_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => window.grecaptcha?.ready(() => resolve());
    script.onerror = () => resolve(); // degrade: server will ask for v2
    document.head.appendChild(script);
  });
  return v3Loader;
}

/** Returns null when v3 is not configured or unavailable. */
export async function executeRecaptcha(action: string): Promise<string | null> {
  if (!V3_SITE_KEY) return null;
  try {
    await loadRecaptchaV3();
    if (!window.grecaptcha) return null;
    return await window.grecaptcha.execute(V3_SITE_KEY, { action });
  } catch {
    return null;
  }
}

export function loadRecaptchaV2(): Promise<void> {
  if (!V2_SITE_KEY) return Promise.resolve();
  return new Promise<void>((resolve) => {
    if (window.grecaptcha?.render) {
      resolve();
      return;
    }
    const existing = document.getElementById("g-recaptcha-v2");
    if (existing) {
      resolve();
      return;
    }
    window.aquilaRecaptchaV2Onload = () => resolve();
    const script = document.createElement("script");
    script.id = "g-recaptcha-v2";
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=aquilaRecaptchaV2Onload&render=explicit";
    script.async = true;
    script.defer = true;
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}
