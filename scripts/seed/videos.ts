/**
 * Placeholder results for the Video and Motion graphics shelves: seamless canvas
 * loops rendered frame-by-frame and encoded to H.264 MP4 (+ poster JPEG).
 * Run: npx tsx scripts/seed/videos.ts [name ...]
 */
import path from "node:path";
import { FONT_LINK, closeBrowser, promptDir, renderCanvasVideo } from "./lib";

/** Wrap a scene body: `p` is loop progress 0..1, `t` seconds. Helpers are in scope. */
function canvasPage(w: number, h: number, seconds: number, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}
<style>html,body{margin:0;background:#000}canvas{display:block}</style></head><body>
<canvas width="${w}" height="${h}"></canvas>
<script>
const c = document.querySelector('canvas'); const x = c.getContext('2d');
const W = ${w}, H = ${h}, D = ${seconds}, TAU = Math.PI * 2;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
const easeInOut = (k) => { k = clamp(k); return k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2; };
const seg = (p, a, b) => clamp((p - a) / (b - a));
function rand(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function vgrad(stops, y0 = 0, y1 = H) { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function grain(amount = 18) { const id = x.getImageData(0, 0, W, H), d = id.data; const r = rand(Math.floor(performance.now())); for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * amount; d[i] += n; d[i+1] += n; d[i+2] += n; } x.putImageData(id, 0, 0); }
window.draw = (t) => { const p = (t % D) / D; x.save(); x.clearRect(0, 0, W, H); ${body}; x.restore(); };
</script></body></html>`;
}

// ---------------------------------------------------------------- VIDEO (16:9)

const droneOverDunes = canvasPage(
  960,
  540,
  5,
  `
  x.fillStyle = vgrad([[0,'#2d1b4e'],[.45,'#c2563f'],[.75,'#f6a35c'],[1,'#ffe0a8']], 0, 330); x.fillRect(0,0,W,H);
  const sy = 250 - 10 * Math.sin(p * TAU);
  const glow = x.createRadialGradient(640, sy, 0, 640, sy, 260); glow.addColorStop(0,'rgba(255,244,214,.95)'); glow.addColorStop(.25,'rgba(255,214,150,.5)'); glow.addColorStop(1,'rgba(255,200,120,0)');
  x.fillStyle = glow; x.fillRect(0,0,W,H); x.fillStyle = '#fff4d8'; x.beginPath(); x.arc(640, sy, 34, 0, TAU); x.fill();
  const layers = [
    { y: 330, a: [16, 8], f: [2, 5], speed: 1, c: ['#e58a5a','#b65a35'] },
    { y: 380, a: [26, 10], f: [1, 4], speed: 2, c: ['#f0a066','#a9492a'] },
    { y: 450, a: [34, 14], f: [2, 3], speed: 3, c: ['#dd7a45','#7f3317'] },
  ];
  for (const L of layers) {
    const off = p * L.speed;
    x.beginPath(); x.moveTo(0, H);
    for (let i = 0; i <= W; i += 4) {
      const u = i / W + off;
      const y = L.y - L.a[0] * Math.sin(TAU * L.f[0] * u) - L.a[1] * Math.sin(TAU * L.f[1] * u + 1.3);
      x.lineTo(i, y);
    }
    x.lineTo(W, H); x.closePath(); x.fillStyle = vgrad([[0, L.c[0]], [1, L.c[1]]], L.y - 40, H); x.fill();
    x.strokeStyle = 'rgba(255,236,200,.35)'; x.lineWidth = 1.5; x.stroke();
  }
  const haze = x.createLinearGradient(0, 260, 0, 420); haze.addColorStop(0,'rgba(255,220,170,0)'); haze.addColorStop(.5,'rgba(255,220,170,.35)'); haze.addColorStop(1,'rgba(255,220,170,0)');
  x.fillStyle = haze; x.fillRect(0,0,W,H);
  grain(14);
`,
);

const oceanSunset = canvasPage(
  960,
  540,
  4,
  `
  const hz = 300;
  x.fillStyle = vgrad([[0,'#1b2350'],[.55,'#c0506a'],[.85,'#ffa36c'],[1,'#ffd49a']], 0, hz); x.fillRect(0,0,W,hz);
  const g = x.createRadialGradient(480, hz, 0, 480, hz, 300); g.addColorStop(0,'rgba(255,236,190,.9)'); g.addColorStop(1,'rgba(255,190,140,0)'); x.fillStyle = g; x.fillRect(0,0,W,hz);
  x.fillStyle = '#fff0c9'; x.beginPath(); x.arc(480, hz + 8, 46, Math.PI, 0); x.fill();
  x.fillStyle = vgrad([[0,'#6b3a5e'],[.4,'#2c2454'],[1,'#0c1030']], hz, H); x.fillRect(0, hz, W, H - hz);
  for (let row = 0; row < 26; row++) {
    const k = row / 25; const y = hz + 4 + Math.pow(k, 1.7) * (H - hz);
    const amp = 1 + k * 6; const len = 30 + k * 120;
    x.strokeStyle = 'rgba(255,205,170,' + (0.12 + (1-k) * .18) + ')'; x.lineWidth = 1 + k * 2;
    x.beginPath();
    for (let i = -20; i <= W + 20; i += 6) {
      const yy = y + amp * Math.sin(i / len * TAU + p * TAU * (1 + (row % 3)) + row);
      i === -20 ? x.moveTo(i, yy) : x.lineTo(i, yy);
    }
    x.stroke();
  }
  const r = rand(5);
  for (let i = 0; i < 70; i++) {
    const k = r(); const y = hz + 6 + Math.pow(k, 1.4) * (H - hz - 10);
    const spread = 30 + k * 160; const xx = 480 + (r() - .5) * spread * 2;
    const a = Math.max(0, Math.sin(p * TAU * 2 + i * 1.7)) * (1 - k * .6);
    x.fillStyle = 'rgba(255,230,180,' + a + ')'; x.fillRect(xx, y, 10 + k * 40, 2 + k * 2);
  }
  grain(12);
`,
);

const neonCityRain = canvasPage(
  960,
  540,
  4,
  `
  const s = 1 + 0.025 * (1 - Math.cos(p * TAU));
  x.translate(W/2, H/2); x.scale(s, s); x.translate(-W/2, -H/2);
  x.fillStyle = vgrad([[0,'#05060f'],[1,'#141432']]); x.fillRect(0,0,W,H);
  const r = rand(11);
  for (let i = 0; i < 14; i++) { const bw = 60 + r() * 90, bx = i * 72 - 20, bh = 180 + r() * 220; x.fillStyle = 'rgb(' + (12 + i % 3 * 4) + ',' + (13 + i % 2 * 4) + ',32)'; x.fillRect(bx, 380 - bh, bw, bh);
    for (let wy = 380 - bh + 14; wy < 370; wy += 18) for (let wx = bx + 8; wx < bx + bw - 10; wx += 14) if (r() > .78) { x.fillStyle = 'rgba(255,200,120,.35)'; x.fillRect(wx, wy, 6, 8); } }
  const signs = [
    { x: 130, y: 150, w: 170, h: 54, c: '#ff3d81', txt: 'NOODLES', f: 3 },
    { x: 560, y: 120, w: 210, h: 60, c: '#35e0ff', txt: 'OPEN 24H', f: 5 },
    { x: 360, y: 230, w: 120, h: 44, c: '#ffd23d', txt: 'BAR', f: 7 },
    { x: 770, y: 250, w: 150, h: 46, c: '#8b5cff', txt: 'ARCADE', f: 2 },
  ];
  function drawSigns(mirror) {
    for (const sg of signs) {
      const flick = Math.sin(p * TAU * sg.f) > -0.92 ? 1 : 0.25;
      x.save(); x.globalAlpha = flick * (mirror ? .35 : 1);
      x.shadowColor = sg.c; x.shadowBlur = 24; x.strokeStyle = sg.c; x.lineWidth = 4;
      const y = mirror ? 2 * 400 - sg.y - sg.h : sg.y;
      x.beginPath(); x.roundRect(sg.x, y, sg.w, sg.h, 12); x.stroke();
      x.fillStyle = sg.c; x.font = '700 24px "Inter Tight"'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.save(); if (mirror) { x.translate(0, 2 * (y + sg.h/2)); x.scale(1, -1); } x.fillText(sg.txt, sg.x + sg.w/2, y + sg.h/2 + 1); x.restore();
      x.restore();
    }
  }
  drawSigns(false);
  x.fillStyle = vgrad([[0,'#0b0b1e'],[1,'#020208']], 380, H); x.fillRect(0, 380, W, H - 380);
  x.save(); x.beginPath(); x.rect(0, 400, W, H); x.clip(); x.filter = 'blur(3px)'; drawSigns(true); x.restore();
  x.fillStyle = 'rgba(80,90,140,.25)'; x.fillRect(0, 380, W, 3);
  const rr = rand(2); x.strokeStyle = 'rgba(180,200,255,.35)'; x.lineWidth = 1.2;
  for (let i = 0; i < 260; i++) { const rx = rr() * W, sp = 1 + rr() * 2, len = 10 + rr() * 18; const ry = ((rr() + p * sp) % 1) * (H + 40) - 20; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx - 3, ry + len); x.stroke(); }
  grain(10);
`,
);

const productTurntable = canvasPage(
  960,
  540,
  4,
  `
  x.fillStyle = vgrad([[0,'#ffe9d6'],[1,'#f7c9a8']]); x.fillRect(0,0,W,H);
  const sp = x.createRadialGradient(480, 220, 20, 480, 260, 420); sp.addColorStop(0,'rgba(255,255,255,.75)'); sp.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle = sp; x.fillRect(0,0,W,H);
  x.fillStyle = 'rgba(160,90,60,.25)'; x.beginPath(); x.ellipse(480, 452, 210, 34, 0, 0, TAU); x.fill();
  x.fillStyle = '#fff6ee'; x.beginPath(); x.ellipse(480, 440, 200, 30, 0, 0, TAU); x.fill();
  x.fillStyle = '#e9c3a8'; x.fillRect(280, 440, 400, 14); x.beginPath(); x.ellipse(480, 454, 200, 30, 0, 0, Math.PI); x.fill();
  const cx = 480, top = 120, bottom = 420, R = 92;
  x.fillStyle = 'rgba(90,40,20,.28)'; x.filter = 'blur(10px)'; x.beginPath(); x.ellipse(cx + 10, bottom + 8, R + 10, 16, 0, 0, TAU); x.fill(); x.filter = 'none';
  const N = 260;
  for (let i = 0; i < N; i++) {
    const u = i / N; const th = TAU * (u + p);
    const cos = Math.cos(th); if (cos <= 0) continue;
    const sx = cx + R * Math.sin(th); const w = (TAU * R / N) * cos + 1.2;
    let col = '#ff6b35';
    const v = (u * 4) % 1;
    if (v > .1 && v < .18) col = '#fff3e6';
    if (u > .1 && u < .32) col = (Math.floor(u * 60) % 2) ? '#1d1d1f' : '#ff6b35';
    if (u > .55 && u < .6) col = '#ffd23d';
    x.fillStyle = col; x.fillRect(sx - w/2, top + 18, w, bottom - top - 36);
  }
  const sh = x.createLinearGradient(cx - R, 0, cx + R, 0);
  sh.addColorStop(0,'rgba(0,0,0,.45)'); sh.addColorStop(.28,'rgba(0,0,0,0)'); sh.addColorStop(.38,'rgba(255,255,255,.55)'); sh.addColorStop(.46,'rgba(255,255,255,0)'); sh.addColorStop(.85,'rgba(0,0,0,.15)'); sh.addColorStop(1,'rgba(0,0,0,.5)');
  x.fillStyle = sh; x.fillRect(cx - R, top + 18, R * 2, bottom - top - 36);
  const metal = x.createLinearGradient(cx - R, 0, cx + R, 0); metal.addColorStop(0,'#8d8d92'); metal.addColorStop(.4,'#f4f4f6'); metal.addColorStop(1,'#77777c');
  x.fillStyle = metal; x.fillRect(cx - R, top, R * 2, 20); x.fillRect(cx - R + 4, bottom - 20, R * 2 - 8, 20);
  x.beginPath(); x.ellipse(cx, top, R, 16, 0, 0, TAU); x.fillStyle = '#d9d9de'; x.fill(); x.strokeStyle = '#a7a7ad'; x.lineWidth = 2; x.stroke();
  x.beginPath(); x.ellipse(cx, top, R * .7, 10, 0, 0, TAU); x.strokeStyle = '#b9b9be'; x.stroke();
  x.beginPath(); x.ellipse(cx, bottom, R - 4, 14, 0, 0, Math.PI); x.fillStyle = '#7d7d82'; x.fill();
  grain(8);
`,
);

const cloudsTimelapse = canvasPage(
  960,
  540,
  5,
  `
  const k = .5 - .5 * Math.cos(p * TAU);
  x.fillStyle = vgrad([[0, k > .5 ? '#2f4f8f' : '#3a6fb8'],[.6,'#9fc6ea'],[1,'#f5e3cf']]); x.fillRect(0,0,W,H);
  const r = rand(21);
  const ridges = [
    { base: 330, amp: 90, col: '#8fa3c4', seed: 1 },
    { base: 380, amp: 110, col: '#5f7499', seed: 2 },
    { base: 440, amp: 120, col: '#3b4b6b', seed: 3 },
  ];
  const clouds = (layer) => { const cr = rand(40 + layer); for (let i = 0; i < 7; i++) { const sp = .6 + cr() * .8; const cx0 = cr() * (W + 400); const cx1 = ((cx0 + p * (W + 400) * (layer + 1) * sp) % (W + 400)) - 200; const cy = 90 + cr() * 160 + layer * 30; const s = 60 + cr() * 80; x.save(); x.globalAlpha = .75 - layer * .15; x.filter = 'blur(' + (14 - layer * 4) + 'px)'; x.fillStyle = '#fff'; for (let j = 0; j < 5; j++) { x.beginPath(); x.ellipse(cx1 + (j - 2) * s * .5, cy + Math.sin(j) * 10, s * .55, s * .32, 0, 0, TAU); x.fill(); } x.restore(); } };
  clouds(0);
  for (const R of ridges) {
    const rr = rand(R.seed); const pts = []; for (let i = 0; i <= 24; i++) pts.push(R.base - rr() * R.amp);
    x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= 24; i++) x.lineTo(i * W / 24, pts[i]); x.lineTo(W, H); x.closePath();
    x.fillStyle = R.col; x.fill();
    x.save(); x.clip(); x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); for (let i = 0; i <= 24; i++) { if (pts[i] < R.base - R.amp * .7) { x.moveTo(i * W / 24 - 12, pts[i] + 18); x.lineTo(i * W / 24, pts[i]); x.lineTo(i * W / 24 + 12, pts[i] + 18); } } x.fill(); x.restore();
  }
  clouds(1);
  const sh = x.createLinearGradient(0,0,W,0); const cs = (p * 1.4) % 1.4 - .2; sh.addColorStop(clamp(cs - .2),'rgba(0,0,20,0)'); sh.addColorStop(clamp(cs),'rgba(0,0,20,.18)'); sh.addColorStop(clamp(cs + .2),'rgba(0,0,20,0)'); x.fillStyle = sh; x.fillRect(0, 300, W, H);
  void r; grain(10);
