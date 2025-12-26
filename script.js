/* ===============================
   RIZZ WEB — VERSION 2 (BASELINE)
   =============================== */

let people = JSON.parse(localStorage.getItem("rizz_people")) || [];
let focus = 0;
let editingIndex = null;

/* Elements */
const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

const dashFocus = document.getElementById("dashFocus");
const dashPause = document.getElementById("dashPause");
const dashAction = document.getElementById("dashAction");

const focusValueEl = document.getElementById("focusValue");
const focusInput = form.querySelector('[name="focus"]');
const statusInput = form.querySelector('[name="status"]');

/* Status buttons */
document.querySelectorAll(".status-buttons button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".status-buttons button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    statusInput.value = btn.dataset.status;
  };
});

/* Focus controls */
document.getElementById("plus").onclick = () => {
  focus = Math.min(100, focus + 10);
  updateFocus();
};
document.getElementById("minus").onclick = () => {
  focus = Math.max(0, focus - 10);
  updateFocus();
};

function updateFocus() {
  focusValueEl.textContent = focus + "%";
  focusInput.value = focus;
}

/* Simple next move */
function getNextMove(p) {
  if (p.status === "pause" || p.focus <= 20) return "Do nothing today";
  if (p.status === "dating" && p.focus >= 80) return "Plan a quality date";
  if (p.status === "crush" && p.focus >= 60) return "Flirt lightly";
  return "Keep it steady";
}

/* Dashboard */
function updateDashboard() {
  if (!people.length) {
    dashFocus.textContent = "—";
    dashPause.textContent = "—";
    dashAction.textContent = "Add someone to begin.";
    return;
  }

  const paused = people.filter(p => p.focus <= 20);
  const top = [...people].sort((a,b)=>b.focus-a.focus)[0];

  dashFocus.textContent = top ? top.name : "—";
  dashPause.textContent = paused.length ? paused.map(p=>p.name).join(", ") : "—";
  dashAction.textContent = top ? `${top.nextMove} — ${top.name}` : "Stay steady";
}

/* Render */
function render() {
  list.innerHTML = "";

  people.forEach((p,i) => {
    const card = document.createElement("div");
    card.className = "person";

    card.innerHTML = `
      <strong>${p.name}</strong>
      <div>${p.status}</div>

      <div class="focus-bar">
        <div class="focus-fill" style="width:${p.focus}%"></div>
      </div>

      <div>${p.focus}% focus</div>
      <div><strong>Next Move:</strong> ${p.nextMove}</div>

      <button onclick="openEdit(${i})">Edit</button>
      <button onclick="removePerson(${i})">Remove</button>
    `;

    list.appendChild(card);
  });

  updateDashboard();
}

/* Add */
form.onsubmit = e => {
  e.preventDefault();

  const p = {
    name: form.name.value.trim(),
    status: statusInput.value,
    focus,
    nextMove: ""
  };

  p.nextMove = getNextMove(p);
  people.push(p);

  save();
  render();

  form.reset();
  focus = 0;
  updateFocus();
};

/* Edit */
const editModal = document.getElementById("editModal");
const editName = document.getElementById("editName");
const editStatus = document.getElementById("editStatus");
const editFocus = document.getElementById("editFocus");
const editFocusValue = document.getElementById("editFocusValue");

function openEdit(i) {
  editingIndex = i;
  const p = people[i];

  editName.value = p.name;
  editStatus.value = p.status;
  editFocus.value = p.focus;
  editFocusValue.textContent = p.focus + "%";

  editModal.classList.remove("hidden");
}

editFocus.oninput = () => {
  editFocusValue.textContent = editFocus.value + "%";
};

function saveEdit() {
  const p = people[editingIndex];
  p.name = editName.value.trim();
  p.status = editStatus.value;
  p.focus = parseInt(editFocus.value,10);
  p.nextMove = getNextMove(p);

  save();
  render();
  closeEdit();
}

function closeEdit() {
  editModal.classList.add("hidden");
  editingIndex = null;
}

/* Remove */
function removePerson(i) {
  people.splice(i,1);
  save();
  render();
}

/* Storage */
function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

/* Init */
updateFocus();
render();