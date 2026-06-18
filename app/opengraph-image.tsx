import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DSC Action Tracker — DataSkate Sales Support Center";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#0f172a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Red accent bar top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "#E30613", display: "flex" }} />

        {/* Subtle red glow bottom-right */}
        <div style={{
          position: "absolute", bottom: -150, right: -150,
          width: 500, height: 500,
          borderRadius: "50%",
          background: "rgba(227,6,19,0.12)",
          display: "flex",
        }} />

        {/* Left content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 80px", flex: 1, position: "relative" }}>

          {/* Logo — real DataSkate icon + wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 52 }}>
            {/* Actual DataSkate icon paths from DataSkate-logo-Final-02.svg */}
            <svg width="58" height="50" viewBox="40 226 112 96" xmlns="http://www.w3.org/2000/svg">
              {/* Red upper curve (cls-1) */}
              <path
                d="m94.75,245.73v-16.8c29.51,0,51.77,13.84,51.77,32.2s-22.26,32.2-51.77,32.2v-16.8c21.34,0,34.97-9.11,34.97-15.4s-13.62-15.4-34.97-15.4Z"
                fill="#ed1c24"
              />
              {/* White lower curve (cls-2, dark replaced with white for dark bg) */}
              <path
                d="m94.75,299.58v16.8c-29.51,0-51.77-13.84-51.77-32.2s22.26-32.2,51.77-32.2v16.8c-21.34,0-34.97,9.11-34.97,15.4s13.62,15.4,34.97,15.4Z"
                fill="#ffffff"
              />
            </svg>
            {/* Wordmark */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "white", letterSpacing: "-1px", lineHeight: 1 }}>data</span>
              <span style={{ fontSize: 32, fontWeight: 300, color: "#ed1c24", letterSpacing: "-1px", lineHeight: 1 }}>skate</span>
            </div>
          </div>

          {/* Label */}
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#E30613",
            letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20,
            display: "flex",
          }}>
            Sales Support Center
          </div>

          {/* Main heading */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
            <span style={{ fontSize: 72, fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: "-2px" }}>
              DSC Action
            </span>
            <span style={{ fontSize: 72, fontWeight: 800, color: "#E30613", lineHeight: 1.1, letterSpacing: "-2px" }}>
              Tracker
            </span>
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 20, color: "#94a3b8", lineHeight: 1.6, maxWidth: 560,
            display: "flex",
          }}>
            One shared place to track every action, every owner, and every deadline.
          </div>
        </div>

        {/* Right side — workstream cards */}
        <div style={{
          position: "absolute", right: 80, top: 0, bottom: 0,
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 14,
        }}>
          {[
            { label: "AE Engagement", color: "#6366f1" },
            { label: "Client Outreach", color: "#0ea5e9" },
            { label: "Content & Assets", color: "#10b981" },
          ].map(ws => (
            <div key={ws.label} style={{
              background: "rgba(255,255,255,0.07)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderLeft: `4px solid ${ws.color}`,
              borderRadius: 10,
              padding: "14px 24px",
              fontSize: 16, color: "white",
              fontWeight: 600, display: "flex",
              minWidth: 220,
            }}>
              {ws.label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div style={{
          position: "absolute", bottom: 32, left: 80,
          fontSize: 14, color: "#475569", display: "flex",
        }}>
          dsc.dataskate.online
        </div>
      </div>
    ),
    { ...size }
  );
}
