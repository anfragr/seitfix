# seitfix.at — Komplettsystem

Automatisiertes Website-Service: Ein Interessent fordert über `index.html` eine Vorschau an,
n8n baut pro Lead eine individuelle Baukasten-Seite (Maler / Elektriker / Beratung), deployed sie
via **GitHub → Netlify** und führt den Lead durch **zwei Feedback-Runden** bis zur finalen Website.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Startseite von seitfix.at mit dem Anfrage-Formular (E-Mail · Website ja/nein → URL · Gewerbe). |
| `maler.html` | Onepager-Vorlage Malerbetrieb inkl. Baukasten (10 Layout-Schemas, Farben, Fonts, DE/EN). |
| `elektriker.html` | Onepager-Vorlage Elektrotechnik inkl. Baukasten. |
| `beratung.html` | Onepager-Vorlage Unternehmensberatung inkl. Baukasten. |
| `seitfix-n8n-workflow.json` | Importierbarer n8n-Workflow (Trigger A/B/C). |
| `README.md` | Diese Anleitung. |

Alle HTML-Dateien sind **self-contained** (HTML + CSS + JS in einer Datei). Externe Abhängigkeiten:
nur **Google Fonts** und **picsum.photos** (Demo-Bilder), beide erst zur Laufzeit im Browser.

---

## Systemablauf (1–11)

1. Interessent füllt das Formular auf `index.html` aus.
2. Formular POSTet `{ email, hat_website, url, gewerbe }` an den n8n-Webhook `seitfix-form`.
3. n8n **normalisiert** die Daten und erzeugt eine `leadId`; **Switch** verzweigt nach Gewerbe.
4. Je Gewerbe-Ast ein **IF „Website vorhanden?"**:
   - **Ja** → alte Seite laden → **OpenAI** extrahiert Inhalte (JSON) → in die Gewerbe-Vorlage.
   - **Nein** → die eingebauten Demo-/Lorem-Defaults der Vorlage bleiben stehen.
5. **GitHub Commit** nach `l/{leadId}/index.html` → **Netlify** deployed automatisch.
6. **1. Gmail** an den Lead mit dem Link zum Baukasten.
7. **Runde 1 (Frontend):** Lead passt Layout/Farben/Fonts an, wählt vor dem Absenden 2.- und
   3.-Lieblingsschema → POST an `seitfix-round1`.
8. n8n baut die Seite = Kundenauswahl und lässt **OpenAI** aus 2./3.-Favorit **zwei Misch-Schemas**
   ableiten.
9. Neu-Deploy als Baukasten mit **nur 3 Schemas** (Schema 1 = Wahl, 2 & 3 = Mischungen) →
   **2. Gmail** an den Lead.
10. **Runde 2 (Frontend):** Lead wählt 1 von 3 Schemas → POST an `seitfix-round2`.
11. n8n committet die **finale Seite** und schickt dem **Betreiber** die Nachricht „Es ist fertig".

---

## Einrichtung in n8n

### 1. Workflow importieren
n8n → **Workflows → Import from File** → `seitfix-n8n-workflow.json`.

### 2. Credentials (Platzhalter → echte Werte)
Alle Credentials sind leer hinterlegt und müssen einmalig gesetzt werden:

| Credential-Typ | Verwendet in | Was eintragen |
|---|---|---|
| **OpenAI** (`openAiApi`) | „OpenAI: Inhalte extrahieren", „OpenAI: Favoriten mischen" | OpenAI API-Key. Modell ggf. anpassen (Default `gpt-4o-mini`). |
| **GitHub** (`githubApi`) | alle `SHA holen …` und `GitHub Commit …` | GitHub Personal Access Token mit `repo`-Rechten. |
| **Gmail** (`gmailOAuth2`) | „1./2. Mail an Lead", „Betreiber-Mail" | Gmail-OAuth2-Konto für den Versand. |

### 3. Platzhalter im Workflow ersetzen
Per Suchen-und-Ersetzen im JSON (vor Import) **oder** direkt in den Node-Parametern:

| Platzhalter | Bedeutung | Beispiel |
|---|---|---|
| `OWNER` | GitHub-Benutzer/Organisation | `meinname` |
| `REPO` | Repository-Name | `seitfix-sites` |
| `main` | Ziel-Branch (in URLs & Commit-Body) | `main` |
| `NETLIFY-DOMAIN` | Netlify-Domain, die das Repo deployed | `seitfix.netlify.app` |
| `BETREIBER@example.com` | Ihre Betreiber-Adresse (Schritt 11) | `ivo@seitfix.at` |
| `DEMO-LEAD@example.com` | Empfänger der 2. Mail — siehe Hinweis unten | — |

> **Empfänger der 2. Mail (Runde 2):** Die Lead-E-Mail stammt aus Trigger A. Persistieren Sie sie
> (z. B. in einem Datastore/Sheet je `leadId`) und schlagen Sie sie in Trigger B nach. Als
> einfacher Start ist ein Platzhalter gesetzt.

### 4. GitHub → Netlify
Legen Sie ein GitHub-Repo an (`OWNER/REPO`) und verbinden Sie es mit Netlify (Continuous
Deployment). Die vier HTML-Dateien gehören ins **Repo-Root**; n8n schreibt Lead-Seiten nach
`l/{leadId}/index.html`. Netlify deployed jeden Commit automatisch.

---

## Webhook-URLs ↔ Frontend-Konstanten

