# 🌍 Global Index Tracker

> Track all major global indexes and India's world ranking — free web app!

## ✨ Features
- 📊 **22+ Global Indexes** — HDI, GDP, Press Freedom, GII, CPI & more
- 🇮🇳 **India's rank** highlighted with trend (📈/📉)
- 🔍 **Search** any index by name or keyword
- 🏷️ **Category filters** — Economy, Human Dev, Governance, Environment, Tech, Health
- 📈 **Trend chart** — India's rank over years (Chart.js)
- ➕ **Add new indexes** — save to Firebase Firestore
- 🌙 **Dark Mode** toggle
- 📱 **Mobile-first** responsive design

---

## 🚀 How to Host FREE on Netlify (Easiest)

### Step 1 — Create GitHub Account
1. Go to [github.com](https://github.com) → Sign up (free)

### Step 2 — Upload Your Files
1. Click **"New repository"** → Name it `global-index-tracker`
2. Click **"Upload files"** → Drag all these files:
   ```
   index.html
   css/style.css
   js/app.js
   js/data.js
   js/firebase-config.js
   ```
3. Click **"Commit changes"**

### Step 3 — Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) → Sign up with GitHub (free)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose GitHub → Select your `global-index-tracker` repo
4. Click **"Deploy site"** — done! 🎉

Your site will be live at: `https://your-site-name.netlify.app`

---

## 🔥 Firebase Setup (Optional — for saving new indexes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → name it `global-index-tracker`
3. Click **"Web"** app icon (`</>`) → Register app
4. Copy the `firebaseConfig` object
5. Open `js/firebase-config.js` → Replace config values
6. In Firebase console → **Firestore Database** → Create database → Test mode

Without Firebase, the app still works — new indexes save to browser localStorage.

---

## 📁 File Structure
```
global-index-tracker/
├── index.html          ← Main page
├── css/
│   └── style.css       ← All styles
└── js/
    ├── app.js          ← Main logic
    ├── data.js         ← All 22+ indexes data
    └── firebase-config.js  ← Firebase (optional)
```

## 📊 Indexes Covered

| Category | Indexes |
|---|---|
| 💰 Economy | GDP PPP, GDP Nominal, Ease of Business, GCI, Trade |
| 👤 Human Dev | HDI, Gender Gap, Happiness, Hunger Index |
| 🏛️ Governance | CPI (Corruption), Press Freedom, Democracy, Rule of Law, E-Govt |
| 🌱 Environment | EPI, Climate Change Index, Forest Coverage |
| 💻 Technology | Global Innovation, ICT Development, Cybersecurity |
| 🏥 Health | GHSI, Bloomberg Health, Universal Health Coverage |

---
Made with ❤️ | Data from IMF, UNDP, WEF, WHO, Transparency International (2023–24)