`,
);

const forestRays = canvasPage(
  960,
  540,
  5,
  `
  const s = 1 + 0.04 * (.5 - .5 * Math.cos(p * TAU));
  x.translate(W/2, H/2); x.scale(s, s); x.translate(-W/2, -H/2);
  x.fillStyle = vgrad([[0,'#cfe6c2'],[.5,'#5d8a5a'],[1,'#1c2e1d']]); x.fillRect(0,0,W,H);
  const layers = [{ n: 16, w: [10, 22], col: 'rgba(70,100,70,.55)', seed: 3 }, { n: 10, w: [22, 40], col: 'rgba(40,62,40,.8)', seed: 4 }, { n: 6, w: [44, 80], col: '#152015', seed: 5 }];
  layers.forEach((L, li) => { const r = rand(L.seed); for (let i = 0; i < L.n; i++) { const tw = L.w[0] + r() * (L.w[1] - L.w[0]); const tx = r() * W; x.fillStyle = L.col; x.beginPath(); x.moveTo(tx - tw/2, -10); x.lineTo(tx + tw/2, -10); x.lineTo(tx + tw * .65, H + 10); x.lineTo(tx - tw * .65, H + 10); x.fill(); }
    x.fillStyle = 'rgba(210,235,200,' + (.12 - li * .03) + ')'; x.fillRect(0, 0, W, H); });
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const a = .08 + .06 * Math.sin(p * TAU + i * 1.3); const x0 = 520 + i * 70; const g = x.createLinearGradient(x0, 0, x0 - 260, H); g.addColorStop(0,'rgba(255,250,210,' + a * 2 + ')'); g.addColorStop(1,'rgba(255,250,210,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(x0, -20); x.lineTo(x0 + 40, -20); x.lineTo(x0 - 200, H + 20); x.lineTo(x0 - 330, H + 20); x.fill(); }
  const r = rand(9); for (let i = 0; i < 90; i++) { const px = (r() * W + Math.sin(p * TAU + i) * 20); const py = ((r() - p * (.2 + r() * .2) + 1) % 1) * H; const al = .3 + .5 * Math.abs(Math.sin(p * TAU * 2 + i)); x.fillStyle = 'rgba(255,248,215,' + al + ')'; x.beginPath(); x.arc(px, py, .8 + r() * 1.8, 0, TAU); x.fill(); }
  x.restore();
  x.fillStyle = vgrad([[0,'rgba(0,0,0,0)'],[1,'rgba(10,20,10,.6)']], 380, H); x.fillRect(0, 380, W, H);
  grain(12);
`,
);

// ---------------------------------------------------------------- MOTION (1:1)

const logoReveal = canvasPage(
  720,
  720,
  4,
  `
  x.fillStyle = vgrad([[0,'#2a1a5e'],[1,'#120b2e']]); x.fillRect(0,0,W,H);
  const fadeOut = 1 - seg(p, .88, 1);
  x.globalAlpha = fadeOut;
  const cx = 360, cy = 320;
  const k1 = easeOut(seg(p, 0, .3)), k2 = easeOut(seg(p, .08, .38)), k3 = easeOut(seg(p, .16, .46));
  const snap = easeInOut(seg(p, .46, .58));
  x.save(); x.translate(lerp(-120, cx - 54, k1) + snap * 10, lerp(cy - 160, cy, k1)); x.rotate((1 - k1) * -2);
  x.fillStyle = '#ff6b9a'; x.beginPath(); x.arc(0, 0, 46, 0, TAU); x.fill(); x.restore();
  x.save(); x.translate(lerp(W + 120, cx + 54, k2) - snap * 10, lerp(cy + 180, cy, k2)); x.rotate((1 - k2) * 3);
  x.fillStyle = '#ffd23d'; x.beginPath(); x.roundRect(-44, -44, 88, 88, 18); x.fill(); x.restore();
  x.save(); x.translate(cx, lerp(-120, cy - 64, k3) + snap * 20); x.rotate((1 - k3) * 4);
  x.fillStyle = '#5ee0c8'; x.globalCompositeOperation = 'screen'; x.beginPath(); x.moveTo(0, -46); x.lineTo(46, 34); x.lineTo(-46, 34); x.closePath(); x.fill(); x.restore();
  const w = easeOut(seg(p, .56, .72));
  x.save(); x.beginPath(); x.rect(cx - 170, 430, 340 * w, 110); x.clip();
  x.fillStyle = '#fff'; x.font = '800 92px "Inter Tight"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('nova', cx, 482); x.restore();
  const t2 = easeOut(seg(p, .66, .8)); x.globalAlpha = t2 * fadeOut; x.fillStyle = 'rgba(255,255,255,.6)'; x.font = '500 20px "Inter Tight"'; x.textAlign = 'center'; x.fillText('S T U D I O', cx, 560);
  if (snap > 0 && snap < 1) { x.globalAlpha = (1 - snap) * .6; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy - 10, 60 + snap * 120, 0, TAU); x.stroke(); }
  x.globalAlpha = 1; grain(10);
