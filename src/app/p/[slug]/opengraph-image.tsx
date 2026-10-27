import { ImageResponse } from "next/og";
import { getCategoryDef } from "@/config/categories";
import { getAllPrompts, getPrompt } from "@/lib/content";
import { plural } from "@/lib/format";
import { publicExcerpt } from "@/lib/access";
import { mediaDataUrl, OG_SIZE, ogFonts, ogSafe } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Prompt on Promptshelf";

export async function generateStaticParams() {
  return (await getAllPrompts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const prompt = await getPrompt((await params).slug);
  const cat = getCategoryDef(prompt?.category ?? "images")!;
  const cover = prompt?.cover ? await mediaDataUrl(prompt.cover) : null;
  const p = cat.palette;
  const models = prompt
    ? prompt.models.length > 1
      ? `${prompt.models[0]} +${prompt.models.length - 1}`
      : prompt.models[0]
    : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#F1F0ED",
        padding: 56,
        fontFamily: "Inter Tight",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: cover ? 40 : 0 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 26,
            fontWeight: 600,
            color: "#141414",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 30 }}>
            <div style={{ width: 9, height: 22, borderRadius: 3, background: "#E5561F" }} />
            <div style={{ width: 9, height: 30, borderRadius: 3, background: "#2A80EB" }} />
            <div
              style={{
                width: 9,
                height: 25,
                borderRadius: 3,
                background: "#7B4DF0",
                transform: "rotate(14deg)",
              }}
            />
          </div>
          promptshelf
        </div>
        <div style={{ display: "flex", marginTop: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: p.tint,
              color: p.deep,
              fontSize: 22,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 999,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: p.accent }} />
            {cat.number} · {cat.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: prompt && prompt.title.length > 34 ? 60 : 72,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: -2.4,
            color: "#141414",
          }}
        >
          {ogSafe(prompt?.title ?? "Promptshelf")}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 26,
            lineHeight: 1.35,
            color: "#4C4A46",
          }}
        >
          {ogSafe(prompt?.summary ?? "")}
        </div>
        <div
          style={{ display: "flex", marginTop: "auto", gap: 14, fontSize: 22, color: "#696660" }}
        >
          <span>{models}</span>
          <span>·</span>
          <span style={{ color: "#141414" }}>
            {prompt?.access === "premium" ? "Premium" : "Free"}
          </span>
          {prompt?.blanks.length ? (
            <>
              <span>·</span>
              <span>{plural(prompt.blanks.length, "blank")} to fill</span>
            </>
          ) : null}
        </div>
      </div>
      {cover ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 440,
            background: p.tint,
            borderRadius: 32,
          }}
        >
          <img
            src={cover}
            alt=""
            style={{
              width: 360,
              height: 400,
              objectFit: "cover",
              objectPosition: "top",
              borderRadius: 18,
              border: "8px solid #fff",
              boxShadow: "0 30px 50px -20px rgba(20,20,20,.45)",
              transform: "rotate(-3deg)",
            }}
          />
        </div>
      ) : prompt ? (
        <div
          style={{ display: "flex", width: 440, background: p.tint, borderRadius: 32, padding: 34 }}
        >
          <div
            style={{
              display: "flex",
              background: "#fff",
              borderRadius: 18,
              padding: 26,
              fontFamily: "JetBrains Mono",
              fontSize: 19,
              lineHeight: 1.6,
              color: "#141414",
              transform: "rotate(2deg)",
              boxShadow: "0 30px 50px -20px rgba(20,20,20,.35)",
            }}
          >
            {ogSafe(publicExcerpt(prompt).slice(0, 210))}
          </div>
        </div>
      ) : null}
    </div>,
    { ...size, fonts: ogFonts() },
  );
}
