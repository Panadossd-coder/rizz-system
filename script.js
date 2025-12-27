* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  margin: 0;
  padding: 0;
  background: #000;
  color: #fff;
  overscroll-behavior: none;
}

body {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.app {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px;
}

/* BASE CARD */
.card {
  background: rgba(14,14,18,0.9);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.7);
}

/* DASHBOARD (ALIVE, SAFE) */
.dashboard {
  position: relative;
  padding: 22px;
  overflow: hidden;
  animation: float 7s ease-in-out infinite;
}

.dashboard::before,
.dashboard::after {
  pointer-events: none;
}

.dashboard::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255,255,255,0.12),
    rgba(255,255,255,0.02),
    rgba(255,255,255,0.1)
  );
  opacity: 0.25;
}

.dashboard::after {
  content: "";
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle, rgba(255,105,180,0.18), transparent 60%);
  animation: sweep 10s linear infinite;
}

@keyframes sweep {
  from { transform: translateX(-20%); }
  to { transform: translateX(20%); }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}

.dash-item span {
  font-weight: 700;
  color: #fff;
}

/* FORM */
input, textarea, button {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: rgba(20,20,24,0.9);
  color: #fff;
}

.status-buttons {
  display: flex;
  gap: 10px;
}

.status-buttons button {
  flex: 1;
  background: rgba(255,255,255,0.05);
}

.status-buttons button.active {
  background: linear-gradient(135deg,#ff6aa2,#ff99c8);
  color: #000;
}

.focus-control {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
}

.focus-control button {
  background: linear-gradient(135deg,#ff6aa2,#ff99c8);
  color: #000;
  font-size: 26px;
}

/* EDIT MODAL */
.edit-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.edit-modal.hidden {
  display: none;
}

.edit-box {
  background: #111;
  padding: 16px;
  border-radius: 16px;
  width: 90%;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}