`,
);

const kineticType = canvasPage(
  720,
  720,
  4.5,
  `
  const words = [['MAKE', '#E5561F', '#141414'], ['IT', '#141414', '#F2B81F'], ['MOVE', '#2A80EB', '#ffffff']];
  const n = words.length; const fp = p * n; const i = Math.floor(fp) % n; const k = fp - Math.floor(fp);
  const [word, bg, fg] = words[i]; const [, prevBg] = words[(i + n - 1) % n];
  x.fillStyle = prevBg; x.fillRect(0, 0, W, H);
  const wipe = easeInOut(seg(k, 0, .35)); x.fillStyle = bg; x.beginPath(); x.arc(W/2, H/2, wipe * W * .8, 0, TAU); x.fill();
  const inK = easeOut(seg(k, .15, .55)); const outK = easeInOut(seg(k, .82, 1));
  x.save(); x.translate(W/2, H/2); const sc = lerp(2.6, 1, inK) * (1 - outK * .3); x.scale(sc, sc); x.rotate(lerp(-.25, 0, inK));
  x.globalAlpha = clamp(inK * 1.4) * (1 - outK); x.fillStyle = fg; x.font = '900 ' + (word.length > 2 ? 190 : 300) + 'px "Inter Tight"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(word, 0, 10); x.restore();
  x.globalAlpha = .8; x.strokeStyle = fg; x.lineWidth = 3; const st = easeOut(seg(k, .3, .7));
  for (let s = 0; s < 6; s++) { x.beginPath(); const yy = 120 + s * 96; x.moveTo(40, yy); x.lineTo(40 + st * (120 + s * 30) * (s % 2 ? 1 : .6), yy); x.stroke(); }
  x.globalAlpha = 1; x.fillStyle = fg; x.font = '600 18px "JetBrains Mono"'; x.textAlign = 'left'; x.fillText('0' + (i + 1) + ' / 03', 40, H - 40);
