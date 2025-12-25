document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("addForm");
  const list = document.getElementById("peopleList");

  const focusDisplay = document.getElementById("focusDisplay");
  const plusBtn = document.getElementById("focusPlus");
  const minusBtn = document.getElementById("focusMinus");

  const statusButtons = document.querySelectorAll(".status-btn");

  let people = JSON.parse(localStorage.getItem("rizz_people")) || [];

  let currentFocus = 0;
  let currentStatus = "";

  // ---------- HELPERS ----------
  function save() {
    localStorage.setItem("rizz_people", JSON.stringify(people));
  }

  function isUrgent(text) {
    if (!text) return false;
    const t = text.toLowerCase();
    return t.includes("today") || t.includes("tonight") || t.includes("now");
  }

  function getAdvice(p) {
    if (p.reminder) return "You have something scheduled — handle this first.";
    if (p.focus >= 70 && p.status === "dating") return "High priority. Call or see them soon.";
    if (p.focus >= 70 && p.status === "crush") return "Build momentum. Light flirting works.";
    if (p.focus < 40) return "Low priority. Do not over-invest.";
    if (p.status === "pause") return "Give space. Let them come to you.";
    return "Keep it steady.";
  }

  // ---------- DASHBOARD ----------
  function updateDashboard() {
    const dashFocus = document.getElementById("dashFocus");
    const dashPause = document.getElementById("dashPause");
    const dashAction = document.getElementById("dashAction");

    if (!people.length) {
      dashFocus.textContent = "—";
      dashPause.textContent = "—";
      dashAction.textContent = "Add someone to begin.";
      return;
    }

    const sorted = [...people].sort((a, b) => b.focus - a.focus);

    const focusPerson = sorted.find(p => p.focus >= 70);
    const pausePerson = sorted.find(p => p.focus < 40);

    dashFocus.textContent = focusPerson ? focusPerson.name : "No high focus";
    dashPause.textContent = pausePerson ? pausePerson.name : "—";

    if (focusPerson?.reminder) {
      dashAction.textContent = `Reminder: ${focusPerson.reminder}`;
    } else if (focusPerson) {
      dashAction.textContent = getAdvice(focusPerson);
    } else {
      dashAction.textContent = "Maintain balance.";
    }
  }

  // ---------- RENDER ----------
  function render() {
    list.innerHTML = "";

    if (!people.length) {
      list.innerHTML = `<div class="card sub">No entries yet</div>`;
      updateDashboard();
      return;
    }

    people.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "card";

      if (p.focus < 40) card.classList.add("low-focus");
      if (p.focus >= 70) card.classList.add("high-focus");
      if (isUrgent(p.reminder)) card.classList.add("urgent");

      card.innerHTML = `
        <strong>${p.name}</strong><br>
        <span class="sub">${p.status}</span>

        <div class="focus-wrap">
          <div class="focus-bar">
            <div class="focus-fill" style="width:${p.focus}%"></div>
          </div>
          <div class="sub">${p.focus}% focus</div>
        </div>

        ${p.reminder ? `<div class="reminder">⏰ ${p.reminder}</div>` : ""}
        <div class="advice">${getAdvice(p)}</div>

        <button class="remove">Remove</button>
      `;

      card.querySelector(".remove").addEventListener("click", () => {
        people.splice(i, 1);
        save();
        render();
      });

      list.appendChild(card);
    });

    updateDashboard();
  }

  // ---------- STATUS BUTTONS ----------
  statusButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      statusButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      currentStatus = btn.dataset.value;
    });
  });

  // ---------- FOCUS BUTTONS ----------
  function updateFocus(val) {
    currentFocus = Math.max(0, Math.min(100, val));
    focusDisplay.textContent = `${currentFocus}%`;
  }

  plusBtn.addEventListener("click", () => updateFocus(currentFocus + 10));
  minusBtn.addEventListener("click", () => updateFocus(currentFocus - 10));

  updateFocus(0);

  // ---------- ADD ----------
  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = form.name.value.trim();
    const notes = form.notes.value.trim();
    const reminder = form.reminder.value.trim();

    if (!name || !currentStatus) {
      alert("Enter name and select status");
      return;
    }

    people.push({
      name,
      status: currentStatus,
      focus: currentFocus,
      notes,
      reminder
    });

    save();
    render();

    // reset
    form.reset();
    currentStatus = "";
    statusButtons.forEach(b => b.classList.remove("selected"));
    updateFocus(0);
  });

  render();

});
