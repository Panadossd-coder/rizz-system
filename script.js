document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("addForm");
  const list = document.getElementById("peopleList");

  const nameInput = document.getElementById("nameInput");
  const notesInput = document.getElementById("notesInput");
  const reminderInput = document.getElementById("reminderInput");

  const dashFocus = document.getElementById("dashFocus");
  const dashPause = document.getElementById("dashPause");
  const dashAction = document.getElementById("dashAction");

  const statusBtns = document.querySelectorAll(".status-btn");

  let selectedStatus = null;
  let focus = 0;

  // STATUS BUTTONS
  statusBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      statusBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedStatus = btn.dataset.status;
    });
  });

  // FOCUS CONTROLS
  document.getElementById("plus").onclick = () => {
    focus = Math.min(100, focus + 10);
    document.getElementById("focusValue").textContent = focus + "%";
  };

  document.getElementById("minus").onclick = () => {
    focus = Math.max(0, focus - 10);
    document.getElementById("focusValue").textContent = focus + "%";
  };

  // LOAD SAVED
  const saved = JSON.parse(localStorage.getItem("rizzPeople") || "[]");
  saved.forEach(addPersonCard);
  updateDashboard();

  // ADD PERSON
  form.addEventListener("submit", e => {
    e.preventDefault();

    if (!nameInput.value || !selectedStatus) return;

    const person = {
      name: nameInput.value,
      status: selectedStatus,
      focus,
      notes: notesInput.value,
      reminder: reminderInput.value
    };

    saved.push(person);
    localStorage.setItem("rizzPeople", JSON.stringify(saved));

    addPersonCard(person);
    updateDashboard();

    form.reset();
    focus = 0;
    document.getElementById("focusValue").textContent = "0%";
    statusBtns.forEach(b => b.classList.remove("active"));
    selectedStatus = null;
  });

  function addPersonCard(person) {
    const div = document.createElement("div");
    div.className = "person";

    div.innerHTML = `
      <strong>${person.name}</strong>
      <div>${person.status}</div>
      <div class="bar"><div style="width:${person.focus}%"></div></div>
      <div>${person.focus}% focus</div>
      ${person.reminder ? `<div>⏰ ${person.reminder}</div>` : ""}
      <button class="remove-btn">Remove</button>
    `;

    div.querySelector(".remove-btn").onclick = () => {
      const index = saved.indexOf(person);
      saved.splice(index, 1);
      localStorage.setItem("rizzPeople", JSON.stringify(saved));
      div.remove();
      updateDashboard();
    };

    list.appendChild(div);
  }

  function updateDashboard() {
    if (!saved.length) {
      dashFocus.textContent = "—";
      dashPause.textContent = "—";
      dashAction.textContent = "Add someone to begin.";
      return;
    }

    const sorted = [...saved].sort((a, b) => b.focus - a.focus);
    dashFocus.textContent = sorted[0]?.name || "—";

    const paused = saved.find(p => p.status === "pause");
    dashPause.textContent = paused ? paused.name : "—";

    dashAction.textContent =
      sorted[0].focus >= 70
        ? "High priority. Reach out."
        : "Keep balance.";
  }

});