`,
);

const liquidGradient = canvasPage(
  720,
  720,
  6,
  `
  x.fillStyle = '#0f0a24'; x.fillRect(0,0,W,H);
  const blobs = [['#ff5f8f', 1, 2, 0], ['#7b4df0', 2, 1, 1], ['#2ad4ff', 1, 3, 2], ['#ffb547', 3, 2, 3], ['#4dffb0', 2, 3, 4]];
  x.filter = 'blur(70px)'; x.globalCompositeOperation = 'lighter';
  for (const [col, a, b, ph] of blobs) { const bx = W/2 + Math.sin(TAU * a * p + ph) * 220; const by = H/2 + Math.cos(TAU * b * p + ph * 1.3) * 220; x.fillStyle = col; x.globalAlpha = .7; x.beginPath(); x.arc(bx, by, 200, 0, TAU); x.fill(); }
  x.filter = 'none'; x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  grain(10);
`,
);

const loaders = canvasPage(
  720,
  720,
  3,
  `
  x.fillStyle = '#f4f2ee'; x.fillRect(0,0,W,H);
  const cells = [[180,180],[540,180],[180,540],[540,540]];
  x.fillStyle = '#fff'; for (const [cx, cy] of cells) { x.beginPath(); x.roundRect(cx - 150, cy - 150, 300, 300, 36); x.fill(); }
  { const [cx, cy] = cells[0]; x.lineCap = 'round'; x.lineWidth = 14; x.strokeStyle = '#eae7e1'; x.beginPath(); x.arc(cx, cy, 60, 0, TAU); x.stroke(); const a = p * TAU * 2; const len = 1 + Math.sin(p * TAU * 2) * .7; x.strokeStyle = '#E5561F'; x.beginPath(); x.arc(cx, cy, 60, a, a + len * 1.8); x.stroke(); }
  { const [cx, cy] = cells[1]; for (let i = 0; i < 3; i++) { const y = cy - Math.abs(Math.sin(p * TAU * 2 - i * .6)) * 50; x.fillStyle = ['#2A80EB','#7B4DF0','#DD4387'][i]; x.beginPath(); x.arc(cx - 60 + i * 60, y + 25, 20, 0, TAU); x.fill(); } }
  { const [cx, cy] = cells[2]; for (let i = 0; i < 3; i++) { const k = (p * 2 + i / 3) % 1; x.strokeStyle = 'rgba(28,150,96,' + (1 - k) + ')'; x.lineWidth = 6; x.beginPath(); x.arc(cx, cy, 10 + k * 90, 0, TAU); x.stroke(); } x.fillStyle = '#1C9660'; x.beginPath(); x.arc(cx, cy, 16, 0, TAU); x.fill(); }
  { const [cx, cy] = cells[3]; for (let i = 0; i < 5; i++) { const h = 30 + (Math.sin(p * TAU * 2 + i * .9) * .5 + .5) * 110; x.fillStyle = '#F2B81F'; x.beginPath(); x.roundRect(cx - 100 + i * 42, cy + 70 - h, 26, h, 13); x.fill(); } }
