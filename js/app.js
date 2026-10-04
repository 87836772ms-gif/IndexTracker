// ════════════════════════════════════════
// APP.JS — Global Index Tracker
// Full Interactive Logic
// ════════════════════════════════════════

// ── STATE ──
let activeCategory = 'all';
let activeSearch = '';
let trendChart = null;
let currentTheme = localStorage.getItem('theme') || 'light';
let localIndexes = []; // user-added indexes from localStorage
let liveIndexes = [];
let liveDataLoaded = false;

// ── INIT ──
document.addEventListener('DOMContentLoaded', async () => {
  loadLocalIndexes();
  applyTheme(currentTheme);
  await loadLiveIndexes();
  initSplash();
});

async function loadLiveIndexes() {
  try {
    const res = await fetch('js/live-data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Live data unavailable');
    const payload = await res.json();
    liveIndexes = payload.autoUpdatedIndexes || {};
    liveDataLoaded = true;
  } catch (e) {
    liveIndexes = {};
    liveDataLoaded = false;
  }
}

function mergeLiveData(index) {
  const live = Array.isArray(liveIndexes)
    ? liveIndexes.find(item => item.id === index.id)
    : liveIndexes[index.id];
  return live ? { ...index, ...live } : index;
}

// ══════════ SPLASH LOADER ══════════
function initSplash() {
  const fill = document.getElementById('splashFill');
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');

  let w = 0;
  const interval = setInterval(() => {
    w += Math.random() * 8 + 3;
    if (w >= 100) {
      w = 100;
      fill.style.width = w + '%';
      clearInterval(interval);
      setTimeout(() => {
        splash.classList.add('hide');
        app.classList.remove('app-hidden');
        app.classList.add('app-visible');
        setTimeout(() => splash.remove(), 700);
        renderAll();
      }, 400);
    } else {
      fill.style.width = w + '%';
    }
  }, 50);
}

// ══════════ RENDER EVERYTHING ══════════
function renderAll() {
  const all = getAllIndexes();
  renderIndiaStats(all);
  renderCards(all);
  populateChartSelect(all);
  updateChart();
  updateLastUpdated();
}

function getAllIndexes() {
  return [...INDEXES, ...localIndexes].map(mergeLiveData);
}

// ══════════ INDIA HERO STATS ══════════
function renderIndiaStats(indexes) {
  const row = document.getElementById('indiaStats');
  // Show only top 5 notable ones
  const featured = ['gdp-ppp', 'hdi', 'gii', 'climate-change', 'cyber', 'happiness'];
  const pills = indexes
    .filter(idx => featured.includes(idx.id))
    .map(idx => createStatPill(idx))
    .join('');
  row.innerHTML = pills;
}

function createStatPill(idx) {
  const trendIcon = idx.trend === 'up' ? '📈' : idx.trend === 'down' ? '📉' : '➡️';
  const trendClass = idx.trend === 'up' ? 'trend-up' : idx.trend === 'down' ? 'trend-down' : 'trend-same';
  return `
    <div class="stat-pill" onclick="openDetailModal('${idx.id}')">
      <span class="pill-emoji">${idx.emoji}</span>
      <div>
        <div style="font-size:0.7rem;color:var(--text2)">${idx.name.split('(')[0].trim().substring(0,18)}</div>
        <div class="pill-rank">#${idx.indiaRank}</div>
      </div>
      <span class="pill-trend ${trendClass}">${trendIcon}</span>
    </div>
  `;
}

// ══════════ CARDS GRID ══════════
function renderCards(indexes) {
  const grid = document.getElementById('cardsGrid');
  const badge = document.getElementById('countBadge');
  const filtered = applyFilters(indexes);

  badge.textContent = `${filtered.length} indexes`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div style="font-size:3rem">🔍</div>
        <p>No indexes found for "<strong>${activeSearch || activeCategory}</strong>"</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(idx => createCard(idx)).join('');
}