Nach dem Aktivieren des Workflows liefert n8n je Webhook eine URL. Tragen Sie diese in die
entsprechenden Konstanten in den HTML-Dateien ein:

| n8n-Webhook-Pfad | Frontend-Konstante | Datei(en) |
|---|---|---|
| `seitfix-form` | `N8N_FORM_WEBHOOK` | `index.html` |
| `seitfix-round1` | `N8N_ROUND1_WEBHOOK` | `maler.html`, `elektriker.html`, `beratung.html` |
| `seitfix-round2` | `N8N_ROUND2_WEBHOOK` | `maler.html`, `elektriker.html`, `beratung.html` |

Aktuell steht überall der Platzhalter `https://REPLACE-ME.n8n.cloud/webhook/…`. Die **Pfade**
(`seitfix-form`, `seitfix-round1`, `seitfix-round2`) sind zwischen Frontend und Workflow bereits
identisch — nur die Domain/Basis-URL muss angepasst werden.

---

## Injektions-Mechanik (wie n8n Inhalte einsetzt)

Jede Vorlage enthält zwei klar markierte, von n8n ersetzbare Blöcke:

```html
<!-- SEITFIX:CONFIG:START -->
<script> window.SEITFIX_CONFIG = { leadId, schema, akzent, textfarbe, nebentext,
         headingFont, bodyFont, round, availableSchemas }; </script>
<!-- SEITFIX:CONFIG:END -->

<!-- SEITFIX:CONTENT:START -->
<script> window.SEITFIX_CONTENT = { … business-Inhalte je Feld als {de,en} … }; </script>
<!-- SEITFIX:CONTENT:END -->
```

- Die Seite liest beim Laden `window.SEITFIX_CONFIG` / `window.SEITFIX_CONTENT`; fehlt ein Wert,
  greifen die eingebauten Defaults (nichts bleibt je leer).
- **Trigger A** ersetzt den `CONFIG`-Block (`leadId`, `round:1`, 10 Schemas) und — nur wenn eine
  alte Website extrahiert wurde — den `CONTENT`-Block.
- **Trigger B** lädt die aktuelle Lead-Seite, ersetzt **nur** den `CONFIG`-Block: `schema` =
  Kundenwahl, Farben/Fonts aus Runde 1, `round:2`, `availableSchemas:[wahl, mix1, mix2]`. Inhalte
  bleiben erhalten.
- **Trigger C** fixiert die finale Wahl: `schema` = finale Wahl, `round:3`,
  `availableSchemas:[schema]`.

`round`/`availableSchemas` steuern den Baukasten-Modus: `round 1` = voller Baukasten (10 Schemas),
`round 2` = nur die 3 angebotenen Schemas + „Finale Wahl bestätigen", `round 3` = fixiertes Schema.

---

## `content.*`-Felder je Vorlage

Von n8n ersetzbare Inhaltsfelder (im `SEITFIX:CONTENT`-Block, jeweils `{de, en}`; Bildfelder als
URL-String). Struktur ist in allen drei Vorlagen identisch — nur die Defaults unterscheiden sich.

**Gemeinsame Felder (maler / elektriker / beratung):**

```
firmenname
hero_eyebrow · hero_titel · hero_subtitel · hero_badge_zahl · hero_badge_text · hero_bild (URL)
leistungen_titel · leistungen_text
leistung_1_titel · leistung_1_text
leistung_2_titel · leistung_2_text
leistung_3_titel · leistung_3_text
leistung_4_titel · leistung_4_text
projekte_titel · projekte_text
referenz_1_bild (URL) · referenz_1_titel
referenz_2_bild (URL) · referenz_2_titel
referenz_3_bild (URL) · referenz_3_titel
ueber_bild (URL) · ueber_titel · ueber_text
station_1_jahr · station_1_titel · station_1_text
station_2_jahr · station_2_titel · station_2_text
station_3_jahr · station_3_titel · station_3_text
kontakt_titel · kontakt_text · kontakt_adresse · kontakt_email · kontakt_telefon
footer_text
```

Demo-Bilder nutzen `https://picsum.photos/seed/<stichwort>/<b>/<h>` mit Branchen-Stichwörtern —
Maler: `paint,wall,interior,renovation` · Elektriker: `electric,wiring,solar,panel` ·
Beratung: `office,meeting,chart,strategy`.

Die UI-Chrome (Navigation, Buttons, Sektions-Labels, Formular-Labels) liegt getrennt im
`I18N`-Objekt jeder Datei und schaltet ebenfalls DE/EN.

---

## Lokaler Test

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080/` (Startseite) bzw. `.../maler.html` öffnen. Ohne gesetzte Webhook-URLs
zeigen die Formulare trotzdem eine freundliche Bestätigung — es wirkt nichts „kaputt".

**Runde-2-Modus testen:** In der Browser-Konsole vor dem Neuladen z. B.
`window.SEITFIX_CONFIG = { leadId:'demo', round:2, availableSchemas:[8,10,4] }` setzen, dann die
Seite mit diesem injizierten Block ausliefern — der Baukasten zeigt dann nur 3 Schemas und den
„Finale Wahl bestätigen"-Button.

---

## Hinweis zum Betrieb

- Der Workflow ist mit `"active": false` importiert — nach dem Konfigurieren aktivieren.
- Die `SHA holen …`-Nodes tolerieren einen 404 (Datei existiert beim ersten Commit noch nicht).
- OpenAI-Nodes und externe HTTP-Loads sind auf `continueRegularOutput` gesetzt, damit ein einzelner
  Fehler den Lauf nicht abbricht.
