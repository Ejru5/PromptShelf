/**
 * Placeholder results for the Images shelf: illustrated SVG scenes rendered to JPEG.
 * Run: npx tsx scripts/seed/images.ts
 */
import path from "node:path";
import {
  FONT_LINK,
  GRAIN_FILTER,
  closeBrowser,
  promptDir,
  renderHtmlToImage,
  rng,
  svgPage,
} from "./lib";

// ---------------------------------------------------------------- 1. desert portrait

type DesertPalette = {
  sky: [string, string, string, string];
  sun: string;
  sunY: number;
  dunes: [string, string][];
  dress: string;
  haze: string;
};

const DESERT: Record<string, DesertPalette> = {
  golden: {
    sky: ["#3b1d4a", "#b3483a", "#f29a5b", "#ffd6a0"],
    sun: "#fff1cf",
    sunY: 560,
    dunes: [
      ["#eb9160", "#c9663b"],
      ["#f2a468", "#b9532d"],
      ["#e07a43", "#8e3a1c"],
    ],
    dress: "#c81d25",
    haze: "#ffd9a0",
  },
  blue: {
    sky: ["#0f1a3d", "#33407a", "#8b7fb3", "#f0b8a6"],
    sun: "#ffe3d0",
    sunY: 640,
    dunes: [
      ["#9a7fa8", "#6e5a86"],
      ["#b38ea0", "#6b4f73"],
      ["#8f6a86", "#3e2a4a"],
    ],
    dress: "#f2f0ea",
    haze: "#f3c4c0",
  },
  noon: {
    sky: ["#5aa9e6", "#8cc6f0", "#cfe7f7", "#f6efe4"],
    sun: "#fffdf4",
    sunY: 260,
    dunes: [
      ["#f3c58e", "#e2a466"],
      ["#f7cf96", "#d99050"],
      ["#eeb06f", "#b8682d"],
    ],
    dress: "#1f4fbf",
    haze: "#fff4df",
  },
};

function desertScene(p: DesertPalette) {
  const W = 1500;
  const H = 1000;
  return svgPage(
    W,
    H,
    `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".38" stop-color="${p.sky[1]}"/>
    <stop offset=".7" stop-color="${p.sky[2]}"/><stop offset="1" stop-color="${p.sky[3]}"/>
  </linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="${p.sun}" stop-opacity=".95"/><stop offset=".35" stop-color="${p.sun}" stop-opacity=".45"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/></radialGradient>
  ${p.dunes
    .map(
      ([a, b], i) =>
        `<linearGradient id="d${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`,
    )
    .join("")}
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="${p.haze}" stop-opacity="0"/><stop offset=".68" stop-color="${p.haze}" stop-opacity=".55"/><stop offset=".85" stop-color="${p.haze}" stop-opacity="0"/></linearGradient>
  <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
  <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.dress}"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  ${GRAIN_FILTER}
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle cx="1050" cy="${p.sunY}" r="330" fill="url(#glow)"/>
<circle cx="1050" cy="${p.sunY}" r="62" fill="${p.sun}"/>
<path d="M0 650 C 250 590, 420 610, 600 628 S 1000 570, 1200 606 S 1450 648, 1500 628 L1500 1000 L0 1000Z" fill="url(#d0)" opacity=".92"/>
<path d="M0 735 C 200 670, 380 662, 560 712 S 900 800, 1150 712 S 1400 672, 1500 700 V1000 H0Z" fill="url(#d1)"/>
<path d="M0 870 C 300 770, 520 708, 760 698 C 980 690, 1200 770, 1500 832 V1000 H0Z" fill="url(#d2)"/>
<path d="M760 698 C 980 690, 1200 770, 1500 832 V1000 H 980 C 930 880, 850 760, 760 698Z" fill="#000" opacity=".16"/>
${[0, 1, 2, 3, 4, 5]
  .map(
    (i) =>
      `<path d="M${80 + i * 90} ${905 + i * 14} C ${300 + i * 60} ${860 + i * 10}, ${520 + i * 40} ${830 + i * 12}, ${700 + i * 30} ${845 + i * 16}" stroke="#fff" stroke-opacity=".16" stroke-width="2" fill="none"/>`,
  )
  .join("")}