`,
);

const orbitParticles = canvasPage(
  720,
  720,
  5,
  `
  x.fillStyle = vgrad([[0,'#04121c'],[1,'#0b2a3a']]); x.fillRect(0,0,W,H);
  const cx = 360, cy = 360;
  const core = x.createRadialGradient(cx, cy, 0, cx, cy, 140); core.addColorStop(0,'rgba(120,255,230,.95)'); core.addColorStop(.25,'rgba(40,200,200,.45)'); core.addColorStop(1,'rgba(20,120,160,0)');
  x.fillStyle = core; x.beginPath(); x.arc(cx, cy, 140, 0, TAU); x.fill();
  x.fillStyle = '#eafffb'; x.beginPath(); x.arc(cx, cy, 26 + Math.sin(p * TAU * 2) * 3, 0, TAU); x.fill();
  const orbits = [[250, 90, -.45, '#5ee0c8', 1], [210, 70, .6, '#ffd23d', 2], [290, 120, 1.4, '#ff6b9a', 1]];
  for (const [rx, ry, rot, col, sp] of orbits) {
    x.save(); x.translate(cx, cy); x.rotate(rot);
    x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.stroke();
    for (let j = 0; j < 4; j++) for (let tr = 0; tr < 14; tr++) { const a = TAU * (p * sp + j / 4) - tr * .035; x.globalAlpha = 1 - tr / 14; x.fillStyle = col; x.beginPath(); x.arc(Math.cos(a) * rx, Math.sin(a) * ry, 7 - tr * .4, 0, TAU); x.fill(); }
    x.restore(); x.globalAlpha = 1;
  }
  const r = rand(3); for (let i = 0; i < 80; i++) { x.fillStyle = 'rgba(200,255,250,' + (.2 + .3 * Math.abs(Math.sin(p * TAU + i))) + ')'; x.fillRect(r() * W, r() * H, 1.5, 1.5); }
