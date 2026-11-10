(() => {
  /* ================= SCENA PIXEL ART (320x180) ================= */
  const W = 320, H = 180, HOR = 100;
  const cv = document.getElementById("scene");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = rng(1717);
  const mk = (w, h) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"); x.imageSmoothingEnabled = false; return [c, x];
  };
  const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => {
    const A = hex(a), B = hex(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
  };
  const BAYER = [0.125, 0.625, 0.875, 0.375];
  const th = (x, y) => BAYER[(x & 1) + ((y & 1) << 1)];

  const [bg, b] = mk(W, H);

  /* ---- cielo ---- */
  const SKY = ["#070b22", "#0c1233", "#121a45", "#1b2358", "#2a2b68", "#3d3475", "#573d7e", "#74477f", "#97537e", "#bd6a78", "#e08a6e", "#f2ad73"];
  function skyAt(x, y) {
    const t = Math.min(1, y / HOR), f = t * (SKY.length - 1), i = Math.floor(f);
    if (i >= SKY.length - 1) return SKY[SKY.length - 1];
    return f - i > th(x, y) ? SKY[i + 1] : SKY[i];
  }
  for (let y = 0; y < HOR; y++) for (let x = 0; x < W; x++) R(b, skyAt(x, y), x, y, 1, 1);

  /* ---- luna ---- */
  const MX = 236, MY = 34;
  for (let y = MY - 34; y <= MY + 34; y++) for (let x = MX - 34; x <= MX + 34; x++) {
    const d = Math.hypot(x - MX, y - MY);
    if (d <= 13) {
      let col = d > 11.5 ? "#e6dfbf" : "#f6f1d4";
      if ((x - MX + 4) ** 2 + (y - MY - 3) ** 2 < 9) col = "#d9d2ae";
      else if ((x - MX - 5) ** 2 + (y - MY + 4) ** 2 < 5) col = "#e3dcb8";
      else if ((x - MX + 2) ** 2 + (y - MY + 6) ** 2 < 4) col = "#e3dcb8";
      R(b, col, x, y, 1, 1);
    } else if (d < 34) {
      const a = Math.pow(1 - (d - 13) / 21, 2) * 0.5;
      if (a > th(x, y) * 0.55) { b.fillStyle = "rgba(190,200,255,0.30)"; b.fillRect(x, y, 1, 1); }
    }
  }

  /* ---- montagne carsiche ---- */
  function mountains(c, base, color, edge, seed, count, wmin, wmax, hmin, hmax) {
    const r = rng(seed), peaks = [];
    for (let i = 0; i < count; i++) peaks.push({ c: r() * (W + 20) - 10, w: wmin + r() * (wmax - wmin), h: hmin + r() * (hmax - hmin) });
    for (let x = 0; x < W; x++) {
      let h = 0;
      peaks.forEach((p) => { const u = Math.abs(x - p.c) / p.w; if (u < 1) h = Math.max(h, p.h * Math.pow(1 - Math.pow(u, 2.4), 0.55)); });
      h += 2 + Math.sin(x * 0.07) * 1.5;
      const top = Math.round(base - h);
      R(c, color, x, top, 1, base - top);
      R(c, edge, x, top, 1, 1);
      if ((x * 7 + top) % 5 === 0) R(c, edge, x, top + 1, 1, 1);
    }
  }
  mountains(b, HOR, "#2b2c68", "#5a4a92", 11, 9, 8, 20, 12, 36);
  mountains(b, HOR + 1, "#171c4a", "#34408a", 29, 8, 7, 15, 20, 46);
  // alberelli in cima
  for (let i = 0; i < 40; i++) { const x = Math.floor(rand() * W); R(b, "#0c1235", x, HOR - 30 - Math.floor(rand() * 20), 2, 2); }
  // nebbia all'orizzonte
  for (let i = 0; i < 12; i++) {
    const a = Math.round(((i / 12) * 0.45) * 4) / 4;
    b.fillStyle = `rgba(240,160,160,${a * 0.9})`; b.fillRect(0, HOR - 12 + i, W, 1);
  }

  /* ---- acqua ---- */
  for (let y = HOR; y < H; y++) {
    const t = (y - HOR) / (H - HOR);
    const base = mix("#2d4182", "#08102c", Math.pow(t, 0.65));
    const sy = Math.max(0, HOR - 1 - (y - HOR) * 0.9);
    for (let x = 0; x < W; x++) R(b, mix(base, skyAt(x, sy), 0.3 * (1 - t)), x, y, 1, 1);
  }
  for (let i = 0; i < 340; i++) {
    const y = HOR + 2 + Math.floor(Math.pow(rand(), 0.8) * (H - HOR - 3));
    const x = Math.floor(rand() * W), w = 2 + Math.floor(rand() * (4 + (y - HOR) / 8));
    R(b, rand() > 0.5 ? "#4a62ad" : "#1d2f66", x, y, w, 1);
  }
  for (let y = HOR + 1; y < HOR + 74; y += 2) {
    const w = 3 + (y - HOR) * 0.12 + rand() * 4;
    b.fillStyle = `rgba(232,224,184,${0.6 - (y - HOR) / 150})`;
    b.fillRect(Math.round(MX - w / 2 + (rand() - 0.5) * 4), y, Math.round(w), 1);
  }

  /* ---- isola con faro e villaggio lontano ---- */
  for (let x = 130; x < 168; x++) { const hh = Math.round(5 * Math.sqrt(Math.max(0, 1 - ((x - 149) / 19) ** 2))); R(b, "#10153b", x, HOR - hh, 1, hh); }
  R(b, "#e9e4d4", 147, 84, 4, 12); R(b, "#c0392b", 147, 88, 4, 2); R(b, "#c0392b", 147, 92, 4, 2);
  R(b, "#ffe08a", 146, 80, 6, 4); R(b, "#1a1f4a", 145, 78, 8, 2); R(b, "#1a1f4a", 147, 76, 4, 2);
  [[34, 8, 5], [46, 10, 6], [60, 7, 5], [72, 9, 6], [88, 8, 5]].forEach(([x, w, h], i) => {
    R(b, "#1b2150", x, HOR - 1 - h, w, h);
    for (let k = 0; k < w; k += 1) R(b, "#10153b", x + k, HOR - 1 - h - 1 + Math.abs((k - w / 2)) * 0.4 | 0, 1, 1);
    R(b, "#121741", x - 1, HOR - 2 - h - 1, w + 2, 1);
    if (i % 2 === 0) R(b, "#ffcc66", x + 2, HOR - h, 2, 2);
    R(b, "#0e1238", x + 1, HOR - 1, 1, 2); R(b, "#0e1238", x + w - 2, HOR - 1, 1, 2);
  });

  /* ---- casa su palafitte ---- */
  [238, 256, 274, 292, 310].forEach((x) => {
    R(b, "#2b1b10", x, 127, 4, 28); R(b, "#3d2918", x, 127, 1, 28);
    for (let k = 0; k < 4; k++) R(b, "#2f6b3a", x + (k % 2), 134 + k * 5, 1, 2);
    R(b, "#10153b", x - 1, 155, 6, 1);
  });
  // parete
  R(b, "#51341f", 232, 89, 90, 36);
  for (let x = 232; x < 322; x += 5) { R(b, "#3d2616", x, 89, 1, 36); R(b, "#62411f", x + 1, 89, 1, 36); }
  R(b, "#2a1a10", 232, 89, 90, 3); R(b, "#2a1a10", 232, 122, 90, 4);
  [232, 258, 278, 304].forEach((x) => R(b, "#2a1a10", x, 89, 4, 36));
  // finestre
  function win(x, y, w, h, c1, c2) {
    R(b, "#2a1a10", x - 2, y - 2, w + 4, h + 4); R(b, c1, x, y, w, h); R(b, c2, x, y + h / 2, w, h / 2);
    R(b, "#7a4a1a", x + w / 2 - 1, y, 2, h); R(b, "#7a4a1a", x, y + h / 2 - 1, w, 2);
    R(b, "#3d2616", x - 3, y + h + 2, w + 6, 2);
    R(b, "#2f6b3a", x - 1, y + h + 1, 3, 1); R(b, "#e86f8f", x, y + h, 1, 1); R(b, "#ffd36b", x + 2, y + h, 1, 1);
  }
  win(242, 98, 14, 14, "#ffd36b", "#ffb84a");
  win(284, 98, 14, 14, "#f2c15a", "#e69a3a");
  // porta
  R(b, "#2a1a10", 262, 102, 14, 23); R(b, "#3e2715", 264, 104, 10, 21); R(b, "#ffc65a", 268, 104, 1, 21); R(b, "#ffe08a", 271, 114, 1, 2);
  // tetto
  for (let y = 62; y < 90; y++) {
    const xl = Math.round(250 - (y - 62) * 1.15), band = Math.floor((y - 62) / 3);
    R(b, band % 2 ? "#27346a" : "#1f2a57", xl, y, W - xl, 1);
    for (let x = xl; x < W; x++) if ((x + (band % 2) * 3) % 6 === 0) R(b, "#141b3d", x, y, 1, 1);
    R(b, "#7f8fd0", xl, y, 1, 1);
    if (y % 3 === 0) R(b, "#3a4a8e", xl + 1, y, 3, 1);
  }
  R(b, "#6f80c8", 249, 61, W - 249, 2); R(b, "#10153b", 222, 90, W - 222, 2);
  b.fillStyle = "rgba(0,0,10,0.35)"; b.fillRect(236, 92, 86, 3);
  // stendino
  for (let x = 236; x < 258; x++) R(b, "#c9b27a", x, 93 + Math.round(Math.sin((x - 236) / 22 * Math.PI) * 2), 1, 1);
  [[239, "#e8e4d4"], [244, "#7f9be0"], [250, "#e8b4a0"]].forEach(([x, c]) => R(b, c, x, 95, 3, 5));
  // cassetta della posta
  R(b, "#3b2615", 223, 114, 2, 12); R(b, "#d1382f", 218, 107, 12, 8); R(b, "#9c231c", 218, 113, 12, 2); R(b, "#f4e9c8", 221, 109, 6, 1); R(b, "#e85a4f", 218, 107, 12, 1);
  // vasi con fiori
  [[300, 120], [312, 120]].forEach(([x, y]) => { R(b, "#8a4a2a", x, y + 3, 6, 3); R(b, "#2f8a4a", x, y, 6, 3); R(b, "#e86f8f", x + 1, y - 1, 1, 1); R(b, "#ffd36b", x + 4, y - 1, 1, 1); });

  /* ---- molo ---- */
  const DX0 = 112, DY = 126;
  R(b, "#7b5230", DX0, DY, W - DX0, 4); R(b, "#a8743f", DX0, DY, W - DX0, 1);
  for (let x = DX0 + 6; x < W; x += 14) { R(b, "#5a3a22", x, DY + 1, 1, 3); R(b, "#5a3a22", x + 7, DY + 2, 1, 2); }
  R(b, "#4e321d", DX0, DY + 4, W - DX0, 6);
  for (let x = DX0 + 4; x < W; x += 9) R(b, "#3a2515", x, DY + 4, 1, 6);
  R(b, "#2c1b0f", DX0, DY + 9, W - DX0, 1);
  b.fillStyle = "rgba(0,0,10,0.4)"; b.fillRect(DX0, DY + 10, W - DX0, 4);
  [118, 150, 184, 214].forEach((x) => {
    R(b, "#3b2615", x, 118, 4, 36); R(b, "#5e3e24", x, 118, 1, 36); R(b, "#6f4a2b", x - 1, 117, 6, 2);
    R(b, "#10153b", x - 1, 154, 6, 1);
    for (let k = 0; k < 3; k++) R(b, "#2f6b3a", x + 3, 134 + k * 6, 1, 3);
  });
  for (let x = 119; x < 151; x++) R(b, "#c9b27a", x, 121 + Math.round(Math.sin((x - 119) / 31 * Math.PI) * 3), 1, 1);
  // lanterna sul palo
  R(b, "#2a1a10", 148, 106, 8, 2); R(b, "#2a1a10", 148, 116, 8, 2); R(b, "#2a1a10", 148, 108, 1, 8); R(b, "#2a1a10", 155, 108, 1, 8); R(b, "#ffd36b", 149, 108, 6, 8);

  /* ---- primo piano: fronde e erba ---- */
  function frond(x0, y0, ang, len, droop) {
    for (let i = 0; i <= len; i++) {
      const t = i / len, x = x0 + Math.cos(ang) * len * t, y = y0 + Math.sin(ang) * len * t + droop * t * t * len;
      const wd = Math.max(1, Math.round(3 * (1 - t) + 1));
      R(b, "#04061a", x, y, wd, wd);
      if (i % 3 === 0) R(b, "#14306a", x, y - 1, 1, 1);
      if (i % 4 === 1) { R(b, "#04061a", x - 1, y + 2, 1, 3); R(b, "#04061a", x + 2, y + 2, 1, 3); }
    }
  }
  for (let i = 0; i < 9; i++) frond(-4, 2 + i * 1.5, 0.15 + i * 0.12, 50 + (i % 3) * 14, 0.5 + (i % 2) * 0.2);
  for (let i = 0; i < 5; i++) frond(6, -2, 0.7 + i * 0.18, 40 + i * 4, 0.4);
  R(b, "#04061a", 0, 0, 4, 40);
  for (let x = 0; x < W; x += 2) {
    const hh = 3 + Math.floor(rand() * 9) + (x < 80 ? 6 : 0);
    R(b, "#04061a", x, H - hh, 2, hh);
    if (rand() > 0.6) { R(b, "#0e1b3e", x, H - hh, 1, 1); }
  }
  for (let i = 0; i < 6; i++) { const x = 8 + Math.floor(rand() * 90); const hh = 12 + Math.floor(rand() * 14); R(b, "#04061a", x, H - hh, 1, hh); R(b, "#2a1a10", x - 1, H - hh - 3, 3, 4); }

  /* ---- nuvole (animate) ---- */
  function makeCloud(w, h, seed) {
    const r = rng(seed), mask = []; for (let x = 0; x < w; x++) mask[x] = new Uint8Array(h);
    const n = 7 + Math.floor(r() * 4);
    for (let k = 0; k < n; k++) {
      const cx = w * 0.18 + r() * w * 0.64, cy = h * 0.55 + (r() - 0.5) * h * 0.3, rad = h * 0.32 + r() * h * 0.22;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (((x - cx) / 1.7) ** 2 + (y - cy) ** 2 < rad * rad) mask[x][y] = 1;
    }
    for (let x = 0; x < w; x++) for (let y = Math.floor(h * 0.78); y < h; y++) mask[x][y] = 0;
    const [c, x] = mk(w, h);
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (mask[xx][yy]) {
      const above = yy > 0 && mask[xx][yy - 1], below = yy < h - 2 && mask[xx][yy + 2];
      R(x, !above ? "#b79ad0" : (!below ? "#262663" : "#43408a"), xx, yy, 1, 1);
    }
    return c;
  }
  const clouds = [
    { c: makeCloud(64, 20, 5), x: 20, y: 14, v: 0.05 },
    { c: makeCloud(90, 24, 9), x: 150, y: 30, v: 0.035 },
    { c: makeCloud(54, 16, 3), x: 270, y: 8, v: 0.06 },
    { c: makeCloud(70, 18, 7), x: 90, y: 52, v: 0.025 }
  ];

  /* ---- stelle, lucciole ---- */
  const stars = [];
  for (let i = 0; i < 80; i++) stars.push({ x: Math.floor(rand() * W), y: Math.floor(rand() * 62), p: rand() * 6.28, s: rand() > 0.88 ? 2 : 1 });
  const flies = [];
  for (let i = 0; i < 18; i++) flies.push({ x: rand() * W, y: 90 + rand() * 70, p: rand() * 6.28, s: 0.2 + rand() * 0.4 });

  /* ---- luci con dithering ---- */
  function glow(c, x, y, r, rgb, k) {
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
      const d = Math.hypot(xx, yy); if (d > r) continue;
      const a = Math.pow(1 - d / r, 2) * k;
      if (a > th(x + xx, y + yy) * 0.8) { c.fillStyle = `rgba(${rgb},0.22)`; c.fillRect(x + xx, y + yy, 1, 1); }
    }
  }

  /* ---- barca ---- */
  function drawBoat(c, t) {
    const bx = 38, by = 143 + Math.round(Math.sin(t * 1.4));
    for (let i = 0; i < 11; i++) {
      const inset = Math.round(i * 0.9), y = by - 8 + i;
      R(c, i === 0 ? "#9a6a3a" : (i % 3 === 0 ? "#4a2f1b" : "#6b4423"), bx + inset, y, 68 - inset * 2, 1);
    }
    R(c, "#2a1a10", bx + 6, by - 8, 56, 2); R(c, "#9a6a3a", bx, by - 9, 68, 1);
    R(c, "#3b2615", 63, by - 20, 2, 12); R(c, "#2a1a10", 60, by - 22, 8, 2);
    R(c, "#ffd36b", 61, by - 20, 6, 5); R(c, "#2a1a10", 60, by - 15, 8, 1);
    R(c, "#e8e0b8", 24, by - 2, 14, 1); R(c, "#e8e0b8", 90, by - 3, 10, 1);
    R(c, "#c9b27a", 100, by - 10, 4, 1);
    c.fillStyle = "rgba(255,200,110,0.18)"; c.fillRect(56, by + 3, 16, 1);
    return { x: 64, y: by - 18 };
  }

  /* ================= PERSONAGGIO ================= */
  const [sp, sx] = mk(30, 46);
  function drawSprite(bob, step, blink) {
    sx.clearRect(0, 0, 30, 46);
    const S = (col, x, y, w, h, bb = 0) => R(sx, col, x + 1, y + 1 + bb, w, h);
    const hD = "#4a2c17", hM = "#6b4423", hL = "#9a6334", sk = "#f1c27d", skS = "#d99a5e",
      bl = "#1d1d28", blL = "#363650", bd = "#0f0f18", pn = "#2b3142", pnL = "#454f70",
      sh = "#f4f4f4", shS = "#a3abbd", rd = "#e5484d", bb = bob;
    const l0 = step === 1 ? 1 : 0, l1 = step === 2 ? 1 : 0;
    // gambe e scarpe
    S(pn, 8, 30, 6, 8 - l0); S(pn, 14, 30, 6, 8 - l1);
    S(pnL, 9, 31, 1, 6 - l0); S(pnL, 15, 31, 1, 6 - l1);
    S(bd, 13, 30, 2, 8);
    [[7, l0], [15, l1]].forEach(([x, l]) => {
      S(sh, x, 38 - l, 7, 3); S(shS, x, 40 - l, 7, 1); S(shS, x, 41 - l, 7, 2); S(rd, x + 2, 38 - l, 2, 1); S("#d8d8e4", x + 4, 39 - l, 3, 1);
    });
    // busto
    S(bl, 7, 16, 14, 14, bb); S(bd, 7, 28, 14, 2, bb);
    S(blL, 9, 18, 2, 8, bb); S(bd, 17, 21, 2, 6, bb); S(bd, 10, 26, 8, 1, bb);
    S(skS, 12, 14, 4, 2, bb);
    S(bl, 9, 15, 10, 2, bb); S(blL, 10, 15, 3, 1, bb);
    S("#cfd6e4", 12, 17, 1, 4, bb); S("#cfd6e4", 15, 17, 1, 5, bb); S("#8a93a6", 12, 21, 1, 1, bb);
    // braccia
    S(bl, 3, 17, 4, 10, bb); S(bl, 21, 17, 4, 10, bb);
    S(bd, 3, 26, 4, 1, bb); S(bd, 21, 26, 4, 1, bb); S(blL, 4, 18, 1, 6, bb);
    // portatile
    S("#8a93a6", 8, 19, 12, 8, bb); S("#16264d", 9, 20, 10, 6, bb);
    S("#4ade80", 10, 21, 3, 1, bb); S("#38bdf8", 14, 21, 4, 1, bb); S("#4ade80", 11, 23, 5, 1, bb);
    S("#ffc857", 17, 23, 1, 1, bb); S("#38bdf8", 10, 25, 6, 1, bb); S("#e86f8f", 17, 25, 1, 1, bb);
    S("#cfd6e4", 7, 27, 14, 2, bb);
    S(sk, 5, 27, 3, 3, bb); S(sk, 20, 27, 3, 3, bb); S(skS, 5, 29, 3, 1, bb); S(skS, 20, 29, 3, 1, bb);
    // testa
    S(hD, 8, 1, 12, 5, bb); S(hM, 9, 1, 10, 3, bb); S(hL, 11, 1, 5, 1, bb); S(hL, 10, 2, 2, 1, bb);
    S(hD, 7, 3, 2, 8, bb); S(hD, 19, 3, 2, 8, bb); S(hM, 7, 3, 1, 6, bb);
    S(sk, 9, 6, 10, 8, bb); S(skS, 9, 13, 10, 1, bb);
    S(hM, 9, 5, 10, 2, bb); S(hD, 9, 7, 3, 1, bb); S(hD, 13, 7, 2, 1, bb); S(hD, 17, 7, 2, 1, bb);
    S(sk, 7, 10, 2, 2, bb); S(sk, 19, 10, 2, 2, bb); S(skS, 8, 11, 1, 1, bb);
    S(hD, 11, 8, 2, 1, bb); S(hD, 15, 8, 2, 1, bb);
    if (blink) { S("#1a1a24", 11, 10, 2, 1, bb); S("#1a1a24", 15, 10, 2, 1, bb); }
    else { S("#fff", 11, 9, 2, 2, bb); S("#14141c", 12, 9, 1, 2, bb); S("#fff", 15, 9, 2, 2, bb); S("#14141c", 16, 9, 1, 2, bb); }
    S(skS, 14, 11, 1, 1, bb); S("#a0522d", 13, 12, 3, 1, bb); S("#e8a07a", 10, 11, 1, 1, bb); S("#e8a07a", 18, 11, 1, 1, bb);
    // contorno automatico
    const id = sx.getImageData(0, 0, 30, 46), d = id.data, a = (x, y) => (x < 0 || y < 0 || x > 29 || y > 45) ? 0 : d[(y * 30 + x) * 4 + 3];
    const add = [];
    for (let y = 0; y < 46; y++) for (let x = 0; x < 30; x++) if (!a(x, y) && (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1))) add.push([x, y]);
    add.forEach(([x, y]) => R(sx, "#0a0a14", x, y, 1, 1));
  }

  const player = { x: 178, dir: 1, moving: false, step: 0 };
  const keys = { left: false, right: false };
  const MINX = 128, MAXX = 296;

  /* ================= LOOP ================= */
  let last = 0, tick = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (ts - last < 1000 / 30) return;
    last = ts; tick++;
    const t = ts / 1000;

    // movimento
    player.moving = false;
    if (keys.left && !keys.right) { player.x -= 1.1; player.dir = -1; player.moving = true; }
    if (keys.right && !keys.left) { player.x += 1.1; player.dir = 1; player.moving = true; }
    player.x = Math.max(MINX, Math.min(MAXX, player.x));

    ctx.drawImage(bg, 0, 0);

    // stelle
    stars.forEach((s) => {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.p));
      ctx.fillStyle = `rgba(255,248,220,${a})`; ctx.fillRect(s.x, s.y, s.s, s.s);
    });
    // nuvole
    clouds.forEach((c) => { c.x -= c.v; if (c.x < -c.c.width) c.x = W + 4; ctx.drawImage(c.c, Math.round(c.x), c.y); });

    // faro: fascio
    const sw = Math.sin(t * 0.9);
    if (Math.abs(sw) > 0.15) {
      const dir = sw > 0 ? 1 : -1, al = Math.min(0.2, (Math.abs(sw) - 0.15) * 0.4);
      ctx.fillStyle = `rgba(255,240,170,${al})`;
      ctx.beginPath(); ctx.moveTo(149, 82); ctx.lineTo(149 + dir * 90, 70); ctx.lineTo(149 + dir * 90, 94); ctx.closePath(); ctx.fill();
    }
    glow(ctx, 149, 82, 9, "255,240,170", 0.8 + 0.2 * Math.sin(t * 6));

    // riflessi sull'acqua
    const rs = rng(Math.floor(t * 3) + 7);
    for (let i = 0; i < 46; i++) {
      const y = HOR + 2 + Math.floor(rs() * 70), x = Math.floor(rs() * W), w = 2 + Math.floor(rs() * 6);
      ctx.fillStyle = rs() > 0.5 ? "rgba(190,205,255,0.35)" : "rgba(232,224,184,0.45)";
      ctx.fillRect(x, y, w, 1);
    }
    const lf = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
    // riflessi lanterne
    for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(255,208,110,${0.5 - i * 0.07})`; ctx.fillRect(150 + (i % 2) - 1 + Math.round(Math.sin(t * 2 + i)), 142 + i * 3, 6 - i % 3, 1); }

    // barca
    const boat = drawBoat(ctx, t);
    glow(ctx, boat.x, boat.y + 4, 16, "255,200,100", lf);

    // luci
    glow(ctx, 152, 112, 24, "255,200,100", 0.95 * lf);
    glow(ctx, 249, 105, 22, "255,205,110", 0.75);
    glow(ctx, 291, 105, 18, "255,195,100", 0.6);
    glow(ctx, 269, 112, 14, "255,200,100", 0.5);

    // personaggio
    const walkStep = player.moving ? (Math.floor(tick / 5) % 2) + 1 : 0;
    const bob = player.moving ? (Math.floor(tick / 5) % 2) : (Math.floor(t * 1.6) % 2);
    const blink = (t % 4.2) > 4.05;
    drawSprite(bob, walkStep, blink);
    const px = Math.round(player.x), footY = 128;
    ctx.fillStyle = "rgba(0,0,10,0.32)"; ctx.fillRect(px - 9, footY - 2, 18, 2); ctx.fillRect(px - 6, footY - 3, 12, 1);
    ctx.save();
    ctx.translate(px, footY - 44);
    if (player.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(sp, -15, 0);
    ctx.restore();
    glow(ctx, px, footY - 20, 22, "255,200,110", 0.18 * lf);

    // lucciole
    flies.forEach((f) => {
      f.x += Math.sin(t * f.s + f.p) * 0.25; f.y += Math.cos(t * f.s * 1.3 + f.p) * 0.18;
      if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
      const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 + f.p));
      ctx.fillStyle = `rgba(255,236,130,${a})`; ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      ctx.fillStyle = `rgba(255,236,130,${a * 0.25})`; ctx.fillRect(Math.round(f.x) - 1, Math.round(f.y), 3, 1); ctx.fillRect(Math.round(f.x), Math.round(f.y) - 1, 1, 3);
    });
  }
  requestAnimationFrame(frame);

  /* ---- controlli del personaggio ---- */
  const setKey = (e, v) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = v;
    else if (k === "ArrowRight" || k === "d" || k === "D") keys.right = v;
  };
  window.addEventListener("keydown", (e) => { setKey(e, true); });
  window.addEventListener("keyup", (e) => { setKey(e, false); });
  [["goLeft", "left"], ["goRight", "right"]].forEach(([id, k]) => {
    const el = document.getElementById(id);
    ["pointerdown"].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); keys[k] = true; }));
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => el.addEventListener(ev, () => { keys[k] = false; }));
  });

  /* ================= INTERFACCIA ================= */
  let audio;
  function blip(f = 660, d = 0.05) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = "square"; o.frequency.value = f; g.gain.value = 0.03;
      o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + d);
    } catch (e) { /* audio non disponibile */ }
  }

  const buttons = [...document.querySelectorAll("#menu button")];
  let current = 0;

  function show(i, sound) {
    current = (i + buttons.length) % buttons.length;
    buttons.forEach((bt, n) => bt.classList.toggle("sel", n === current));
    const name = buttons[current].dataset.panel;
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "p-" + name));
    if (name === "statistiche") fillStats();
    if (name === "curiosita") nextFact(true);
    if (sound) blip(660 + current * 90);
  }
  buttons.forEach((bt, i) => {
    bt.addEventListener("click", () => show(i, true));
    bt.addEventListener("mouseenter", () => { if (i !== current) show(i, true); });
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); show(current + 1, true); }
    else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); show(current - 1, true); }
    else if ((e.key === "Enter" || e.key === " ") && buttons[current].dataset.panel === "curiosita" && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); nextFact(); }
  });

  /* ---- statistiche ---- */
  const STATS = [
    ["HTML / CSS", 75], ["JavaScript", 65], ["PHP", 55], ["SQL", 50], ["Python", 35], ["Git / GitHub", 60], ["Resistenza al sonno", 90]
  ];
  const statsBox = document.getElementById("stats");
  STATS.forEach(([n, v]) => {
    const row = document.createElement("div");
    row.className = "stat" + (v >= 90 ? " hi" : "");
    row.innerHTML = `<span>${n}</span><div class="bar">${'<i class="seg"></i>'.repeat(20)}</div><b>${v}%</b>`;
    statsBox.appendChild(row);
  });
  let statTimers = [];
  function fillStats() {
    statTimers.forEach(clearTimeout); statTimers = [];
    [...statsBox.children].forEach((row, r) => {
      const segs = [...row.querySelectorAll(".seg")], n = Math.round(STATS[r][1] / 5);
      segs.forEach((s) => s.classList.remove("on"));
      for (let i = 0; i < n; i++) statTimers.push(setTimeout(() => segs[i].classList.add("on"), r * 70 + i * 22));
    });
  }

  /* ---- icone dello zaino ---- */
  const ICONS = {
    palette: { r: "#c0392b", R: "#7a1f17", w: "#f4e9c8", L: "#8a93a6", l: "#cfd6e4", c: "#16264d", g: "#4ade80", u: "#38bdf8", G: "#5fbf3f", H: "#3f9a2a", D: "#8a5a30", d: "#6b4423", y: "#ffc857", t: "#6ee7d8" },
    book: [".RRRRRR.", "RrrrrrRw", "RrwwrrRw", "RrrrrrRw", "RrwwwrRw", "RrrrrrRw", "RRRRRRRw", ".wwwwww."],
    laptop: ["........", ".LLLLLL.", ".LccccL.", ".LgucuL.", ".LccccL.", ".LLLLLL.", "llllllll", ".lLLLLl."],
    block: ["GGGGGGGG", "GHGGGHGG", "DDDDDDDD", "DdDDDdDD", "DDDdDDDD", "DdDDDDdD", "DDDDdDDD", "dDDDDDDd"],
    code: ["........", ".t....t.", "t.t..t.t", "t..y.t.t", "t.t.yt.t", ".t..y.t.", "........", "........"]
  };
  document.querySelectorAll(".icon").forEach((cnv) => {
    const map = ICONS[cnv.dataset.icon], c = cnv.getContext("2d");
    map.forEach((row, y) => [...row].forEach((ch, x) => { if (ICONS.palette[ch]) { c.fillStyle = ICONS.palette[ch]; c.fillRect(x, y, 1, 1); } }));
  });

  /* ---- curiosità con effetto macchina da scrivere ---- */
  const FACTS = [
    "Ho pubblicato dei libri su Amazon.",
    "Mi piace creare progetti web e sperimentare con nuove tecnologie.",
    "Ho un server Minecraft e sviluppo progetti legati al gaming."
  ];
  const typed = document.getElementById("typed"), more = document.getElementById("more");
  let fi = -1, typeTimer = null;
  function type(text) {
    clearInterval(typeTimer); typed.textContent = ""; more.style.visibility = "hidden";
    let i = 0;
    typeTimer = setInterval(() => {
      typed.textContent = text.slice(0, ++i);
      if (i % 3 === 0) blip(520, 0.02);
      if (i >= text.length) { clearInterval(typeTimer); more.style.visibility = "visible"; }
    }, 28);
  }
  function nextFact(first) {
    if (first) { type("Ciao! Sono Filippo. Premi il pulsante per scoprire qualcosa su di me."); fi = -1; return; }
    let n; do { n = Math.floor(Math.random() * FACTS.length); } while (n === fi && FACTS.length > 1);
    fi = n; type(FACTS[n]);
  }
  document.getElementById("btn").addEventListener("click", () => nextFact());

  show(0, false);
})();
