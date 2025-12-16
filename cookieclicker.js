// Simple score tracker for the cookie button (persisted in localStorage)
let score = parseInt(localStorage.getItem('cookieScore') || '0', 10) || 0;
// upgrades
let bonusPerClick = parseInt(localStorage.getItem('cookieBonus') || '0', 10) || 0; // additional +N per click
let autoClickers = parseInt(localStorage.getItem('cookieAuto') || '0', 10) || 0; // number of auto-clickers
// threshold upgrades state (claimed thresholds)
let claimedUpgrades = {};
try { claimedUpgrades = JSON.parse(localStorage.getItem('cookieClaimed') || '{}'); } catch(e) { claimedUpgrades = {}; }

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
  // show current increment (how much the next click will add)
  let incEl = document.getElementById('increment');
  const nextIncrement = 1 + Math.floor(score / 100);
  const shownIncrement = nextIncrement + bonusPerClick;
  if (!incEl) {
    incEl = document.createElement('div');
    incEl.id = 'increment';
    incEl.style.cssText = 'font-size:0.95rem; color:var(--score-color, #fff); text-align:center; margin-top:0.25rem; opacity:0.9;';
    el.insertAdjacentElement('afterend', incEl);
  }
  incEl.textContent = `Increment: +${shownIncrement}`;
  updateUpgradesUI();
  renderThresholdUpgrades();
}

// Definitions for threshold-based upgrades
const thresholdDefs = [
  { t:100,  id:'t100',  title:'Small Bonus',  bonus:1,  auto:0,  desc:'+1 per click' },
  { t:200,  id:'t200',  title:'Medium Bonus', bonus:2,  auto:0,  desc:'+2 per click' },
  { t:300,  id:'t300',  title:'Large Bonus',  bonus:5,  auto:0,  desc:'+5 per click' },
  { t:400,  id:'t400',  title:'Mini Auto',     bonus:0,  auto:1,  desc:'+1 auto-clicker' },
  { t:500,  id:'t500',  title:'Baker Team',    bonus:3,  auto:1,  desc:'+3 per click & +1 auto' },
  { t:600,  id:'t600',  title:'Oven Boost',    bonus:5,  auto:2,  desc:'+5 per click & +2 auto' },
  { t:700,  id:'t700',  title:'Factory',       bonus:10, auto:3,  desc:'+10 per click & +3 auto' },
  { t:800,  id:'t800',  title:'Conveyor',      bonus:0,  auto:5,  desc:'+5 auto-clickers' },
  { t:900,  id:'t900',  title:'Elite Oven',    bonus:20, auto:5,  desc:'+20 per click & +5 auto' },
  { t:1000, id:'t1000', title:'Grand Machine', bonus:0,  auto:10, desc:'+10 auto-clickers' }
];

// Render threshold upgrades (horizontal scrollable list)
function renderThresholdUpgrades() {
  const container = document.getElementById('threshold-upgrades');
  if (!container) return;
  container.innerHTML = '';
  thresholdDefs.forEach(def => {
    const t = def.t;
    const bought = !!claimedUpgrades[t];
    const unlocked = score >= t;
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    const btn = document.createElement('button');
    btn.className = 'styled-button small';
    btn.textContent = bought ? `Claimed (${def.title})` : `Claim ${def.title}`;
    btn.disabled = !unlocked || bought;
    btn.onclick = () => claimThreshold(def.t);
    const title = document.createElement('div');
    title.style.cssText = 'color:#fff; font-weight:600; font-size:0.95rem;';
    title.textContent = `${def.title} — ${def.desc}`;
    const info = document.createElement('div');
    info.style.cssText = 'color:#ddd; font-size:0.85rem;';
    info.textContent = bought ? 'Purchased' : (unlocked ? `Available at ${def.t}` : `Unlocks at ${def.t}`);
    card.appendChild(btn);
    card.appendChild(title);
    card.appendChild(info);
    container.appendChild(card);
  });
}

