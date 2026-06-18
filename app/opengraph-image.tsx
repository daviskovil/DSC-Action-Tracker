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

          {/* Logo — text only, reliable in edge runtime */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 56 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "#E30613",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 900, color: "white",
            }}>DS</div>
            <div style={{ display: "flex", gap: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 300, color: "white" }}>data</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>skate</span>
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