<ellipse cx="660" cy="712" rx="120" ry="9" fill="#000" opacity=".22" filter="url(#soft)"/>
<g>
  <path d="M770 621 C 812 606, 846 618, 888 602 C 858 626, 816 630, 772 630Z" fill="${p.dress}" opacity=".85"/>
  <circle cx="762" cy="602" r="12.5" fill="#2a1410"/>
  <path d="M770 596 C 790 590, 800 600, 812 596 C 800 606, 786 606, 772 606Z" fill="#2a1410"/>
  <path d="M755 614 C 753 636, 751 646, 748 666 L 775 666 C 772 646, 770 636, 768 614Z" fill="url(#dress)"/>
  <path d="M749 660 C 741 682, 737 700, 730 716 C 764 721, 806 716, 850 702 C 820 692, 796 676, 775 660Z" fill="url(#dress)"/>
  <path d="M752 630 L 736 664 M768 630 L 790 650" stroke="#2a1410" stroke-width="4" stroke-linecap="round"/>
</g>
<rect width="${W}" height="${H}" fill="url(#haze)"/>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
<rect width="${W}" height="${H}" filter="url(#grain)"/>`,
  );
}

// ---------------------------------------------------------------- 2. product podium

function podiumScene(bg: [string, string], glass: [string, string, string], label: string) {
  const W = 1200;
  const H = 1500;
  const sphere = (cx: number, cy: number, r: number) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#pearl)"/>`;
  return svgPage(
    W,
    H,
    `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[1]}"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
  <linearGradient id="cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9cfc4"/><stop offset=".45" stop-color="#fffaf6"/><stop offset="1" stop-color="#dcb8a8"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${glass[0]}"/><stop offset=".5" stop-color="${glass[1]}"/><stop offset="1" stop-color="${glass[2]}"/></linearGradient>
  <linearGradient id="cap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c1c1c"/><stop offset=".4" stop-color="#5a5a5a"/><stop offset="1" stop-color="#151515"/></linearGradient>
  <radialGradient id="pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f3e6ef"/><stop offset="1" stop-color="#cdb6c6"/></radialGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
  ${GRAIN_FILTER}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<path d="M290 1180 V560 A310 310 0 0 1 910 560 V1180Z" fill="#fff" opacity=".35"/>
<path d="M330 1180 V575 A270 270 0 0 1 870 575 V1180Z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>
<rect y="1180" width="${W}" height="${H - 1180}" fill="url(#floor)"/>
<ellipse cx="610" cy="1290" rx="330" ry="40" fill="#000" opacity=".22" filter="url(#blur)"/>
<rect x="340" y="1090" width="520" height="170" fill="url(#cyl)"/>
<ellipse cx="600" cy="1260" rx="260" ry="54" fill="url(#cyl)"/>
<ellipse cx="600" cy="1090" rx="260" ry="54" fill="#fff6f0"/>
<ellipse cx="610" cy="1090" rx="120" ry="20" fill="#000" opacity=".2" filter="url(#blur)"/>
<rect x="500" y="650" width="200" height="440" rx="44" fill="url(#glass)" opacity=".96"/>
<rect x="500" y="800" width="200" height="290" rx="44" fill="#000" opacity=".08"/>
<rect x="524" y="680" width="18" height="380" rx="9" fill="#fff" opacity=".5"/>
<rect x="662" y="700" width="8" height="330" rx="4" fill="#fff" opacity=".25"/>
<rect x="530" y="830" width="140" height="150" rx="10" fill="#fffaf5" opacity=".92"/>
<text x="600" y="902" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="40" letter-spacing="6" fill="#2b2b2b">${label}</text>
<text x="600" y="940" text-anchor="middle" font-family="Inter Tight, sans-serif" font-size="13" letter-spacing="4" fill="#6b6b6b">EAU DE PARFUM</text>
<rect x="562" y="600" width="76" height="56" fill="${glass[0]}"/>
<rect x="545" y="470" width="110" height="138" rx="18" fill="url(#cap)"/>
<rect x="560" y="486" width="10" height="108" rx="5" fill="#fff" opacity=".35"/>
${sphere(260, 980, 46)}${sphere(940, 760, 30)}${sphere(880, 1150, 22)}${sphere(310, 640, 18)}
<rect width="${W}" height="${H}" filter="url(#grain)"/>`,
    FONT_LINK,
  );
}

