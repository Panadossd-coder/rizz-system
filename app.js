const MAX_FOCUS = 2;
const AUTO_FOCUS_AT = 90;
const STORAGE = "rizz_v1_clean";

const nameInput = document.getElementById("nameInput");
const addBtn = document.getElementById("addBtn");
const decayBtn = document.getElementById("decayBtn");
const peopleDiv = document.getElementById("people");

let state = JSON.parse(localStorage.getItem(STORAGE)) || [];

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function render() {
  peopleDiv.innerHTML = "";

  state.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "header";
    header.innerHTML = `
      <strong>${p.name} — ${p.score}%</strong>
      ${p.focus ? `<span class="focus">FOCUS</span>` :
        `<span class="status">${p.paused ? "PAUSED" : "ACTIVE"}</span>`}
    `;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `<div class="fill" style="width:${p.score}%"></div>`;

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.innerHTML = `
      <button data-act="minus">-10</button>
      <button data-act="plus">+10</button>
      <button data-act="focus">${p.focus ? "Unfocus" : "Focus"}</button>
      <button data-act="pause">${p.paused ? "Active" : "Pause"}</button>
      <button data-act="delete" class="danger">Delete</button>
    `;

    actions.onclick = e => {
      const act = e.target.dataset.act;
      if (!act) return;

      if (act === "minus") p.score = clamp(p.score - 10);
      if (act === "plus") p.score = clamp(p.score + 10);
      if (act === "delete") {
        state = state.filter(x => x !== p);
      }
      if (act === "pause") {
        p.paused = !p.paused;
        p.focus = false;
      }
      if (act === "focus") {
        if (p.focus) {
          p.focus = false;
        } else {
          const focused = state.filter(x => x.focus);
          if (focused.length >= MAX_FOCUS) {
            focused[0].focus = false;
          }
          p.focus = true;
        }
      }

      if (p.score >= AUTO_FOCUS_AT && !p.paused) {
        const focused = state.filter(x => x.focus);
        if (!p.focus && focused.length < MAX_FOCUS) p.focus = true;
      }

      save();
      render();
    };

    card.append(header, bar, actions);
    peopleDiv.appendChild(card);
  });
}

addBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) return;

  let p = state.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (!p) {
    p = { name, score: 0, focus: false, paused: false };
    state.push(p);
  }
  save();
  render();
  nameInput.value = "";
};

decayBtn.onclick = () => {
  state.forEach(p => {
    if (!p.paused && !p.focus) {
      p.score = clamp(p.score - 10);
    }
  });
  save();
  render();
};

render();