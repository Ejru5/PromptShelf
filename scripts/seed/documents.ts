/**
 * Placeholder results for the Documents & PDFs and Reports & data shelves:
 * real A4 HTML documents rendered to page images and a PDF.
 * Run: npx tsx scripts/seed/documents.ts [slug ...]
 */
import { FONT_LINK, closeBrowser, promptDir, renderDocument } from "./lib";

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{background:#d9d6cf;font-family:'Inter Tight',system-ui,sans-serif;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:794px;height:1123px;background:#fff;position:relative;overflow:hidden;margin:0 auto 24px;padding:64px 68px;break-after:page}
@media print{body{background:none}.page{margin:0}}
.serif{font-family:'Newsreader',Georgia,serif}
.mono{font-family:'JetBrains Mono',monospace}
.muted{color:#6b6862}
.small{font-size:11px}
.label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:#7a7771}
h1,h2,h3{letter-spacing:-.02em;line-height:1.05}
table{border-collapse:collapse;width:100%}
.foot{position:absolute;left:68px;right:68px;bottom:40px;display:flex;justify-content:space-between;font-size:10px;color:#8a877f}
`;

function doc(title: string, css: string, pages: string[]) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${FONT_LINK}<style>${BASE_CSS}${css}</style></head><body>${pages
    .map((p) => `<section class="page">${p}</section>`)
    .join("")}</body></html>`;
}

// ---------------------------------------------------------------- chart helpers (SVG)

function lineChart(
  series: { name: string; color: string; data: number[] }[],
  labels: string[],
  w = 640,
  h = 220,
) {
  const pad = { l: 36, r: 12, t: 12, b: 26 };
  const max = Math.ceil(Math.max(...series.flatMap((s) => s.data)) / 10) * 10;
  const X = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (labels.length - 1);
  const Y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map(
      (k) =>
        `<line x1="${pad.l}" x2="${w - pad.r}" y1="${Y(max * k)}" y2="${Y(max * k)}" stroke="#ece9e3"/><text x="${pad.l - 8}" y="${Y(max * k) + 3}" font-size="9" text-anchor="end" fill="#8a877f">${Math.round(max * k)}</text>`,
    )
    .join("");
  const lines = series
    .map((s) => {
      const d = s.data
        .map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`)
        .join(" ");
      const area = `${d} L${X(s.data.length - 1)} ${Y(0)} L${X(0)} ${Y(0)}Z`;
      return `<path d="${area}" fill="${s.color}" opacity=".08"/><path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round"/>${s.data.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="2.6" fill="#fff" stroke="${s.color}" stroke-width="1.6"/>`).join("")}`;
    })
    .join("");
  const xl = labels
    .map(
      (l, i) =>
        `<text x="${X(i)}" y="${h - 8}" font-size="9" text-anchor="middle" fill="#8a877f">${l}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${grid}${lines}${xl}</svg>`;
}

function barChart(
  data: { label: string; value: number; color?: string }[],
  w = 300,
  h = 180,
  color = "#2A80EB",
) {
  const pad = { l: 8, r: 8, t: 18, b: 24 };
  const max = Math.max(...data.map((d) => d.value));
  const bw = (w - pad.l - pad.r) / data.length;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${data
    .map((d, i) => {
      const bh = (d.value / max) * (h - pad.t - pad.b);
      const x = pad.l + i * bw + bw * 0.18;
      const y = h - pad.b - bh;
      return `<rect x="${x}" y="${y}" width="${bw * 0.64}" height="${bh}" rx="4" fill="${d.color ?? color}"/><text x="${x + bw * 0.32}" y="${y - 5}" font-size="9" text-anchor="middle" fill="#4c4a46" font-weight="600">${d.value}</text><text x="${x + bw * 0.32}" y="${h - 8}" font-size="9" text-anchor="middle" fill="#8a877f">${d.label}</text>`;
    })
    .join("")}</svg>`;
}

function donut(parts: { value: number; color: string }[], size = 150, label = "", sub = "") {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let off = 0;
  const arcs = parts
    .map((p) => {
      const len = (p.value / total) * c;
      const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p.color}" stroke-width="20" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
      off += len;
      return el;
    })
    .join("");
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${arcs}<text x="50%" y="48%" text-anchor="middle" font-size="30" font-weight="700" fill="#1a1a1a" letter-spacing="-1">${label}</text><text x="50%" y="62%" text-anchor="middle" font-size="9" fill="#8a877f" letter-spacing="1.5">${sub}</text></svg>`;
}

function hbars(items: { label: string; value: number }[], color = "#1C9660", max = 100) {
  return `<div class="hbars">${items
    .map(
      (it) =>
        `<div class="hb"><span>${it.label}</span><div class="track"><i style="width:${(it.value / max) * 100}%;background:${color}"></i></div><b>${it.value}%</b></div>`,
    )
    .join("")}</div>`;
}

const HBAR_CSS = `.hbars{display:grid;gap:9px}.hb{display:grid;grid-template-columns:150px 1fr 40px;align-items:center;gap:10px;font-size:11.5px}.track{height:9px;border-radius:9px;background:#efece6;overflow:hidden}.track i{display:block;height:100%;border-radius:9px}.hb b{text-align:right;font-weight:600}`;

// ---------------------------------------------------------------- DOCUMENTS

const resume = doc(
  "Maya Okafor — Resume",
  `.page{padding:0;display:grid;grid-template-columns:250px 1fr}
   aside{background:#14213d;color:#e9ecf5;padding:60px 32px}
   aside .label{color:#9fb0d6}
   main{padding:60px 52px}
   .name{font-size:44px;font-weight:800;letter-spacing:-.04em;line-height:.95}
   .role{margin-top:10px;font-size:15px;color:#E5561F;font-weight:600}
   .sec{margin-top:30px}
   .job{margin-top:16px;padding-left:16px;border-left:2px solid #ece9e3}
   .job h3{font-size:15px}.job .meta{font-size:11px;color:#7a7771;margin:3px 0 7px}
   .job li{font-size:12px;line-height:1.55;color:#3e3c38;margin-left:14px}
   .chip{display:inline-block;padding:4px 9px;border-radius:20px;background:#22325a;font-size:11px;margin:0 4px 6px 0}
   .bar{height:5px;background:#22325a;border-radius:5px;margin:5px 0 12px}.bar i{display:block;height:100%;border-radius:5px;background:#F2B81F}
   aside p{font-size:12px;line-height:1.6}
   .avatar{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#F2B81F,#E5561F);display:grid;place-items:center;font-size:34px;font-weight:800;color:#14213d;margin-bottom:28px}`,
  [
    `<aside>
      <div class="avatar">MO</div>
      <p class="label">Contact</p>
      <p style="margin-top:8px">maya.okafor@mail.com<br>+44 7700 900 123<br>London, UK<br>mayaokafor.design</p>
      <p class="label" style="margin-top:30px">Skills</p>
      <div style="margin-top:10px">${["Product strategy", "Design systems", "Prototyping", "User research", "Figma", "Accessibility", "Workshops"].map((s) => `<span class="chip">${s}</span>`).join("")}</div>
      <p class="label" style="margin-top:26px">Tools</p>
      <div style="margin-top:10px;font-size:12px">${[
        ["Figma", 95],
        ["Framer", 80],
        ["HTML/CSS", 70],
        ["Notion", 85],
      ]
        .map(([t, v]) => `${t}<div class="bar"><i style="width:${v}%"></i></div>`)
        .join("")}</div>
      <p class="label" style="margin-top:20px">Languages</p>
      <p style="margin-top:8px">English (native)<br>French (professional)<br>Yoruba (conversational)</p>
    </aside>
    <main>
      <h1 class="name">Maya<br>Okafor</h1>
      <p class="role">Senior Product Designer</p>
      <p style="margin-top:18px;font-size:13px;line-height:1.6;color:#3e3c38">Product designer with 8 years of experience shipping consumer fintech and health products. I turn messy problems into calm, accessible interfaces — and build the design systems that keep teams fast.</p>
      <div class="sec"><p class="label">Experience</p>
        <div class="job"><h3>Senior Product Designer · Monzo</h3><p class="meta">2022 — Present · London</p><ul>
          <li>Led redesign of savings pots; adoption up 34% and support tickets down 21%.</li>
          <li>Built "Ledger", a 120-component design system used by 9 squads.</li>
          <li>Mentored 4 designers; ran monthly critique and accessibility clinics.</li></ul></div>
        <div class="job"><h3>Product Designer · Babylon Health</h3><p class="meta">2019 — 2022 · London</p><ul>
          <li>Designed symptom-checker flows used by 2M+ patients across 3 markets.</li>
          <li>Partnered with clinicians to cut triage time from 9 to 4 minutes.</li></ul></div>
        <div class="job"><h3>UX Designer · Deliveroo</h3><p class="meta">2017 — 2019 · London</p><ul>
          <li>Owned rider onboarding; completion rate improved from 58% to 81%.</li></ul></div>
      </div>
      <div class="sec"><p class="label">Education</p>
        <div class="job"><h3>BA Interaction Design · Central Saint Martins</h3><p class="meta">2013 — 2016 · First-class honours</p></div></div>
      <div class="sec"><p class="label">Selected recognition</p>
        <p style="margin-top:10px;font-size:12px;line-height:1.7;color:#3e3c38">UX Design Awards — Gold, 2024 · Speaker, Config Europe 2025 · D&AD New Blood judge</p></div>
    </main>`,
  ],
);

const proposal = doc(
  "Website redesign proposal — Fernhill Coffee",
  `.cover{background:#1f3a2e;color:#f4efe4;padding:72px}
   .cover h1{font-family:'Newsreader',serif;font-weight:600;font-size:78px;letter-spacing:-.03em;line-height:.95;margin-top:300px}
   .cover .label{color:#b7c9b5}
   .bean{position:absolute;right:-80px;top:-60px;width:420px;height:560px;border-radius:50%;background:#2c5241;transform:rotate(28deg)}
   .bean:after{content:"";position:absolute;left:48%;top:8%;width:18px;height:84%;border-radius:20px;background:#1f3a2e;transform:rotate(8deg)}
   h2{font-size:26px;margin-bottom:14px}
   p,li{font-size:12.5px;line-height:1.6;color:#3a3833}
   .cols{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:26px}
   .tl{margin-top:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
   .tl div{border-top:3px solid #1f3a2e;padding-top:8px;font-size:11px}.tl b{display:block;font-size:12.5px;margin-bottom:3px}
   td,th{padding:10px 8px;border-bottom:1px solid #ece9e3;font-size:12px;text-align:left}th{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7a7771}
   .total td{font-weight:700;font-size:14px;border-bottom:none;border-top:2px solid #1a1a1a}`,
  [
    `<div class="cover" style="position:absolute;inset:0"><div class="bean"></div>
      <p class="label">Proposal · October 2026</p>
      <h1>A warmer<br>home online<br>for Fernhill<br>Coffee.</h1>
      <p style="margin-top:28px;font-size:15px;color:#d7e2d4;max-width:420px;line-height:1.5">Website redesign, online ordering and brand refresh — prepared for Hannah Lewis, Founder.</p>
      <p style="position:absolute;bottom:64px;left:72px;font-size:12px;color:#b7c9b5">Prepared by Northfold Studio · hello@northfold.studio</p></div>`,
    `<p class="label">01 — Overview</p><h2 style="margin-top:8px">What we heard</h2>
      <p>Fernhill has grown from one café to four, but the website still reflects the first shop. Customers can't order ahead, the menu lives in a PDF, and 71% of visits are on phones where the current site is hard to use.</p>
      <div class="cols"><div><p class="label">Goals</p><ul style="margin:10px 0 0 16px"><li>Make ordering ahead possible in under 60 seconds</li><li>Show each café's hours, menu and vibe</li><li>Grow the subscription bean club to 1,000 members</li></ul></div>
      <div><p class="label">Success measures</p><ul style="margin:10px 0 0 16px"><li>25% of morning orders placed online by Q2</li><li>Mobile conversion from 0.8% → 2.5%</li><li>Page speed score ≥ 90 on mobile</li></ul></div></div>
      <p class="label" style="margin-top:34px">02 — Timeline</p>
      <div class="tl"><div><b>Discover</b>Weeks 1–2<br>Interviews, audit</div><div><b>Design</b>Weeks 3–6<br>Concepts, UI kit</div><div><b>Build</b>Weeks 7–10<br>Shopify + ordering</div><div><b>Launch</b>Weeks 11–12<br>QA, training</div></div>
      <p class="label" style="margin-top:34px">03 — Investment</p>
      <table style="margin-top:10px"><tr><th>Item</th><th>Details</th><th style="text-align:right">Cost</th></tr>
      <tr><td>Discovery & strategy</td><td>Interviews, analytics, sitemap</td><td style="text-align:right">£3,200</td></tr>
      <tr><td>Brand refresh</td><td>Type, colour, photography direction</td><td style="text-align:right">£4,800</td></tr>
      <tr><td>Website design</td><td>12 templates, responsive</td><td style="text-align:right">£7,500</td></tr>
      <tr><td>Build & ordering</td><td>Shopify theme, click-and-collect</td><td style="text-align:right">£9,900</td></tr>
      <tr class="total"><td>Total</td><td></td><td style="text-align:right">£25,400</td></tr></table>
      <p style="margin-top:18px" class="muted small">50% on signature, 50% at launch. Valid for 30 days.</p>
      <div class="foot"><span>Northfold Studio — Fernhill Coffee proposal</span><span>2 / 2</span></div>`,
  ],
);

const onePager = doc(
  "Loop smart bottle — one-pager",
  `.page{background:#f3f7fb}
   .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:20px;align-items:center}
   h1{font-size:56px;font-weight:800;letter-spacing:-.045em;line-height:.92}
   .bottle{height:330px;width:130px;margin:0 auto;border-radius:60px 60px 40px 40px;background:linear-gradient(90deg,#1b4d89,#2A80EB 45%,#86b8f5);position:relative;box-shadow:0 30px 60px -20px rgba(27,77,137,.6)}
   .bottle:before{content:"";position:absolute;top:-46px;left:30px;width:70px;height:56px;border-radius:18px;background:#14213d}
   .bottle:after{content:"";position:absolute;top:30px;left:18px;width:12px;height:240px;border-radius:12px;background:rgba(255,255,255,.4)}
   .ring{position:absolute;left:50%;top:50%;width:250px;height:250px;margin:-125px;border-radius:50%;border:2px dashed #b9d4f5}
   .feats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:34px}
   .feat{background:#fff;border-radius:16px;padding:18px}
   .feat i{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#e4f0fd;font-style:normal;font-size:17px;margin-bottom:12px}
   .feat h3{font-size:15px;margin-bottom:6px}.feat p{font-size:11.5px;line-height:1.5;color:#4c4a46}
   .specs{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:26px}
   .spec{border-top:2px solid #14213d;padding-top:8px}.spec b{display:block;font-size:22px;letter-spacing:-.03em}.spec span{font-size:10.5px;color:#6b6862}
   .cta{margin-top:34px;display:flex;justify-content:space-between;align-items:center;background:#14213d;color:#fff;border-radius:18px;padding:22px 26px}
   .btn{background:#F2B81F;color:#14213d;font-weight:700;padding:11px 18px;border-radius:30px;font-size:13px}`,
  [
    `<p class="label">Product one-pager · Loop by Tidewell</p>
     <div class="hero"><div><h1 style="margin-top:14px">Drink more water. Think less about it.</h1>
       <p style="margin-top:18px;font-size:14px;line-height:1.55;color:#3a3833">Loop is a self-cleaning smart bottle that glows when it's time to sip, tracks every gulp, and syncs to Apple Health and Google Fit.</p></div>
       <div style="position:relative;height:380px"><div class="ring"></div><div class="bottle" style="margin-top:40px"></div></div></div>
     <div class="feats">
       <div class="feat"><i>💡</i><h3>Gentle glow reminders</h3><p>A soft LED ring nudges you based on your goal, the weather and your calendar.</p></div>
       <div class="feat"><i>🧼</i><h3>UV-C self-cleaning</h3><p>Kills 99.9% of bacteria every two hours. No bottle funk, ever.</p></div>
       <div class="feat"><i>📈</i><h3>Automatic tracking</h3><p>A weight sensor logs every sip — no tapping, no manual logs.</p></div></div>
     <div class="specs"><div class="spec"><b>600 ml</b><span>Double-wall steel</span></div><div class="spec"><b>24 h</b><span>Cold retention</span></div><div class="spec"><b>30 days</b><span>Battery, USB-C</span></div><div class="spec"><b>$79</b><span>Launch price</span></div></div>
     <div class="cta"><div><p style="font-size:18px;font-weight:700;letter-spacing:-.02em">Ships November 2026</p><p style="font-size:12px;color:#b9c4dd;margin-top:4px">Pre-order today and get a free second cap.</p></div><span class="btn">tidewell.com/loop →</span></div>`,
  ],
);

const invoice = doc(
  "Invoice 2026-014",
  `h1{font-size:64px;font-weight:800;letter-spacing:-.05em}
   .top{display:flex;justify-content:space-between;align-items:flex-start}
   .brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:16px}.brand i{width:30px;height:30px;border-radius:9px;background:#DD4387;display:block}
   .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:44px;font-size:12px;line-height:1.6}
   td,th{padding:13px 6px;border-bottom:1px solid #ece9e3;font-size:12.5px;text-align:left}th{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7a7771;border-bottom:2px solid #1a1a1a}
   .r{text-align:right}
   .tot{margin-left:auto;width:280px;margin-top:20px;font-size:13px}.tot div{display:flex;justify-content:space-between;padding:7px 0}.tot .big{border-top:2px solid #1a1a1a;margin-top:6px;padding-top:12px;font-size:20px;font-weight:800;letter-spacing:-.02em}
   .paid{display:inline-block;margin-top:6px;padding:4px 10px;border-radius:20px;background:#fce7f0;color:#a3215a;font-size:11px;font-weight:600}`,
  [
    `<div class="top"><div class="brand"><i></i>Studio Paloma</div><div style="text-align:right"><h1>Invoice</h1><span class="paid">Due 26 Nov 2026</span></div></div>
     <div class="grid3"><div><p class="label">Billed to</p><p style="margin-top:6px"><b>Harbour & Co.</b><br>14 Quay Street<br>Bristol BS1 4DJ<br>accounts@harbour.co</p></div>
       <div><p class="label">From</p><p style="margin-top:6px"><b>Studio Paloma Ltd</b><br>2 Tannery Lane<br>Leeds LS2 7HR<br>VAT GB 284 1188 21</p></div>
       <div><p class="label">Details</p><p style="margin-top:6px">Invoice № <b>2026-014</b><br>Issued 27 Oct 2026<br>Project: Spring campaign<br>PO: HC-8812</p></div></div>
     <table style="margin-top:44px"><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr>
       <tr><td><b>Campaign concept</b><br><span class="muted small">Moodboards, 3 routes, presentation</span></td><td class="r">1</td><td class="r">£2,400</td><td class="r">£2,400</td></tr>
       <tr><td><b>Photography — studio day</b><br><span class="muted small">Incl. retouching of 24 images</span></td><td class="r">2</td><td class="r">£1,350</td><td class="r">£2,700</td></tr>
       <tr><td><b>Social cut-downs</b><br><span class="muted small">9:16 and 1:1, 12 assets</span></td><td class="r">12</td><td class="r">£95</td><td class="r">£1,140</td></tr>
       <tr><td><b>Art direction</b><br><span class="muted small">Hours</span></td><td class="r">14</td><td class="r">£85</td><td class="r">£1,190</td></tr></table>
     <div class="tot"><div><span class="muted">Subtotal</span><span>£7,430.00</span></div><div><span class="muted">VAT (20%)</span><span>£1,486.00</span></div><div class="big"><span>Total</span><span>£8,916.00</span></div></div>
     <div style="margin-top:60px;display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:12px;line-height:1.6"><div><p class="label">Payment</p><p style="margin-top:6px">Bank transfer to Studio Paloma Ltd<br>Sort code 20-45-77 · Account 31926845<br>Reference: 2026-014</p></div><div><p class="label">Thank you</p><p style="margin-top:6px">It was a joy working on the spring campaign. Questions? hello@studiopaloma.co</p></div></div>`,
  ],
);

const handout = doc(
  "Workshop handout — Writing better prompts",
  `.page{background:#fffdf7}
   h1{font-family:'Newsreader',serif;font-size:48px;font-weight:600;letter-spacing:-.03em}
   .steps{display:grid;gap:14px;margin-top:28px}
   .step{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:start}
   .n{width:44px;height:44px;border-radius:50%;background:#F2B81F;display:grid;place-items:center;font-weight:800;font-size:18px}
   .step h3{font-size:16px;margin-top:4px}.step p{font-size:12px;line-height:1.55;color:#3a3833;margin-top:4px}
   .ex{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:28px}
   .box{border-radius:14px;padding:16px;font-size:11.5px;line-height:1.55}
   .bad{background:#fce6e6}.good{background:#e2f5eb}
   .box .mono{font-size:11px;display:block;margin-top:8px;background:rgba(255,255,255,.6);padding:10px;border-radius:8px}
   .check{margin-top:26px;columns:2;font-size:12px;line-height:2}
   .check span{display:inline-block;width:12px;height:12px;border:1.6px solid #1a1a1a;border-radius:3px;margin-right:8px;vertical-align:-1px}`,
  [
    `<p class="label">Workshop handout · Session 2 of 4</p><h1 style="margin-top:10px">Writing prompts that work the first time</h1>
     <p style="margin-top:12px;font-size:13px;color:#4c4a46;max-width:560px;line-height:1.6">Five habits that turn vague requests into reliable results — for any model, image or text.</p>
     <div class="steps">
       <div class="step"><div class="n">1</div><div><h3>Name the role and the reader</h3><p>"You are a senior UX writer. Write for first-time users on mobile." Context beats cleverness.</p></div></div>
       <div class="step"><div class="n">2</div><div><h3>Describe the output, not just the topic</h3><p>Format, length, tone and structure: "3 bullet points, under 60 words, friendly but direct."</p></div></div>
       <div class="step"><div class="n">3</div><div><h3>Give one good example</h3><p>A single example of the style you want is worth a paragraph of adjectives.</p></div></div>
       <div class="step"><div class="n">4</div><div><h3>Leave blanks for what changes</h3><p>Turn specifics into {{blanks}} so the prompt is reusable: {{product}}, {{audience}}, {{tone}}.</p></div></div>
       <div class="step"><div class="n">5</div><div><h3>Ask for a check before the answer</h3><p>"List any assumptions first" catches misunderstandings before they cost you a rewrite.</p></div></div></div>
     <div class="ex"><div class="box bad"><b>Before</b><span class="mono">Write a product description for my candle.</span></div>
       <div class="box good"><b>After</b><span class="mono">You are a copywriter for a slow-living brand. Write a 70-word description of {{product}} for {{audience}}. Mention scent notes and burn time. Calm, sensory tone. No exclamation marks.</span></div></div>
     <p class="label" style="margin-top:28px">Your checklist</p>
     <div class="check"><p><span></span>Role & reader defined</p><p><span></span>Output format stated</p><p><span></span>Length limit set</p><p><span></span>Tone in 3 words</p><p><span></span>One example included</p><p><span></span>Blanks for variables</p><p><span></span>Constraints listed</p><p><span></span>Asked for assumptions</p></div>
     <div class="foot"><span>Prompt Craft Workshop · promptshelf.dev</span><span>Handout 2</span></div>`,
  ],
);

const pressRelease = doc(
  "Press release — Northwind Robotics",
  `.mast{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a1a1a;padding-bottom:16px}
   .logo{font-weight:900;font-size:22px;letter-spacing:-.03em}.logo span{color:#E5484D}
   h1{font-family:'Newsreader',serif;font-size:40px;font-weight:600;letter-spacing:-.025em;line-height:1.08;margin-top:30px}
   .dek{font-family:'Newsreader',serif;font-style:italic;font-size:17px;color:#4c4a46;margin-top:14px;line-height:1.45}
   .body{columns:2;column-gap:28px;margin-top:26px;font-size:12px;line-height:1.65;color:#2e2c29}
   .body p{margin-bottom:11px}
   blockquote{border-left:3px solid #E5484D;padding-left:12px;font-family:'Newsreader',serif;font-size:14.5px;font-style:italic;color:#1a1a1a;margin:4px 0 12px;break-inside:avoid}
   .about{margin-top:20px;padding:16px;background:#f6f4f0;border-radius:12px;font-size:11px;line-height:1.6}`,
  [
    `<div class="mast"><div class="logo">north<span>wind</span></div><p class="label" style="color:#E5484D">For immediate release</p></div>
     <h1>Northwind launches Kestrel, a warehouse robot that learns new pick routes in under an hour</h1>
     <p class="dek">The autonomous picker cuts onboarding from weeks to an afternoon and is available today to mid-sized retailers in the UK and EU.</p>
     <div class="body">
       <p><b>MANCHESTER, 27 October 2026</b> — Northwind Robotics today announced Kestrel, an autonomous mobile picking robot designed for warehouses between 5,000 and 50,000 square metres. Kestrel maps a new site and learns optimal pick routes in under 60 minutes, compared with the two-to-six weeks typical of current systems.</p>
       <p>Early customers including Oakhouse Home and Brightfield Pharmacy report picking-rate improvements of 38% and a 52% reduction in walking time for floor staff, who now focus on packing and quality checks.</p>
       <blockquote>"Warehouses change every week — new stock, new layouts, peak season. Kestrel is the first robot that keeps up without a consultant on site."<br><span style="font-style:normal;font-size:11px;font-family:'Inter Tight'">— Priya Raman, CEO, Northwind Robotics</span></blockquote>
       <p>Kestrel works alongside people, slowing and re-routing automatically around staff. It integrates with major warehouse management systems through a single API and requires no floor markers or reflectors.</p>
       <p>Pricing starts at £1,450 per robot per month, including maintenance and software updates. A free two-week pilot is available for qualifying sites.</p>
       <blockquote>"We were live on a Tuesday afternoon. By Friday our pickers were asking for more robots."<br><span style="font-style:normal;font-size:11px;font-family:'Inter Tight'">— Tom Ellery, Ops Director, Oakhouse Home</span></blockquote>
       <p>Kestrel is available to order today at northwind.ai/kestrel, with first deliveries in January 2027.</p></div>
     <div class="about"><b>About Northwind Robotics</b> — Founded in 2021 in Manchester, Northwind builds adaptable robots for logistics. The company has raised £64M from Atomico and Octopus Ventures and employs 140 people.<br><br><b>Media contact:</b> Leah Morgan · press@northwind.ai · +44 161 555 0142</div>
     <p style="text-align:center;margin-top:16px;font-size:12px;letter-spacing:.4em">###</p>`,
  ],
);

// ---------------------------------------------------------------- REPORTS

const kpiReport = doc(
  "October 2026 Growth Report",
  `.head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #ece9e3;padding-bottom:18px}
   h1{font-size:40px;font-weight:800;letter-spacing:-.04em}
   .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:22px}
   .kpi{background:#f6f4f0;border-radius:14px;padding:14px}.kpi b{display:block;font-size:26px;letter-spacing:-.03em;margin-top:4px}
   .up{color:#1C9660;font-size:11px;font-weight:600}.down{color:#E5484D;font-size:11px;font-weight:600}
   .card{border:1px solid #ece9e3;border-radius:16px;padding:16px;margin-top:16px}
   .card h3{font-size:14px;margin-bottom:10px}
   .two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
   .legend{display:flex;gap:14px;font-size:10.5px;color:#4c4a46;margin-bottom:6px}.legend i{display:inline-block;width:10px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle}
   p.note{font-size:12px;line-height:1.6;color:#3a3833}
   td,th{padding:8px 4px;border-bottom:1px solid #f0ede7;font-size:11.5px;text-align:left}th{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8a877f}
   ${HBAR_CSS}`,
  [
    `<div class="head"><div><p class="label">Monthly growth report</p><h1 style="margin-top:6px">October 2026</h1></div><p class="muted small" style="text-align:right">Prepared 2 Nov 2026<br>Growth team · Lumen App</p></div>
     <div class="kpis"><div class="kpi"><span class="label">Active users</span><b>48.2k</b><span class="up">▲ 12.4% MoM</span></div><div class="kpi"><span class="label">New signups</span><b>9,310</b><span class="up">▲ 8.1%</span></div><div class="kpi"><span class="label">Paid conversion</span><b>4.6%</b><span class="up">▲ 0.7 pts</span></div><div class="kpi"><span class="label">Churn</span><b>2.9%</b><span class="down">▲ 0.3 pts</span></div></div>
     <div class="card"><h3>Weekly active users vs. signups</h3><div class="legend"><span><i style="background:#2A80EB"></i>Weekly actives (k)</span><span><i style="background:#E5561F"></i>Signups (hundreds)</span></div>
       ${lineChart(
         [
           { name: "WAU", color: "#2A80EB", data: [31, 33, 34, 36, 38, 41, 43, 46, 48] },
           { name: "Signups", color: "#E5561F", data: [18, 19, 21, 20, 23, 22, 25, 24, 27] },
         ],
         ["W32", "W33", "W34", "W35", "W36", "W37", "W38", "W39", "W40"],
       )}</div>
     <div class="two"><div class="card"><h3>Signups by channel</h3>${barChart([
       { label: "Organic", value: 3420 },
       { label: "Referral", value: 2210, color: "#7B4DF0" },
       { label: "Paid", value: 1980, color: "#E5561F" },
       { label: "Social", value: 1120, color: "#DD4387" },
       { label: "Other", value: 580, color: "#8a877f" },
     ])}</div>
       <div class="card"><h3>Feature adoption (of actives)</h3>${hbars(
         [
           { label: "Smart reminders", value: 64 },
           { label: "Shared lists", value: 41 },
           { label: "Widgets", value: 33 },
           { label: "Calendar sync", value: 27 },
         ],
         "#1C9660",
       )}</div></div>
     <div class="card"><h3>What happened</h3><p class="note">Growth was driven by the <b>referral programme relaunch</b> (14 Oct), which lifted referral signups 46%. Paid conversion rose after moving the paywall from day 1 to day 5. Churn ticked up among annual renewals; a win-back sequence starts 10 Nov.</p></div>
     <div class="foot"><span>Lumen · Growth report · Confidential</span><span>1 / 2</span></div>`,
    `<p class="label">Detail</p><h2 style="font-size:26px;margin-top:6px">Funnel & cohorts</h2>
     <div class="card"><h3>Activation funnel (October cohort)</h3>${hbars(
       [
         { label: "Visited site", value: 100 },
         { label: "Started signup", value: 38 },
         { label: "Completed signup", value: 27 },
         { label: "Created first list", value: 19 },
         { label: "Active on day 7", value: 12 },
       ],
       "#2A80EB",
     )}</div>
     <div class="card"><h3>Retention by cohort (% active)</h3><table><tr><th>Cohort</th><th>Users</th><th>W1</th><th>W2</th><th>W4</th><th>W8</th></tr>
       ${[
         ["Jul", "6,840", 61, 48, 39, 31],
         ["Aug", "7,420", 63, 50, 41, 33],
         ["Sep", "8,610", 66, 53, 44, "—"],
         ["Oct", "9,310", 68, 55, "—", "—"],
       ]
         .map(
           (r) =>
             `<tr>${r.map((c, i) => `<td${i > 1 && typeof c === "number" ? ` style="background:rgba(42,128,235,${(c as number) / 120})"` : ""}>${typeof c === "number" ? c + "%" : c}</td>`).join("")}</tr>`,
         )
         .join("")}</table></div>
     <div class="two"><div class="card"><h3>Next month's bets</h3><p class="note">1. Win-back emails for lapsed annual plans<br>2. Onboarding checklist A/B test<br>3. Android widget launch (10 Nov)</p></div>
       <div class="card"><h3>Risks</h3><p class="note">Ad costs up 18% into holiday season. iOS 20 notification changes may reduce reminder opens; monitoring weekly.</p></div></div>
     <div class="foot"><span>Lumen · Growth report · Confidential</span><span>2 / 2</span></div>`,
  ],
);

const survey = doc(
  "Customer survey 2026 — results",
  `.page{background:#fbfaf7}
   h1{font-family:'Newsreader',serif;font-size:46px;font-weight:600;letter-spacing:-.03em}
   .row{display:grid;grid-template-columns:200px 1fr;gap:26px;align-items:center;margin-top:26px;background:#fff;border-radius:18px;padding:20px}
   .legend p{font-size:11.5px;margin:5px 0}.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;vertical-align:-1px}
   .quotes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
   .q{background:#fff;border-radius:16px;padding:16px;font-family:'Newsreader',serif;font-style:italic;font-size:14px;line-height:1.45}
   .q span{display:block;font-family:'Inter Tight';font-style:normal;font-size:10.5px;color:#8a877f;margin-top:8px}
   ${HBAR_CSS}`,
  [
    `<p class="label">Annual customer survey · n = 1,204</p><h1 style="margin-top:8px">How customers feel about Brightdesk in 2026</h1>
     <div class="row">${donut(
       [
         { value: 58, color: "#1C9660" },
         { value: 27, color: "#F2B81F" },
         { value: 15, color: "#E5484D" },
       ],
       170,
       "+43",
       "NPS",
     )}
       <div><h3 style="font-size:18px">Net Promoter Score rose from +31 to +43</h3><p style="font-size:12px;line-height:1.6;color:#3a3833;margin-top:8px">The biggest jump came from teams of 10–50 people, where the new shared inbox replaced two other tools.</p>
       <div class="legend" style="margin-top:10px"><p><i style="background:#1C9660"></i>Promoters 58%</p><p><i style="background:#F2B81F"></i>Passives 27%</p><p><i style="background:#E5484D"></i>Detractors 15%</p></div></div></div>
     <div class="row" style="grid-template-columns:1fr"><div><h3 style="font-size:15px;margin-bottom:12px">What customers value most</h3>${hbars(
       [
         { label: "Shared inbox", value: 72 },
         { label: "Response templates", value: 61 },
         { label: "Reporting", value: 44 },
         { label: "Integrations", value: 39 },
         { label: "Mobile app", value: 22 },
       ],
       "#2A80EB",
     )}</div></div>
     <div class="row" style="grid-template-columns:1fr"><div><h3 style="font-size:15px;margin-bottom:12px">Top frustrations</h3>${hbars(
       [
         { label: "Search is slow", value: 38 },
         { label: "Notification overload", value: 31 },
         { label: "Pricing for small teams", value: 24 },
         { label: "Setup takes too long", value: 17 },
       ],
       "#E5484D",
     )}</div></div>
     <div class="quotes"><div class="q">"It's the first support tool my whole team actually opens without being reminded."<span>Ops lead, 24-person agency</span></div><div class="q">"Search needs to be instant. Everything else is great."<span>Founder, e-commerce brand</span></div></div>
     <div class="foot"><span>Brightdesk Research · Survey fielded 1–15 Oct 2026</span><span>Summary</span></div>`,
  ],
);

const competitive = doc(
  "Competitive analysis — note-taking apps",
  `h1{font-size:38px;font-weight:800;letter-spacing:-.04em}
   td,th{padding:10px 8px;border-bottom:1px solid #ece9e3;font-size:11.5px;text-align:center}th{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#7a7771}
   td:first-child,th:first-child{text-align:left}
   .us{background:#fff8e1}
   .y{color:#1C9660;font-weight:700}.n{color:#cfccc5}.p{color:#F2B81F;font-weight:700}
   .grid{display:grid;grid-template-columns:1.05fr .95fr;gap:22px;margin-top:22px}
   .card{border:1px solid #ece9e3;border-radius:16px;padding:16px}
   .swot{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:20px}
   .swot div{border-radius:12px;padding:12px;font-size:11px;line-height:1.55}.swot b{display:block;font-size:12px;margin-bottom:4px}`,
  [
    `<p class="label">Competitive analysis · Q4 2026</p><h1 style="margin-top:6px">Where Quill fits in note-taking</h1>
     <p style="margin-top:10px;font-size:12.5px;color:#4c4a46;line-height:1.6;max-width:600px">Feature parity, positioning and gaps against four competitors, based on hands-on testing and 40 customer interviews.</p>
     <table style="margin-top:20px"><tr><th>Capability</th><th class="us">Quill</th><th>Notion</th><th>Obsidian</th><th>Apple Notes</th><th>Bear</th></tr>
      ${[
        ["Offline-first", "y", "n", "y", "y", "y"],
        ["Real-time collaboration", "y", "y", "n", "p", "n"],
        ["AI summaries", "y", "y", "p", "n", "n"],
        ["Markdown export", "y", "p", "y", "n", "y"],
        ["Handwriting", "p", "n", "n", "y", "n"],
        ["End-to-end encryption", "y", "n", "p", "y", "p"],
        ["Free tier", "y", "y", "y", "y", "p"],
        ["Price / mo (pro)", "$6", "$10", "$8", "Free", "$3"],
      ]
        .map(
          (r) =>
            `<tr>${r.map((c, i) => (i === 0 ? `<td>${c}</td>` : `<td class="${i === 1 ? "us " : ""}${["y", "n", "p"].includes(c) ? c : ""}">${c === "y" ? "●" : c === "n" ? "○" : c === "p" ? "◐" : c}</td>`)).join("")}</tr>`,
        )
        .join("")}</table>
     <p class="small muted" style="margin-top:8px">● full &nbsp; ◐ partial &nbsp; ○ none</p>
     <div class="grid"><div class="card"><h3 style="font-size:14px">Positioning map</h3>
       <svg viewBox="0 0 300 240" width="100%"><line x1="150" y1="10" x2="150" y2="230" stroke="#cfccc5"/><line x1="10" y1="120" x2="290" y2="120" stroke="#cfccc5"/>
       <text x="150" y="8" font-size="9" text-anchor="middle" fill="#8a877f">Team-oriented</text><text x="150" y="240" font-size="9" text-anchor="middle" fill="#8a877f">Personal</text><text x="12" y="114" font-size="9" fill="#8a877f">Simple</text><text x="288" y="114" font-size="9" text-anchor="end" fill="#8a877f">Powerful</text>
       ${[
         ["Notion", 230, 50, "#8a877f"],
         ["Obsidian", 250, 170, "#8a877f"],
         ["Apple Notes", 60, 190, "#8a877f"],
         ["Bear", 90, 160, "#8a877f"],
         ["Quill", 175, 85, "#F2B81F"],
       ]
         .map(
           ([n, cx, cy, col]) =>
             `<circle cx="${cx}" cy="${cy}" r="${n === "Quill" ? 14 : 9}" fill="${col}" opacity="${n === "Quill" ? 1 : 0.5}"/><text x="${cx}" y="${Number(cy) + 26}" font-size="10" text-anchor="middle" font-weight="${n === "Quill" ? 700 : 500}">${n}</text>`,
         )
         .join("")}</svg></div>
       <div><div class="swot"><div style="background:#e2f5eb"><b>Strengths</b>Fast offline sync, privacy story, fair pricing.</div><div style="background:#fce6e6"><b>Weaknesses</b>Few templates, no web clipper, small brand.</div><div style="background:#e4f0fd"><b>Opportunities</b>Teams leaving Notion over price; students on iPad.</div><div style="background:#fdf5da"><b>Threats</b>Apple Notes adding collaboration in iOS 20.</div></div>
       <p style="font-size:12px;line-height:1.6;margin-top:14px"><b>Recommendation:</b> lead with "private by default, shared when you want" and ship templates + web clipper before Q2.</p></div></div>
     <div class="foot"><span>Quill Strategy · Internal</span><span>Competitive analysis</span></div>`,
  ],
);

const pipeline = doc(
  "Sales pipeline snapshot — Q4",
  `.page{background:#0f1424;color:#e7eaf3}
   .label{color:#8f97b2}
   h1{font-size:38px;font-weight:800;letter-spacing:-.04em}
   .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}
   .kpi{background:#182036;border-radius:14px;padding:16px}.kpi b{display:block;font-size:28px;letter-spacing:-.03em;margin-top:4px}
   .funnel{margin-top:22px;display:grid;gap:8px}
   .stage{display:grid;grid-template-columns:120px 1fr 90px;align-items:center;gap:12px;font-size:12px}
   .stage i{display:block;height:30px;border-radius:8px;background:linear-gradient(90deg,#2A80EB,#7B4DF0)}
   td,th{padding:9px 6px;border-bottom:1px solid #232b45;font-size:11.5px;text-align:left}th{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8f97b2}
   .pill{display:inline-block;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:600}`,
  [
    `<p class="label">Pipeline snapshot · Week 43</p><h1 style="margin-top:6px">Q4 is tracking at 92% of target</h1>
     <div class="kpis"><div class="kpi"><span class="label">Open pipeline</span><b>$4.8M</b><span style="color:#5ee0a0;font-size:11px">▲ $620k vs last week</span></div><div class="kpi"><span class="label">Weighted forecast</span><b>$1.84M</b><span style="color:#8f97b2;font-size:11px">Target $2.0M</span></div><div class="kpi"><span class="label">Win rate (90d)</span><b>27%</b><span style="color:#5ee0a0;font-size:11px">▲ 3 pts</span></div></div>
     <div class="funnel">${[
       ["Prospecting", 100, "$4.8M · 212"],
       ["Discovery", 74, "$3.6M · 141"],
       ["Proposal", 48, "$2.3M · 63"],
       ["Negotiation", 29, "$1.4M · 22"],
       ["Closed won", 14, "$680k · 9"],
     ]
       .map(
         ([n, w, v]) =>
           `<div class="stage"><span>${n}</span><div><i style="width:${w}%"></i></div><span style="text-align:right;color:#b8bfd6">${v}</span></div>`,
       )
       .join("")}</div>
     <h3 style="font-size:15px;margin-top:28px">Top deals to close this quarter</h3>
     <table style="margin-top:8px"><tr><th>Account</th><th>Owner</th><th>Stage</th><th>Close</th><th style="text-align:right">Value</th></tr>
      ${[
        ["Helios Energy", "R. Chen", "Negotiation", "14 Nov", "$310k", "#F2B81F"],
        ["Marlow Health", "A. Ruiz", "Proposal", "28 Nov", "$245k", "#2A80EB"],
        ["Cobalt Freight", "J. Patel", "Negotiation", "2 Dec", "$190k", "#F2B81F"],
        ["Fable & Co", "S. Okoye", "Proposal", "9 Dec", "$150k", "#2A80EB"],
        ["Northgate Bank", "R. Chen", "Discovery", "18 Dec", "$420k", "#7B4DF0"],
      ]
        .map(
          ([a, o, s, c, v, col]) =>
            `<tr><td><b>${a}</b></td><td>${o}</td><td><span class="pill" style="background:${col}33;color:${col}">${s}</span></td><td>${c}</td><td style="text-align:right">${v}</td></tr>`,
        )
        .join("")}</table>
     <div style="margin-top:22px;background:#182036;border-radius:14px;padding:16px;font-size:12px;line-height:1.6"><b>Focus this week:</b> unblock Helios legal review (security questionnaire due Thu) and get exec sponsor meeting with Northgate before 8 Nov.</div>
     <div class="foot" style="color:#5f6785"><span>RevOps · Generated from CRM export</span><span>Snapshot</span></div>`,
  ],
);

const research = doc(
  "User research synthesis — meal planning",
  `.page{background:#fffcf6}
   h1{font-family:'Newsreader',serif;font-size:42px;font-weight:600;letter-spacing:-.03em}
   .themes{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}
   .theme{border-radius:16px;padding:16px;min-height:200px}
   .theme h3{font-size:15px;margin:6px 0 8px}
   .note{display:block;background:rgba(255,255,255,.75);border-radius:6px;padding:7px 9px;font-size:10.5px;line-height:1.4;margin-top:6px;box-shadow:0 1px 0 rgba(0,0,0,.05)}
   .persona{display:grid;grid-template-columns:110px 1fr;gap:18px;margin-top:22px;border:1px solid #ece9e3;border-radius:18px;padding:18px;background:#fff}
   .face{width:110px;height:110px;border-radius:24px;background:linear-gradient(160deg,#ffd0b5,#E5561F);display:grid;place-items:end center;overflow:hidden}
   .face i{width:60px;height:70px;border-radius:30px 30px 0 0;background:#7a3a1c;display:block}
   .ins{margin-top:20px;display:grid;gap:10px}
   .in{display:grid;grid-template-columns:28px 1fr;gap:12px;font-size:12px;line-height:1.55}.in b{font-family:'JetBrains Mono';color:#E5561F}`,
  [
    `<p class="label">Research synthesis · 14 interviews · Sept 2026</p><h1 style="margin-top:8px">Why busy parents abandon meal planning by Wednesday</h1>
     <div class="themes">
       <div class="theme" style="background:#fdede5"><p class="label">Theme 1</p><h3>Plans break on contact with real life</h3><span class="note">"Monday's plan is fiction by Tuesday — someone has football."</span><span class="note">9 of 14 replan midweek</span><span class="note">Leftovers never in the plan</span></div>
       <div class="theme" style="background:#e4f0fd"><p class="label">Theme 2</p><h3>The shopping list is the real product</h3><span class="note">"I don't care about recipes. I care that the list is right."</span><span class="note">Lists shared in WhatsApp</span><span class="note">Aisle order matters</span></div>
       <div class="theme" style="background:#e2f5eb"><p class="label">Theme 3</p><h3>Kids veto more than budgets do</h3><span class="note">"If my son won't eat it, it doesn't matter how cheap it is."</span><span class="note">Picky-eater swaps wanted</span><span class="note">Kids like choosing 1 meal</span></div></div>
     <div class="persona"><div class="face"><i></i></div><div><p class="label">Primary persona</p><h3 style="font-size:18px;margin-top:4px">Jess, 38 — "the default planner"</h3><p style="font-size:12px;line-height:1.6;margin-top:6px;color:#3a3833">Works 4 days a week, two kids (7 and 11). Plans on Sunday night on her phone, shops online Monday. Wants dinner sorted in 10 minutes a week and fewer "what's for tea?" texts.</p></div></div>
     <p class="label" style="margin-top:24px">Key insights</p>
     <div class="ins"><div class="in"><b>01</b><span><b style="font-family:'Inter Tight';color:#1a1a1a">Design for replanning, not planning.</b> A one-tap "swap Wednesday" beats a perfect Sunday plan.</span></div>
       <div class="in"><b>02</b><span><b style="font-family:'Inter Tight';color:#1a1a1a">Make the list shareable and sorted.</b> Export to WhatsApp and the household's usual store.</span></div>
       <div class="in"><b>03</b><span><b style="font-family:'Inter Tight';color:#1a1a1a">Give kids a vote.</b> A weekly "kid's pick" increased stated plan completion in concept tests.</span></div></div>
     <div class="foot"><span>Product Research · Supper app</span><span>Synthesis</span></div>`,
  ],
);

const financial = doc(
  "Quarterly financial summary — Q3 2026",
  `h1{font-size:38px;font-weight:800;letter-spacing:-.04em}
   .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px}
   .kpi{border-top:3px solid #1a1a1a;padding-top:10px}.kpi b{display:block;font-size:24px;letter-spacing:-.03em;margin-top:2px}
   .g{color:#1C9660}.r{color:#E5484D}
   td,th{padding:8px 6px;border-bottom:1px solid #ece9e3;font-size:11.5px;text-align:right}th{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#7a7771}
   td:first-child,th:first-child{text-align:left}
   tr.sub td{font-weight:700;border-top:1.5px solid #1a1a1a}
   .two{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px}
   .card{background:#f6f4f0;border-radius:16px;padding:16px}`,
  [
    `<p class="label">Quarterly financial summary · Q3 FY2026</p><h1 style="margin-top:6px">Revenue up 24%, margins expanding</h1>
     <div class="kpis"><div class="kpi"><span class="label">Revenue</span><b>$12.4M</b><span class="g small">▲ 24% YoY</span></div><div class="kpi"><span class="label">Gross margin</span><b>71.2%</b><span class="g small">▲ 2.1 pts</span></div><div class="kpi"><span class="label">Operating income</span><b>$1.9M</b><span class="g small">▲ $1.1M</span></div><div class="kpi"><span class="label">Cash</span><b>$38.6M</b><span class="r small">▼ $2.2M</span></div></div>
     <div class="two"><div class="card"><h3 style="font-size:14px;margin-bottom:8px">Quarterly revenue ($M)</h3>${barChart(
       [
         { label: "Q3'25", value: 10.0, color: "#cfccc5" },
         { label: "Q4'25", value: 10.6, color: "#cfccc5" },
         { label: "Q1'26", value: 11.1, color: "#cfccc5" },
         { label: "Q2'26", value: 11.7, color: "#cfccc5" },
         { label: "Q3'26", value: 12.4, color: "#1C9660" },
       ],
     )}</div>
       <div class="card"><h3 style="font-size:14px;margin-bottom:8px">Revenue mix</h3><div style="display:flex;gap:16px;align-items:center">${donut(
         [
           { value: 68, color: "#1C9660" },
           { value: 22, color: "#2A80EB" },
           { value: 10, color: "#F2B81F" },
         ],
         130,
         "68%",
         "SUBSCRIPTION",
       )}<div style="font-size:11.5px;line-height:2"><p><b style="color:#1C9660">■</b> Subscriptions 68%</p><p><b style="color:#2A80EB">■</b> Services 22%</p><p><b style="color:#F2B81F">■</b> Marketplace 10%</p></div></div></div></div>
     <h3 style="font-size:15px;margin-top:22px">Income statement (unaudited, $000)</h3>
     <table style="margin-top:6px"><tr><th>Line item</th><th>Q3 FY26</th><th>Q3 FY25</th><th>Change</th></tr>
      ${[
        ["Revenue", "12,410", "10,010", "+24.0%"],
        ["Cost of revenue", "(3,574)", "(3,093)", "+15.6%"],
        ["Gross profit", "8,836", "6,917", "+27.7%", "sub"],
        ["R&D", "(3,104)", "(2,720)", "+14.1%"],
        ["Sales & marketing", "(2,688)", "(2,610)", "+3.0%"],
        ["G&A", "(1,140)", "(1,030)", "+10.7%"],
        ["Operating income", "1,904", "557", "+242%", "sub"],
      ]
        .map(
          ([a, b, c, d, cls]) =>
            `<tr class="${cls ?? ""}"><td>${a}</td><td>${b}</td><td>${c}</td><td class="${String(d).startsWith("+") && cls ? "g" : ""}">${d}</td></tr>`,
        )
        .join("")}</table>
     <div class="card" style="margin-top:18px;font-size:12px;line-height:1.6"><b>Commentary.</b> Growth came from enterprise expansion (net revenue retention 118%). Gross margin improved as hosting moved to reserved capacity. Cash decreased due to the annual office prepayment; we remain on track for cash-flow breakeven in Q1 FY27.</div>
     <div class="foot"><span>Finance · Board pack excerpt</span><span>Q3 FY2026</span></div>`,
  ],
);

const DOCS: Record<string, [string, string]> = {
  "one-page-resume": ["documents", resume],
  "project-proposal": ["documents", proposal],
  "product-one-pager": ["documents", onePager],
  "client-invoice": ["documents", invoice],
  "workshop-handout": ["documents", handout],
  "press-release": ["documents", pressRelease],
  "monthly-kpi-report": ["reports", kpiReport],
  "survey-results-summary": ["reports", survey],
  "competitive-analysis": ["reports", competitive],
  "sales-pipeline-snapshot": ["reports", pipeline],
  "user-research-synthesis": ["reports", research],
  "quarterly-financial-summary": ["reports", financial],
};

async function main() {
  const only = process.argv.slice(2);
  console.log("Documents:");
  for (const [slug, [category, html]] of Object.entries(DOCS)) {
    if (only.length && !only.includes(slug)) continue;
    await renderDocument(html, promptDir(category, slug));
  }
  await closeBrowser();
}

void main();
