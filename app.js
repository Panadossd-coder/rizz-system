function render() {
  const list = $("list");
  list.innerHTML = "";

  let total = 0;
  people.forEach(p => total += p.score);
  const avg = people.length ? Math.round(total / people.length) : 0;

  $("overallPct").textContent = avg + "%";
  $("overallBar").style.width = avg + "%";

  people.forEach(p => {
    const row = document.createElement("div");
    row.className = "person" + (p.active ? "" : " paused");

    const name = document.createElement("strong");
    name.textContent = p.name;

    const score = document.createElement("span");
    score.textContent = ` ${p.score}% `;

    const plus = document.createElement("button");
    plus.textContent = "+10";
    plus.onclick = () => adjust(p.id, 10);

    const minus = document.createElement("button");
    minus.textContent = "-10";
    minus.onclick = () => adjust(p.id, -10);

    const focus = document.createElement("button");
    focus.textContent = "Focus";
    focus.onclick = () => toggleFocus(p.id);

    const active = document.createElement("button");
    active.textContent = p.active ? "Pause" : "Activate";
    active.onclick = () => toggleActive(p.id);

    row.append(name, score, plus, minus, focus, active);
    list.appendChild(row);
  });

  save();
}