// ---------------------------------------------------------------- 3. sketch → watercolour

function cottage(mode: "sketch" | "paint") {
  const W = 1500;
  const H = 1000;
  const ink = mode === "sketch" ? "#3b3a36" : "#4a4033";
  const lineOpacity = mode === "sketch" ? 1 : 0.5;
  const fill = (color: string) =>
    mode === "paint" ? `fill="${color}" filter="url(#wc)"` : `fill="none"`;
  const lines = `stroke="${ink}" stroke-opacity="${lineOpacity}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"`;
  const hatch = Array.from({ length: 14 }, (_, i) => {
    const x = 640 + i * 28;
    return `<path d="M${x} ${470 - Math.min(i, 13 - i) * 4} l -30 70" ${lines} fill="none" stroke-width="1.6"/>`;
  }).join("");
  return svgPage(
    W,
    H,
    `<defs>
  <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>
  <filter id="wc" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="8" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="26" result="d"/>
    <feGaussianBlur in="d" stdDeviation="2.4" result="b"/>
    <feComposite in="b" in2="b" operator="arithmetic" k1="0" k2=".9" k3="0" k4="0"/>
  </filter>
  <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 .12 0"/></filter>
  <radialGradient id="sunwash"><stop offset="0" stop-color="#ffd36b" stop-opacity=".95"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="#f7f2e7"/>
<rect width="${W}" height="${H}" filter="url(#paper)"/>
${mode === "paint" ? `<rect x="40" y="40" width="${W - 80}" height="560" fill="#bcd9ef" opacity=".7" filter="url(#wc)"/><circle cx="1180" cy="210" r="150" fill="url(#sunwash)"/>` : ""}
<circle cx="1180" cy="210" r="70" ${fill("#ffcb57")} ${lines}/>
<path d="M60 700 C 320 560, 560 600, 760 650 S 1200 560, 1440 640 L1440 940 L60 940Z" ${fill("#9cc27a")} ${lines}/>
<path d="M60 800 C 380 700, 700 760, 900 790 S 1260 740, 1440 780 L1440 940 L60 940Z" ${fill("#6fa35a")} ${lines}/>
<rect x="600" y="520" width="420" height="250" ${fill("#f3e2c3")} ${lines}/>
<path d="M570 530 L810 380 L1050 530Z" ${fill("#d46a45")} ${lines}/>
${mode === "sketch" ? hatch : ""}
<rect x="930" y="400" width="44" height="90" ${fill("#a7553a")} ${lines}/>
<path d="M952 390 C 930 350, 990 330, 960 290 C 940 262, 990 240, 975 210" fill="none" ${lines} stroke-width="2"/>
<rect x="770" y="640" width="80" height="130" rx="4" ${fill("#7a5a43")} ${lines}/>
<rect x="650" y="580" width="80" height="70" ${fill("#9ec9e8")} ${lines}/>
<rect x="890" y="580" width="80" height="70" ${fill("#9ec9e8")} ${lines}/>
<path d="M690 580 V650 M650 615 H730 M930 580 V650 M890 615 H970" ${lines}/>
<path d="M810 770 C 790 840, 760 880, 720 940" fill="none" ${lines}/>
<path d="M850 770 C 860 840, 900 880, 960 940" fill="none" ${lines}/>
${mode === "paint" ? `<path d="M810 770 C 790 840, 760 880, 720 940 L960 940 C 900 880, 860 840, 850 770Z" fill="#e8d2a6" filter="url(#wc)"/>` : ""}
<rect x="330" y="560" width="30" height="230" ${fill("#7b5536")} ${lines}/>
<circle cx="345" cy="500" r="110" ${fill("#5f9a4b")} ${lines}/>
<circle cx="270" cy="560" r="80" ${fill("#79b25c")} ${lines}/>
<circle cx="420" cy="560" r="85" ${fill("#4f8a3f")} ${lines}/>
${[0, 1, 2, 3, 4, 5, 6, 7]
  .map(
    (i) => `<path d="M${1060 + i * 45} 790 V 730 M${1052 + i * 45} 745 l 8 -10 l 8 10" ${lines}/>`,
  )
  .join("")}
<path d="M1060 760 H 1385" ${lines}/>
<path d="M300 200 q 14 -14 28 0 q 14 -14 28 0 M400 250 q 12 -12 24 0 q 12 -12 24 0" fill="none" ${lines} stroke-width="2.2"/>`,
  );
}

