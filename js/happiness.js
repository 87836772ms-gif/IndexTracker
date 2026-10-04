const INDIA_DATA = [
  { year: "2021", score: 3.819, rank: 139, total: 149 },
  { year: "2022", score: 3.777, rank: 136, total: 146 },
  { year: "2023", score: 4.036, rank: 126, total: 137 },
  { year: "2024", score: 4.054, rank: 126, total: 143 },
  { year: "2025", score: 4.389, rank: 118, total: 147 },
  { year: "2026", score: 4.536, rank: 116, total: 147 }
];

const RANKINGS = {
  2026: [
    ["Finland",7.764,1],["Iceland",7.540,2],["Denmark",7.539,3],["Costa Rica",7.439,4],
    ["Sweden",7.255,5],["Norway",7.242,6],["Netherlands",7.223,7],["Israel",7.187,8],
    ["Luxembourg",7.063,9],["Switzerland",7.018,10],["New Zealand",6.995,11],
    ["Mexico",6.974,12],["Australia",6.916,15],["Ireland",6.828,13],
    ["Germany",6.882,14],["India",4.536,116]
  ],
  2025: [
    ["Finland",7.736,1],["Denmark",7.521,2],["Iceland",7.515,3],["Sweden",7.345,4],
    ["Netherlands",6.955,5],["Costa Rica",6.979,6],["Norway",7.262,7],["Israel",7.187,8],
    ["Luxembourg",7.122,9],["Mexico",6.979,10],["Australia",6.974,11],
    ["New Zealand",6.952,12],["Switzerland",6.935,13],["Ireland",6.889,14],
    ["Germany",6.882,15],["India",4.389,118]
  ],
  2024: [
    ["Finland",7.741,1],["Denmark",7.583,2],["Iceland",7.525,3],["Sweden",7.344,4],
    ["Israel",7.341,5],["Netherlands",7.319,6],["Norway",7.302,7],["Luxembourg",7.122,8],
    ["Switzerland",7.060,9],["Australia",7.057,10],["New Zealand",7.029,11],
    ["Costa Rica",6.955,12],["Kuwait",6.951,13],["Austria",6.905,14],
    ["Canada",6.900,15],["India",4.054,126]
  ]
};

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("indextracker-theme");

if(savedTheme === "dark"){
  document.body.classList.add("dark");
  themeToggle.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("indextracker-theme", dark ? "dark" : "light");
  themeToggle.textContent = dark ? "☀" : "☾";
  if(window.indiaHappinessChart) window.indiaHappinessChart.update();
});

function trendLabel(current, previous){
  if(current.rank < previous.rank && current.score > previous.score) return "Strongly improved";
  if(current.rank < previous.rank || current.score > previous.score) return "Moderately improved";
  if(current.rank === previous.rank && Math.abs(current.score-previous.score) < 0.03) return "Stable";
  if(current.rank > previous.rank && current.score < previous.score) return "Moderately declined";
  return "Stable";
}

function renderRankings(year = "2026"){
  const body = document.getElementById("rankingBody");
  const query = document.getElementById("countrySearch").value.trim().toLowerCase();
  const rows = RANKINGS[year] || [];
  const india = INDIA_DATA.find(x => x.year === String(year));

  let data = rows
    .filter(item => item[2] <= 10)
    .map(item => ({
      rank: item[2],
      country: item[0],
      score: item[1]
    }));

  if(query){
    data = rows
      .filter(item => item[0].toLowerCase().includes(query))
      .map(item => ({
        rank: item[2],
        country: item[0],
        score: item[1]
      }));
    if(!data.length && india && "india".includes(query)){
      data = [{rank: india.rank, country:"India", score:india.score}];
    }
  }
  data.sort((a,b) => a.rank - b.rank);

  body.innerHTML = data.map(row => {
    const isIndia = row.country === "India";
    return `
      <tr>
        <td><span class="rank-badge">#${row.rank}</span></td>
        <td><span class="country-name">${row.country}</span></td>
        <td><span class="score-value">${row.score.toFixed(3)}</span></td>
        <td><span class="status ${isIndia ? "status-india" : ""}">${isIndia ? "India" : row.rank === 1 ? "Highest score" : "Ranked"}</span></td>
      </tr>
    `;
  }).join("");

  if(!data.length){
    body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">No country found.</td></tr>';
  }
}

const search = document.getElementById("countrySearch");
const yearSelect = document.getElementById("rankingYear");
search.addEventListener("input", () => renderRankings(yearSelect.value));
yearSelect.addEventListener("change", () => renderRankings(yearSelect.value));

renderRankings();

const ctx = document.getElementById("indiaHappinessChart");

window.indiaHappinessChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: INDIA_DATA.map(d => d.year),
    datasets: [{
      label: "India",
      data: INDIA_DATA.map(d => d.score),
      borderColor: "#d97927",
      backgroundColor: "rgba(217,121,39,.08)",
      borderWidth: 3,
      pointRadius: INDIA_DATA.map((_,i) => i === INDIA_DATA.length-1 ? 7 : 4),
      pointHoverRadius: 8,
      pointBackgroundColor: INDIA_DATA.map((_,i) => i === INDIA_DATA.length-1 ? "#3d8b61" : "#d97927"),
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      tension: .35,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` Score: ${ctx.parsed.y.toFixed(3)} / 10`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, color: "#8b877f" },
        grid: { color: "rgba(120,110,95,.13)" },
        border: { display: false },
        title: { display: true, text: "Life evaluation score", color: "#8b877f" }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#8b877f" },
        border: { display: false }
      }
    }
  },
  plugins: [{
    id: "latestValue",
    afterDatasetsDraw(chart){
      const meta = chart.getDatasetMeta(0);
      const i = meta.data.length - 1;
      const point = meta.data[i];
      if(!point) return;

      const {ctx} = chart;
      ctx.save();
      ctx.font = "700 12px Inter, sans-serif";
      ctx.fillStyle = "#3d8b61";
      ctx.textAlign = "center";
      ctx.fillText(INDIA_DATA[i].score.toFixed(3), point.x, point.y - 16);
      ctx.restore();
    }
  }]
});

const stars = document.querySelectorAll("#starRating button");
const feedbackMessage = document.getElementById("feedbackMessage");
let selectedRating = 0;

stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.rating);
    stars.forEach(s => s.classList.toggle("active", Number(s.dataset.rating) <= selectedRating));
  });
});

document.getElementById("submitFeedback").addEventListener("click", () => {
  const text = document.getElementById("feedbackText").value.trim();

  if(!selectedRating){
    feedbackMessage.textContent = "Please select a rating first.";
    return;
  }

  localStorage.setItem("happiness-feedback", JSON.stringify({
    rating: selectedRating,
    text,
    submittedAt: new Date().toISOString()
  }));

  feedbackMessage.textContent = "Thank you for your feedback!";
});

const latest = INDIA_DATA[INDIA_DATA.length - 1];
const previous = INDIA_DATA[INDIA_DATA.length - 2];
const situation = trendLabel(latest, previous);

document.getElementById("indiaRankSituation").textContent = situation;
document.getElementById("trendStatus").textContent = situation;
document.getElementById("glanceIndiaRank").textContent = latest.rank;
document.getElementById("glanceIndiaScore").textContent = latest.score.toFixed(3);
document.getElementById("indiaRankLarge").textContent = "#" + latest.rank;
document.getElementById("indiaScoreLarge").textContent = latest.score.toFixed(3);
