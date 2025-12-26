/* ===============================
   RIZZ WEB — VERSION 2.1
   CLEAN, STABLE, EDIT FIXED
   =============================== */

/* ---------- STORAGE ---------- */
let people = JSON.parse(localStorage.getItem("rizz_people")) || [];
let focus = 0;
let editingIndex = null;

/* ---------- ELEMENTS ---------- */
const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

const dashFocus = document.getElementById("dashFocus");
const dashPause = document.getElementById("dashPause");
const dashAction = document.getElementById("dashAction");

const focusValueEl = document.getElementById("focusValue");
const focusInput = form.querySelector('[name="focus"]');
const statusInput = form.querySelector('[name="status"]');

/* ---------- STATUS BUTTONS ---------- */
document.querySelectorAll(".status-buttons button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".status-buttons button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    statusInput.value = btn.dataset.status;
  };
});
document.querySelector('[data-status="crush"]').classList.add("active");

/* ---------- FOCUS CONTROLS ---------- */
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

/* ===============================
   NEXT MOVE ENGINE (EXPANDED)
   =============================== */

const datingHigh = [
  "Plan a quality date this week",
  "Deep conversation about direction",
  "Talk about future goals together",
  "Strengthen emotional safety",
  "Create shared routines",
  "Surprise her with thoughtful effort",
  "Discuss exclusivity",
  "Spend uninterrupted time together"
];

const datingMid = [
  "Check in emotionally",
  "Light call or voice note",
  "Support her plans",
  "Be consistent but calm",
  "Flirty but relaxed conversation",
  "Let things flow naturally"
];

const datingLow = [
  "Give space today",
  "No heavy talks",
  "Minimal check-in",
  "Focus on yourself",
  "Observe energy"
];

const crushHigh = [
  "Compliment her vibe",
  "Flirt confidently",
  "Suggest a casual meet",
  "Build attraction playfully",
  "Create intrigue"
];

const crushMid = [
  "Send a fun message",
  "Light teasing",
  "Stay interesting",
  "React to her energy"
];

const crushLow = [
  "Pull back slightly",
  "Let her miss you",
  "Respond only",
  "Do nothing today"
];

const pauseMoves = [
  "Do nothing today",
  "No contact",
  "Reset emotional energy",
  "Focus on yourself"
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getNextMove(p) {
  if (p.status === "pause" || p.focus <= 20) return pick(pauseMoves);

  if (p.status === "dating") {
    if (p.focus >= 80) return pick(datingHigh);
    if (p.focus >= 50) return pick(datingMid);
    return pick(datingLow);
  }

  if (p.status === "crush") {
    if (p.focus >= 60) return pick(crushHigh);
    if (p.focus >= 30) return pick(crushMid);
    return pick(crushLow);
  }

  return "No action today";
}

/* ===============================
   DASHBOARD
   =============================== */
function updateDashboard() {
  if (!people.length) {
    dashFocus.textContent = "—";
    dashPause.textContent = "—";
    dashAction.textContent = "Add someone to begin.";
    return;
  }

  const paused = people.filter(p => p.focus <= 20);
  const focused = people
    .filter(p =>
      (p.status === "dating" && p.focus >= 80) ||
      (p.status === "crush" && p.focus >= 60)
    )
    .sort((a, b) => b.focus - a.focus)
    .slice(0, 2);

  dashFocus.textContent = focused.length
    ? focused.map(p => p.name).join(", ")
    : "—";

  dashPause.textContent = paused.length
    ? paused.map(p => p.name).join(", ")
    : "—";

  dashAction.textContent = focused.length
    ? `${focused[0].nextMove} — ${focused[0].name}`
    : "Stay steady.";
}

/* ===============================
   RENDER
   =============================== */
function render() {
  list.innerHTML = "";

  people.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card person";
    if (p.focus <= 20) card.classList.add("paused");

    card.innerHTML = `
      <strong>${p.name}</strong>
      <div>${p.status}</div>
      <div class="focus-bar">
        <div class="focus-fill" style="width:${p.focus}%"></div>
      </div>
      <div>${p.focus}% focus</div>
      <div><strong>Next Move:</strong> ${p.nextMove}</div>
      <div class="card-actions">
        <button onclick="openEdit(${i})">Edit</button>
        <button onclick="removePerson(${i})">Remove</button>
      </div>
    `;
    list.appendChild(card);
  });

  updateDashboard();
}

/* ===============================
   ADD PERSON
   =============================== */
form.onsubmit = e => {
  e.preventDefault();

  const p = {
    name: form.name.value.trim(),
    status: statusInput.value,
    focus,
    notes: form.notes.value.trim(),
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
};

/* ===============================
   EDIT (FIXED IDS)
   =============================== */
function openEdit(i) {
  editingIndex = i;
  const p = people[i];

  document.getElementById("editName").value = p.name;
  document.getElementById("editStatus").value = p.status;
  document.getElementById("editFocus").value = p.focus;
  document.getElementById("editFocusValue").textContent = p.focus + "%";

  document.getElementById("editModal").classList.remove("hidden");
}

document.getElementById("editFocus").oninput = e => {
  document.getElementById("editFocusValue").textContent = e.target.value + "%";
};

function saveEdit() {
  const p = people[editingIndex];

  p.name = document.getElementById("editName").value.trim();
  p.status = document.getElementById("editStatus").value;
  p.focus = parseInt(document.getElementById("editFocus").value, 10);
  p.nextMove = getNextMove(p);

  save();
  render();
  closeEdit();
}

function closeEdit() {
  document.getElementById("editModal").classList.add("hidden");
  editingIndex = null;
}

/* ===============================
   REMOVE
   =============================== */
function removePerson(i) {
  people.splice(i, 1);
  save();
  render();
}

/* ===============================
   SAVE
   =============================== */
function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

/* ===============================
   INIT
   =============================== */
updateFocusUI();
render();