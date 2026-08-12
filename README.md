# Daily Lesson & Attendance Tracker — Pilot Setup

A free, mobile-first tool for teachers to log the lesson taught and attendance
for each period, and for the principal to see it all in one dashboard.

**Stack:** Google Sheets (database) + Google Apps Script (free backend/API) +
two static HTML pages (teacher form, principal dashboard) you host for free
and point at `school.zeratech.io`.

No paid services required for a single-school pilot.

---

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank sheet.
2. Name it something like **"[Your School] – Lesson Tracker"**.
3. Keep it open — you'll add the backend script to it next.

## 2. Add the backend script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code and paste in the entire contents of `Code.gs`
   (in this folder).
3. Click **Save** (disk icon), name the project e.g. "Lesson Tracker Backend".
4. In the function dropdown at the top, select **setupSheets**, then click
   **Run** (▶). The first time, Google will ask you to authorize the script
   (it's your own script acting on your own Sheet — click through the
   "unverified app" warning: **Advanced → Go to [project name] (unsafe)**).
5. Go back to the Sheet — you'll now see two tabs: **Entries** and **Setup**.
6. Open the **Setup** tab and replace the example rows with your real data:
   - **Teachers** column: one teacher name per row
   - **Classes** column: one class per row (e.g. Grade 6, Grade 7…)
   - **Sections** column: one section per row (e.g. A, B, C) — leave blank rows if you don't use sections
   - **Periods** column: one period per row (e.g. 1, 2, 3… or Period 1, Period 2…)
   - **Subjects** column: one subject per row
   - **SchoolName**: put your school's name in the first row only (cell F2)

   Columns don't need to be the same length — extra blank cells are ignored.

## 3. Deploy the backend as a Web App

1. Back in the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Settings:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**, authorize again if asked.
5. Copy the **Web app URL** it gives you (looks like
   `https://script.google.com/macros/s/XXXXXXX/exec`). You'll need this next.

   Every time you edit `Code.gs` later, you must create a **new deployment**
   (or use "Manage deployments → Edit → New version") for changes to go live.

## 4. Connect the frontend to your backend

1. Open `index.html` in this folder, find the line:
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
   and replace it with the Web App URL from step 3.
2. Do the same in `dashboard.html`.
3. Save both files.

## 5. Hosting (Zera Technologies standard flow)

This project follows the same GitHub → Vercel → Hostinger flow as other
Zera Technologies portals:

1. Code lives in `github.com/zeradental3585-dotcom/lesson-tracker-app`.
2. Vercel auto-deploys the static site on every push to `main`.
3. DNS for `zeratech.io` is managed in Hostinger — a CNAME record points
   `school.zeratech.io` at the Vercel deployment.
4. Teachers use `https://school.zeratech.io/` (index.html).
5. Principal dashboard is at `https://school.zeratech.io/dashboard.html`.

No server, no hosting cost, no database to manage — Google Sheets is the
database and Apps Script is the API.

## 6. Try it end-to-end

1. Open `https://school.zeratech.io/` on a phone — pick teacher, class,
   section, period, subject, enter topic + present/absent, submit.
2. Open the Sheet — a new row should appear in **Entries** within a couple
   of seconds.
3. Open `https://school.zeratech.io/dashboard.html` — the entry should show
   up in the table, stat cards, and charts.

---

## Data model (for reference)

**Entries sheet** (one row per submission):

| Column | Meaning |
|---|---|
| Timestamp | Server time of submission |
| Date | Date the lesson was taught (editable, defaults to today) |
| Teacher | Teacher name |
| Class | e.g. Grade 6 |
| Section | e.g. A |
| Period | e.g. Period 3 |
| Subject | e.g. Mathematics |
| Topic Taught | Free text |
| Present | Number present |
| Absent | Number absent |
| Total | Present + Absent |
| Remarks | Optional free text |

**Setup sheet**: the dropdown source lists (Teachers, Classes, Sections,
Periods, Subjects) plus SchoolName.

---

## Known limits of this pilot version (by design, to keep it free & fast)

- **No login/PIN** — any teacher can submit as any name. Fine for a trusted
  pilot; add a PIN-per-teacher check in `doPost` in `Code.gs` before wider
  rollout.
- **Google Sheets write concurrency** — Apps Script appends are queued and
  safe, but very high simultaneous traffic (hundreds of teachers submitting
  in the same second) can slow down. Not a concern for a single school.
- **Single school only** — the Sheet + script pair are per-school. Turning
  this into a multi-school paid product means moving to a real multi-tenant
  database (Firebase/Supabase) so each school's data is isolated and you can
  onboard schools without manual per-school setup. The data model above was
  kept simple on purpose so that migration is a data-copy, not a rewrite.

## Natural next features (once the pilot proves out)

- "Who hasn't submitted yet today" alert list for the principal
- Timetable-aware period auto-suggestion (skip manual period selection)
- Weekly email/WhatsApp digest to the principal
- Syllabus pace tracking (topics taught vs. curriculum plan)
- Per-teacher PIN login
- Multi-school, multi-tenant version for the sellable product

---

Designed and developed by [Zera Technologies](https://zeratech.io/) —
this project is a property of Zera Technologies.
