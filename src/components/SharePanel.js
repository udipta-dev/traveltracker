import { useState } from "react";

const SHARE_TEXT = "Check out JourneyMap – track your travels, see your world!";

const shareOptions = [
  {
    label: "Copy Link",
    icon: "🔗",
    action: (url) => {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    },
  },
  {
    label: "WhatsApp",
    icon: "🟢",
    href: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    label: "Telegram",
    icon: "✈️",
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    label: "Facebook",
    icon: "📘",
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "X (Twitter)",
    icon: "🐦",
    href: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    label: "Instagram DM",
    icon: "📸",
    action: (url) => {
      navigator.clipboard.writeText(url);
      window.open("https://instagram.com/direct/inbox/", "_blank");
      alert("Link copied! Paste it into your Instagram DM.");
    },
  },
];

export default function SharePanel({ style = {} }) {
  const [open, setOpen] = useState(false);

  const url =
    typeof window !== "undefined"
      ? window.location.href
      : "https://journeymap.me";
  const text = SHARE_TEXT;

  return (
    <div style={{ position: "relative", ...style }}>
      <button
  onClick={() => setOpen((v) => !v)}
  style={{
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "#fff",
    borderRadius: "10px",
    width: "36px",
    height: "36px",
    fontSize: "1.3rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.16)",
    cursor: "pointer",
    marginRight: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, color 0.2s",
  }}
  aria-label="Share"
  title="Share"
>
  🔗
</button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: "50px",
            bottom: "0",
            background: "#161f2e",
            color: "#fff",
            borderRadius: "14px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            minWidth: "180px",
            zIndex: 1001,
          }}
        >
          {shareOptions.map((option) =>
            option.href ? (
              <a
                key={option.label}
                href={option.href(url, text)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </a>
            ) : (
              <button
                key={option.label}
                onClick={() => option.action(url)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "1.1rem",
                  color: "#fff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: 0,
                }}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}