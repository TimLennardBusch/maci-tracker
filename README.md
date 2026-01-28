# 1% Besser - Daily Habit Tracker

> "Was macht mich heute 1% besser?"

Eine mobile-first Progressive Web App (PWA) zum Tracken täglicher Micro-Improvements. Setze morgens ein Ziel, bestätige abends deinen Erfolg, und verfolge deinen Fortschritt über Zeit.

## ✨ Features

- 🌅 **Morgen-Routine**: Tägliches Ziel definieren
- 🌙 **Abend-Check**: Erfolg bestätigen mit optionaler Reflexion
- 🔥 **Streak-Tracking**: Tage in Folge mit Erfolg
- 📊 **Analytics**: 30-Tage Fortschritts-Graph
- 📅 **Wochen-Übersicht**: Kalenderansicht der letzten 7 Tage
- 📱 **PWA**: Installierbar auf iOS/Android
- 🔗 **Apple Shortcuts**: REST API für Automatisierung

## 🚀 Quick Start

### 1. Dependencies installieren

```bash
cd "20 daily habit tracker"
npm install
```

### 2. Firebase einrichten

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. Neues Projekt erstellen
3. **Realtime Database** aktivieren (nicht Firestore!)
4. Database Rules setzen (siehe unten)
5. Projekt-Konfiguration kopieren

### 3. Environment Variablen

Bearbeite `.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://dein-projekt-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=dein-projekt
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_APP_PASSWORD=dein-sicheres-passwort
```

### 4. Firebase Database Rules

In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "dailyEntries": {
      "$userId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### 5. Starten

```bash
npm run dev
```

Öffne http://localhost:5173 im Browser.

## 📱 PWA Installation

### iOS (Safari)

1. Öffne die App in Safari
2. Tippe auf "Teilen" → "Zum Home-Bildschirm"

### Android (Chrome)

1. Öffne die App in Chrome
2. Tippe auf die drei Punkte → "App installieren"

## 🍎 Apple Shortcuts

Siehe [docs/APPLE_SHORTCUTS.md](docs/APPLE_SHORTCUTS.md) für die vollständige API-Dokumentation.

**Kurz-Übersicht:**

| Aktion       | Methode | Endpoint                                   |
| ------------ | ------- | ------------------------------------------ |
| Ziel setzen  | PUT     | `/dailyEntries/demo-user-001/{datum}.json` |
| Abend-Check  | PATCH   | `/dailyEntries/demo-user-001/{datum}.json` |
| Ziel abrufen | GET     | `/dailyEntries/demo-user-001/{datum}.json` |

## 🛠 Manuelle Konfigurationsschritte

### 1. Firebase Projekt erstellen

- Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
- "Projekt hinzufügen" klicken
- Projektnamen eingeben (z.B. "habit-tracker-1percent")
- Google Analytics optional deaktivieren
- Projekt erstellen

### 2. Realtime Database aktivieren

- Im Menü links: "Build" → "Realtime Database"
- "Datenbank erstellen" klicken
- Standort wählen (europe-west1 empfohlen)
- "Im Testmodus starten" wählen (für Entwicklung)

### 3. Database Rules anpassen

- Tab "Regeln" öffnen
- Regeln von oben einfügen und "Veröffentlichen"

### 4. Web-App registrieren

- Projektübersicht → Web-App hinzufügen (</> Icon)
- App-Nickname eingeben
- Firebase SDK Config kopieren
- Werte in `.env` eintragen

### 5. (Optional) Deployment

```bash
npm run build
# Deploy dist/ Ordner auf Vercel, Netlify, etc.
```

## 📁 Projektstruktur

```
20 daily habit tracker/
├── .env                    # Firebase Credentials
├── index.html              # Entry HTML
├── vite.config.js          # Vite + PWA Config
├── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css           # Design System
│   ├── lib/
│   │   └── supabase.js     # Firebase Client (historischer Name)
│   └── components/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── MorningInput.jsx
│       ├── EveningCheck.jsx
│       ├── StreakBadge.jsx
│       ├── WeekOverview.jsx
│       ├── AnalyticsChart.jsx
│       └── BottomNav.jsx
└── docs/
    └── APPLE_SHORTCUTS.md
```

## 🎨 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Vanilla CSS mit Custom Properties
- **Charts**: Chart.js + react-chartjs-2
- **Database**: Firebase Realtime Database
- **PWA**: vite-plugin-pwa

## 📄 Lizenz

MIT
