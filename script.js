document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addForm");
  const list = document.getElementById("peopleList");
  const focusValue = document.getElementById("focusValue");
  const dashFocus = document.getElementById("dashFocus");
  const dashAction = document.getElementById("dashAction");

  let focus = 0;
  let status = null;

  document.querySelectorAll(".status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      status = btn.dataset.status;
    });
  });

  document.getElementById("plus").onclick = () => {
    focus = Math.min(100, focus + 10);
    focusValue.textContent = focus + "%";
  };

  document.getElementById("minus").onclick = () => {
    focus = Math.max(0, focus - 10);
    focusValue.textContent = focus + "%";
  };

  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    if (!name || !status) return;

    const card = document.createElement("div");
    card.className = "person";
    card.innerHTML = `
      <strong>${name}</strong><br>
      ${status}<br>
      ${focus}% focus
      <button class="remove">Remove</button>
    `;

    card.querySelector(".remove").onclick = () => card.remove();

    list.appendChild(card);

    dashFocus.textContent = name;
    dashAction.textContent = focus >= 70 ? "High priority. Reach out." : "Keep it steady.";

    form.reset();
    focus = 0;
    focusValue.textContent = "0%";
    status = null;
    document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
  });
});