// ---------------------------------------------------------------- 4. isometric room

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const OX = 600;
const OY = 400;
const iso = (x: number, y: number, z: number) =>
  `${(OX + (x - y) * C).toFixed(1)},${(OY + (x + y) * S - z).toFixed(1)}`;
const poly = (pts: [number, number, number][], fill: string, extra = "") =>
  `<polygon points="${pts.map(([x, y, z]) => iso(x, y, z)).join(" ")}" fill="${fill}" ${extra}/>`;

function shade(hex: string, amt: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, "0")).join("")}`;
}

/** Axis-aligned box: draws top, +y (left-front) and +x (right-front) faces. */
function box(x: number, y: number, z: number, w: number, d: number, h: number, color: string) {
  return [
    poly(
      [
        [x, y + d, z],
        [x + w, y + d, z],
        [x + w, y + d, z + h],
        [x, y + d, z + h],
      ],
      shade(color, -0.12),
    ),
    poly(
      [
        [x + w, y, z],
        [x + w, y + d, z],
        [x + w, y + d, z + h],
        [x + w, y, z + h],
      ],
      shade(color, -0.25),
    ),
    poly(
      [
        [x, y, z + h],
        [x + w, y, z + h],
        [x + w, y + d, z + h],
        [x, y + d, z + h],
      ],
      shade(color, 0.12),
    ),
  ].join("");
}

function isoRoom(night: boolean) {
  const W = 1200;
  const H = 1200;
  const L = 440;
  const T = 26;
  const wallL = night ? "#3d3f6b" : "#f4d9c6";
  const wallR = night ? "#4a4c7d" : "#fbe7d8";
  const floor = night ? "#6b5546" : "#d9a67c";
  const glow = night
    ? `<ellipse cx="${OX + 40}" cy="${OY + 250}" rx="320" ry="150" fill="#ffcf73" opacity=".18" filter="url(#b)"/>`
    : "";
  const books = ["#E5561F", "#2A80EB", "#7B4DF0", "#F2B81F", "#1C9660", "#DD4387"]
    .map((c, i) => box(10, 60 + i * 26, 190, 34, 20, 52 + (i % 3) * 10, c))
    .join("");
  return svgPage(
    W,
    H,
    `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${night ? "#1d1f3f" : "#f6efe7"}"/><stop offset="1" stop-color="${night ? "#2e2350" : "#e7dff3"}"/></linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? "#141a46" : "#8cc8ff"}"/><stop offset="1" stop-color="${night ? "#5b3d8a" : "#d8efff"}"/></linearGradient>
  <filter id="b"><feGaussianBlur stdDeviation="30"/></filter>
  ${GRAIN_FILTER}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<ellipse cx="${OX}" cy="${OY + L + 90}" rx="470" ry="80" fill="#000" opacity=".18" filter="url(#b)"/>
