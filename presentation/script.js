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
  const MX = 205, MY = 34;
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
  const boatPos = { bx: 160, by: 143 };
  function drawBoat(c, t) {
    const bx = boatPos.bx, by = 143 + Math.round(Math.sin(t * 1.4));
    boatPos.by = by;
    for (let i = 0; i < 11; i++) {
      const inset = Math.round(i * 0.9), y = by - 8 + i;
      R(c, i === 0 ? "#9a6a3a" : (i % 3 === 0 ? "#4a2f1b" : "#6b4423"), bx + inset, y, 68 - inset * 2, 1);
    }
    R(c, "#2a1a10", bx + 6, by - 8, 56, 2); R(c, "#9a6a3a", bx, by - 9, 68, 1);
    R(c, "#3b2615", bx + 4, by - 16, 2, 8); R(c, "#2a1a10", bx + 3, by - 20, 4, 1); R(c, "#2a1a10", bx + 3, by - 17, 4, 1);
    R(c, "#ffd36b", bx + 4, by - 19, 2, 2);
    R(c, "#e8e0b8", bx - 14, by - 2, 14, 1); R(c, "#e8e0b8", bx + 52, by - 3, 10, 1);
    R(c, "#c9b27a", bx + 62, by - 10, 4, 1);
    c.fillStyle = "rgba(255,200,110,0.18)"; c.fillRect(bx + 18, by + 3, 16, 1);
    return { x: bx + 5, y: by - 18 };
  }

  /* ================= SPRITE ================= */
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

  /* ================= DATI ================= */
  const STATS = [
    ["HTML / CSS", 75], ["JavaScript", 65], ["PHP", 55], ["SQL", 50], ["Python", 35], ["Git / GitHub", 60], ["Sleep resistance", 90]
  ];
  const ICONS = {
    palette: { r: "#c0392b", R: "#7a1f17", w: "#f4e9c8", L: "#8a93a6", l: "#cfd6e4", c: "#16264d", g: "#4ade80", u: "#38bdf8", G: "#5fbf3f", H: "#3f9a2a", D: "#8a5a30", d: "#6b4423", y: "#ffc857", t: "#6ee7d8", n: "#2a3d99", N: "#0f1a4a", p: "#e86f8f", P: "#a8325a" },
    book: ["NNNNNNN.", "NnnnnnNw", "NnyyynNw", "NnnnnnNw", "NnnyynNw", "NnnnnnNw", "NNNNNNNw", ".wwwwww."],
    book2: ["PPPPPPP.", "Ppppppw.".replace("w.", "pw"), "PpyyyppW".replace("W", "w"), "PpppyppW".replace("W", "w"), "PpyyyppW".replace("W", "w"), "PpppppW_".replace("W_", "pw"), "PPPPPPPw", ".wwwwww."],
    laptop: ["........", ".LLLLLL.", ".LccccL.", ".LgucuL.", ".LccccL.", ".LLLLLL.", "llllllll", ".lLLLLl."],
    block: ["GGGGGGGG", "GHGGGHGG", "DDDDDDDD", "DdDDDdDD", "DDDdDDDD", "DdDDDDdD", "DDDDdDDD", "dDDDDDDd"],
    code: ["........", ".t....t.", "t.t..t.t", "t..y.t.t", "t.t.yt.t", ".t..y.t.", "........", "........"]
  };
  function drawIcon(c, name, x, y) {
    ICONS[name].forEach((row, yy) => [...row].forEach((ch, xx) => {
      const col = ICONS.palette[ch]; if (col) R(c, col, x + xx, y + yy, 1, 1);
    }));
  }
  document.querySelectorAll("canvas.icon").forEach((cnv) => drawIcon(cnv.getContext("2d"), cnv.dataset.icon, 0, 0));

  const STAR_MAP = ["....o....", "...oyo...", "...oyo...", "ooooyoooo", "oyyyywyyo", ".oyyyyyo.", "..oyyyo..", ".oyyoyyo.", ".oyo.oyo.", "..o...o.."];
  const STAR_PAL = { o: "#4a3300", y: "#ffd34d", w: "#fff6b0" };
  function drawStar(x, y) {
    STAR_MAP.forEach((row, yy) => [...row].forEach((ch, xx) => { if (STAR_PAL[ch]) R(ctx, STAR_PAL[ch], x + xx, y + yy, 1, 1); }));
  }
  const GLYPHS = {
    "?": ["111", "001", "011", "000", "010"], "!": ["010", "010", "010", "000", "010"],
    A: ["010", "101", "111", "101", "101"], B: ["110", "101", "110", "101", "110"], C: ["011", "100", "100", "100", "011"],
    0: ["111", "101", "101", "101", "111"], 1: ["010", "110", "010", "010", "111"], "{": ["011", "010", "110", "010", "011"], "}": ["110", "010", "011", "010", "110"]
  };

  const FACTS = [
    "I've published books on Amazon.",
    "I love building web projects and experimenting with new tech.",
    "I run a Minecraft server and build projects around gaming."
  ];
  const QUIZ = [
    { q: "Where does Filippo come from?", a: ["Caorle", "Rome", "Milan"], c: 0, fb: "Caorle, a seaside town in northern Italy." },
    { q: "What does Filippo study?", a: ["Medicine", "Computer science", "Law"], c: 1, fb: "Computer science, of course!" },
    { q: "What has Filippo published on Amazon?", a: ["Books", "Music albums", "Video games"], c: 0, fb: "He has published books." },
    { q: "Which game does Filippo run a server for?", a: ["Chess", "Tetris", "Minecraft"], c: 2, fb: "A Minecraft server!" },
    { q: "What is Filippo's “personal bug”?", a: ["He can't code without pizza", "He starts a project out of curiosity and stays up all night", "He always forgets his laptop"], c: 1, fb: "Curiosity wins, sleep loses." }
  ];
  const VOCAB = [
    { w: "bug", ph: "/bʌɡ/", d: "A mistake in a program that makes it work in the wrong way.", ex: "I spent two hours looking for one tiny bug." },
    { w: "loop", ph: "/luːp/", d: "A piece of code that repeats the same steps again and again.", ex: "A loop can show the numbers from 1 to 10." },
    { w: "function", ph: "/ˈfʌŋkʃən/", d: "A block of code that does one job and can be used many times.", ex: "I wrote a function to calculate an average." },
    { w: "debug", ph: "/diːˈbʌɡ/", d: "To find and fix the mistakes in your code.", ex: "Debugging is a bit like being a detective." },
    { w: "commit", ph: "/kəˈmɪt/", d: "To save a set of changes in Git, with a short message.", ex: "I commit my code every evening." },
    { w: "deploy", ph: "/dɪˈplɔɪ/", d: "To publish a website or an app so that people can use it.", ex: "I deployed this page on GitHub Pages." }
  ];
  const ACH = [
    { id: "profile", t: "Meet the player", xp: 10 },
    { id: "skills", t: "Check the skills", xp: 10 },
    { id: "about", t: "Read my story", xp: 10 },
    { id: "inventory", t: "Open the inventory", xp: 10 },
    { id: "facts", t: "Unlock all the fun facts", xp: 30 },
    { id: "quiz", t: "Finish the quiz", xp: 20 },
    { id: "vocab", t: "Open all the tech words", xp: 30 },
    { id: "places", t: "Visit the 4 places on the pier", xp: 40 },
    { id: "quests", t: "Inspect all the quests", xp: 30 },
    { id: "stars", t: "Collect all 6 stars", xp: 60 }
  ];
  const XP_PER_LEVEL = 50, MAX_LEVEL = 7;

  /* ================= AUDIO ================= */
  let audio, soundOn = true;
  function blip(f = 660, d = 0.05, vol = 0.03) {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = "square"; o.frequency.value = f; g.gain.value = vol;
      o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + d);
    } catch (e) { /* audio non disponibile */ }
  }
  function jingle(notes) { notes.forEach((n, i) => setTimeout(() => blip(n, 0.08, 0.03), i * 90)); }
  function speak(text) {
    if (!soundOn) return;
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = 0.9;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) { /* voce non disponibile */ }
  }
  const sndBtn = document.getElementById("snd");
  sndBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    sndBtn.textContent = soundOn ? "♪ SOUND ON" : "♪ SOUND OFF";
    sndBtn.setAttribute("aria-pressed", String(soundOn));
    blip(880, 0.06);
  });

  /* ================= STATO DI GIOCO ================= */
  const FOOT = 128, MINX = 128, MAXX = 296;
  const player = { x: 178, dir: 1, moving: false, hy: 0, vy: 0, target: null };
  const keys = { left: false, right: false };
  const SPOTS = { web: 158, mc: 186, book1: 208, book2: 208, git: 142, about: 269 };
  const DUR = { web: 6.5, mc: 7, book1: 6, book2: 6, git: 6, profile: 5, stats: 6, inventory: 6.5, about: 6, quest: 5, facts: Infinity, quiz: Infinity, vocab: Infinity };
  const SAYS = {
    web: "Building something new…",
    book1: "“3:17” is out on Amazon!",
    book2: "“Diary of a Content Creator” is out on Amazon!",
    mc: "Server online. Come play!",
    git: "git push origin main",
    profile: "Hi! I'm Filippo. Welcome to my world!",
    stats: "Skill check… not bad!",
    inventory: "Let me check my bag…",
    facts: "Ask away! Well, press the button.",
    about: "Come in! This is my place.",
    quiz: "Let's see how well you know me!",
    vocab: "Words I use every day when I code.",
    quest: "Let's see what is left to do…"
  };
  const mailbox = { flag: false, downAt: 0 };
  const parts = [];
  let act = null, nowT = 0, tick = 0, mailToggle = false;

  const game = { xp: 0, done: new Set(), places: new Set(), quests: new Set(), flipped: new Set(), stars: 0, finished: false };
  const STARS = [
    { x: 140, y: 111 }, { x: 160, y: 111 }, { x: 198, y: 74 }, { x: 236, y: 111 }, { x: 252, y: 74 }, { x: 288, y: 111 }
  ].map((s) => Object.assign(s, { got: false, p: Math.random() * 6 }));
  const HOTSPOTS = [
    { id: "post", x: 152, mx: 152, my: 96, spot: 158, bx: [143, 104, 161, 124], act: () => "web" },
    { id: "boat", x: 186, mx: 178, my: 124, spot: 186, bx: [160, 134, 228, 148], act: () => "mc" },
    { id: "mail", x: 208, mx: 224, my: 97, spot: 208, bx: [214, 105, 232, 127], act: () => ((mailToggle = !mailToggle) ? "book1" : "book2") },
    { id: "door", x: 269, mx: 269, my: 93, spot: 269, bx: [258, 100, 280, 127], act: () => "about" }
  ];
  const PLACE_OF_ACT = { web: "post", mc: "boat", book1: "mail", book2: "mail", about: "door" };

  /* ---- fumetto / toast / prompt ---- */
  const bub = document.getElementById("bubble"), toastEl = document.getElementById("toast"), promptEl = document.getElementById("prompt");
  let btimer = null;
  function say(text, speed = 24) {
    clearInterval(btimer); bub.classList.add("show"); bub.textContent = "";
    let i = 0;
    btimer = setInterval(() => {
      bub.textContent = text.slice(0, ++i);
      if (i % 3 === 0) blip(540, 0.02, 0.02);
      if (i >= text.length) clearInterval(btimer);
    }, speed);
  }
  function hideBubble() { clearInterval(btimer); bub.classList.remove("show"); }

  const toastQ = []; let toastBusy = false;
  function toast(text, kind = "") {
    toastQ.push({ text, kind }); if (!toastBusy) nextToast();
  }
  function nextToast() {
    const n = toastQ.shift();
    if (!n) { toastBusy = false; return; }
    toastBusy = true;
    toastEl.textContent = n.text; toastEl.className = "show " + n.kind;
    setTimeout(() => { toastEl.className = ""; setTimeout(nextToast, 250); }, 3200);
  }

  /* ---- progresso, livelli, finale ---- */
  const lvEl = document.getElementById("lv"), xpBar = document.getElementById("xpbar"), xpNum = document.getElementById("xpnum"), starNum = document.getElementById("starnum");
  xpBar.innerHTML = '<i class="seg"></i>'.repeat(20);
  const level = () => Math.min(MAX_LEVEL, 1 + Math.floor(game.xp / XP_PER_LEVEL));
  function setHUD() {
    const lv = level(), segs = lv >= MAX_LEVEL ? 20 : Math.round(((game.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 20);
    lvEl.textContent = "LV." + lv; xpNum.textContent = game.xp + " XP"; starNum.textContent = `★ ${game.stars}/${STARS.length}`;
    [...xpBar.children].forEach((s, i) => s.classList.toggle("on", i < segs));
    renderQuest();
  }
  function addXP(n, label) {
    const before = level(); game.xp += n; setHUD();
    if (label) toast(`+${n} XP · ${label}`);
    if (level() > before) {
      setTimeout(() => { toast(`LEVEL UP! You reached level ${level()}`, "lvl"); burst(player.x, FOOT - 50, 16, "#ffd34d"); jingle([523, 659, 784, 1046]); }, 400);
    }
  }
  function award(id) {
    if (game.done.has(id)) return;
    const a = ACH.find((x) => x.id === id); if (!a) return;
    game.done.add(id);
    addXP(a.xp); toast(`★ Quest complete: ${a.t} (+${a.xp} XP)`, "ach"); jingle([660, 880]);
    if (game.done.size === ACH.length && !game.finished) { game.finished = true; setTimeout(showFinale, 2600); }
  }
  const finale = document.getElementById("finale");
  function showFinale() {
    finale.hidden = false; jingle([523, 659, 784, 1046, 1318]);
    let n = 0; const iv = setInterval(() => {
      burst(140 + Math.random() * 150, 30 + Math.random() * 60, 18, ["#ffd34d", "#e86f8f", "#6ee7d8", "#a78bfa"][n % 4]); if (++n > 14) clearInterval(iv);
    }, 280);
  }
  document.getElementById("finClose").addEventListener("click", () => { finale.hidden = true; });

  function renderQuest() {
    const list = document.getElementById("qlog"); if (!list) return;
    list.innerHTML = ACH.map((a) => `<li class="${game.done.has(a.id) ? "done" : ""}"><span>${game.done.has(a.id) ? "✔" : "□"}</span>${a.t}<em>+${a.xp} XP</em></li>`).join("");
    document.getElementById("qfound").textContent = `${game.done.size}/${ACH.length}`;
  }

  /* ================= SISTEMA DI AZIONI ================= */
  function perform(name, opts = {}) {
    if (act && act.name === name) {
      if (opts.hold) act.hold = true;
      if (opts.restart && act.state === "do") { act.t0 = nowT; act.fired = {}; act.last = {}; act.endAt = act.hold ? Infinity : nowT + DUR[name]; say(SAYS[name]); }
      return;
    }
    hideBubble();
    if (act) clearActProps();
    act = { name, state: "walk", t0: 0, endAt: 0, hold: !!opts.hold, fired: {}, last: {} };
    syncActive();
    const spot = SPOTS[name];
    if (spot == null) { player.target = null; arrive(nowT); } else player.target = spot;
  }
  function release(name) {
    if (act && act.name === name && act.hold) {
      act.hold = false;
      if (act.state === "do") act.endAt = Math.max(nowT + 0.8, act.t0 + 2.6);
    }
  }
  function arrive(t) {
    if (!act) return;
    act.state = "do"; act.t0 = t;
    act.endAt = act.hold ? Infinity : t + DUR[act.name];
    say(SAYS[act.name]);
    if (act.name in SPOTS) player.dir = 1;
    blip(520, 0.05); setTimeout(() => blip(780, 0.06), 70);
    const pl = PLACE_OF_ACT[act.name];
    if (pl) { game.places.add(pl); if (game.places.size >= 4) award("places"); }
    if (["web", "book1", "book2", "mc"].includes(act.name)) { game.quests.add(act.name); if (game.quests.size >= 4) award("quests"); }
  }
  function clearActProps() { if (mailbox.flag) mailbox.downAt = nowT + 2; blocks.length = 0; }
  function syncActive() { document.querySelectorAll(".card").forEach((c) => c.classList.toggle("active", !!act && c.dataset.act === act.name)); }
  function endAct() { if (act) clearActProps(); act = null; hideBubble(); syncActive(); }

  function hop(v = -2.4) { if (player.hy === 0) player.vy = v; }
  function once(key, cond, fn) { if (cond && !act.fired[key]) { act.fired[key] = true; fn(); } }
  function every(key, e, iv, fn) { const n = Math.floor(e / iv); if (act.last[key] !== n) { act.last[key] = n; fn(n); } }
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => { v = clamp01(v); return 1 - Math.pow(1 - v, 3); };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---- particelle ---- */
  function addPart(p) { parts.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 30, kind: "spark", col: "#fff" }, p, { max: p.life || 30 })); }
  function burst(x, y, n, col, kind = "star") {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, s = 0.3 + Math.random() * 0.9;
      addPart({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.4, g: 0.02, life: 26 + Math.random() * 14, kind, col });
    }
  }
  function drawParts() {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.life / (p.max * 0.5));
      const x = Math.round(p.x), y = Math.round(p.y);
      if (p.kind === "star") { R(ctx, p.col, x, y, 1, 1); R(ctx, p.col, x - 1, y, 1, 1); R(ctx, p.col, x + 1, y, 1, 1); R(ctx, p.col, x, y - 1, 1, 1); R(ctx, p.col, x, y + 1, 1, 1); }
      else if (p.kind === "bit") R(ctx, p.col, x, y, 2, 2);
      else if (p.kind === "heart") [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2], [2, 3]].forEach(([dx, dy]) => R(ctx, p.col, x + dx, y + dy, 1, 1));
      else if (p.kind === "glyph") GLYPHS[p.ch].forEach((row, yy) => [...row].forEach((c, xx) => { if (c === "1") R(ctx, p.col, x + xx, y + yy, 1, 1); }));
      else if (p.kind === "drop") { R(ctx, p.col, x, y, 1, 2); R(ctx, p.col, x - 1, y + 2, 3, 2); }
      else R(ctx, p.col, x, y, 1, 1);
      ctx.globalAlpha = 1;
    }
  }

  /* ---- utilità di disegno ---- */
  function line(col, x0, y0, x1, y1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), stx = x0 < x1 ? 1 : -1, sty = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let guard = 0; guard < 400; guard++) {
      R(ctx, col, x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += stx; }
      if (e2 <= dx) { err += dx; y0 += sty; }
    }
  }
  function popup(x, y, w, h, k) {
    const hh = Math.max(3, Math.round(h * k));
    R(ctx, "#0a0a14", x - 2, y - 2, w + 4, hh + 4); R(ctx, "#cfd6e4", x - 1, y - 1, w + 2, hh + 2); R(ctx, "#0f1840", x, y, w, hh);
    return hh;
  }
  const POP_Y = 22;
  const popX = (px, w) => Math.round(Math.max(124, Math.min(px - 18, 218 - w)));

  function drawBookSprite(x, y, v) {
    const cover = v === 2 ? "#e86f8f" : "#2a3d99", dark = v === 2 ? "#a8325a" : "#0f1a4a", gold = "#ffc857";
    R(ctx, "#0a0a14", x - 1, y - 1, 13, 16);
    R(ctx, dark, x, y, 12, 14); R(ctx, cover, x + 2, y, 10, 14); R(ctx, "#f4e9c8", x + 11, y + 1, 1, 12);
    if (v === 2) { R(ctx, gold, x + 6, y + 3, 2, 4); R(ctx, gold, x + 5, y + 4, 4, 2); R(ctx, "#fff", x + 4, y + 9, 6, 2); R(ctx, "#0a0a14", x + 6, y + 9, 2, 2); }
    else { R(ctx, gold, x + 5, y + 3, 4, 1); R(ctx, gold, x + 5, y + 5, 4, 1); R(ctx, gold, x + 5, y + 7, 4, 1); R(ctx, gold, x + 4, y + 10, 6, 1); R(ctx, gold, x + 5, y + 4, 1, 3); }
  }
  function drawEnvelope(x, y) {
    R(ctx, "#0a0a14", x - 1, y - 1, 10, 8); R(ctx, "#f4e9c8", x, y, 8, 6);
    line("#c9b27a", x, y, x + 3, y + 3); line("#c9b27a", x + 7, y, x + 4, y + 3); R(ctx, "#e5484d", x + 3, y + 3, 2, 2);
  }
  const blocks = [];
  function drawGrass(x, y) {
    R(ctx, "#0a0a14", x - 1, y - 1, 8, 8); R(ctx, "#5fbf3f", x, y, 6, 2); R(ctx, "#8a5a30", x, y + 2, 6, 4); R(ctx, "#6b4423", x + 1, y + 3, 1, 1); R(ctx, "#6b4423", x + 4, y + 4, 1, 1); R(ctx, "#3f9a2a", x + 2, y, 1, 1);
  }
  function drawPick(hx, hy, dir, f) {
    if (f === 0) { line("#6b4423", hx, hy, hx + 7 * dir, hy - 9); R(ctx, "#0a0a14", hx + 7 * dir - 3, hy - 11, 7, 4); R(ctx, "#cfd6e4", hx + 7 * dir - 2, hy - 10, 5, 2); }
    else { line("#6b4423", hx, hy, hx + 8 * dir, hy + 2); R(ctx, "#0a0a14", hx + 8 * dir - 2, hy - 3, 4, 8); R(ctx, "#cfd6e4", hx + 8 * dir - 1, hy - 2, 2, 6); }
  }
  function drawMarker(x, y, visited, t) {
    const yy = y + Math.round(Math.sin(t * 4 + x) * 1.5);
    if (visited) { R(ctx, "#0a0a14", x - 3, yy - 3, 7, 7); R(ctx, "#2fa85c", x - 2, yy - 2, 5, 5); R(ctx, "#fff", x - 1, yy, 1, 1); R(ctx, "#fff", x, yy + 1, 1, 1); R(ctx, "#fff", x + 1, yy - 1, 1, 1); return; }
    R(ctx, "#0a0a14", x - 4, yy - 6, 9, 12); R(ctx, "#ffd34d", x - 3, yy - 5, 7, 10); R(ctx, "#fff6b0", x - 3, yy - 5, 7, 1);
    R(ctx, "#0a0a14", x - 1, yy - 4, 3, 5); R(ctx, "#0a0a14", x - 1, yy + 2, 3, 2);
    R(ctx, "#0a0a14", x - 1, yy + 6, 3, 1);
  }

  /* ---- effetti ---- */
  function fxBack(t) {
    if (!act || act.state !== "do" || act.name !== "inventory") return;
    const e = t - act.t0, px = Math.round(player.x);
    ["laptop", "book", "block", "code"].forEach((n, i) => {
      const a = e * 2.2 + i * Math.PI / 2;
      if (Math.sin(a) < 0) drawIcon(ctx, n, Math.round(px + Math.cos(a) * 24 - 4), Math.round(FOOT - 32 + Math.sin(a) * 7 - 4 + player.hy));
    });
  }
  function drawDoorOpen(t) {
    if (!act || act.state !== "do" || act.name !== "about") return;
    const e = t - act.t0, k = ease(e / 0.5);
    R(ctx, "#0a0a14", 262, 102, 14, 23);
    R(ctx, "#ffd36b", 263, 103, 12, 21); R(ctx, "#ffb84a", 263, 112, 12, 12);
    R(ctx, "#7a4a1a", 263, 103, Math.round(4 * (1 - k)) + 2, 21);
    R(ctx, "#2a1a10", 266, 108, 5, 9); R(ctx, "#2a1a10", 267, 105, 3, 3);
    ctx.fillStyle = "rgba(255,211,107,0.16)"; ctx.beginPath(); ctx.moveTo(263, 124); ctx.lineTo(275, 124); ctx.lineTo(292, 129); ctx.lineTo(250, 129); ctx.closePath(); ctx.fill();
  }
  function fxFront(t) {
    if (!act || act.state !== "do") return;
    const e = t - act.t0, px = Math.round(player.x), n = act.name, hy = Math.round(player.hy);

    if (n === "web") {
      const w = 48, h = 34, x = popX(px, w), y = POP_Y, k = ease(e / 0.3);
      popup(x, y, w, h, k);
      if (k >= 1) {
        R(ctx, "#3d4d99", x, y, w, 5); R(ctx, "#e5484d", x + 2, y + 2, 1, 1); R(ctx, "#ffc857", x + 4, y + 2, 1, 1); R(ctx, "#4ade80", x + 6, y + 2, 1, 1);
        R(ctx, "#1d2a6b", x + 10, y + 1, w - 14, 3);
        R(ctx, "#38bdf8", x + 3, y + 8, Math.round((w - 6) * ease((e - 0.4) / 0.8)), 3);
        R(ctx, "#4ade80", x + 3, y + 13, Math.round(20 * ease((e - 1.2) / 0.5)), 9);
        R(ctx, "#ffc857", x + 25, y + 13, Math.round(20 * ease((e - 1.9) / 0.5)), 9);
        R(ctx, "#e86f8f", x + 3, y + 24, Math.round((w - 6) * ease((e - 2.6) / 0.6)), 5);
        if (Math.floor(e * 3) % 2 === 0) R(ctx, "#fff", x + w - 8, y + 30, 3, 2);
      }
      every("bit", e, 0.16, () => addPart({ x: px + (Math.random() * 8 - 4), y: FOOT - 26, vx: (Math.random() - 0.3) * 0.4, vy: -0.5 - Math.random() * 0.4, life: 40, kind: "bit", col: Math.random() > 0.5 ? "#4ade80" : "#38bdf8" }));
    }

    if (n === "git") {
      const w = 58, h = 34, x = popX(px, w), y = POP_Y, k = ease(e / 0.3);
      popup(x, y, w, h, k);
      if (k >= 1) {
        const y0 = y + 25, xs = [x + 8, x + 22, x + 36, x + 50];
        R(ctx, "#2b3a7a", x + 4, y0, Math.round((w - 8) * ease((e - 0.3) / 0.8)), 1);
        const bx1 = x + 15, bx2 = x + 29, by_ = y + 14;
        if (e > 0.7) line("#a78bfa", xs[0], y0, bx1, by_);
        if (e > 1.1) line("#a78bfa", bx1, by_, bx1 + Math.round((bx2 - bx1) * ease((e - 1.1) / 0.5)), by_);
        if (e > 1.7) line("#a78bfa", bx2, by_, xs[2], y0);
        xs.forEach((nx, i) => { if (e > 0.5 + i * 0.5) R(ctx, "#cfd6e4", nx - 1, y0 - 1, 3, 3); });
        if (e > 0.9) R(ctx, "#a78bfa", bx1 - 1, by_ - 1, 3, 3);
        if (e > 1.5) R(ctx, "#a78bfa", bx2 - 1, by_ - 1, 3, 3);
        if (e > 2.6) {
          R(ctx, Math.floor(e * 4) % 2 === 0 ? "#4ade80" : "#2fa85c", xs[3] - 2, y0 - 2, 5, 5);
          const p = clamp01((e - 2.8) / 1.2), ay = lerp(y0 - 3, y - 6, p), cx = x + w - 6;
          R(ctx, "#0a0a14", cx - 8, y - 14, 18, 9); R(ctx, "#e8eefc", cx - 7, y - 13, 16, 7); R(ctx, "#e8eefc", cx - 4, y - 15, 8, 3);
          if (p < 1) { R(ctx, "#4ade80", xs[3], Math.round(ay), 1, 4); R(ctx, "#4ade80", xs[3] - 1, Math.round(ay) + 1, 3, 1); }
          once("gitdone", p >= 1, () => { burst(cx, y - 10, 8, "#4ade80"); jingle([660, 880, 1100]); });
        }
      }
      every("bit", e, 0.3, () => addPart({ x: px + (Math.random() * 8 - 4), y: FOOT - 26, vy: -0.5, life: 34, kind: "bit", col: "#a78bfa" }));
    }

    if (n === "stats") {
      once("hop", e > 0.05, () => hop());
      const w = 48, h = 36, x = popX(px, w), y = POP_Y, k = ease(e / 0.3);
      popup(x, y, w, h, k);
      if (k >= 1) {
        R(ctx, "#5a6ab0", x + 2, y + h - 4, w - 4, 1);
        STATS.forEach(([, v], i) => {
          const bh = Math.round((v / 100) * 26 * ease((e - 0.4 - i * 0.14) / 0.5));
          R(ctx, i === 6 ? "#ffc857" : "#6ee7d8", x + 3 + i * 6, y + h - 4 - bh, 4, bh);
          if (bh > 1) R(ctx, "#ffffff", x + 3 + i * 6, y + h - 4 - bh, 4, 1);
        });
        once("sp", e > 2.2, () => { burst(x + 3 + 6 * 6 + 2, y + 8, 7, "#ffc857"); jingle([784, 988]); });
      }
    }

    if (n === "inventory") {
      ["laptop", "book", "block", "code"].forEach((nm, i) => {
        const a = e * 2.2 + i * Math.PI / 2;
        if (Math.sin(a) >= 0) drawIcon(ctx, nm, Math.round(px + Math.cos(a) * 24 - 4), Math.round(FOOT - 32 + Math.sin(a) * 7 - 4 + hy));
      });
      every("tw", e, 0.25, () => addPart({ x: px + (Math.random() * 44 - 22), y: FOOT - 40 + Math.random() * 22, life: 20, kind: "star", col: "#ffe08a" }));
    }

    if (n === "profile") {
      once("h1", e > 0.05, () => hop());
      once("h2", e > 0.75, () => hop(-2));
      every("hearts", e < 2.8 ? e : 99, 0.4, () => addPart({ x: px + (Math.random() * 14 - 7), y: FOOT - 48, vx: (Math.random() - 0.5) * 0.3, vy: -0.45, life: 46, kind: "heart", col: Math.random() > 0.4 ? "#e86f8f" : "#ffc857" }));
    }

    if (n === "about") {
      every("warm", e, 0.35, () => addPart({ x: 266 + Math.random() * 8, y: 118, vx: (Math.random() - 0.5) * 0.3, vy: -0.3, life: 30, kind: "star", col: "#ffe08a" }));
    }

    if (n === "quiz") {
      every("q", e, 0.7, () => addPart({ x: px + (Math.random() * 30 - 15), y: FOOT - 52, vx: (Math.random() - 0.5) * 0.2, vy: -0.4, life: 44, kind: "glyph", ch: "?", col: "#ffd34d" }));
    }
    if (n === "vocab") {
      every("v", e, 0.5, (i) => addPart({ x: px + (Math.random() * 40 - 20), y: FOOT - 46, vx: (Math.random() - 0.5) * 0.3, vy: -0.4, life: 50, kind: "glyph", ch: "ABC"[i % 3], col: "#6ee7d8" }));
    }
    if (n === "quest") {
      once("h", e > 0.05, () => hop(-2));
      ["#ffd34d", "#ffd34d", "#ffd34d"].forEach((c, i) => { const a = e * 2 + i * 2.1; R(ctx, c, Math.round(px + Math.cos(a) * 18), Math.round(FOOT - 56 + Math.sin(a) * 5), 2, 2); });
    }

    if (n === "book1" || n === "book2") {
      const v = n === "book2" ? 2 : 1, rise = ease(e / 0.6);
      const bY = lerp(FOOT - 32, FOOT - 82, rise) + Math.sin(e * 4) * 1.2;
      drawBookSprite(px - 6, Math.round(bY), v);
      every("sp", e, 0.2, () => addPart({ x: px - 8 + Math.random() * 18, y: bY + Math.random() * 16, life: 22, kind: "star", col: "#ffe08a" }));
      if (e > 1.4 && e < 2.6) {
        const p = (e - 1.4) / 1.2, ex = lerp(px, 223, p) - 4, ey = lerp(FOOT - 44, 111, p) - Math.sin(p * Math.PI) * 24;
        drawEnvelope(Math.round(ex), Math.round(ey));
        addPart({ x: ex + 4, y: ey + 3, life: 14, kind: "star", col: "#f4e9c8" });
      }
      once("land", e >= 2.6, () => { mailbox.flag = true; mailbox.downAt = 0; burst(224, 108, 12, "#ffd36b"); jingle([660, 784, 988, 1318]); });
    }

    if (n === "mc") {
      const f = Math.floor(e / 0.22) % 2, hx = px + 8, hyy = FOOT - 20 + hy;
      drawPick(hx, hyy, 1, f);
      every("sw", e, 0.22, (i) => { if (i % 2 === 1) { burst(hx + 8, hyy + 2, 3, "#ffe08a", "spark"); blip(220, 0.04, 0.025); } });
      for (let i = 0; i < 6; i++) {
        const start = 0.9 + i * 0.6, p = (e - start) / 0.7;
        const lx = boatPos.bx + 10 + i * 9, ly = boatPos.by - 14;
        if (p < 0) continue;
        if (p < 1) drawGrass(Math.round(lerp(px + 8, lx, p)), Math.round(lerp(FOOT - 30, ly, p) - Math.sin(p * Math.PI) * 16));
        else drawGrass(lx, ly);
        once("L" + i, p >= 1, () => { burst(lx + 3, ly + 4, 3, "#9be07a", "spark"); blip(330 + i * 40, 0.05, 0.025); });
      }
    }
  }

  /* ---- reazioni al quiz ---- */
  function react(good) {
    if (good) {
      hop(); burst(player.x, FOOT - 50, 10, "#ffe08a");
      for (let i = 0; i < 3; i++) addPart({ x: player.x + i * 5 - 5, y: FOOT - 50, vy: -0.5, life: 40, kind: "heart", col: "#e86f8f" });
      say(["Correct!", "Yes! You know me!", "Nice one!"][Math.floor(Math.random() * 3)]); jingle([660, 880, 1100]);
    } else {
      say("Oops… not quite!"); blip(180, 0.18, 0.04);
      for (let i = 0; i < 3; i++) addPart({ x: player.x + 8 + i * 3, y: FOOT - 46, vy: 0.3, g: 0.02, life: 26, kind: "drop", col: "#6ec6ff" });
    }
  }

  /* ================= LOOP ================= */
  let last = 0;
  const POSX = () => (window.innerWidth <= 1100 ? 0.66 : 0.62);
  function sceneToScreen(x, y) {
    const vw = window.innerWidth, vh = window.innerHeight, sc = Math.max(vw / W, vh / H);
    return [(vw - W * sc) * POSX() + x * sc, (vh - H * sc) * 0.5 + y * sc];
  }
  function screenToScene(cx, cy) {
    const vw = window.innerWidth, vh = window.innerHeight, sc = Math.max(vw / W, vh / H);
    return [(cx - (vw - W * sc) * POSX()) / sc, (cy - (vh - H * sc) * 0.5) / sc];
  }
  const nearHotspot = () => HOTSPOTS.find((h) => Math.abs(player.x - h.spot) <= 9);
  const touchUI = window.matchMedia("(hover: none)").matches;

  function frame(ts) {
    requestAnimationFrame(frame);
    if (ts - last < 1000 / 30) return;
    last = ts; tick++;
    const t = ts / 1000; nowT = t;

    // input e movimento
    const kl = keys.left && !keys.right, kr = keys.right && !keys.left;
    if (kl || kr) {
      if (act) endAct();
      player.target = null; player.x += kl ? -1.3 : 1.3; player.dir = kl ? -1 : 1; player.moving = true;
    } else if (player.target == null) player.moving = false;
    if (player.target != null) {
      const dx = player.target - player.x;
      if (Math.abs(dx) <= 1.6) { player.x = player.target; player.target = null; player.moving = false; if (act && act.state === "walk") arrive(t); }
      else { player.x += Math.sign(dx) * 1.7; player.dir = Math.sign(dx); player.moving = true; }
    }
    player.x = Math.max(MINX, Math.min(MAXX, player.x));
    player.vy += 0.25; player.hy += player.vy; if (player.hy > 0) { player.hy = 0; player.vy = 0; }
    if (act && act.state === "do" && t > act.endAt) endAct();
    if (mailbox.downAt && t > mailbox.downAt) { mailbox.flag = false; mailbox.downAt = 0; }

    // stelle da raccogliere
    STARS.forEach((s, i) => {
      if (s.got) return;
      const sy = s.y + Math.sin(t * 3 + s.p) * 2;
      if (Math.abs(player.x - s.x) < 8 && (Math.abs(FOOT - 22 + player.hy - sy) < 9 || Math.abs(FOOT - 40 + player.hy - sy) < 8)) {
        s.got = true; game.stars++; setHUD();
        burst(s.x, sy, 10, "#ffd34d"); blip(880 + game.stars * 80, 0.07, 0.035); setTimeout(() => blip(1320 + game.stars * 60, 0.07, 0.03), 80);
        addXP(5, game.stars < STARS.length ? `Star ${game.stars}/${STARS.length}` : "");
        if (game.stars === 3) toast("Tip: some stars are high. Press SPACE to jump!");
        if (game.stars === STARS.length) award("stars");
      }
    });

    ctx.drawImage(bg, 0, 0);
    stars.forEach((s) => {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.p));
      ctx.fillStyle = `rgba(255,248,220,${a})`; ctx.fillRect(s.x, s.y, s.s, s.s);
    });
    clouds.forEach((c) => { c.x -= c.v; if (c.x < -c.c.width) c.x = W + 4; ctx.drawImage(c.c, Math.round(c.x), c.y); });

    const sw = Math.sin(t * 0.9);
    if (Math.abs(sw) > 0.15) {
      const dir = sw > 0 ? 1 : -1, al = Math.min(0.2, (Math.abs(sw) - 0.15) * 0.4);
      ctx.fillStyle = `rgba(255,240,170,${al})`;
      ctx.beginPath(); ctx.moveTo(149, 82); ctx.lineTo(149 + dir * 90, 70); ctx.lineTo(149 + dir * 90, 94); ctx.closePath(); ctx.fill();
    }
    glow(ctx, 149, 82, 9, "255,240,170", 0.8 + 0.2 * Math.sin(t * 6));

    const rs = rng(Math.floor(t * 3) + 7);
    for (let i = 0; i < 46; i++) {
      const y = HOR + 2 + Math.floor(rs() * 70), x = Math.floor(rs() * W), w = 2 + Math.floor(rs() * 6);
      ctx.fillStyle = rs() > 0.5 ? "rgba(190,205,255,0.35)" : "rgba(232,224,184,0.45)";
      ctx.fillRect(x, y, w, 1);
    }
    const lf = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(255,208,110,${0.5 - i * 0.07})`; ctx.fillRect(150 + (i % 2) - 1 + Math.round(Math.sin(t * 2 + i)), 142 + i * 3, 6 - i % 3, 1); }

    const boat = drawBoat(ctx, t);
    glow(ctx, boat.x, boat.y + 4, 14, "255,200,100", lf);
    glow(ctx, 152, 112, 24, "255,200,100", 0.95 * lf);
    glow(ctx, 249, 105, 22, "255,205,110", 0.75);
    glow(ctx, 291, 105, 18, "255,195,100", 0.6);
    glow(ctx, 269, 112, 14, "255,200,100", 0.5);
    if (mailbox.flag) { R(ctx, "#0a0a14", 229, 98, 3, 10); R(ctx, "#ffd36b", 230, 99, 1, 8); R(ctx, "#0a0a14", 227, 98, 6, 5); R(ctx, "#ffc857", 228, 99, 4, 3); }
    drawDoorOpen(t);

    // stelle
    STARS.forEach((s) => {
      if (s.got) return;
      const sy = Math.round(s.y + Math.sin(t * 3 + s.p) * 2);
      glow(ctx, s.x, sy, 10, "255,215,90", 0.9);
      drawStar(s.x - 4, sy - 5);
    });

    // segnaposto dei luoghi
    HOTSPOTS.forEach((h) => drawMarker(h.mx, h.my, game.places.has(h.id), t));

    fxBack(t);

    // personaggio
    const typing = act && act.state === "do" && (act.name === "web" || act.name === "git");
    const mining = act && act.state === "do" && act.name === "mc";
    const walkStep = player.moving ? (Math.floor(tick / 5) % 2) + 1 : 0;
    const bob = player.moving ? (Math.floor(tick / 5) % 2) : typing ? (Math.floor(tick / 3) % 2) : mining ? (Math.floor((t - act.t0) / 0.22) % 2) : (Math.floor(t * 1.6) % 2);
    drawSprite(bob, walkStep, (t % 4.2) > 4.05);
    const px = Math.round(player.x), py = Math.round(FOOT + player.hy);
    ctx.fillStyle = "rgba(0,0,10,0.32)"; ctx.fillRect(px - 9, FOOT - 2, 18, 2); ctx.fillRect(px - 6, FOOT - 3, 12, 1);
    ctx.save(); ctx.translate(px, py - 44);
    if (player.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(sp, -15, 0); ctx.restore();
    glow(ctx, px, FOOT - 20, 22, "255,200,110", 0.18 * lf);

    fxFront(t);
    drawParts();

    flies.forEach((f) => {
      f.x += Math.sin(t * f.s + f.p) * 0.25; f.y += Math.cos(t * f.s * 1.3 + f.p) * 0.18;
      if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
      const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 + f.p));
      ctx.fillStyle = `rgba(255,236,130,${a})`; ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      ctx.fillStyle = `rgba(255,236,130,${a * 0.25})`; ctx.fillRect(Math.round(f.x) - 1, Math.round(f.y), 3, 1); ctx.fillRect(Math.round(f.x), Math.round(f.y) - 1, 1, 3);
    });

    // fumetto e suggerimento di interazione
    if (bub.classList.contains("show")) {
      const [bx, by] = sceneToScreen(px, py - 50);
      const half = Math.min(bub.offsetWidth / 2 + 8, window.innerWidth / 2);
      bub.style.left = Math.max(half, Math.min(bx, window.innerWidth - half)) + "px";
      bub.style.top = Math.max(70, by) + "px";
    }
    const nh = nearHotspot();
    if (nh && !act && !player.moving) {
      const [ax, ay] = sceneToScreen(nh.mx, nh.my - 10);
      promptEl.textContent = touchUI ? "Tap A" : "Press E";
      promptEl.style.left = ax + "px"; promptEl.style.top = ay + "px"; promptEl.classList.add("show");
    } else promptEl.classList.remove("show");
  }
  requestAnimationFrame(frame);

  /* ---- controlli ---- */
  function interact() {
    const h = nearHotspot(); if (!h) return;
    if (h.id === "door") showPanel("about"); // aggiorna anche il menu
    perform(h.act(), { restart: true });
  }
  function jump() { hop(-2.6); }
  window.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = true;
    else if (k === "ArrowRight" || k === "d" || k === "D") keys.right = true;
    else if (k === " ") { e.preventDefault(); if (!e.repeat) jump(); }
    else if ((k === "e" || k === "E") && !e.repeat) interact();
  });
  window.addEventListener("keyup", (e) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
    else if (k === " ") e.preventDefault();
  });
  window.addEventListener("blur", () => { keys.left = keys.right = false; });
  [["goLeft", "left"], ["goRight", "right"]].forEach(([id, k]) => {
    const el = document.getElementById(id);
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); keys[k] = true; });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => el.addEventListener(ev, () => { keys[k] = false; }));
  });
  document.getElementById("goJump").addEventListener("pointerdown", (e) => { e.preventDefault(); jump(); });
  document.getElementById("goAct").addEventListener("pointerdown", (e) => { e.preventDefault(); interact(); });

  // clic sulla scena: cammina o interagisci con gli oggetti
  function hotspotAt(sx_, sy_) { return HOTSPOTS.find((h) => sx_ >= h.bx[0] && sx_ <= h.bx[2] && sy_ >= h.bx[1] && sy_ <= h.bx[3]); }
  cv.addEventListener("click", (e) => {
    const [sx_, sy_] = screenToScene(e.clientX, e.clientY);
    const h = hotspotAt(sx_, sy_);
    if (h) { if (h.id === "door") showPanel("about"); perform(h.act(), { restart: true }); return; }
    endAct(); player.target = Math.max(MINX, Math.min(MAXX, sx_));
  });
  cv.addEventListener("pointermove", (e) => {
    const [sx_, sy_] = screenToScene(e.clientX, e.clientY);
    cv.style.cursor = hotspotAt(sx_, sy_) ? "pointer" : "default";
  });

  /* ================= INTERFACCIA ================= */
  const buttons = [...document.querySelectorAll("#menu button")];
  const PANEL_ACT = { profile: "profile", skills: "stats", about: "about", inventory: "inventory", facts: "facts", quiz: "quiz", vocab: "vocab", quest: "quest" };
  let current = 0;
  function showPanel(name) {
    const i = buttons.findIndex((b) => b.dataset.panel === name);
    if (i >= 0) show(i, false, false);
  }
  function show(i, sound, silent) {
    current = (i + buttons.length) % buttons.length;
    buttons.forEach((bt, n) => bt.classList.toggle("sel", n === current));
    const name = buttons[current].dataset.panel;
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "p-" + name));
    if (name === "skills") fillStats();
    if (name === "quiz" && !quiz.running) renderQuiz();
    if (name === "quest") renderQuest();
    if (sound) blip(660 + current * 70);
    if (!silent) {
      if (["profile", "skills", "about", "inventory"].includes(name)) setTimeout(() => award(name), 600);
      perform(PANEL_ACT[name], { hold: ["facts", "quiz", "vocab"].includes(name) });
    }
  }
  buttons.forEach((bt, i) => {
    bt.addEventListener("click", () => show(i, true));
    bt.addEventListener("mouseenter", () => { if (i !== current) show(i, true); });
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); show(current + 1, true); }
    else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); show(current - 1, true); }
  });

  // elementi che attivano le azioni (quest board, inventario, GitHub)
  document.querySelectorAll("[data-act]").forEach((el) => {
    const name = el.dataset.act;
    el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") perform(name, { hold: true }); });
    el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") release(name); });
    el.addEventListener("focus", () => { if (el.matches(":focus-visible")) perform(name, { hold: true }); });
    el.addEventListener("blur", () => release(name));
    el.addEventListener("click", () => { perform(name, { restart: true }); blip(740, 0.05); });
  });

  /* ---- skills ---- */
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

  /* ---- fun facts ---- */
  const unlocked = new Set();
  const factList = document.getElementById("factList"), found = document.getElementById("found");
  function renderFacts() {
    factList.innerHTML = FACTS.map((f, i) => unlocked.has(i)
      ? `<li class="open"><span>★</span>${f}</li>` : `<li class="locked"><span>?</span>??? keep talking</li>`).join("");
    found.textContent = `${unlocked.size}/${FACTS.length}`;
  }
  renderFacts();
  document.getElementById("btn").addEventListener("click", () => {
    if (!act || act.name !== "facts") perform("facts", { hold: true });
    const locked = FACTS.map((_, i) => i).filter((i) => !unlocked.has(i));
    const pool = locked.length ? locked : FACTS.map((_, i) => i);
    const i = pool[Math.floor(Math.random() * pool.length)];
    if (act && act.state === "walk") { act.state = "do"; act.t0 = nowT; act.endAt = Infinity; }
    say(FACTS[i], 26);
    if (!unlocked.has(i)) {
      unlocked.add(i); renderFacts(); burst(player.x, FOOT - 50, 10, "#ffe08a"); jingle([660, 880]);
      if (unlocked.size === FACTS.length) award("facts");
    }
    hop(-2);
  });

  /* ---- quiz ---- */
  const quizBox = document.getElementById("quizBox");
  const quiz = { i: 0, score: 0, answered: false, running: false, paid: false };
  function renderQuiz() {
    if (!quiz.running) {
      quizBox.innerHTML = `<p class="qintro">5 questions about me. Ready to play?</p><button type="button" class="action" id="qstart">▶ Start quiz</button>`;
      document.getElementById("qstart").addEventListener("click", () => { quiz.i = 0; quiz.score = 0; quiz.answered = false; quiz.running = true; blip(740); renderQuiz(); });
      return;
    }
    if (quiz.i >= QUIZ.length) {
      const s = quiz.score, msg = s === QUIZ.length ? "Perfect! You really know me." : s >= 3 ? "Great job! You know me quite well." : "Not bad! Play again to learn more about me.";
      quizBox.innerHTML = `<p class="qres">Score: <b>${s}/${QUIZ.length}</b></p><p class="qintro">${msg}</p><button type="button" class="action" id="qagain">▶ Play again</button>`;
      document.getElementById("qagain").addEventListener("click", () => { quiz.running = false; renderQuiz(); });
      if (!quiz.paid) { quiz.paid = true; addXP(s * 10, `Quiz score ${s}/${QUIZ.length}`); award("quiz"); }
      say(s === QUIZ.length ? "Perfect score! You're a pro." : "Thanks for playing!");
      if (s === QUIZ.length) { hop(); burst(player.x, FOOT - 50, 14, "#ffd34d"); }
      return;
    }
    const q = QUIZ[quiz.i];
    quizBox.innerHTML = `<p class="qhead">Question ${quiz.i + 1}/${QUIZ.length} · Score ${quiz.score}</p><p class="qtext">${q.q}</p>` +
      `<div class="qopts">${q.a.map((a, n) => `<button type="button" class="qopt" data-n="${n}">${a}</button>`).join("")}</div><p class="qfb" id="qfb"></p>`;
    quizBox.querySelectorAll(".qopt").forEach((b) => b.addEventListener("click", () => answer(Number(b.dataset.n))));
  }
  function answer(n) {
    if (quiz.answered) return;
    quiz.answered = true;
    const q = QUIZ[quiz.i], ok = n === q.c;
    if (ok) quiz.score++;
    quizBox.querySelectorAll(".qopt").forEach((b, idx) => { b.disabled = true; if (idx === q.c) b.classList.add("right"); else if (idx === n) b.classList.add("wrong"); });
    document.getElementById("qfb").innerHTML = `${ok ? "Correct!" : "Not quite."} ${q.fb} <button type="button" class="action small" id="qnext">${quiz.i === QUIZ.length - 1 ? "▶ See result" : "▶ Next"}</button>`;
    document.getElementById("qnext").addEventListener("click", () => { quiz.i++; quiz.answered = false; renderQuiz(); blip(700); });
    react(ok);
  }

  /* ---- tech words ---- */
  const vocabBox = document.getElementById("vocabBox"), vfound = document.getElementById("vfound");
  vocabBox.innerHTML = VOCAB.map((v, i) => `<div class="vcard" data-i="${i}">
      <button type="button" class="vhead" aria-expanded="false"><b>${v.w}</b><span>${v.ph}</span></button>
      <div class="vbody"><p>${v.d}</p><p class="ex">“${v.ex}”</p><button type="button" class="listen" data-w="${v.w}">♪ Listen</button></div></div>`).join("");
  vocabBox.querySelectorAll(".vcard").forEach((card) => {
    const i = Number(card.dataset.i), head = card.querySelector(".vhead");
    head.addEventListener("click", () => {
      const open = card.classList.toggle("open"); head.setAttribute("aria-expanded", String(open));
      blip(open ? 760 : 520, 0.05);
      if (open) {
        if (act && act.name === "vocab" && act.state === "do") say(`“${VOCAB[i].w}”: ${VOCAB[i].ex}`, 20);
        game.flipped.add(i); vfound.textContent = `${game.flipped.size}/${VOCAB.length}`;
        if (game.flipped.size === VOCAB.length) award("vocab");
      }
    });
    card.querySelector(".listen").addEventListener("click", (e) => { e.stopPropagation(); speak(VOCAB[i].w + ". " + VOCAB[i].ex); });
  });

  /* ---- avvio ---- */
  setHUD();
  show(0, false, true);
  setTimeout(() => { if (!act) perform("profile"); }, 700);
  setTimeout(() => toast(touchUI ? "Use the buttons to walk, jump and interact" : "Arrows walk · SPACE jumps · E interacts · click the pier"), 2200);
})();