`,
);

const odometer = canvasPage(
  720,
  720,
  5,
  `
  x.fillStyle = '#141414'; x.fillRect(0,0,W,H);
  const target = [2, 0, 2, 6]; const fade = 1 - seg(p, .9, 1); const intro = easeOut(seg(p, 0, .1));
  x.globalAlpha = Math.min(fade, intro);
  x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '500 22px "Inter Tight"'; x.textAlign = 'center'; x.fillText('PROMPTS COPIED', 360, 210);
  const cw = 130, chh = 190, x0 = 360 - cw * 2;
  for (let i = 0; i < 4; i++) {
    const settle = easeOut(seg(p, .12 + i * .1, .5 + i * .1));
    const spins = 3 + i; const v = settle * (spins * 10 + target[i]);
    const bx = x0 + i * cw;
    x.fillStyle = '#232323'; x.beginPath(); x.roundRect(bx + 8, 250, cw - 16, chh, 18); x.fill();
    x.save(); x.beginPath(); x.rect(bx + 8, 250, cw - 16, chh); x.clip();
    x.fillStyle = i === 3 ? '#F2B81F' : '#fff'; x.font = '700 150px "Roboto Mono", "JetBrains Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const base = Math.floor(v), frac = v - base;
    for (let k = -1; k <= 1; k++) { const d = ((base + k) % 10 + 10) % 10; x.fillText(String(d), bx + cw/2, 250 + chh/2 + (k - frac) * chh + 8); }
    x.restore();
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(bx + 8, 250 + chh/2 - 1, cw - 16, 2);
  }
  const bar = easeOut(seg(p, .55, .85)); x.fillStyle = '#2a2a2a'; x.beginPath(); x.roundRect(160, 520, 400, 10, 5); x.fill(); x.fillStyle = '#F2B81F'; x.beginPath(); x.roundRect(160, 520, 400 * bar, 10, 5); x.fill();
  x.fillStyle = 'rgba(255,255,255,.45)'; x.font = '500 18px "JetBrains Mono"'; x.fillText('+' + Math.round(bar * 128) + '% this month', 360, 575);
  x.globalAlpha = 1;
