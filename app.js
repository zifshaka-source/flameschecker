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
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function sanitizeName(raw) {
  return (raw || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
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
  UI.result.innerHTML = "";
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
    case "F":
      return { title: "Friends", desc: "Good vibes and strong friendship energy.", badge: "f" };
    case "L":
      return { title: "Love", desc: "Romantic connection and attraction.", badge: "l" };
    case "A":
      return { title: "Affection", desc: "Caring, warm, and emotionally close.", badge: "a" };
    case "M":
      return { title: "Marriage", desc: "Commitment vibes—partner material.", badge: "m" };
    case "E":
      return { title: "Enemies", desc: "A chaotic match—handle with care.", badge: "e" };
    case "S":
      return { title: "Siblings", desc: "Like family—playful and protective.", badge: "s" };
    default:
      return { title: "Unknown", desc: "Try again with valid names.", badge: "f" };
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
    UI.arenaSub.textContent = `Remove: ${letters[idx]} (count=${count}, size=${letters.length})`;
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

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("flames_theme", theme);
  } catch {
    // ignore
  }
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem("flames_theme");
  } catch {
    saved = null;
  }
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
    return;
  }
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(prefersLight ? "light" : "dark");
}

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
    UI.result.innerHTML = "";
    setStatus("Preparing…");

    const rawA = UI.nameA.value;
    const rawB = UI.nameB.value;
    const a = sanitizeName(rawA);
    const b = sanitizeName(rawB);

    if (!a || !b) {
      setStatus("Please enter two valid names (letters only).");
      return;
    }

    clearStage();
    setStatus("Canceling letters…");
    const { remainingA, remainingB, count } = await animateCanceling(a, b);

    UI.count.textContent = String(count);
    UI.count.classList.add("pulse");
    const showA = remainingA ? `“${remainingA.toUpperCase()}”` : "—";
    const showB = remainingB ? `“${remainingB.toUpperCase()}”` : "—";
    UI.countSub.textContent = `Remaining: ${showA} + ${showB}`;

    await sleep(260);

    if (count === 0) {
      setStatus("All letters cancelled. Try different names/spellings.");
      return;
    }

    setStatus("Eliminating FLAMES…");
    const last = await animateFlamesElimination(count);

    const verified = finalizeFlames(count);
    const letter = last || verified;

    const info = describeResult(letter);
    UI.resultRow.hidden = false;
    UI.result.innerHTML = `
      <div class="badge ${info.badge}" aria-hidden="true">${letter}</div>
      <div>
        <div class="result-title">${info.title}</div>
        <div class="result-desc">${info.desc}</div>
      </div>
    `;

    setStatus(`Result: ${info.title}`);
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

UI.form.addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});

UI.resetBtn.addEventListener("click", resetAll);

UI.themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

initTheme();
resetAll();
