// Rizz Web — unified clean script (v2.1)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addForm');
  const list = document.getElementById('peopleList');
  const dashFocus = document.getElementById('dashFocus');
  const dashPause = document.getElementById('dashPause');
  const dashAction = document.getElementById('dashAction');
  const nameInput = document.getElementById('name');
  const notesInput = document.getElementById('notes');
  const reminderInput = document.getElementById('reminder');
  const addBtn = document.getElementById('addBtn');

  // status buttons
  const statusBtns = Array.from(document.querySelectorAll('.status-btn'));
  let selectedStatus = null;

  // focus controls
  const focusMinus = document.getElementById('focusMinus');
  const focusPlus = document.getElementById('focusPlus');
  const focusValueEl = document.getElementById('focusValue');
  let focusValue = 0;

  // localStorage
  const LS_KEY = 'rizz_people_v2';
  let people = JSON.parse(localStorage.getItem(LS_KEY) || '[]');

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(people));
  }

  function isUrgent(reminder) {
    if (!reminder) return false;
    const text = String(reminder).toLowerCase();
    return text.includes('today') || text.includes('tonight') || text.includes('now');
  }

  function getAdvice(p) {
    if (p.reminder) {
      return `Reminder: ${p.reminder}`;
    }
    if (p.focus >= 70 && p.status === 'dating') return 'High priority. Call or see them soon.';
    if (p.focus >= 70 && p.status === 'crush') return 'Build momentum. Light flirting or check-in.';
    if (p.focus < 40 && p.status !== 'pause') return 'Low priority. Do not over-invest.';
    if (p.status === 'pause') return 'Give space. Let them come to you.';
    return 'Keep it steady. No pressure.';
  }

  function updateDashboard() {
    if (people.length === 0) {
      dashFocus.textContent = '—';
      dashPause.textContent = '—';
      dashAction.textContent = 'Add someone to begin.';
      return;
    }
    const sorted = [...people].sort((a,b) => b.focus - a.focus);
    const focusPerson = sorted.find(p => p.focus >= 70);
    const pausePerson = sorted.find(p => p.status === 'pause');

    dashFocus.textContent = focusPerson ? focusPerson.name : 'No high focus';
    dashPause.textContent = pausePerson ? pausePerson.name : '—';

    if (focusPerson) {
      dashAction.textContent = isUrgent(focusPerson.reminder)
        ? `Reminder: ${focusPerson.reminder}`
        : getAdvice(focusPerson);
    } else {
      dashAction.textContent = 'Maintain balance. Don’t force anything.';
    }
  }

  function render() {
    list.innerHTML = '';
    if (people.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No entries yet';
      list.appendChild(empty);
      updateDashboard();
      return;
    }

    people.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      if (p.focus >= 70) card.classList.add('high-focus');
      if (p.focus < 40) card.classList.add('low-focus');

      card.innerHTML = `
        <strong style="font-size:18px">${escapeHtml(p.name)}</strong>
        <div style="color:#9aa3ad;margin-top:6px;text-transform:lowercase">${escapeHtml(p.status)}</div>

        <div class="focus-bar">
          <div class="focus-fill" style="width:${p.focus}%"></div>
        </div>
        <div style="margin-top:8px;color:#9aa3ad">${p.focus}% focus</div>
        ${p.reminder ? `<div class="reminder">⏰ ${escapeHtml(p.reminder)}</div>` : ''}
        <div style="margin-top:8px;font-style:italic;color:#9aa3ad">${escapeHtml(getAdvice(p))}</div>
        ${p.notes ? `<div style="margin-top:10px">${escapeHtml(p.notes)}</div>` : ''}
        <button data-index="${i}" class="remove-btn">Remove</button>
      `;

      list.appendChild(card);
    });

    // wire remove buttons
    Array.from(list.querySelectorAll('.remove-btn')).forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          people.splice(idx,1);
          save();
          render();
        }
      });
    });

    updateDashboard();
  }

  // Escape HTML helper to avoid injection
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // status buttons click
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedStatus = btn.dataset.status;
    });
  });

  // focus buttons
  function setFocus(v) {
    focusValue = Math.max(0, Math.min(100, Math.round(v)));
    focusValueEl.textContent = `${focusValue}%`;
  }
  focusMinus.addEventListener('click', () => setFocus(focusValue - 10));
  focusPlus.addEventListener('click', () => setFocus(focusValue + 10));

  // helper: person key to prevent duplicates
  function personKey(p) {
    return `${(p.name||'').toLowerCase().trim()}|${(p.status||'').toLowerCase().trim()}`;
  }

  // add form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const notes = notesInput.value.trim();
    const reminder = reminderInput.value.trim();
    const status = selectedStatus || ''; // if not selected, remain empty

    if (!name) {
      alert('Please enter a name.');
      return;
    }
    if (!status) {
      alert('Please select a status (Crush / Dating / Pause).');
      return;
    }

    const person = { name, status, notes, reminder, focus: focusValue };

    // duplicate check
    const newKey = personKey(person);
    if (people.some(p => personKey(p) === newKey)) {
      alert('This person already exists with the same status.');
      return;
    }

    people.push(person);
    save();
    render();

    // reset form state
    form.reset();
    selectedStatus = null;
    statusBtns.forEach(b => b.classList.remove('selected'));
    setFocus(0);
  });

  // initial
  setFocus(0);
  render();
});