function claimThreshold(threshold) {
  if (claimedUpgrades[threshold]) return;
  if (score < threshold) return; // shouldn't happen if button disabled
  const def = thresholdDefs.find(d => d.t === threshold);
  if (!def) return;
  claimedUpgrades[threshold] = true;
  // apply effects
  if (def.bonus) {
    bonusPerClick += def.bonus;
    try { localStorage.setItem('cookieBonus', String(bonusPerClick)); } catch(e) {}
  }
  if (def.auto) {
    autoClickers += def.auto;
    try { localStorage.setItem('cookieAuto', String(autoClickers)); } catch(e) {}
  }
  try { localStorage.setItem('cookieClaimed', JSON.stringify(claimedUpgrades)); } catch(e) {}
  updateScoreDisplay();
}

function addScore() {
  // increment amount increases by 1 for each 100 points reached
  const increment = 1 + Math.floor(score / 100) + bonusPerClick;
  score += increment;
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
  // wire upgrade buttons
  const buyMult = document.getElementById('buy-mult');
  const buyAuto = document.getElementById('buy-auto');
  if (buyMult) buyMult.addEventListener('click', buyMultiplier);
  if (buyAuto) buyAuto.addEventListener('click', buyAutoClicker);
  // start autosave/passive income
  setInterval(() => {
    if (autoClickers > 0) {
      score += autoClickers; // each auto-clicker adds 1 per second
      try { localStorage.setItem('cookieScore', String(score)); } catch (e) {}
      updateScoreDisplay();
    }
  }, 1000);
  // render threshold upgrades on load
  renderThresholdUpgrades();
  attachUpgradeWheelHandler();
  // wire reset button
  const resetBtn = document.getElementById('reset-progress');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset score and all purchases? This cannot be undone.')) resetProgress();
    });
  }
});

// When the mouse wheel is used over the horizontal upgrades strip,
// translate mostly-vertical wheels into page scrolls and horizontal
// wheels into horizontal scrolling of the strip. This prevents the
// upgrades row from 'capturing' vertical scrolling so you can scroll
// up and down the page normally.
function attachUpgradeWheelHandler() {
  const container = document.getElementById('threshold-upgrades');
  if (!container) return;
  container.addEventListener('wheel', (e) => {
    // if the user is primarily scrolling horizontally, let the strip scroll
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    if (absX > absY) {
      // allow default horizontal scroll behavior
      return;
    }
    // otherwise, scroll the window vertically and prevent the strip from capturing it
    window.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
    e.preventDefault();
  }, { passive: false });
}

// Reset progress: clear stored values and reset runtime state
function resetProgress() {
  // clear localStorage keys used by the game
  try {
    localStorage.removeItem('cookieScore');
    localStorage.removeItem('cookieBonus');
    localStorage.removeItem('cookieAuto');
    localStorage.removeItem('cookieClaimed');
  } catch (e) {}
  // reset runtime variables
  score = 0;
  bonusPerClick = 0;
  autoClickers = 0;
  claimedUpgrades = {};
  updateScoreDisplay();
}

// Upgrade logic
function multCost() { return 50 * (bonusPerClick + 1); }
function autoCost() { return 200 * Math.pow(2, autoClickers); }

function updateUpgradesUI() {
  const multInfo = document.getElementById('mult-info');
  const autoInfo = document.getElementById('auto-info');
  if (multInfo) multInfo.textContent = `Bonus per click: +${bonusPerClick} — Cost: ${multCost()}`;
  if (autoInfo) autoInfo.textContent = `Auto-clickers: ${autoClickers} — Cost: ${autoCost()}`;
}

function buyMultiplier() {
  const cost = multCost();
  if (score >= cost) {
    score -= cost;
    bonusPerClick += 1;
    try { localStorage.setItem('cookieScore', String(score)); } catch (e) {}
    try { localStorage.setItem('cookieBonus', String(bonusPerClick)); } catch (e) {}
    updateScoreDisplay();
  } else {
    flashNotEnough();
  }
}

function buyAutoClicker() {
  const cost = autoCost();
  if (score >= cost) {
    score -= cost;
    autoClickers += 1;
    try { localStorage.setItem('cookieScore', String(score)); } catch (e) {}
    try { localStorage.setItem('cookieAuto', String(autoClickers)); } catch (e) {}
    updateScoreDisplay();
  } else {
    flashNotEnough();
  }
}

function flashNotEnough() {
  const el = document.getElementById('score');
  if (!el) return;
  el.animate([
    { color: '#ffdddd' },
    { color: 'var(--score-color, #fff)' }
  ], { duration: 400 });
}
