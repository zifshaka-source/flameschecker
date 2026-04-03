const UI = {
  form: document.getElementById("flamesForm"),
  nameA: document.getElementById("nameA"),
  nameB: document.getElementById("nameB"),
  startBtn: document.getElementById("startBtn"),
  resetBtn: document.getElementById("resetBtn"),
  status: document.getElementById("status"),
  chipsA: document.getElementById("chipsA"),
  chipsB: document.getElementById("chipsB"),
  count: document.getElementById("count"),
  countSub: document.getElementById("countSub"),
  flames: document.getElementById("flames"),
  arenaSub: document.getElementById("arenaSub"),
  resultRow: document.getElementById("resultRow"),
  result: document.getElementById("result"),
  themeToggle: document.getElementById("themeToggle"),
  shareBtn: document.getElementById("shareBtn"),
  copyToast: document.getElementById("copyToast"),
  confettiCanvas: document.getElementById("confettiCanvas"),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#ff6b8a", "#f5a623", "#ffd166", "#c44569", "#ff9eb5", "#ffc14d", "#a855f7", "#22c55e"];

function launchConfetti() {
  const canvas = UI.confettiCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 120,
    w: 7 + Math.random() * 7,
    h: 3 + Math.random() * 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    vx: (Math.random() - 0.5) * 3.5,
    vy: 2 + Math.random() * 3.5,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.22,
    opacity: 1,
  }));

  let start = null;
  const DURATION = 3000;

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.angle += p.spin;
      if (elapsed > DURATION * 0.55) p.opacity = Math.max(0, p.opacity - 0.016);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      // Mix rectangles and circles for variety
      if (p.w > 11) {
        ctx.beginPath();
        ctx.arc(0, 0, p.h, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });

    if (elapsed < DURATION) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(frame);
}

// ─── Share ─────────────────────────────────────────────────────────────────────

let lastResultText = "";

function showToast(msg) {
  UI.copyToast.textContent = msg;
  UI.copyToast.classList.add("visible");
  setTimeout(() => UI.copyToast.classList.remove("visible"), 2400);
}

function shareResult() {
  if (!lastResultText) return;
  const text = `${lastResultText}\n🔥 Try Flamify → https://flamify-rho.vercel.app`;
  if (navigator.share) {
    navigator.share({ title: "My Flamify Result", text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text)
      .then(() => showToast("✅ Copied to clipboard!"))
      .catch(() => showToast("❌ Copy failed — try manually"));
  }
}

// ─── Core Logic ────────────────────────────────────────────────────────────────

function sanitizeName(raw) {
  return (raw || "").toLowerCase().replace(/[^a-z]/g, "");
}

function setStatus(text) {
  UI.status.textContent = text || "";
}

function clearStage() {
  UI.chipsA.innerHTML = "";
  UI.chipsB.innerHTML = "";
  UI.flames.innerHTML = "";
  UI.count.textContent = "—";
  UI.count.classList.remove("pulse");
  UI.countSub.textContent = "After removing common letters";
  UI.arenaSub.textContent = "Each round: count forward, remove one, rotate, repeat.";
  UI.resultRow.hidden = true;
  UI.resultRow.classList.remove("revealed");
  UI.result.innerHTML = "";
  lastResultText = "";
}

function renderChips(container, str) {
  container.innerHTML = "";
  for (let i = 0; i < str.length; i++) {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = str[i].toUpperCase();
    chip.dataset.char = str[i];
    chip.dataset.idx = String(i);
    chip.dataset.cancelled = "0";
    container.appendChild(chip);
  }
}

function renderFlames(letters, activeIndex = -1, removingIndex = -1) {
  UI.flames.innerHTML = "";
  letters.forEach((ch, idx) => {
    const el = document.createElement("div");
    el.className = "fl";
    el.textContent = ch;
    if (idx === activeIndex) el.classList.add("active");
    if (idx === removingIndex) el.classList.add("remove");
    UI.flames.appendChild(el);
  });
}

function getAvailableMatchChip(container, char) {
  const chips = Array.from(container.querySelectorAll(".chip"));
  for (const chip of chips) {
    if (chip.dataset.cancelled === "0" && chip.dataset.char === char) return chip;
  }
  return null;
}

async function animateCanceling(a, b) {
  renderChips(UI.chipsA, a);
  renderChips(UI.chipsB, b);

  const chipsA = Array.from(UI.chipsA.querySelectorAll(".chip"));
  let remainingB = b.split("");
  const cancelledA = new Set();

  for (let i = 0; i < a.length; i++) {
    const char = a[i];
    if (cancelledA.has(i)) continue;
    const matchIndex = remainingB.indexOf(char);
    if (matchIndex === -1) continue;

    const chipA = chipsA[i];
    const chipB = getAvailableMatchChip(UI.chipsB, char);
    if (!chipA || !chipB) continue;

    chipA.classList.add("match");
    chipB.classList.add("match");
    await sleep(170);

    chipA.classList.remove("match");
    chipB.classList.remove("match");
    chipA.classList.add("cancelled");
    chipB.classList.add("cancelled");
    chipA.dataset.cancelled = "1";
    chipB.dataset.cancelled = "1";

    remainingB.splice(matchIndex, 1);
    cancelledA.add(i);
    await sleep(90);
  }

  const remainingA = chipsA
    .filter((chip) => chip.dataset.cancelled === "0")
    .map((chip) => chip.dataset.char)
    .join("");

  const remainingBFinal = Array.from(UI.chipsB.querySelectorAll(".chip"))
    .filter((chip) => chip.dataset.cancelled === "0")
    .map((chip) => chip.dataset.char)
    .join("");

  return { remainingA, remainingB: remainingBFinal, count: remainingA.length + remainingBFinal.length };
}

function finalizeFlames(count) {
  let flames = ["F", "L", "A", "M", "E", "S"];
  while (flames.length > 1) {
    const index = (count % flames.length) - 1;
    if (index >= 0) {
      flames.splice(index, 1);
      flames = flames.slice(index).concat(flames.slice(0, index));
    } else {
      flames.pop();
    }
  }
  return flames[0];
}

function describeResult(letter) {
  switch (letter) {
    case "F": return { title: "Friends",   desc: "Good vibes and a strong, lasting bond.",       badge: "f", emoji: "🤝" };
    case "L": return { title: "Love",      desc: "Deep romantic connection and attraction.",      badge: "l", emoji: "❤️" };
    case "A": return { title: "Affection", desc: "Warm, caring and emotionally close.",           badge: "a", emoji: "🥰" };
    case "M": return { title: "Marriage",  desc: "Real commitment vibes — partner material.",     badge: "m", emoji: "💍" };
    case "E": return { title: "Enemies",   desc: "A chaotic match — handle with care.",           badge: "e", emoji: "⚡" };
    case "S": return { title: "Siblings",  desc: "Like family — playful and always protective.",  badge: "s", emoji: "🫂" };
    default:  return { title: "Unknown",   desc: "Try again with valid names.",                   badge: "f", emoji: "🤔" };
  }
}

async function animateFlamesElimination(count) {
  let letters = ["F", "L", "A", "M", "E", "S"];
  renderFlames(letters);
  await sleep(180);

  while (letters.length > 1) {
    const steps = count % letters.length === 0 ? letters.length : count % letters.length;
    setStatus(`Counting ${steps}…`);

    for (let i = 0; i < steps; i++) {
      renderFlames(letters, i % letters.length, -1);
      await sleep(120);
    }

    const removeIndex = (count % letters.length) - 1;
    const idx = removeIndex >= 0 ? removeIndex : letters.length - 1;
    UI.arenaSub.textContent = `Removing: ${letters[idx]} (count ${count}, ${letters.length} left)`;
    renderFlames(letters, -1, idx);
    await sleep(420);

    if (removeIndex >= 0) {
      letters.splice(removeIndex, 1);
      letters = letters.slice(removeIndex).concat(letters.slice(0, removeIndex));
    } else {
      letters.pop();
    }

    renderFlames(letters);
    await sleep(220);
  }

  setStatus("Done.");
  return letters[0];
}

// ─── Theme ─────────────────────────────────────────────────────────────────────

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("flamify_theme", theme); } catch {}
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("flamify_theme"); } catch {}
  if (saved === "light" || saved === "dark") { setTheme(saved); return; }
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  setTheme(prefersLight ? "light" : "dark");
}

