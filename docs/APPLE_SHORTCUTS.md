# Apple Shortcuts API Dokumentation (Firebase)

Diese Dokumentation beschreibt, wie du Apple Kurzbefehle einrichtest, um mit der 1% Besser App via Firebase REST API zu interagieren.

## Firebase REST API Basis

Firebase Realtime Database bietet eine REST API:

```
https://DEIN-PROJEKT-default-rtdb.europe-west1.firebasedatabase.app/
```

> [!NOTE]
> Die Region kann variieren (europe-west1, us-central1, etc.) - prüfe deine Firebase Console.

---

## API Endpoints

### 1. Morgenziel setzen (PUT)

Setzt oder aktualisiert das Tagesziel.

**Endpoint:**

```
PUT /dailyEntries/demo-user-001/2024_01_28.json
```

> [!IMPORTANT]
> Firebase nutzt Unterstriche statt Bindestriche im Datum: `2024_01_28` nicht `2024-01-28`

**Body:**

```json
{
  "user_id": "demo-user-001",
  "date": "2024-01-28",
  "morning_goal": "10 Minuten meditieren",
  "evening_completed": null,
  "created_at": "2024-01-28T07:00:00Z",
  "updated_at": "2024-01-28T07:00:00Z"
}
```

**Vollständige URL:**

```
https://YOUR-PROJECT-default-rtdb.europe-west1.firebasedatabase.app/dailyEntries/demo-user-001/2024_01_28.json
```

### 2. Abend-Bestätigung (PATCH)

Aktualisiert nur das evening_completed Feld.

**Endpoint:**

```
PATCH /dailyEntries/demo-user-001/2024_01_28.json
```

**Body (Erfolg):**

```json
{
  "evening_completed": true,
  "reflection_note": "Hat super geklappt!",
  "updated_at": "2024-01-28T21:00:00Z"
}
```

**Body (Nicht geschafft):**

```json
{
  "evening_completed": false,
  "updated_at": "2024-01-28T21:00:00Z"
}
```

### 3. Heutiges Ziel abrufen (GET)

**Endpoint:**

```
GET /dailyEntries/demo-user-001/2024_01_28.json
```

**Response:**

```json
{
  "user_id": "demo-user-001",
  "date": "2024-01-28",
  "morning_goal": "10 Minuten meditieren",
  "evening_completed": null
}
```

---

## Beispiel Apple Shortcut: Morgenziel

```
1. [Eingabe erfragen] - "Was macht dich heute 1% besser?"
   → Speichere als "Ziel"

2. [Aktuelles Datum] - Format berechnen
   → Verwende "Datumsformat: yyyy_MM_dd"
   → Speichere als "DatumKey"

3. [Aktuelles Datum] - Format ISO
   → Verwende "Datumsformat: yyyy-MM-dd"
   → Speichere als "DatumISO"

4. [URL abrufen]
   URL: https://YOUR-PROJECT-default-rtdb.europe-west1.firebasedatabase.app/dailyEntries/demo-user-001/[DatumKey].json
   Methode: PUT
   Headers:
     - Content-Type: application/json
   Body (JSON):
     {
       "user_id": "demo-user-001",
       "date": "[DatumISO]",
       "morning_goal": "[Ziel]",
       "evening_completed": null,
       "created_at": "[Aktuelles Datum ISO8601]",
       "updated_at": "[Aktuelles Datum ISO8601]"
     }

5. [Mitteilung anzeigen] - "✅ Ziel gesetzt: [Ziel]"
```

## Beispiel Apple Shortcut: Abend-Check

```
1. [Aus Liste wählen] - "Hast du dein Ziel erreicht?"
   Optionen: "✓ Ja", "✗ Nein"
   → Speichere als "Ergebnis"

2. [Aktuelles Datum] - Format: yyyy_MM_dd
   → Speichere als "DatumKey"

3. [Wenn Ergebnis = "✓ Ja"]
   → Setze "StatusJSON" auf: {"evening_completed": true}
   [Sonst]
   → Setze "StatusJSON" auf: {"evening_completed": false}

4. [URL abrufen]
   URL: https://YOUR-PROJECT-default-rtdb.firebasedatabase.app/dailyEntries/demo-user-001/[DatumKey].json
   Methode: PATCH
   Headers:
     - Content-Type: application/json
   Body: [StatusJSON]

5. [Mitteilung anzeigen] - "Abend-Check gespeichert!"
```

---

## Wichtige Hinweise für Firebase

| Thema                 | Details                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| **Authentifizierung** | Für öffentlichen Zugriff müssen die Database Rules auf `".read": true, ".write": true` gesetzt sein |
| **Datum-Format**      | Nutze Unterstriche im Key: `2024_01_28`                                                             |
| **Region**            | Prüfe deine Region in der Firebase Console                                                          |

### Database Rules (für Shortcuts notwendig)

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

> [!WARNING]
> Diese Rules sind offen für jeden! Für Produktion solltest du Firebase Authentication einrichten.