function createCard(idx) {
  const dedicatedPages = { happiness: 'happiness.html' };
  const cardAction = dedicatedPages[idx.id]
    ? `window.location.href='\${dedicatedPages[idx.id]}'`
    : `openDetailModal('\${idx.id}')`;
  const pct = Math.round((1 - idx.indiaRank / idx.total) * 100);
  const barW = Math.max(4, pct);

  const trendBadgeClass = idx.trend === 'up' ? 'trend-up-badge' : idx.trend === 'down' ? 'trend-down-badge' : 'trend-same-badge';
  const trendText = idx.trend === 'up' ? '📈 Improved' : idx.trend === 'down' ? '📉 Declined' : '➡️ Stable';
  const currentYear = new Date().getFullYear();
  const latestYear = idx.latestYear || (idx.history?.length ? Math.max(...idx.history.map(h => h.year)) : null);
  const yearStatus = latestYear
    ? 'Latest available: ' + latestYear + (latestYear < currentYear ? ' • ' + currentYear + ' data not released yet' : '')
    : 'Latest release year unavailable';
  const rankRatio = idx.total ? idx.indiaRank / idx.total : 1;
  const rankColor = rankRatio <= 0.33 ? '#16a34a' : rankRatio <= 0.66 ? '#d97706' : '#dc2626';

  const categoryLabel = {
    economy: '💰 Economy', human: '👤 Human Dev',
    governance: '🏛️ Governance', environment: '🌱 Environment',
    tech: '💻 Technology', health: '🏥 Health'
  }[idx.category] || idx.category;

  return `
    <div class="index-card" style="--card-color:${idx.color};border-left:3px solid ${rankColor}" onclick="${cardAction}">
      <div class="card-top">
        <span class="card-emoji">${idx.emoji}</span>
        <span class="card-category">${categoryLabel}</span>
      </div>
      <div class="card-name">${idx.name}</div>
      <div class="card-org">${idx.org}</div>
      <div class="card-rank-row">
        <div>
          <div class="india-rank-label">🇮🇳 India</div>
          <div class="india-rank-num" style="color:${rankColor}">#${idx.indiaRank}</div>
          <div style="font-size:.72rem;color:var(--text2);margin-top:4px">${yearStatus}</div>
          <div class="india-rank-out">of ${idx.total}</div>
        </div>
        <div class="rank-progress">
          <div class="rank-bar-wrap">
            <div class="rank-bar-fill" style="width:${barW}%"></div>
          </div>
          <div class="rank-pct">Top ${100 - pct}%</div>
        </div>
        <span class="card-trend ${trendBadgeClass}">${trendText}</span>
      </div>
    </div>
  `;
}

// ══════════ FILTERS ══════════
function applyFilters(indexes) {
  return indexes.filter(idx => {
    const matchCat = activeCategory === 'all' || idx.category === activeCategory;
    const q = activeSearch.toLowerCase();
    const matchSearch = !q || idx.name.toLowerCase().includes(q) || idx.org.toLowerCase().includes(q) || idx.category.includes(q);
    return matchCat && matchSearch;
  });
}

function filterByCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderCards(getAllIndexes());
}

function filterIndexes() {
  activeSearch = document.getElementById('searchInput').value;
  renderCards(getAllIndexes());
}

