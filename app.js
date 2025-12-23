const STORAGE_KEY = "rizz_v1";
const FOCUS_LIMIT = 2;
const AUTO_FOCUS = 90;
const DECAY_STEP = 10;

const nameInput = document.getElementById("nameInput");
const addBtn = document.getElementById("addBtn");
const decayBtn = document.getElementById("decayBtn");
const container = document.getElementById("peopleContainer");
const alertBox = document.getElementById("alertBox");

let state = loadState();

/* ---------- helpers ---------- */
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    people: [],
    lastDecay: Date.now()
  };
}

function showAlert(msg){
  alertBox.textContent = msg;
  alertBox.classList.remove("hidden");
  setTimeout(()=>alertBox.classList.add("hidden"),1500);
}

/* ---------- core actions ---------- */
function addPerson(){
  const name = nameInput.value.trim();
  if(!name) return;

  const existing = state.people.find(p => p.name.toLowerCase() === name.toLowerCase());
  if(!existing){
    state.people.push({
      id: Date.now(),
      name,
      score: 0,
      focus:false,
      paused:false
    });
    showAlert("Added " + name);
  } else {
    showAlert("Updated " + name);
  }

  nameInput.value="";
  saveState();
  render();
}

function changeScore(id, delta){
  const p = state.people.find(p=>p.id===id);
  if(!p) return;

  p.score = Math.max(0, Math.min(100, p.score + delta));
  applyAutoFocus();
  saveState();
  render();
}

function toggleFocus(id){
  const focused = state.people.filter(p=>p.focus);
  const p = state.people.find(p=>p.id===id);

  if(p.focus){
    p.focus=false;
  } else {
    if(focused.length >= FOCUS_LIMIT){
      focused[0].focus=false;
    }
    p.focus=true;
  }

  saveState();
  render();
}

function applyAutoFocus(){
  state.people.forEach(p=>{
    if(p.score >= AUTO_FOCUS && !p.focus){
      toggleFocus(p.id);
    }
  });
}

function runDecay(){
  state.people.forEach(p=>{
    if(!p.focus && !p.paused){
      p.score = Math.max(0, p.score - DECAY_STEP);
    }
  });
  saveState();
  render();
  showAlert("Decay applied");
}

/* ---------- render ---------- */
function render(){
  container.innerHTML="";

  state.people.forEach(p=>{
    const card = document.createElement("div");
    card.className="card";

    card.innerHTML = `
      <div class="row">
        <strong>${p.name} — ${p.score}%</strong>
        ${p.focus ? `<span class="badge">FOCUS</span>` : ""}
      </div>

      <div class="progress">
        <div class="bar" style="width:${p.score}%"></div>
      </div>

      <div class="controls-row">
        <button class="action">-10</button>
        <button class="action">+10</button>
        <button class="action">${p.focus ? "Unfocus":"Focus"}</button>
        <button class="action danger">Delete</button>
      </div>
    `;

    const [minus, plus, focusBtn, del] = card.querySelectorAll("button");
    minus.onclick = ()=>changeScore(p.id,-10);
    plus.onclick = ()=>changeScore(p.id,10);
    focusBtn.onclick = ()=>toggleFocus(p.id);
    del.onclick = ()=>{
      state.people = state.people.filter(x=>x.id!==p.id);
      saveState(); render();
    };

    container.appendChild(card);
  });
}

/* ---------- events ---------- */
addBtn.onclick = addPerson;
decayBtn.onclick = runDecay;

render();