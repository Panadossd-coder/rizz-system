let people = [];
let selectedStatus = null;
let focus = 0;

const nameInput = document.getElementById("nameInput");
const notesInput = document.getElementById("notesInput");
const reminderInput = document.getElementById("reminderInput");
const list = document.getElementById("list");
const dashFocus = document.getElementById("dashFocus");
const dashPause = document.getElementById("dashPause");
const dashAction = document.getElementById("dashAction");
const focusValue = document.getElementById("focusValue");

document.querySelectorAll(".status-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedStatus = btn.dataset.status;
  });
});

document.getElementById("plus").onclick = () => {
  if (focus < 100) focus += 10;
  focusValue.textContent = focus + "%";
};

document.getElementById("minus").onclick = () => {
  if (focus > 0) focus -= 10;
  focusValue.textContent = focus + "%";
};

document.getElementById("addForm").addEventListener("submit", e => {
  e.preventDefault();

  if (!nameInput.value || !selectedStatus) return;

  people.push({
    name: nameInput.value,
    status: selectedStatus,
    focus,
    notes: notesInput.value,
    reminder: reminderInput.value
  });

  nameInput.value = "";
  notesInput.value = "";
  reminderInput.value = "";
  focus = 0;
  focusValue.textContent = "0%";
  selectedStatus = null;
  document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));

  render();
});

function render() {
  list.innerHTML = "";

  if (people.length === 0) {
    dashFocus.textContent = "—";
    dashPause.textContent = "—";
    dashAction.textContent = "Add someone to begin.";
    return;
  }

  const focusPerson = people.reduce((a, b) => b.focus > a.focus ? b : a);
  dashFocus.textContent = focusPerson.name;
  dashPause.textContent = people.find(p => p.status === "pause")?.name || "—";
  dashAction.textContent = focusPerson.focus >= 70 ? "High priority. Reach out." : "Keep it steady.";

  people.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "person";
    div.innerHTML = `
      <strong>${p.name}</strong><br>
      ${p.status}<br>
      ${p.focus}% focus<br>
      ${p.reminder ? "⏰ " + p.reminder : ""}
      <button class="remove">Remove</button>
    `;
    div.querySelector(".remove").onclick = () => {
      people.splice(i, 1);
      render();
    };
    list.appendChild(div);
  });
}
