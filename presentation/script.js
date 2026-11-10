// ---- Quest 1: curiosità ----
const facts = [
  "Ho pubblicato libri su Amazon.",
  "Mi piace creare progetti web e sperimentare con nuove tecnologie.",
  "Ho un server Minecraft e sviluppo progetti legati al gaming."
];
let last = -1;
document.getElementById("btn").addEventListener("click", () => {
  let i;
  do { i = Math.floor(Math.random() * facts.length); } while (i === last);
  last = i;
  document.getElementById("fact").textContent = facts[i];
});

// ---- Quest 2: statistiche RPG ----
const stats = [
  ["HTML / CSS", 75],
  ["JavaScript", 65],
  ["PHP", 55],
  ["SQL", 50],
  ["Python", 35],
  ["Git / GitHub", 60],
  ["Sleep Resistance", 90]
];
const box = document.getElementById("stats");
stats.forEach(([name, value]) => {
  const row = document.createElement("div");
  row.className = "stat";
  row.innerHTML =
    `<div class="stat-top"><span>${name}</span><b>${value}%</b></div>` +
    `<div class="bar"><div class="fill" data-v="${value}"></div></div>`;
  box.appendChild(row);
});
const fills = document.querySelectorAll(".fill");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      fills.forEach((f) => (f.style.width = f.dataset.v + "%"));
      io.disconnect();
    }
  });
}, { threshold: 0.3 });
io.observe(box);

// ---- Quest 3: avatar 32x32 ----
const ctx = document.getElementById("avatar").getContext("2d");
const px = (c, x, y, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

const HAIR = "#6b4423", SKIN = "#f1c27d", BLACK = "#1a1a22", PANTS = "#2a2f3a";
const SHOE = "#f2f2f2", SOLE = "#7d8596", LAP = "#cfd6e4", SCREEN = "#16264d";

// capelli
px(HAIR, 11, 3, 10, 3); px(HAIR, 10, 5, 2, 5); px(HAIR, 20, 5, 2, 5); px(HAIR, 12, 6, 8, 2);
// viso
px(SKIN, 12, 8, 8, 5);
px("#111", 14, 9, 1, 2); px("#111", 17, 9, 1, 2);
px("#a0522d", 15, 12, 2, 1);
// collo
px(SKIN, 15, 13, 2, 1);
// felpa nera: cappuccio, busto, braccia
px(BLACK, 12, 14, 8, 1);
px(BLACK, 10, 14, 12, 8);
px(BLACK, 7, 15, 3, 6); px(BLACK, 22, 15, 3, 6);
px("#2c2c38", 15, 15, 2, 3); // cordini
// pantaloni
px(PANTS, 11, 22, 10, 6);
ctx.clearRect(15, 25, 2, 3);
// scarpe da ginnastica
px(SHOE, 10, 28, 6, 2); px(SHOE, 16, 28, 6, 2);
px(SOLE, 10, 30, 6, 1); px(SOLE, 16, 30, 6, 1);
// portatile in mano
px(LAP, 10, 16, 12, 6);
px(SCREEN, 11, 17, 10, 4);
px("#4ade80", 13, 18, 1, 2); px("#4ade80", 14, 19, 1, 1); px("#4ade80", 13, 20, 1, 1);
px("#38bdf8", 16, 18, 3, 1); px("#38bdf8", 16, 20, 2, 1);
px("#8a93a6", 9, 22, 14, 1);
// mani
px(SKIN, 8, 20, 2, 2); px(SKIN, 22, 20, 2, 2);
