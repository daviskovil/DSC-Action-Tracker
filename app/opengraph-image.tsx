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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "40px 40px",
          display: "flex",
        }} />

        {/* Red accent bar top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#E30613", display: "flex" }} />

        {/* Red glow bottom-right */}
        <div style={{
          position: "absolute", bottom: -100, right: -100,
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(227,6,19,0.15) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "60px 80px", flex: 1, position: "relative" }}>

          {/* Logo area */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
            {/* DataSkate icon placeholder */}
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "#E30613",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 900, color: "white",
            }}>
              D
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>
              data<span style={{ color: "#E30613" }}>skate</span>
            </span>
          </div>

          {/* Main heading */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: "#E30613",
              letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16,
              display: "flex",
            }}>
              Sales Support Center
            </div>
            <div style={{
              fontSize: 64, fontWeight: 800, color: "white",
              lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24,
              display: "flex", flexDirection: "column",
            }}>
              <span>DSC Action</span>
              <span style={{ color: "#E30613" }}>Tracker</span>
            </div>
            <div style={{
              fontSize: 22, color: "#94a3b8", lineHeight: 1.5, maxWidth: 600,
              display: "flex",
            }}>
              One shared place to track every action, every owner, and every deadline — across all 3 workstreams.
            </div>
          </div>

          {/* Bottom stats row */}
          <div style={{ display: "flex", gap: 48, marginTop: 48 }}>
            {[
              { value: "52+", label: "Actions Tracked" },
              { value: "3", label: "Workstreams" },
              { value: "5", label: "Team Members" },
              { value: "24hr", label: "SLA Target" },
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "white" }}>{stat.value}</span>
                <span style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side decorative element */}
        <div style={{
          position: "absolute", right: 80, top: "50%",
          transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 10,
          opacity: 0.15,
        }}>
          {["AE Engagement", "Client Outreach", "Content & Assets"].map(ws => (
            <div key={ws} style={{
              background: "white", borderRadius: 8,
              padding: "10px 20px", fontSize: 15, color: "#0f172a",
              fontWeight: 600, display: "flex",
            }}>
              {ws}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div style={{
          position: "absolute", bottom: 32, right: 80,
          fontSize: 14, color: "#475569", display: "flex",
        }}>
          dsc.dataskate.online
        </div>
      </div>
    ),
    { ...size }
  );
}
