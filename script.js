let people = JSON.parse(localStorage.getItem("rizz_people") || "[]");
let focus = 0;
let editingIndex = null;

/* =========================
   NEXT MOVE LIBRARIES
   ========================= */

const NEXT_MOVES = {
  dating: {
    high: [
      "Plan a definite meet-up and set a time",
      "Call and lead the conversation confidently",
      "Introduce future plans casually",
      "Create a shared routine (calls, check-ins)",
      "Deepen emotional connection with meaningful talk",
      "Take initiative and surprise her",
      "Escalate intimacy naturally",
      "Reinforce exclusivity through actions",
      "Be decisive — leadership matters now",
      "Turn momentum into consistency"
    ],
    mid: [
      "Maintain consistent communication",
      "Share something personal today",
      "Keep conversations playful and warm",
      "Strengthen emotional safety",
      "Compliment effort, not looks",
      "Suggest light plans without pressure",
      "Mirror her energy calmly",
      "Avoid over-investing — stay balanced",
      "Show reliability",
      "Build familiarity steadily"
    ],
    low: [
      "Slow down and observe",
      "Reduce initiation slightly",
      "Focus on calm presence",
      "Let her invest a bit",
      "Avoid pressure or demands",
      "Stay polite and friendly",
      "Give space without disappearing",
      "Reset expectations",
      "Watch consistency before effort",
      "Protect your energy"
    ]
  },

  crush: {
    high: [
      "Send a friendly ‘thinking of you’ message",
      "Light flirt without expectations",
      "Ask an open-ended question",
      "Create curiosity through humor",
      "Compliment personality subtly",
      "Be present, not intense",
      "Invite conversation, not commitment",
      "Build emotional comfort",
      "Let attraction grow naturally",
      "Stay playful and relaxed"
    ],
    mid: [
      "Keep conversations light",
      "Respond warmly but briefly",
      "Let interest develop slowly",
      "Avoid forcing momentum",
      "Observe her engagement level",
      "Stay friendly and consistent",
      "Use humor more than flirting",
      "Create familiarity",
      "Be patient",
      "Don’t rush clarity"
    ],
    low: [
      "Reduce effort",
      "Observe from a distance",
      "Reply politely",
      "Do not chase",
      "Focus elsewhere",
      "Let time reveal interest",
      "Avoid emotional investment",
      "Keep it neutral",
      "Stay respectful",
      "Preserve self-worth"
    ]
  },

  pause: [
    "Give space and reset energy",
    "No action — focus on yourself",
    "Wait for initiative from her",
    "Detach emotionally",
    "Re-center priorities",
    "Silence can be strategic",
    "Protect your time",
    "Do nothing for now",
    "Let dynamics cool",
    "Observe without reacting"
  ]
};

/* =========================
   HELPERS
   ========================= */

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNextMove(person) {
  if (person.focus <= 20) {
    return pickRandom(NEXT_MOVES.pause);
  }

  if (person.status === "dating") {
    if (person.focus >= 80) return pickRandom(NEXT_MOVES.dating.high);
    if (person.focus >= 50) return pickRandom(NEXT_MOVES.dating.mid);
    return pickRandom(NEXT_MOVES.dating.low);
  }

  if (person.status === "crush") {
    if (person.focus >= 60) return pickRandom(NEXT_MOVES.crush.high);
    if (person.focus >= 30) return pickRandom(NEXT_MOVES.crush.mid);
    return pickRandom(NEXT_MOVES.crush.low);
  }

  return pickRandom(NEXT_MOVES.pause);
}

/* =========================
   CORE ELEMENTS
   ========================= */

const list = document.getElementById("peopleList");
const dashFocus = document.getElementById("dashFocus");
const dashPause = document.getElementById("dashPause");
const dashAction = document.getElementById("dashAction");

const focusValue = document.getElementById("focusValue");
const focusInput = document.querySelector('[name="focus"]');
const statusInput = document.querySelector('[name="status"]');

/* =========================
   FOCUS CONTROLS
   ========================= */

document.getElementById("plus").onclick = () => setFocus(focus + 10);
document.getElementById("minus").onclick = () => setFocus(focus - 10);

function setFocus(v) {
  focus = Math.max(0, Math.min(100, v));
  focusValue.textContent = focus + "%";
  focusInput.value = focus;
}

/* =========================
   STATUS BUTTONS
   ========================= */

document.querySelectorAll(".status-buttons button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".status-buttons button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    statusInput.value = btn.dataset.status;
  };
});

/* =========================
   RENDER
   ========================= */

function render() {
  list.innerHTML = "";

  const focusCandidates = people
    .filter(p =>
      (p.status === "dating" && p.focus > 80) ||
      (p.status === "crush" && p.focus > 60)
    )
    .sort((a, b) => b.focus - a.focus)
    .slice(0, 2);

  people.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";

    if (p.focus <= 20) card.classList.add("paused");
    else if (focusCandidates.includes(p)) card.classList.add("glow");

    card.innerHTML = `
      <strong>${p.name}</strong>
      <div class="sub">${p.status}</div>

      <div class="focus-bar">
        <div class="focus-fill" style="width:${p.focus}%"></div>
      </div>

      <div class="sub">${p.focus}% focus</div>

      <div class="advice">
        🧭 Next Move: ${p.nextMove || "—"}
      </div>

      <div class="card-actions">
        <button onclick="openEdit(${i})">Edit</button>
        <button onclick="removePerson(${i})">Remove</button>
      </div>
    `;

    list.appendChild(card);
  });

  dashFocus.textContent = focusCandidates.map(p => p.name).join(", ") || "—";
  dashPause.textContent = people.filter(p => p.focus <= 20).map(p => p.name).join(", ") || "—";

  if (focusCandidates[0]) {
    dashAction.textContent = focusCandidates[0].nextMove || "—";
  } else {
    dashAction.textContent = "Stay steady.";
  }

  localStorage.setItem("rizz_people", JSON.stringify(people));
}

/* =========================
   ADD (SAVE COUNTS)
   ========================= */

document.getElementById("addForm").onsubmit = e => {
  e.preventDefault();

  const person = {
    name: e.target.name.value.trim(),
    status: statusInput.value,
    focus,
    notes: e.target.notes.value,
    reminder: e.target.reminder.value,
    nextMove: null
  };

  person.nextMove = generateNextMove(person);

  people.push(person);

  e.target.reset();
  setFocus(0);
  render();
};

/* =========================
   EDIT (SAVE COUNTS)
   ========================= */

window.openEdit = i => {
  editingIndex = i;
  const p = people[i];

  editNameInput.value = p.name;
  editStatusSelect.value = p.status;
  editFocus.value = p.focus;
  editFocusValue.textContent = p.focus + "%";

  editModal.classList.remove("hidden");
};

saveEditBtn.onclick = () => {
  const p = people[editingIndex];

  p.name = editNameInput.value.trim();
  p.status = editStatusSelect.value;
  p.focus = parseInt(editFocus.value, 10);

  // ✅ regenerate next move ONLY on save
  p.nextMove = generateNextMove(p);

  editModal.classList.add("hidden");
  render();
};

window.removePerson = i => {
  people.splice(i, 1);
  render();
};

render();