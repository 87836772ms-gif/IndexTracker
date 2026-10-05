// ════════════════════════════════════════
// DATA.JS — All Major Global Indexes
// India's 2024 Rankings (Latest Available)
// ════════════════════════════════════════

const INDEXES = [
  // ── ECONOMY ──
  {
    id: "gdp-ppp",
    name: "GDP (PPP) Ranking",
    emoji: "💰",
    org: "International Monetary Fund (IMF)",
    category: "economy",
    indiaRank: 3,
    total: 197,
    latestYear: 2026,
    topCountry: "China",
    trend: "up",
    color: "#f59e0b",
    desc: "Ranks countries by Gross Domestic Product adjusted for Purchasing Power Parity. India is the 3rd largest economy by PPP — larger than Japan and Germany.",
    source: "https://www.imf.org/en/Publications/WEO",
    history: [
      { year: 2020, rank: 6 }, { year: 2021, rank: 5 },
      { year: 2022, rank: 4 }, { year: 2023, rank: 3 }, { year: 2024, rank: 3 }, { year: 2026, rank: 3 }
    ]
  },
  {
    id: "gdp-nominal",
    name: "GDP (Nominal) Ranking",
    emoji: "🏦",
    org: "World Bank / IMF",
    category: "economy",
    indiaRank: 6,
    total: 197,
    latestYear: 2026,
    topCountry: "USA",
    trend: "up",
    color: "#f59e0b",
    desc: "India is the 5th largest economy by nominal GDP, expected to become 3rd by 2030. Currently behind USA, China, Germany, Japan.",
    source: "https://data.worldbank.org/",
    history: [
      { year: 2020, rank: 6 }, { year: 2021, rank: 6 },
      { year: 2022, rank: 5 }, { year: 2023, rank: 5 }, { year: 2024, rank: 5 }, { year: 2026, rank: 6 }
    ]
  },
  {
    id: "ease-of-business",
    name: "Ease of Doing Business",
    emoji: "🏢",
    org: "World Bank (Discontinued 2021)",
    category: "economy",
    indiaRank: 63,
    total: 190,
    topCountry: "New Zealand",
    trend: "up",
    color: "#f59e0b",
    desc: "India improved from rank 142 (2014) to 63 (2020) — a massive jump of 79 places due to regulatory reforms. Report was discontinued after 2021.",
    source: "https://archive.doingbusiness.org/",
    history: [
      { year: 2017, rank: 100 }, { year: 2018, rank: 77 },
      { year: 2019, rank: 63 }, { year: 2020, rank: 63 }
    ]
  },
  {
    id: "gci",
    name: "Global Competitiveness Index",
    emoji: "⚙️",
    org: "World Economic Forum (WEF)",
    category: "economy",
    indiaRank: 40,
    total: 141,
    topCountry: "Singapore",
    trend: "up",
    color: "#f59e0b",
    desc: "Measures national competitiveness based on infrastructure, education, market efficiency, innovation. India ranks 40th — strong in market size but lags in health & skills.",
    source: "https://www.weforum.org/reports/",
    history: [
      { year: 2018, rank: 58 }, { year: 2019, rank: 68 },
      { year: 2020, rank: 43 }, { year: 2022, rank: 40 }
    ]
  },
  {
    id: "trade",
    name: "Enabling Trade Index",
    emoji: "📦",
    org: "World Economic Forum",
    category: "economy",
    indiaRank: 102,
    total: 136,
    topCountry: "Singapore",
    trend: "same",
    color: "#f59e0b",
    desc: "Measures factors enabling international trade — market access, border administration, infrastructure, business environment.",
    source: "https://www.weforum.org/",
    history: [{ year: 2023, rank: 102 }]
  },

  // ── HUMAN DEVELOPMENT ──
  {
    id: "hdi",
    name: "Human Development Index (HDI)",
    emoji: "🌱",
    org: "UNDP",
    category: "human",
    indiaRank: 134,
    total: 193,
    topCountry: "Switzerland",
    trend: "up",
    color: "#10b981",
    desc: "Composite index of life expectancy, education & per-capita income. India ranks 134 out of 193 nations (medium human development category). India's HDI value: 0.644.",
    source: "https://hdr.undp.org/",
    history: [
      { year: 2020, rank: 131 }, { year: 2021, rank: 132 },
      { year: 2022, rank: 132 }, { year: 2023, rank: 134 }
    ]
  },
  {
    id: "gender-gap",
    name: "Global Gender Gap Index",
    emoji: "♀️",
    org: "World Economic Forum",
    category: "human",
    indiaRank: 129,
    total: 146,
    topCountry: "Iceland",
    trend: "down",
    color: "#ec4899",
    desc: "Benchmarks national gender gaps across education, health, economy & politics. India ranks 129th — lower rank driven by economic participation and health/survival gaps.",
    source: "https://www.weforum.org/reports/",
    history: [
      { year: 2021, rank: 140 }, { year: 2022, rank: 135 },
      { year: 2023, rank: 127 }, { year: 2024, rank: 129 }
    ]
  },
  {
    id: "happiness",
    name: "World Happiness Report",
    emoji: "😊",
    org: "UN Sustainable Development Solutions Network",
    category: "human",
    indiaRank: 118,
    total: 143,
    topCountry: "Finland",
    trend: "down",
    color: "#f97316",
    desc: "Ranks countries by self-reported happiness based on GDP/capita, social support, life expectancy, freedom, generosity, corruption. India ranks 118.",
    source: "https://worldhappiness.report/",
    history: [
      { year: 2021, rank: 139 }, { year: 2022, rank: 136 },
      { year: 2023, rank: 126 }, { year: 2024, rank: 118 }
    ]
  },
  {
    id: "hunger",
    name: "Global Hunger Index (GHI)",
    emoji: "🍽️",
    org: "Concern Worldwide & Welthungerhilfe",
    category: "human",
    indiaRank: 105,
    total: 127,
    topCountry: "Belarus",
    trend: "same",
    color: "#ef4444",
    desc: "Measures hunger using undernourishment, child wasting, child stunting & child mortality. India scores 'Serious' on GHI scale. Ranked 105/127.",
    source: "https://www.globalhungerindex.org/",
    history: [
      { year: 2021, rank: 101 }, { year: 2022, rank: 107 },
      { year: 2023, rank: 111 }, { year: 2024, rank: 105 }
    ]
  },

  // ── GOVERNANCE ──
  {
    id: "cpi",
    name: "Corruption Perceptions Index (CPI)",
    emoji: "⚖️",
    org: "Transparency International",
    category: "governance",
    indiaRank: 93,
    total: 180,
    topCountry: "Denmark",
    trend: "down",
    color: "#8b5cf6",
    desc: "Ranks countries by perceived levels of public sector corruption based on expert surveys. Higher rank = more corruption. India scores 39/100.",
    source: "https://www.transparency.org/en/cpi",
    history: [
      { year: 2021, rank: 85 }, { year: 2022, rank: 85 },
      { year: 2023, rank: 93 }, { year: 2024, rank: 93 }
    ]
  },
  {
    id: "press-freedom",
    name: "Press Freedom Index",
    emoji: "📰",
    org: "Reporters Without Borders (RSF)",
    category: "governance",
    indiaRank: 159,
    total: 180,
    topCountry: "Norway",
    trend: "down",
    color: "#6366f1",
    desc: "Evaluates environment for journalism — political context, legal framework, economic context, sociocultural context, safety of journalists.",
    source: "https://rsf.org/en/index",
    history: [
      { year: 2021, rank: 142 }, { year: 2022, rank: 150 },
      { year: 2023, rank: 161 }, { year: 2024, rank: 159 }
    ]
  },
  {
    id: "democracy",
    name: "Democracy Index",
    emoji: "🗳️",
    org: "Economist Intelligence Unit (EIU)",
    category: "governance",
    indiaRank: 46,
    total: 167,
    topCountry: "Norway",
    trend: "same",
    color: "#3b82f6",
    desc: "Ranks countries across 5 categories: electoral process, civil liberties, functioning of government, political participation & culture. India classified as 'Flawed Democracy'.",
    source: "https://www.eiu.com/",
    history: [
      { year: 2020, rank: 53 }, { year: 2021, rank: 46 },
      { year: 2022, rank: 46 }, { year: 2023, rank: 46 }
    ]
  },
  {
    id: "rule-of-law",
    name: "Rule of Law Index",
    emoji: "🔨",
    org: "World Justice Project",
    category: "governance",
    indiaRank: 79,
    total: 142,
    topCountry: "Denmark",
    trend: "down",
    color: "#7c3aed",
    desc: "Covers constraints on government powers, absence of corruption, open government, fundamental rights, order & security, regulatory enforcement, civil/criminal justice.",
    source: "https://worldjusticeproject.org/",
    history: [
      { year: 2021, rank: 79 }, { year: 2022, rank: 77 },
      { year: 2023, rank: 79 }
    ]
  },
  {
    id: "e-govt",
    name: "E-Government Development Index",
    emoji: "🖥️",
    org: "United Nations",
    category: "governance",
    indiaRank: 105,
    total: 193,
    topCountry: "Denmark",
    trend: "up",
    color: "#0ea5e9",
    desc: "Measures countries' use of ICT to deliver public services and transform governance towards more open, smart government.",
    source: "https://publicadministration.un.org/",
    history: [
      { year: 2020, rank: 100 }, { year: 2022, rank: 105 }
    ]
  },

  // ── ENVIRONMENT ──
  {
    id: "epi",
    name: "Environmental Performance Index (EPI)",
    emoji: "🌍",
    org: "Yale & Columbia University",
    category: "environment",
    indiaRank: 176,
    total: 180,
    topCountry: "Estonia",
    trend: "down",
    color: "#22c55e",
    desc: "Ranks nations on environmental health, ecosystem vitality, air quality, water & sanitation, biodiversity & climate change. India ranks very low primarily due to air quality.",
    source: "https://epi.yale.edu/",
    history: [
      { year: 2020, rank: 168 }, { year: 2022, rank: 180 },
      { year: 2024, rank: 176 }
    ]
  },
  {
    id: "climate-change",
    name: "Climate Change Performance Index",
    emoji: "🌡️",
    org: "Germanwatch, NewClimate Institute & CAN",
    category: "environment",
    indiaRank: 7,
    total: 63,
    topCountry: "Denmark",
    trend: "up",
    color: "#16a34a",
    desc: "India performs well on this index — ranks 7th globally. Strong renewable energy commitments drive the score. Tracks GHG emissions, renewables, energy use & climate policy.",
    source: "https://ccpi.org/",
    history: [
      { year: 2021, rank: 10 }, { year: 2022, rank: 10 },
      { year: 2023, rank: 8 }, { year: 2024, rank: 7 }
    ]
  },
  {
    id: "forest",
    name: "Forest & Biodiversity",
    emoji: "🌳",
    org: "FAO Global Forest Resources Assessment",
    category: "environment",
    indiaRank: 10,
    total: 193,
    topCountry: "Russia",
    trend: "up",
    color: "#15803d",
    desc: "India is among top 10 nations in net increase in forest area. Forest cover has been increasing steadily — now at 24.6% of total geographic area.",
    source: "https://www.fao.org/forest-resources-assessment/",
    history: [{ year: 2022, rank: 12 }, { year: 2024, rank: 10 }]
  },

  // ── TECHNOLOGY ──
  {
    id: "gii",
    name: "Global Innovation Index (GII)",
    emoji: "💡",
    org: "WIPO",
    category: "tech",
    indiaRank: 39,
    total: 133,
    topCountry: "Switzerland",
    trend: "up",
    color: "#8b5cf6",
    desc: "India ranked 39 globally in 2023 — up from 81 in 2015. Known for innovation in IT, software, pharma. Consistently ranks in top 10 for innovation quality.",
    source: "https://www.globalinnovationindex.org/",
    history: [
      { year: 2019, rank: 52 }, { year: 2020, rank: 48 },
      { year: 2021, rank: 46 }, { year: 2022, rank: 40 }, { year: 2023, rank: 39 }
    ]
  },
  {
    id: "ict",
    name: "ICT Development Index",
    emoji: "📡",
    org: "International Telecommunication Union (ITU)",
    category: "tech",
    indiaRank: 135,
    total: 167,
    topCountry: "Iceland",
    trend: "up",
    color: "#0284c7",
    desc: "Measures access, use & skills related to ICT. Despite low rank, India has seen massive growth in internet access driven by affordable mobile data.",
    source: "https://www.itu.int/",
    history: [
      { year: 2021, rank: 140 }, { year: 2022, rank: 135 }
    ]
  },
  {
    id: "cyber",
    name: "Global Cybersecurity Index (GCI)",
    emoji: "🔒",
    org: "ITU",
    category: "tech",
    indiaRank: 10,
    total: 175,
    topCountry: "USA",
    trend: "up",
    color: "#0f172a",
    desc: "India ranked Tier 1 (top 10) in cybersecurity — reflecting strong legal, technical, organizational & capacity-building measures. Big jump from rank 47 in 2018.",
    source: "https://www.itu.int/en/ITU-D/Cybersecurity/",
    history: [
      { year: 2018, rank: 47 }, { year: 2020, rank: 10 },
      { year: 2021, rank: 10 }
    ]
  },

  // ── HEALTH ──
  {
    id: "ghsi",
    name: "Global Health Security Index",
    emoji: "🏥",
    org: "Johns Hopkins & NTI",
    category: "health",
    indiaRank: 66,
    total: 195,
    topCountry: "USA",
    trend: "same",
    color: "#ef4444",
    desc: "Assesses countries' ability to prevent, detect and respond to epidemics & pandemics. India scored 42.8/100 — moderate preparedness.",
    source: "https://www.ghsindex.org/",
    history: [
      { year: 2019, rank: 57 }, { year: 2021, rank: 66 }
    ]
  },
  {
    id: "bloomberg-health",
    name: "Bloomberg Healthiest Country Index",
    emoji: "💉",
    org: "Bloomberg",
    category: "health",
    indiaRank: 120,
    total: 169,
    topCountry: "Spain",
    trend: "same",
    color: "#f43f5e",
    desc: "Measures life expectancy, health risks, and environmental factors. India's low rank reflects challenges in sanitation, nutrition, and disease burden.",
    source: "https://www.bloomberg.com/",
    history: [{ year: 2019, rank: 120 }]
  },
  {
    id: "universal-health",
    name: "Universal Health Coverage Index",
    emoji: "🩺",
    org: "WHO & World Bank",
    category: "health",
    indiaRank: 112,
    total: 183,
    topCountry: "Canada",
    trend: "up",
    color: "#dc2626",
    desc: "Tracks access to essential health services. India's score has improved from 53 (2010) to 61 (2023), reflecting Ayushman Bharat and other health schemes.",
    source: "https://www.who.int/data/gho/",
    history: [
      { year: 2019, rank: 120 }, { year: 2021, rank: 115 },
      { year: 2023, rank: 112 }
    ]
  }
];