`,
);

const JOBS: Record<string, () => Promise<void>> = {
  drone: () =>
    renderCanvasVideo(
      droneOverDunes,
      path.join(promptDir("video", "drone-over-desert-dunes"), "clip.mp4"),
      { width: 960, height: 540, seconds: 5 },
    ),
  ocean: () =>
    renderCanvasVideo(
      oceanSunset,
      path.join(promptDir("video", "ocean-sunset-dolly"), "clip.mp4"),
      { width: 960, height: 540, seconds: 4 },
    ),
  neon: () =>
    renderCanvasVideo(
      neonCityRain,
      path.join(promptDir("video", "neon-city-in-the-rain"), "clip.mp4"),
      { width: 960, height: 540, seconds: 4 },
    ),
  turntable: () =>
    renderCanvasVideo(
      productTurntable,
      path.join(promptDir("video", "product-turntable-spin"), "clip.mp4"),
      { width: 960, height: 540, seconds: 4 },
    ),
  clouds: () =>
    renderCanvasVideo(
      cloudsTimelapse,
      path.join(promptDir("video", "mountain-cloud-timelapse"), "clip.mp4"),
      { width: 960, height: 540, seconds: 5 },
    ),
  forest: () =>
    renderCanvasVideo(
      forestRays,
      path.join(promptDir("video", "forest-light-rays-push-in"), "clip.mp4"),
      { width: 960, height: 540, seconds: 5 },
    ),
  logo: () =>
    renderCanvasVideo(
      logoReveal,
      path.join(promptDir("motion", "geometric-logo-reveal"), "loop.mp4"),
      { width: 720, height: 720, seconds: 4, posterAt: 0.8 },
    ),
  kinetic: () =>
    renderCanvasVideo(
      kineticType,
      path.join(promptDir("motion", "kinetic-typography-loop"), "loop.mp4"),
      { width: 720, height: 720, seconds: 4.5, posterAt: 0.22 },
    ),
  liquid: () =>
    renderCanvasVideo(
      liquidGradient,
      path.join(promptDir("motion", "liquid-gradient-background"), "loop.mp4"),
      { width: 720, height: 720, seconds: 6 },
    ),
  loaders: () =>
    renderCanvasVideo(
      loaders,
      path.join(promptDir("motion", "loading-animation-set"), "loop.mp4"),
      { width: 720, height: 720, seconds: 3 },
    ),
  orbit: () =>
    renderCanvasVideo(
      orbitParticles,
      path.join(promptDir("motion", "orbiting-particles-loop"), "loop.mp4"),
      { width: 720, height: 720, seconds: 5 },
    ),
  odometer: () =>
    renderCanvasVideo(
      odometer,
      path.join(promptDir("motion", "odometer-number-counter"), "loop.mp4"),
      { width: 720, height: 720, seconds: 5, posterAt: 0.86 },
    ),
};

async function main() {
  const only = process.argv.slice(2);
  console.log("Videos:");
  for (const [name, job] of Object.entries(JOBS)) {
    if (only.length && !only.includes(name)) continue;
    await job();
  }
  await closeBrowser();
}

void main();