// ─── Run ───────────────────────────────────────────────────────────────────────

let isRunning = false;

async function run() {
  if (isRunning) return;
  isRunning = true;

  UI.startBtn.disabled = true;
  UI.resetBtn.disabled = true;
  UI.nameA.disabled = true;
  UI.nameB.disabled = true;

  try {
    UI.resultRow.hidden = true;
    UI.resultRow.classList.remove("revealed");
    UI.result.innerHTML = "";
    setStatus("Preparing…");

    const rawA = UI.nameA.value.trim();
    const rawB = UI.nameB.value.trim();
    const a = sanitizeName(rawA);
    const b = sanitizeName(rawB);

    if (!a || !b) {
      setStatus("Please enter two valid names.");
      return;
    }

    clearStage();
    setStatus("Canceling letters…");
    const { remainingA, remainingB, count } = await animateCanceling(a, b);

    UI.count.textContent = String(count);
    UI.count.classList.add("pulse");
    const showA = remainingA ? `"${remainingA.toUpperCase()}"` : "—";
    const showB = remainingB ? `"${remainingB.toUpperCase()}"` : "—";
    UI.countSub.textContent = `${showA} + ${showB}`;

    await sleep(260);

    if (count === 0) {
      setStatus("All letters cancelled! Try different spellings.");
      return;
    }

    setStatus("Eliminating FLAMES…");
    const last = await animateFlamesElimination(count);
    const verified = finalizeFlames(count);
    const letter = last || verified;
    const info = describeResult(letter);

    lastResultText = `My FLAMES result: ${info.emoji} ${info.title} (${rawA} + ${rawB})`;

    UI.resultRow.hidden = false;
    void UI.resultRow.offsetWidth;
    UI.resultRow.classList.add("revealed");

    UI.result.innerHTML = `
      <div class="result-inner">
        <div class="badge ${info.badge}">${info.emoji}</div>
        <div class="result-text">
          <div class="result-title">${info.title}</div>
          <div class="result-desc">${info.desc}</div>
        </div>
      </div>
    `;

    setStatus(`${info.emoji} ${info.title}`);
    await sleep(220);
    launchConfetti();

  } finally {
    UI.startBtn.disabled = false;
    UI.resetBtn.disabled = false;
    UI.nameA.disabled = false;
    UI.nameB.disabled = false;
    isRunning = false;
  }
}

function resetAll() {
  if (isRunning) return;
  clearStage();
  setStatus("");
  UI.nameA.focus();
}

// ─── Events ────────────────────────────────────────────────────────────────────

UI.form.addEventListener("submit", (e) => { e.preventDefault(); run(); });
UI.resetBtn.addEventListener("click", resetAll);
UI.shareBtn.addEventListener("click", shareResult);
UI.themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

window.addEventListener("resize", () => {
  if (UI.confettiCanvas) {
    UI.confettiCanvas.width = window.innerWidth;
    UI.confettiCanvas.height = window.innerHeight;
  }
});

initTheme();
resetAll();