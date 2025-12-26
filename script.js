const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

const dashFocus = document.getElementById("dashFocus");
const dashPause = document.getElementById("dashPause");
const dashAction = document.getElementById("dashAction");

const focusValueEl = document.getElementById("focusValue");
const statusInput = form.status;
const focusInput = form.focus;

let focus = 0;
let people = JSON.parse(localStorage.getItem("rizz_people")) || [];

/* STATUS */
document.querySelectorAll(".status-buttons button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".status-buttons button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    statusInput.value = btn.dataset.status;
  };
});
document.querySelector('[data-status="crush"]').classList.add("active");

/* FOCUS */
document.getElementById("plus").onclick = () => { focus = Math.min(100, focus + 10); updateFocus(); };
document.getElementById("minus").onclick = () => { focus = Math.max(0, focus - 10); updateFocus(); };

function updateFocus() {
  focusValueEl.textContent = focus + "%";
  focusInput.value = focus;
}

/* ADVICE */
function adviceFor(f) {
  if (f >= 80) return "High priority. Reach out.";
  if (f >= 60) return "Good momentum.";
  if (f >= 30) return "Keep steady.";
  return "Low priority.";
}

/* DASHBOARD */
function updateDashboard() {
  if (!people.length) return;

  const paused = people.filter(p => p.focus <= 20);
  const focusPeople = people
    .filter(p => (p.status === "dating" && p.focus > 80) || (p.status === "crush" && p.focus > 60))
    .slice(0, 2);

  dashFocus.textContent = focusPeople.map(p => p.name).join(", ") || "—";
  dashPause.textContent = paused.map(p => p.name).join(", ") || "—";
  dashAction.textContent = focusPeople.length ? adviceFor(focusPeople[0].focus) : "Stay consistent.";
}

/* RENDER */
function render() {
  list.innerHTML = "";

  people.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = `card person ${p.focus <= 20 ? "paused" : ""}`;

    card.innerHTML = `
      <strong>${p.name}</strong>
      <div>${p.status}</div>
      <div class="focus-bar"><div class="focus-fill" style="width:${p.focus}%"></div></div>
      <div>${p.focus}% focus</div>
      ${p.reminder ? `<div>⏰ ${p.reminder}</div>` : ""}
      <div class="card-actions">
        <button onclick="openEdit(${i})">Edit</button>
        <button onclick="removePerson(${i})">Remove</button>
      </div>
    `;
    list.appendChild(card);
  });

  updateDashboard();
}

/* ADD */
form.onsubmit = e => {
  e.preventDefault();
  people.push({
    name: form.name.value.trim(),
    status: statusInput.value,
    focus,
    reminder: form.reminder.value.trim()
  });
  save(); render();
  form.reset();
  focus = 0;
  updateFocus();
};

/* STORAGE */
function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}
function removePerson(i) {
  people.splice(i, 1);
  save(); render();
}

/* EDIT (iOS SAFE) */
let editIndex = null;
const editModal = document.getElementById("editModal");
const editName = document.getElementById("editNameInput");
const editStatus = document.getElementById("editStatusSelect");
const editFocus = document.getElementById("editFocus");
const editFocusValue = document.getElementById("editFocusValue");

function openEdit(i) {
  editIndex = i;
  const p = people[i];
  editName.value = p.name;
  editStatus.value = p.status;
  editFocus.value = p.focus;
  editFocusValue.textContent = p.focus + "%";
  editModal.classList.remove("hidden");
}

editFocus.oninput = () => editFocusValue.textContent = editFocus.value + "%";

function closeEdit() {
  editModal.classList.add("hidden");

  // ✅ iOS repaint unlock
  requestAnimationFrame(() => {
    window.scrollBy(0, 1);
    window.scrollBy(0, -1);
  });

  editIndex = null;
}

function saveEdit() {
  const p = people[editIndex];
  p.name = editName.value.trim();
  p.status = editStatus.value;
  p.focus = parseInt(editFocus.value, 10);
  save(); render(); closeEdit();
}

/* INIT */
updateFocus();
render();