${poly(
  [
    [0, L, -T],
    [L, L, -T],
    [L, L, 0],
    [0, L, 0],
  ],
  shade(floor, -0.3),
)}
${poly(
  [
    [L, 0, -T],
    [L, L, -T],
    [L, L, 0],
    [L, 0, 0],
  ],
  shade(floor, -0.42),
)}
${poly(
  [
    [0, 0, 0],
    [L, 0, 0],
    [L, L, 0],
    [0, L, 0],
  ],
  floor,
)}
${Array.from({ length: 10 }, (_, i) => `<polyline points="${iso(0, (i + 1) * 44, 0)} ${iso(L, (i + 1) * 44, 0)}" stroke="#000" stroke-opacity=".08" stroke-width="2" fill="none"/>`).join("")}
${poly(
  [
    [0, 0, 0],
    [0, L, 0],
    [0, L, 320],
    [0, 0, 320],
  ],
  wallL,
)}
${poly(
  [
    [0, 0, 0],
    [L, 0, 0],
    [L, 0, 320],
    [0, 0, 320],
  ],
  wallR,
)}
${poly(
  [
    [-T, 0, 320],
    [-T, L, 320],
    [0, L, 320],
    [0, 0, 320],
  ],
  shade(wallL, 0.25),
)}
${poly(
  [
    [-T, L, 0],
    [-T, L, 320],
    [0, L, 320],
    [0, L, 0],
  ],
  shade(wallL, -0.2),
)}
${poly(
  [
    [0, -T, 320],
    [L, -T, 320],
    [L, 0, 320],
    [0, 0, 320],
  ],
  shade(wallR, 0.25),
)}
${poly(
  [
    [L, -T, 0],
    [L, -T, 320],
    [L, 0, 320],
    [L, 0, 0],
  ],
  shade(wallR, -0.3),
)}
${poly(
  [
    [-T, -T, 320],
    [0, -T, 320],
    [0, 0, 320],
    [-T, 0, 320],
  ],
  shade(wallR, 0.3),
)}
${poly(
  [
    [170, 0, 120],
    [330, 0, 120],
    [330, 0, 270],
    [170, 0, 270],
  ],
  "#fff",
)}
${poly(
  [
    [180, 0, 130],
    [320, 0, 130],
    [320, 0, 260],
    [180, 0, 260],
  ],
  "url(#sky)",
)}
${night ? `<circle cx="${OX + 230 * C - 0}" cy="${OY + 230 * S - 225}" r="14" fill="#fff6d6"/>` : `<circle cx="${OX + 280 * C}" cy="${OY + 280 * S - 230}" r="16" fill="#fff8d0"/>`}
<polyline points="${iso(250, 0, 130)} ${iso(250, 0, 260)}" stroke="#fff" stroke-width="5"/>
<polyline points="${iso(180, 0, 195)} ${iso(320, 0, 195)}" stroke="#fff" stroke-width="5"/>
${poly(
  [
    [0, 300, 150],
    [0, 400, 150],
    [0, 400, 260],
    [0, 300, 260],
  ],
  night ? "#E5561F" : "#2A80EB",
)}
${poly(
  [
    [0, 318, 172],
    [0, 382, 172],
    [0, 382, 238],
    [0, 318, 238],
  ],
  night ? "#ffd29a" : "#cfe4ff",
)}
${box(0, 40, 180, 50, 180, 10, "#a87452")}
${books}
${poly(
  [
    [120, 140, 0],
    [380, 140, 0],
    [380, 400, 0],
    [120, 400, 0],
  ],
  night ? "#7B4DF0" : "#E5561F",
  'opacity=".85"',
)}
${poly(
  [
    [150, 170, 0.5],
    [350, 170, 0.5],
    [350, 370, 0.5],
    [150, 370, 0.5],
  ],
  "#fff",
  'opacity=".25"',
)}
${box(240, 30, 0, 160, 80, 110, "#f7f2ea")}
${box(250, 40, 110, 10, 60, 2, "#ddd")}
${box(300, 45, 112, 70, 46, 4, "#2b2b2b")}
${poly(
  [
    [300, 45, 116],
    [370, 45, 116],
    [370, 45, 166],
    [300, 45, 166],
  ],
  "#1d1d1d",
)}
${poly(
  [
    [304, 46, 120],
    [366, 46, 120],
    [366, 46, 162],
    [304, 46, 162],
  ],
  night ? "#8db5ff" : "#c9e2ff",
)}
${box(150, 60, 0, 60, 60, 46, "#c46a3c")}
<ellipse cx="${OX + (180 - 90) * C}" cy="${OY + (180 + 90) * S - 110}" rx="62" ry="52" fill="#2f8a4b"/>
<ellipse cx="${OX + (160 - 80) * C}" cy="${OY + (160 + 80) * S - 140}" rx="40" ry="44" fill="#49a861"/>
<ellipse cx="${OX + (205 - 95) * C}" cy="${OY + (205 + 95) * S - 150}" rx="34" ry="40" fill="#3c9a55"/>
${box(395, 55, 110, 14, 14, 70, "#2b2b2b")}
<ellipse cx="${OX + (402 - 62) * C}" cy="${OY + (402 + 62) * S - 196}" rx="30" ry="16" fill="${night ? "#ffd36b" : "#F2B81F"}"/>
${night ? `<ellipse cx="${OX + (402 - 62) * C}" cy="${OY + (402 + 62) * S - 120}" rx="90" ry="70" fill="#ffd36b" opacity=".25" filter="url(#b)"/>` : ""}
${glow}
<rect width="${W}" height="${H}" filter="url(#grain)"/>`,
  );
}

// ---------------------------------------------------------------- 5. city day / night

function city(night: boolean) {
  const W = 1600;
  const H = 900;
  const r = rng(42);
  const horizon = 640;
  let x = -20;
  const buildings: { x: number; w: number; h: number; tone: number }[] = [];
  while (x < W + 20) {
    const w = 50 + Math.floor(r() * 80);
    const h = 120 + Math.floor(r() * 330) + (Math.abs(x - 900) < 260 ? 120 : 0);
    buildings.push({ x, w, h, tone: r() });
    x += w + 4 + Math.floor(r() * 10);
  }
  const lit = rng(7);
  const bld = buildings
    .map((b) => {
      const top = horizon - b.h;
      const base = night
        ? `hsl(232 30% ${10 + b.tone * 10}%)`
        : `hsl(210 ${18 + b.tone * 14}% ${62 + b.tone * 16}%)`;
      let windows = "";
      for (let wy = top + 16; wy < horizon - 16; wy += 22) {
        for (let wx = b.x + 8; wx < b.x + b.w - 12; wx += 16) {
          const on = lit() > (night ? 0.55 : 2);
          const fill = night ? (on ? "#ffd66b" : "#232848") : "#e8f3ff";
          windows += `<rect x="${wx}" y="${wy}" width="8" height="11" fill="${fill}" opacity="${night ? (on ? 0.95 : 0.6) : 0.55}"/>`;
        }
      }
      return `<rect x="${b.x}" y="${top}" width="${b.w}" height="${b.h}" fill="${base}"/>${windows}`;
    })
    .join("");
  const sr = rng(3);
  const stars = night
    ? Array.from(
        { length: 140 },
        () =>
          `<circle cx="${sr() * W}" cy="${sr() * 420}" r="${sr() * 1.6 + 0.3}" fill="#fff" opacity="${0.4 + sr() * 0.6}"/>`,
      ).join("")
    : "";
  const clouds = night
    ? ""
    : [
        [260, 150, 1],
        [760, 110, 0.8],
        [1280, 190, 1.2],
      ]
        .map(
          ([cx, cy, s]) =>
            `<g opacity=".9" filter="url(#cb)"><ellipse cx="${cx}" cy="${cy}" rx="${120 * s}" ry="${30 * s}" fill="#fff"/><ellipse cx="${cx + 40 * s}" cy="${cy - 18 * s}" rx="${70 * s}" ry="${34 * s}" fill="#fff"/></g>`,
        )
        .join("");
  return svgPage(
    W,
    H,
    `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${
    night
      ? `<stop offset="0" stop-color="#070b22"/><stop offset=".7" stop-color="#1f2a66"/><stop offset="1" stop-color="#4a3a7a"/>`
      : `<stop offset="0" stop-color="#5fa8ef"/><stop offset=".75" stop-color="#bfe0fb"/><stop offset="1" stop-color="#f3f8fd"/>`
  }</linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">${
    night
      ? `<stop offset="0" stop-color="#151c44"/><stop offset="1" stop-color="#05071a"/>`
      : `<stop offset="0" stop-color="#7fb2dd"/><stop offset="1" stop-color="#3d74a8"/>`
  }</linearGradient>
  <filter id="cb"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="ripple"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="${night ? 18 : 14}" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.2"/></filter>
  <clipPath id="below"><rect y="${horizon}" width="${W}" height="${H - horizon}"/></clipPath>
  ${GRAIN_FILTER}
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
${stars}
${night ? `<circle cx="1260" cy="150" r="44" fill="#fff8e1"/><circle cx="1260" cy="150" r="120" fill="#fff8e1" opacity=".08"/>` : `<circle cx="1300" cy="140" r="56" fill="#fffbe6"/><circle cx="1300" cy="140" r="160" fill="#fffbe6" opacity=".25"/>`}
${clouds}
<g ${night ? 'filter="url(#glow)"' : ""}>${bld}</g>
<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#water)"/>
<g clip-path="url(#below)" opacity="${night ? 0.65 : 0.45}" filter="url(#ripple)"><g transform="translate(0 ${horizon * 2}) scale(1 -1)">${bld}</g></g>
<rect y="${horizon - 2}" width="${W}" height="4" fill="${night ? "#2a2f5a" : "#a9c7e2"}"/>
<rect width="${W}" height="${H}" filter="url(#grain)"/>`,
  );
}

// ---------------------------------------------------------------- 6. swiss poster (HTML)

function swissPoster(accent: string, ink: string, paper: string, title: string[], year: string) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:1600px;background:${paper};font-family:'Inter Tight',sans-serif;color:${ink};position:relative;overflow:hidden}
  .grid{position:absolute;inset:60px;background-image:linear-gradient(to right, ${ink}14 1px, transparent 1px),linear-gradient(to bottom, ${ink}14 1px, transparent 1px);background-size:180px 180px}
  .circle{position:absolute;width:760px;height:760px;border-radius:50%;background:${accent};right:-140px;top:180px;mix-blend-mode:multiply}
  .bar{position:absolute;height:64px;background:${ink};transform-origin:left center}
  .title{position:absolute;left:60px;bottom:250px;font-weight:900;font-size:208px;line-height:.82;letter-spacing:-.06em;text-transform:uppercase}
  .meta{position:absolute;left:60px;right:60px;bottom:60px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;font-size:18px;line-height:1.35;font-weight:500}
  .meta b{display:block;font-weight:800;margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase;font-size:14px}
  .year{position:absolute;top:60px;left:60px;font-weight:800;font-size:28px;letter-spacing:.02em}
  .num{position:absolute;top:50px;right:60px;font-weight:900;font-size:120px;letter-spacing:-.05em;line-height:1}
  .noise{position:absolute;inset:0;opacity:.18;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
</style></head><body>
<div class="grid"></div>
<div class="circle"></div>
<div class="bar" style="width:820px;left:-40px;top:690px;transform:rotate(-24deg)"></div>
<div class="bar" style="width:520px;left:520px;top:640px;height:22px;background:${accent};transform:rotate(-24deg)"></div>
<p class="year">Internationale Plakat&shy;tage ${year}</p>
<p class="num">${year.slice(2)}</p>
<h1 class="title">${title.join("<br>")}</h1>
<div class="meta">
  <p><b>Ort</b>Kunsthalle Basel<br>Steinenberg 7</p>
  <p><b>Zeit</b>12.–28. März<br>Di–So 11–18 Uhr</p>
  <p><b>Eintritt</b>Frei für alle<br>unter 25 Jahren</p>
  <p><b>Programm</b>Vorträge, Workshops<br>und Führungen</p>
</div>
<div class="noise"></div>
</body></html>`;
}

