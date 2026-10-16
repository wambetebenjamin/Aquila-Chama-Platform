"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Voice tour, bottom left.
 *
 * 56x56 circular button. Nothing speaks until the user scrolls or clicks —
 * browsers block autoplay before a gesture, so the first scroll/click is the
 * trigger that unlocks the Web Speech API.
 */

const SCRIPT =
  "Welcome to Aquila Chama Platform. We help savings groups and investment clubs across Kenya manage their contributions, track balances, vote on loans, and generate reports automatically. Register your chama today and start managing your money the smart way. Use the menu to explore features, view pricing, or speak to our team on WhatsApp.";

const STORAGE_KEY = "aquila.voice.muted";

export default function VoiceTour() {
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const mutedRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setMuted(true);
      mutedRef.current = true;
    }
  }, []);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    return (
      voices.find((v) => v.lang.toLowerCase() === "en-ke") ??
      voices.find((v) => v.lang.toLowerCase().startsWith("en-gb")) ??
      voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
      null
    );
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setPlaying(false);
  }, [supported]);

  const speak = useCallback(() => {
    if (!supported || mutedRef.current) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(SCRIPT);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.lang = "en-KE";

    const voice = pickVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => {
      setPlaying(false);
      setHasPlayed(true);
    };
    utterance.onerror = () => {
      setPlaying(false);
      setHasPlayed(true);
    };

    synth.speak(utterance);
  }, [pickVoice, supported]);

  // Voices populate asynchronously in some browsers.
  useEffect(() => {
    if (!supported) return;
    const handler = () => pickVoice();
    window.speechSynthesis.addEventListener?.("voiceschanged", handler);
    return () =>
      window.speechSynthesis.removeEventListener?.("voiceschanged", handler);
  }, [pickVoice, supported]);

  // First user scroll or click starts the tour.
  useEffect(() => {
    if (!supported) return;
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (mutedRef.current) return;
      speak();
    };
    window.addEventListener("scroll", start, { once: true, passive: true });
    window.addEventListener("click", start, { once: true });
    return () => {
      window.removeEventListener("scroll", start);
      window.removeEventListener("click", start);
    };
  }, [speak, supported]);

  // Other parts of the page (the hero button) can request the tour.
  useEffect(() => {
    const handler = () => {
      if (mutedRef.current) return;
      startedRef.current = true;
      speak();
    };
    window.addEventListener("aquila:voice:play", handler);
    return () => window.removeEventListener("aquila:voice:play", handler);
  }, [speak]);

  // Never leave speech running when the tab goes away.
  useEffect(() => () => stop(), [stop]);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    window.localStorage.setItem(STORAGE_KEY, String(next));
    if (next) {
      stop();
    } else {
      speak();
    }
  };

  if (!supported) return null;

  return (
    <div
      className="fixed z-[9200] flex items-end gap-3"
      style={{ bottom: "1.5rem", left: "1.5rem" }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "Site voice tour, click to unmute" : "Site voice tour, click to mute"}
        aria-pressed={!muted}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocus={() => setTooltipOpen(true)}
        onBlur={() => setTooltipOpen(false)}
        className="relative grid place-items-center rounded-full bg-white text-primary shadow-card transition-transform hover:-translate-y-0.5"
        style={{
          width: 56,
          height: 56,
          minHeight: 56,
          border: "1px solid var(--color-border)",
        }}
      >
        {playing && <span className="voice-pulse-ring" aria-hidden="true" />}
        {muted ? (
          <VolumeX size={24} aria-hidden="true" />
        ) : (
          <Volume2 size={24} aria-hidden="true" />
        )}
      </button>

      <div className="hidden min-[390px]:block">
        <button
          type="button"
          onClick={toggle}
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          className="rounded-full bg-white/95 px-4 text-black shadow-card-sm"
          style={{
            height: 56,
            minHeight: 56,
            border: "1px solid var(--color-border)",
            fontSize: "var(--text-meta)",
            fontWeight: 600,
          }}
        >
          {hasPlayed && !playing ? "Replay tour" : muted ? "Voice tour" : "Voice tour"}
        </button>
      </div>

      {tooltipOpen && (
        <span
          role="tooltip"
          className="absolute left-0 rounded-md bg-black px-3 py-1.5 text-white"
          style={{
            bottom: "calc(100% + 0.5rem)",
            fontSize: "var(--text-meta)",
            whiteSpace: "nowrap",
          }}
        >
          Hear what this site is about
        </span>
      )}
    </div>
  );
}
