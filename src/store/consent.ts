import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cookie consent state (Kenya Data Protection Act 2019).
 * Necessary cookies are locked on permanently and cannot be switched off.
 */
export interface ConsentState {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  decided: boolean;
  decidedAt: string | null;
  acceptAll: () => void;
  rejectOptional: () => void;
  save: (prefs: { functional: boolean; analytics: boolean }) => void;
  reopen: () => void;
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      necessary: true as const,
      functional: false,
      analytics: false,
      decided: false,
      decidedAt: null,
      acceptAll: () =>
        set({
          necessary: true,
          functional: true,
          analytics: true,
          decided: true,
          decidedAt: new Date().toISOString(),
        }),
      rejectOptional: () =>
        set({
          necessary: true,
          functional: false,
          analytics: false,
          decided: true,
          decidedAt: new Date().toISOString(),
        }),
      save: (prefs) =>
        set({
          necessary: true,
          functional: prefs.functional,
          analytics: prefs.analytics,
          decided: true,
          decidedAt: new Date().toISOString(),
        }),
      reopen: () => set({ decided: false }),
    }),
    { name: "aquila.cookie-consent" },
  ),
);