// ---------------------------------------------------------------- write

async function main() {
  const dir = (slug: string) => promptDir("images", slug);
  console.log("Images:");
  await renderHtmlToImage(
    desertScene(DESERT.golden),
    path.join(dir("golden-hour-desert-portrait"), "golden.jpg"),
    1500,
    1000,
  );
  await renderHtmlToImage(
    desertScene(DESERT.blue),
    path.join(dir("golden-hour-desert-portrait"), "blue-hour.jpg"),
    1500,
    1000,
  );
  await renderHtmlToImage(
    desertScene(DESERT.noon),
    path.join(dir("golden-hour-desert-portrait"), "midday.jpg"),
    1500,
    1000,
  );

  await renderHtmlToImage(
    podiumScene(["#ead9ff", "#ffd8c6"], ["#ffb48c", "#ff8f66", "#ffd2bb"], "AURA"),
    path.join(dir("perfume-bottle-on-pastel-podium"), "peach.jpg"),
    1200,
    1500,
  );
  await renderHtmlToImage(
    podiumScene(["#d6f5ec", "#f6f1d8"], ["#8fd9c3", "#4fbf9f", "#c9f0e3"], "VERDE"),
    path.join(dir("perfume-bottle-on-pastel-podium"), "mint.jpg"),
    1200,
    1500,
  );

  await renderHtmlToImage(
    cottage("sketch"),
    path.join(dir("sketch-to-watercolor"), "sketch.jpg"),
    1500,
    1000,
  );
  await renderHtmlToImage(
    cottage("paint"),
    path.join(dir("sketch-to-watercolor"), "watercolor.jpg"),
    1500,
    1000,
  );

  await renderHtmlToImage(
    isoRoom(false),
    path.join(dir("isometric-cozy-room"), "day.jpg"),
    1200,
    1200,
  );
  await renderHtmlToImage(
    isoRoom(true),
    path.join(dir("isometric-cozy-room"), "night.jpg"),
    1200,
    1200,
  );

  await renderHtmlToImage(
    city(false),
    path.join(dir("day-to-night-city-edit"), "day.jpg"),
    1600,
    900,
  );
  await renderHtmlToImage(
    city(true),
    path.join(dir("day-to-night-city-edit"), "night.jpg"),
    1600,
    900,
  );

  await renderHtmlToImage(
    swissPoster("#e5482d", "#141414", "#f1ece4", ["Form", "folgt", "Funktion"], "2026"),
    path.join(dir("swiss-style-event-poster"), "red.jpg"),
    1200,
    1600,
  );
  await renderHtmlToImage(
    swissPoster("#2a80eb", "#141414", "#eef0ea", ["Raster", "und", "Rhythmus"], "2027"),
    path.join(dir("swiss-style-event-poster"), "blue.jpg"),
    1200,
    1600,
  );
  await closeBrowser();
}

void main();