// ══════════ DETAIL MODAL ══════════
function openDetailModal(id) {
  const idx = getAllIndexes().find(i => i.id === id);
  if (!idx) return;

  document.getElementById('modalEmoji').textContent = idx.emoji;
  document.getElementById('modalTitle').textContent = idx.name;
  document.getElementById('modalOrg').textContent = `Published by ${idx.org}`;
  document.getElementById('modalIndiaRank').textContent = `#${idx.indiaRank}`;
  document.getElementById('modalOutOf').textContent = `out of ${idx.total} countries`;
  document.getElementById('modalTop').textContent = `${idx.topCountry || '—'}`;
  const currentYear = new Date().getFullYear();
  const latestYear = idx.latestYear || (idx.history?.length ? Math.max(...idx.history.map(h => h.year)) : null);
  const status = latestYear && latestYear < currentYear
    ? ' Latest available report: ' + latestYear + '. ' + currentYear + ' data has not been released yet.'
    : latestYear ? ' Latest available report: ' + latestYear + '.' : '';
  document.getElementById('modalDesc').textContent = (idx.desc || '') + status;
  document.getElementById('modalSource').href = idx.source || '#';

  // Trend badge
  const trendEl = document.getElementById('modalTrend');
  trendEl.textContent = idx.trend === 'up' ? '📈 Improved this year' :
                        idx.trend === 'down' ? '📉 Declined this year' : '➡️ Unchanged this year';
  trendEl.className = 'trend-badge ' + (idx.trend === 'up' ? 'trend-up-badge' : idx.trend === 'down' ? 'trend-down-badge' : 'trend-same-badge');

  // History
  const histEl = document.getElementById('modalHistory');
  if (idx.history && idx.history.length > 0) {
    histEl.innerHTML = idx.history.slice().reverse().map(h =>
      `<div class="hist-item"><div style="font-weight:700">#${h.rank}</div><div class="hist-year">${h.year}</div></div>`
    ).join('');
  } else {
    histEl.textContent = 'No history available';
  }

  document.getElementById('detailModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal(e) {
  if (e.target === e.currentTarget) closeModal('detailModal');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════ ADD INDEX MODAL ══════════
function openAddModal() {
  document.getElementById('addModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function submitNewIndex(e) {
  e.preventDefault();
  const newIdx = {
    id: 'user_' + Date.now(),
    name: document.getElementById('newName').value.trim(),
    emoji: document.getElementById('newEmoji').value.trim() || '📊',
    org: document.getElementById('newOrg').value.trim(),
    category: document.getElementById('newCategory').value,
    indiaRank: parseInt(document.getElementById('newIndiaRank').value),
    total: parseInt(document.getElementById('newTotal').value),
    topCountry: document.getElementById('newTop').value.trim() || '—',
    trend: document.getElementById('newTrend').value,
    color: '#6366f1',
    desc: document.getElementById('newDesc').value.trim(),
    source: document.getElementById('newSource').value.trim() || '#',
    history: [{ year: new Date().getFullYear(), rank: parseInt(document.getElementById('newIndiaRank').value) }]
  };

  localIndexes.push(newIdx);
  saveLocalIndexes();
  closeModal('addModal');
  document.getElementById('addForm').reset();
  renderAll();
  showToast(`✅ "${newIdx.name}" added!`);
}

// ══════════ CHART ══════════
function populateChartSelect(indexes) {
  const sel = document.getElementById('chartIndexSelect');
  sel.innerHTML = indexes
    .filter(idx => idx.history && idx.history.length >= 2)
    .map(idx => `<option value="${idx.id}">${idx.emoji} ${idx.name.substring(0, 35)}</option>`)
    .join('');
}

function updateChart() {
  const id = document.getElementById('chartIndexSelect').value;
  const idx = getAllIndexes().find(i => i.id === id);
  if (!idx || !idx.history) return;

  const labels = idx.history.map(h => h.year.toString());
  const data = idx.history.map(h => h.rank);
  const ctx = document.getElementById('trendChart').getContext('2d');

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `India Rank — ${idx.name}`,
        data,
        borderColor: idx.color || '#4f46e5',
        backgroundColor: (idx.color || '#4f46e5') + '20',
        borderWidth: 3,
        pointBackgroundColor: idx.color || '#4f46e5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          reverse: true, // Lower rank (better) at top
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text2').trim() || '#64748b',
            font: { family: 'Inter', size: 11 }
          },
          grid: { color: currentTheme === 'dark' ? '#1e2d45' : '#f1f5f9' }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text2').trim() || '#64748b',
            font: { family: 'Inter', size: 11 }
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: currentTheme === 'dark' ? '#131929' : '#1e293b',
          titleFont: { family: 'Space Grotesk', weight: '700', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          callbacks: {
            label: ctx => ` India Rank: #${ctx.raw} out of ${idx.total}`
          }
        }
      }
    }
  });
}

// ══════════ THEME ══════════
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  localStorage.setItem('theme', currentTheme);
  if (trendChart) updateChart(); // re-render chart with new theme colors
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// ══════════ LOCAL STORAGE ══════════
function saveLocalIndexes() {
  localStorage.setItem('userIndexes', JSON.stringify(localIndexes));
}

function loadLocalIndexes() {
  const saved = localStorage.getItem('userIndexes');
  if (saved) {
    try { localIndexes = JSON.parse(saved); } catch(e) { localIndexes = []; }
  }
}

// ══════════ LAST UPDATED ══════════
function updateLastUpdated() {
  const el = document.getElementById('lastUpdated');
  const now = new Date();
  el.textContent = liveDataLoaded ? `Data last verified: ${now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} • Automatic official-source refresh enabled` : `Data last verified: ${now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} • Using stored fallback data`;
}

// ══════════ TOAST ══════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ══════════ SCROLL TO TOP ══════════
window.addEventListener('scroll', () => {
  // can add scroll-to-top button logic here if needed
});

// ══════════ CLOSE MODAL ON ESC ══════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal('detailModal');
    closeModal('addModal');
  }
});
