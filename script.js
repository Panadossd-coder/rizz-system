const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

const dashFocus = document.getElementById("dashFocus");
const dashPause = document.getElementById("dashPause");
const dashAction = document.getElementById("dashAction");

const focusValueEl = document.getElementById("focusValue");
const statusInput = form.querySelector('[name="status"]');
const focusInput = form.querySelector('[name="focus"]');

let focus = 0;
let people = JSON.parse(localStorage.getItem("rizz_people")) || [];

/* CLICK SOUND */
const clickSound = document.getElementById("clickSound");
document.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn || !clickSound) return;
  clickSound.currentTime = 0;
  clickSound.volume = 0.35;
  clickSound.play().catch(()=>{});
});

/* STATUS BUTTONS */
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

/* ADD */
form.onsubmit = e => {
  e.preventDefault();
  const name = form.name.value.trim();
  if (!name) return;

  people.push({
    name,
    status: statusInput.value,
    focus
  });

  save();
  render();
  form.reset();
  focus = 0;
  updateFocus();
};

/* RENDER */
function render() {
  list.innerHTML = "";
  people.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card person";
    card.innerHTML = `
      <strong>${p.name}</strong><br>
      <span class="sub">${p.status}</span>
      <div class="focus-bar"><div class="focus-fill" style="width:${p.focus}%"></div></div>
      <div class="sub">${p.focus}% focus</div>
      <div class="card-actions">
        <button onclick="removePerson(${i})">Remove</button>
      </div>
    `;
    list.appendChild(card);
  });
  updateDashboard();
}

function updateDashboard() {
  if (!people.length) {
    dashFocus.textContent = "—";
    dashPause.textContent = "—";
    dashAction.textContent = "Add someone to begin.";
    return;
  }
  const top = [...people].sort((a,b)=>b.focus-a.focus)[0];
  dashFocus.textContent = top.name;
  dashAction.textContent = "Stay consistent.";
}

function removePerson(i) {
  people.splice(i,1);
  save();
  render();
}

function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

/* INIT */
updateFocus();
render();