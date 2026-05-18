"use client";
import { useState, useEffect } from "react";

export default function AnnouncementBar() {
  const [settings, setSettings] = useState({ enabled: false, text: "" });

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

  if (!settings.enabled || !settings.text) return null;

  return (
    <div style={{
      background: "linear-gradient(90deg, #000000ff, #615200ff)",
      color: "#ffffffff",
      padding: "10px 0",
      fontSize: "0.95rem",
      fontWeight: "600",
      letterSpacing: "0.5px",
      zIndex: 100,
      position: "relative",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }}>
      <div className="animate-marquee-rtl">
        {settings.text}
      </div>
    </div>
  );
}
