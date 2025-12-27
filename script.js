/* =========================
   Rizz Web — Version 2
   Stable Core + Next Move
   ========================= */

/* ---------- OPTIONAL CLICK SOUND ---------- */
const clickSound = document.getElementById("clickSound");
document.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn || !clickSound) return;
  try {
    clickSound.currentTime = 0;
    clickSound.volume = 0.35;
    clickSound.play().catch(() => {});
  } catch (e) {}
});

/* ---------- CORE ELEMENTS ---------- */
const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

const dashFocus = document.getElementById("dashFocus");
const dashPause = document.getElementById("dashPause");
const dashAction = document.getElementById("dashAction");

const focusValueEl = document.getElementById("focusValue");
const statusInput = form.querySelector('[name="status"]');
const focusInput = form.querySelector('[name="focus"]');

/* ---------- STATE ---------- */
let focus = 0;
let people = JSON.parse(localStorage.getItem("rizz_people")) || [];
let editingIndex = null;
let selectedStatus = "crush";

/* =========================
   STATUS BUTTONS
   ========================= */
document.querySelectorAll(".status-buttons button").forEach(btn => {
  btn.onclick = () => {
    document
      .querySelectorAll(".status-buttons button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedStatus = btn.dataset.status;
  };
});

const defaultBtn = document.querySelector('[data-status="crush"]');
if (defaultBtn) defaultBtn.classList.add("active");

/* =========================
   FOCUS CONTROLS
   ========================= */
document.getElementById("plus").onclick = () => {
  focus = Math.min(100, focus + 10);
  updateFocusUI();
};

document.getElementById("minus").onclick = () => {
  focus = Math.max(0, focus - 10);
  updateFocusUI();
};

function updateFocusUI() {
  focusValueEl.textContent = focus + "%";
  focusInput.value = focus;
}

/* =========================
   NEXT MOVE ENGINE
   ========================= */
const NEXT_MOVES = {
  dating: {
    high: [
      "Plan a quality date this week",
      "Deep conversation about direction",
      "Discuss future goals",
      "Create a shared routine",
      "Reinforce emotional security"
    ],
    mid: [
      "Keep consistency without pressure",
      "Check in emotionally",
      "Casual call or voice note",
      "Support her plans",
      "Let things flow naturally"
    ],
    low: [
      "Give space today",
      "Respond but don’t push",
      "Avoid heavy conversations",
      "Focus on yourself today",
      "Do nothing today"
    ]
  },
  crush: {
    high: [
      "Flirt confidently",
      "Compliment her vibe",
      "Suggest a casual meet",
      "Build playful tension",
      "Move things forward"
    ],
    mid: [
      "Light teasing",
      "Keep mystery",
      "Stay consistent",
      "Casual check-in",
      "Let her invest"
    ],
    low: [
      "Pull back slightly",
      "Observe from distance",
      "No chasing",
      "Minimal interaction",
      "Stay silent today"
    ]
  },
  pause: [
    "Do nothing today",
    "No contact",
    "Reset emotional energy",
    "Focus on yourself",
    "Wait and observe"
  ]
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getNextMove(p) {
  if (p.status === "pause" || parseInt(p.focus, 10) <= 20) {
    return pickRandom(NEXT_MOVES.pause);
  }

  if (p.status === "dating") {
    if (p.focus >= 80) return pickRandom(NEXT_MOVES.dating.high);
    if (p.focus >= 40) return pickRandom(NEXT_MOVES.dating.mid);
    return pickRandom(NEXT_MOVES.dating.low);
  }

  if (p.status === "crush") {
    if (p.focus >= 60) return pickRandom(NEXT_MOVES.crush.high);
    if (p.focus >= 30) return pickRandom(NEXT_MOVES.crush.mid);
    return pickRandom(NEXT_MOVES.crush.low);
  }

  return "Stay steady.";
}

/* =========================
   DASHBOARD
   ========================= */
function updateDashboard() {
  if (!people.length) {
    dashFocus.textContent = "—";
    dashPause.textContent = "—";
    dashAction.textContent = "Add someone to begin.";
    return;
  }

  const paused = people.filter(p => parseInt(p.focus, 10) <= 20);

  const candidates = people
    .filter(p =>
      (p.status === "dating" && p.focus >= 80) ||
      (p.status === "crush" && p.focus >= 60)
    )
    .sort((a, b) => b.focus - a.focus)
    .slice(0, 2);

  dashFocus.textContent = candidates.length
    ? candidates.map(p => p.name).join(", ")
    : "—";

  dashPause.textContent = paused.length
    ? paused.map(p => p.name).join(", ")
    : "—";

  dashAction.textContent = candidates.length
    ? `${candidates[0].nextMove} — ${candidates[0].name}`
    : "Stay steady.";
}

/* =========================
   SMART NOTES (V2.2)
   ========================= */
const SMART_NOTE_KEYWORDS = {
  met: 15,
  called: 8,
  "she initiated": 12,
  kissed: 20,
  chatted: 4,
  ignored: -12,
  "no reply": -8,
  argued: -15,
  "dry reply": -6,
  "sent money": -5
};

const SMART_NOTE_TAGS = {
  "#met": 15,
  "#call": 8,
  "#initiated": 12,
  "#ignored": -12,
  "#argued": -15
};

const SMART_MAX_DELTA = 30;
const SMART_MIN_APPLY_THRESHOLD = 3;

function normalizeText(s) {
  return String(s || "").toLowerCase().replace(/[.,;!]/g, " ");
}

function computeNoteDelta(notes, person) {
  if (!notes) return 0;
  const text = normalizeText(notes);
  let total = 0;

  Object.keys(SMART_NOTE_KEYWORDS).forEach(k => {
    const re = new RegExp("\\b" + k.replace(/\s+/g, "\\s+") + "\\b", "gi");
    const count = (text.match(re) || []).length;
    if (count) {
      const base = SMART_NOTE_KEYWORDS[k];
      const multiplier = Math.max(0.3, 1 - 0.25 * (count - 1));
      total += Math.round(base * multiplier);
    }
  });

  Object.keys(SMART_NOTE_TAGS).forEach(tag => {
    const count = (text.match(new RegExp(tag, "gi")) || []).length;
    total += SMART_NOTE_TAGS[tag] * count;
  });

  if (person.status === "dating") total = Math.round(total * 0.6);
  if (person.status === "pause") total = Math.round(total * 0.25);

  return Math.max(-SMART_MAX_DELTA, Math.min(SMART_MAX_DELTA, total));
}

function formatDelta(delta) {
  if (!delta) return "Suggested: —";
  return `Suggested: ${delta > 0 ? "+" : ""}${delta}`;
}

function applyDelta(p, delta) {
  p.focus = Math.max(0, Math.min(100, p.focus + delta));
}

/* =========================
   RENDER
   ========================= */
function escapeHtml(s) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function render() {
  list.innerHTML = "";

  const glowSet = new Set(
    people
      .filter(p =>
        (p.status === "dating" && p.focus >= 80) ||
        (p.status === "crush" && p.focus >= 60)
      )
      .sort((a,b)=>b.focus-a.focus)
      .slice(0, 2)
      .map(p => p.name)
  );

  people.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = `card person ${
      p.focus <= 20 ? "paused" : glowSet.has(p.name) ? "glow" : ""
    }`;

    card.innerHTML = `
      <strong>${escapeHtml(p.name)}</strong>
      <span class="sub">${escapeHtml(p.status)}</span>

      <div class="focus-bar">
        <div class="focus-fill" style="width:${p.focus}%"></div>
      </div>
      <div class="sub">${p.focus}% focus</div>

      <div class="advice"><strong>Next Move:</strong> ${escapeHtml(p.nextMove)}</div>

      <div class="card-actions">
        <button type="button" onclick="openEdit(${i})">Edit</button>
        <button type="button" onclick="removePerson(${i})">Remove</button>
      </div>
    `;
    list.appendChild(card);
  });

  updateDashboard();
}

