import { ImageResponse } from "next/og";
import { CATEGORIES } from "@/config/categories";
import { OG_SIZE, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Promptshelf — AI prompts with real results";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#F1F0ED",
        padding: 64,
        fontFamily: "Inter Tight",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#141414" }}>
        promptshelf
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 40,
          fontSize: 132,
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: -6,
          color: "#141414",
        }}
      >
        <span>Prompts,</span>
        <span>with proof.</span>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
        {CATEGORIES.map((c) => (
          <div
            key={c.slug}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: c.palette.tint,
              color: c.palette.deep,
              fontSize: 20,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 999,
            }}
          >
            {c.number} {c.short}
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: ogFonts() },
  );
}
