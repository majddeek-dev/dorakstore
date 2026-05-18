"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function AnnouncementBar() {
  const [settings, setSettings] = useState({ enabled: false, text: "" });
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          enabled: data.ANNOUNCEMENT_BAR_ENABLED === "true",
          text: data.ANNOUNCEMENT_BAR_TEXT || ""
        });
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  const checkOverflow = useCallback(() => {
    if (!containerRef.current || !textRef.current) return;
    const isSmallScreen = window.innerWidth < 768;
    const textOverflows = textRef.current.scrollWidth > containerRef.current.clientWidth;
    setShouldAnimate(isSmallScreen || textOverflows);
  }, []);

  // Re-check after DOM renders (settings change)
  useEffect(() => {
    if (!settings.enabled || !settings.text) return;
    // Use requestAnimationFrame to ensure DOM has painted
    const raf = requestAnimationFrame(() => {
      checkOverflow();
    });
    window.addEventListener("resize", checkOverflow);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [settings, checkOverflow]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const restartAnimation = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    // Remove animation
    el.style.animation = "none";
    // Force reflow so browser registers the removal
    el.getBoundingClientRect();
    // Wait 2 seconds then re-apply
    timeoutRef.current = setTimeout(() => {
      if (textRef.current) {
        textRef.current.style.animation = "marquee-rtl 18s linear 1";
        textRef.current.style.animationFillMode = "forwards";
      }
    }, 2000);
  }, []);

  if (!settings.enabled || !settings.text) return null;

  return (
    <div
      ref={containerRef}
      style={{
        background: "linear-gradient(90deg, #000000ff, #615200ff)",
        color: "#ffffffff",
        padding: "10px 0",
        fontSize: "0.95rem",
        fontWeight: "600",
        letterSpacing: "0.5px",
        zIndex: 100,
        position: "relative",
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: shouldAnimate ? "flex-start" : "center",
        direction: "rtl",
      }}
    >
      <style>{`
        @keyframes marquee-rtl {
          0%   { transform: translateX(-100vw); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <span
        ref={textRef}
        onAnimationEnd={restartAnimation}
        style={{
          display: "inline-block",
          padding: "0 16px",
          animation: shouldAnimate ? "marquee-rtl 18s linear 1" : "none",
          animationFillMode: shouldAnimate ? "forwards" : "none",
        }}
      >
        {settings.text}
      </span>
    </div>
  );
}
