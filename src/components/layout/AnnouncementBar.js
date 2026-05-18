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
      background: "linear-gradient(90deg, #000, #222)", 
      color: "#fff", 
      textAlign: "center", 
      padding: "10px 16px", 
      fontSize: "0.95rem",
      fontWeight: "600",
      letterSpacing: "0.5px",
      zIndex: 100,
      position: "relative"
    }}>
      {settings.text}
    </div>
  );
}