/* =========================
   ADD PERSON
   ========================= */
form.onsubmit = e => {
  e.preventDefault();

  const name = form.name.value.trim();
  if (!name) return;

  const p = {
    name,
    status: selectedStatus,
    focus,
    notes: "",
    reminder: form.reminder.value.trim(),
    nextMove: ""
  };

  p.nextMove = getNextMove(p);
  people.push(p);

  save();
  render();

  form.reset();
  focus = 0;
  updateFocusUI();
  selectedStatus = "crush";
};

/* =========================
   EDIT MODAL
   ========================= */
const editModal = document.getElementById("editModal");
const editNameInput = document.getElementById("editNameInput");
const editStatusSelect = document.getElementById("editStatusSelect");
const editFocus = document.getElementById("editFocus");
const editFocusValue = document.getElementById("editFocusValue");

function openEdit(i) {
  editingIndex = i;
  const p = people[i];

  editNameInput.value = p.name;
  editStatusSelect.value = p.status;
  editFocus.value = p.focus;
  editFocusValue.textContent = p.focus + "%";

  const editNotes = document.getElementById("editNotes");
  const smartSuggestion = document.getElementById("smartSuggestion");
  const applySmartNotes = document.getElementById("applySmartNotes");

  editNotes.value = p.notes || "";
  applySmartNotes.checked = false;
  smartSuggestion.textContent = formatDelta(computeNoteDelta(editNotes.value, p));

  editNotes.oninput = () => {
    smartSuggestion.textContent = formatDelta(
      computeNoteDelta(editNotes.value, { status: editStatusSelect.value })
    );
  };

  editModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

editFocus.oninput = () => {
  editFocusValue.textContent = editFocus.value + "%";
};

function closeEdit() {
  editModal.classList.add("hidden");
  document.body.style.overflow = "";
  editingIndex = null;
}

function saveEdit() {
  if (editingIndex === null) return;

  const p = people[editingIndex];
  p.name = editNameInput.value.trim();
  p.status = editStatusSelect.value;
  p.focus = parseInt(editFocus.value, 10) || 0;

  const editNotes = document.getElementById("editNotes");
  const applySmartNotes = document.getElementById("applySmartNotes");
  const delta = computeNoteDelta(editNotes.value, p);

  p.notes = editNotes.value.trim();

  if (applySmartNotes.checked && Math.abs(delta) >= SMART_MIN_APPLY_THRESHOLD) {
    applyDelta(p, delta);
  }

  p.nextMove = getNextMove(p);

  save();
  render();
  closeEdit();
}

/* =========================
   REMOVE / SAVE
   ========================= */
function removePerson(i) {
  people.splice(i, 1);
  save();
  render();
}

function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

/* =========================
   INIT
   ========================= */
updateFocusUI();
render();