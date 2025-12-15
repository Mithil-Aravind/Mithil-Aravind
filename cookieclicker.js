// Simple score tracker for the cookie button (persisted in localStorage)
let score = parseInt(localStorage.getItem('cookieScore') || '0', 10) || 0;

function updateScoreDisplay() {
  const btn = document.getElementById('cookiebutton');
  if (!btn) return;
  let el = document.getElementById('score');
  if (!el) {
    el = document.createElement('div');
    el.id = 'score';
    el.style.cssText = 'margin-top:0.75rem; font-size:1.125rem; color:var(--score-color, #fff); text-align:center;';
    btn.insertAdjacentElement('afterend', el);
  }
  el.textContent = `Score: ${score}`;
}

function addScore() {
  score += 1;
  // persist immediately
  try { localStorage.setItem('cookieScore', String(score)); } catch (e) {}
  updateScoreDisplay();
  const btn = document.getElementById('cookiebutton');
  if (btn && btn.animate) {
    btn.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.96)' },
      { transform: 'scale(1)' }
    ], { duration: 140, easing: 'ease-out' });
  }
}

// Expose for inline onclicks if present in HTML
window.addScore = addScore;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('cookiebutton');
  if (!btn) return;
  // ensure display exists on load (read any stored value)
  score = parseInt(localStorage.getItem('cookieScore') || '0', 10) || 0;
  updateScoreDisplay();
  // attach safe event listener as well
  btn.addEventListener('click', addScore);
});
