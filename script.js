document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("addForm");
  const list = document.getElementById("peopleList");

  const dashFocus = document.getElementById("dashFocus");
  const dashPause = document.getElementById("dashPause");
  const dashAction = document.getElementById("dashAction");

  const statusBtns = document.querySelectorAll(".status-btn");
  let selectedStatus = null;

  const focusValue = document.getElementById("focusValue");
  let focus = 0;

  function load() {
    const data = JSON.parse(localStorage.getItem("rizz")) || [];
    list.innerHTML = "";
    data.forEach(addCard);
    updateDashboard(data);
  }

  function save(data) {
    localStorage.setItem("rizz", JSON.stringify(data));
  }

  statusBtns.forEach(btn => {
    btn.onclick = () => {
      statusBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedStatus = btn.dataset.status;
    };
  });

  document.getElementById("plus").onclick = () => {
    focus = Math.min(100, focus + 10);
    focusValue.textContent = focus + "%";
  };

  document.getElementById("minus").onclick = () => {
    focus = Math.max(0, focus - 10);
    focusValue.textContent = focus + "%";
  };

  form.onsubmit = e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    if (!name || !selectedStatus) return;

    const entry = {
      name,
      status: selectedStatus,
      focus,
      notes: document.getElementById("notes").value,
      reminder: document.getElementById("reminder").value
    };

    const data = JSON.parse(localStorage.getItem("rizz")) || [];
    data.push(entry);
    save(data);

    addCard(entry);
    updateDashboard(data);

    form.reset();
    focus = 0;
    focusValue.textContent = "0%";
    selectedStatus = null;
    statusBtns.forEach(b => b.classList.remove("active"));
  };

  function addCard(p) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${p.name}</strong><br>
      ${p.status}<br>
      ${p.focus}% focus<br>
      ${p.reminder ? "⏰ " + p.reminder : ""}
      <br><br>
      <button>Remove</button>
    `;
    div.querySelector("button").onclick = () => {
      let data = JSON.parse(localStorage.getItem("rizz")) || [];
      data = data.filter(x => x !== p);
      save(data);
      load();
    };
    list.appendChild(div);
  }

  function updateDashboard(data) {
    if (!data.length) {
      dashFocus.textContent = "—";
      dashPause.textContent = "—";
      dashAction.textContent = "Add someone to begin.";
      return;
    }

    const focusOne = [...data].sort((a,b)=>b.focus-a.focus)[0];
    dashFocus.textContent = focusOne.name;
    dashAction.textContent = focusOne.focus >= 70 ? "High priority. Reach out." : "Keep balance.";

    const paused = data.find(p=>p.status==="pause");
    dashPause.textContent = paused ? paused.name : "—";
  }

  load();
});
