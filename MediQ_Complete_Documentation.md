# 📘 MediQ — Complete System Documentation
### AI-Powered Medical Report Analyzer | Full Technical Reference

> **Version:** v6.0-enhanced | **Author:** Mahesh VVD. P | **Internship:** Infosys Virtual Internship
> **Date:** March 2026 | **Stack:** React + TypeScript + Python Flask + SQLite + Gemini AI

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Interface-to-Interface Workflow](#3-interface-to-interface-workflow)
4. [Feature-Wise System Explanation](#4-feature-wise-system-explanation)
5. [Backend Logic Flow](#5-backend-logic-flow)
6. [Database Interaction](#6-database-interaction)
7. [Complete End-to-End Working Flow](#7-complete-end-to-end-working-flow)
8. [Interface Explanation (Screen-by-Screen)](#8-interface-explanation-screen-by-screen)
9. [Technical Implementation Details](#9-technical-implementation-details)
10. [System Workflow Diagrams](#10-system-workflow-diagrams)

---

## 1. Project Overview

### 1.1 What is MediQ?

**MediQ** is a full-stack, AI-powered **medical report analysis platform** that transforms unstructured medical documents into structured, meaningful, and actionable health insights.

A user uploads a medical report in any common format (PDF, scanned image, or CSV). MediQ **extracts** the text, **analyzes** every biomarker using a dual AI engine, and then **displays** results in a rich interactive dashboard with health scores, risk predictions, a personalized 10-day health plan, doctor's perspective, organ system scores, and historical trend tracking.

### 1.2 The Problem It Solves

In real healthcare environments:

| Problem | How MediQ Solves It |
|---|---|
| Reports come in different formats (PDF, image, CSV) | Smart extraction router handles all formats automatically |
| Biomarkers buried in long documents | AI extracts and structures every value |
| Patients can't understand complex lab language | AI generates plain-language explanations per parameter |
| No quick risk assessment tool | Automated risk scoring + health score out of 100 |
| No tracking over time | Persistent report history + comparison feature |
| No personalized recovery guidance | AI-generated 10-day health plan per report |

### 1.3 Who Are the Users?

- **Patients** — upload their own lab reports to understand their results
- **Health-conscious individuals** — track biomarkers over time
- **Medical students / interns** — study report interpretation via AI explanations
- **Healthcare staff** — quickly summarize patient reports

> **Note:** MediQ is a single-role system. Any registered user has full access to all features. There are no admin/staff distinctions.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Browser)                      │
│   React 18 + TypeScript + Tailwind CSS + Vite           │
│                                                         │
│   8 Screens:  Landing → Auth → Upload → Processing     │
│               → Results → History → HealthPlan → Compare│
│                                                         │
│   API Client:  lib/api.ts  (JWT-authenticated fetch)    │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTP REST  (localhost:5000)
                       │  JSON + multipart/form-data
                       │  Authorization: Bearer <JWT>
┌──────────────────────▼──────────────────────────────────┐
│                BACKEND (Flask API)                       │
│   Python 3.x + Flask + Flask-CORS                       │
│                                                         │
│   Routes:  /  /health  /auth/*  /upload                 │
│            /reports  /reports/<uid>  /reports/compare   │
│                                                         │
│   Modules:                                              │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐ ┌───────┐  │
│   │ app.py   │  │extractors │  │ai_engine │ │utils  │  │
│   │ (routes) │  │  .py      │  │  .py     │ │ .py   │  │
│   └──────────┘  └──────┬────┘  └────┬─────┘ └───────┘  │
│                        │            │                    │
│               ┌────────▼──┐  ┌──────▼──────────────┐   │
│               │ PDF/OCR/  │  │ Gemini 2.0 Flash     │   │
│               │ CSV Parse │  │ (Primary AI Engine)  │   │
│               └───────────┘  │ Groq / LLaMA 3.1     │   │
│                              │ (Fallback Engine)    │   │
│                              └──────────────────────┘   │
│                                                         │
│   database.py ──► SQLite (mediq.db)                     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Frontend Components

| File | Purpose |
|---|---|
| [main.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/main.tsx) | React entry point — mounts `<App />` into `#root` |
| [App.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/App.tsx) | Root component — controls screen navigation with a state machine |
| [lib/api.ts](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts) | Centralized API client — all HTTP calls with JWT injection |
| [index.css](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/index.css) | Global styles, animations, glassmorphism utilities, print styles |
| [LandingPage.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/LandingPage.tsx) | Hero page with feature grid and "Get Started" CTA |
| [AuthScreen.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/AuthScreen.tsx) | Login / Signup form (tab-switched UI) |
| [UploadInterface.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/UploadInterface.tsx) | Drag-and-drop file upload with live backend health monitor |
| [ProcessingScreen.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/ProcessingScreen.tsx) | Animated 5-stage pipeline animation while backend processes |
| [ResultsDashboard.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/ResultsDashboard.tsx) | Full analysis dashboard — the most complex component (662 lines) |
| [HistoryDashboard.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/HistoryDashboard.tsx) | List of all past reports with compare/delete/view actions |
| [HealthPlanView.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/HealthPlanView.tsx) | Day-by-day 10-day interactive health plan with completion tracking |
| [CompareReports.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/CompareReports.tsx) | Side-by-side comparison of two historical reports |

### 2.3 Backend Modules

| File | Responsibility |
|---|---|
| [app.py](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/app.py) | Flask app, all route handlers, CORS, file upload/validation |
| [ai_engine.py](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/ai_engine.py) | Dual AI orchestrator (Gemini → Groq → fallback), prompt builder, normalizer, risk scorer |
| [extractors.py](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/extractors.py) | Smart file routing: PDF text, OCR for images/scanned PDFs, CSV converter |
| [database.py](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/database.py) | SQLite CRUD: `users` and [reports](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/app.py#327-336) tables, connection management |
| [utils.py](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py) | JWT creation/verification, password hashing, auth decorator, validators, compare helper |
| [run_debug.py](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/run_debug.py) | Debug launcher — captures stdout/stderr from [app.py](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/app.py) into log files |

### 2.4 Database Structure

**Database:** SQLite file at [backend/api/mediq.db](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/mediq.db)

**Table: `users`**
```sql
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    last_login    TEXT
);
```

**Table: [reports](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/app.py#327-336)**
```sql
CREATE TABLE reports (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    report_uid    TEXT UNIQUE NOT NULL,   -- e.g. REP-A1B2C3D4E5
    filename      TEXT NOT NULL,
    file_type     TEXT NOT NULL,          -- PDF, PNG, CSV, etc.
    health_score  INTEGER DEFAULT 0,
    overall_risk  TEXT DEFAULT 'unknown', -- low-risk / moderate-risk / high-risk
    analysis_data TEXT,                   -- full JSON blob of AI result
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_uid  ON reports(report_uid);
```

### 2.5 Environment Configuration

[backend/api/.env](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/.env) holds secret keys:
```
GEMINI_API_KEY=<Google AI Studio key>
GROQ_API_KEY=<Groq Cloud key>
JWT_SECRET=<random secret string>
```

[Frontend/.env](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/.env):
```
VITE_API_URL=http://127.0.0.1:5000
```

---

## 3. Interface-to-Interface Workflow

This section traces exactly how the application moves from screen to screen.

### 3.1 State Machine in App.tsx

[App.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/App.tsx) is the navigation controller. It holds a `currentScreen` state with 8 possible values:

```
"landing" | "auth" | "upload" | "processing" | "results" | "history" | "healthplan" | "compare"
```

Only one screen is rendered at a time (no routing library — pure React state). The App also holds:
- `currentUser` — authenticated user object
- `uploadedFile` — the File object selected by the user
- `analysisResult` — the JSON returned by the backend `/upload` API
- `compareOldUid` / `compareNewUid` — UIDs for report comparison

### 3.2 Complete Navigation Flow

```
START
  │
  ▼
[Landing Page]
  │ User clicks "Get Started"
  │
  ├── IF already logged in (localStorage has token)
  │       └──► [Upload Interface]
  │
  └── IF not logged in
          └──► [Auth Screen]
                │ User signs up OR logs in
                │ Backend returns JWT token
                │ Token stored in localStorage
                └──► [Upload Interface]
                          │ User selects file + clicks "Start Analysis"
                          │ Backend /upload API called
                          └──► [Processing Screen]  ← animated pipeline
                                    │ After 9 seconds of animation
                                    └──► [Results Dashboard]
                                              │
                                              ├── "View History" button
                                              │       └──► [History Dashboard]
                                              │                   │
                                              │                   ├── View button
                                              │                   │       └──► [Results Dashboard]
                                              │                   │
                                              │                   └── Compare 2 reports selected
                                              │                           └──► [Compare Reports]
                                              │
                                              └── "10-Day Health Plan" button
                                                      └──► [Health Plan View]
                                                                │
                                                                └── Back → [Results Dashboard]
```

### 3.3 Auth State Persistence

- On app startup, [App.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/App.tsx) calls [isAuthenticated()](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts#34-37) which checks `localStorage` for `mediq_token`
- If token exists, user is auto-logged in (no re-login needed)
- If any API call returns HTTP 401, [setOnAuthError()](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts#40-43) callback fires → auto-logout → redirect to Auth screen
- Logout clears `mediq_token` and `mediq_user` from localStorage

---

## 4. Feature-Wise System Explanation

### 4.1 Feature: User Registration (Sign Up)

**Interface:** [AuthScreen.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/AuthScreen.tsx)

**Input:** Full name, email address, password (min 6 characters)

**Frontend processing:**
1. User switches to "Sign Up" tab in [AuthScreen](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/AuthScreen.tsx#22-269)
2. On form submit, [signup(email, password, fullName)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts#86-97) from [api.ts](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts) is called
3. POST request sent to `http://127.0.0.1:5000/auth/signup` with JSON body

**Backend processing (`app.py → /auth/signup`):**
1. Parse JSON body
2. [validate_email(email)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py#99-109) — checks `@` present and domain has `.`
3. [validate_password(password)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py#111-116) — length ≥ 6
4. `full_name` length check ≥ 2
5. [get_user_by_email(email)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/database.py#87-94) — query DB; if exists → return 409 Conflict
6. [hash_password(password)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py#35-37) using `werkzeug pbkdf2:sha256` with 16-char salt
7. [create_user(email, hash, full_name)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/database.py#71-85) → INSERT into `users` table
8. [create_token(user_id, email)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py#47-55) → JWT signed with `HS256`, expires in 72 hours
9. Increment `SYSTEM_METRICS["total_users"]`

**Database actions:** `INSERT INTO users ...`

**Response returned to UI:**
```json
{
  "message": "Account created successfully",
  "token": "<JWT>",
  "user": { "id": 1, "email": "...", "full_name": "..." }
}
```

**Frontend after response:**
- [setToken(data.token)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts#16-19) → stored in `localStorage["mediq_token"]`
- [setUser(data.user)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts#30-33) → stored in `localStorage["mediq_user"]`
- `onAuthSuccess(data.user)` → [App.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/App.tsx) sets `currentUser`, navigates to Upload

---

### 4.2 Feature: User Login

**Interface:** [AuthScreen.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/AuthScreen.tsx)

**Input:** Email, password

**Backend processing (`/auth/login`):**
1. [get_user_by_email(email)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/database.py#87-94) — fetch user row from DB
2. If not found → 401
3. [verify_password(password, user["password_hash"])](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py#39-41) using `werkzeug check_password_hash`
4. If mismatch → 401
5. [update_user_login(user_id)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/database.py#108-116) → `UPDATE users SET last_login = NOW()`
6. [create_token(user_id, email)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py#47-55) → new JWT

**Output:** Same as signup response. JWT written to localStorage.

---

### 4.3 Feature: File Upload & AI Analysis

**Interface:** [UploadInterface.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/UploadInterface.tsx) → triggers [ProcessingScreen.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/ProcessingScreen.tsx)

**Input:** File selected (PDF, JPG, PNG, CSV, max 10MB)

**Step 1 — Frontend validation (client-side):**
- Check MIME type matches allowed list
- Check file size ≤ 10MB
- If image, create object URL for preview

**Step 2 — Upload (client-side):**
- [handleSubmit()](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/UploadInterface.tsx#90-124) called in [UploadInterface.tsx](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/components/UploadInterface.tsx)
- [uploadFile(file)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts#123-160) from [api.ts](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/Frontend/src/lib/api.ts) creates a `FormData`, sets 90-second `AbortController` timeout
- Progress bar animates from 0% → 90% at 2% / 80ms (simulated)
- Status text changes: "Uploading..." → "Extracting text..." → "AI is analysing..."
- POST to `/upload` with `Authorization: Bearer <token>` header
- On success: `setUploadProgress(100)` → after 600ms → `onUploadComplete(result, file)` called

**Step 3 — Backend route (`/upload`):**
The route is decorated with `@auth_required` which:
1. Reads `Authorization: Bearer <token>` header
2. Calls [decode_token(token)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/utils.py#57-65) — verifies JWT signature and expiry using `PyJWT`
3. Sets `g.user_id` and `g.user_email` on Flask's request context

**Step 4 — File validation (server-side):**
1. Check `"file"` in `request.files`
2. [validate_file(file)](file:///m:/mahesh/Intenships/Infosys%20Internship/Mahesh/MediQ/backend/api/app.py#77-93):
   - Extension in `{.pdf, .png, .jpg, .jpeg, .csv}`
   - File size ≤ 10MB (seek to end, get position, seek back to start)
3. Generate unique filename: `uuid4().hex + "_" + original_name`
4. Save to `backend/api/uploads/` directory

**Step 5 — Text Extraction (`extractors.py → extract_text()`):**

The `extract_text()` function is the smart router:

```
detect_file_type(file_path)
        │
        ├── "pdf"
        │     └── extract_pdf_text()  [PyMuPDF / fitz]
        │           │ If text < 20 chars (scanned PDF):
        │           └── convert_pdf_to_images() → image pages
        │                 └── pytesseract.image_to_string() [OCR fallback]
        │
        ├── "image"  (.jpg/.png)
        │     └── extract_image_text()
        │           └── Image.open() → pytesseract.image_to_string(config="--psm 6")
        │
        └── "csv"
              └── extract_csv_text()
                    └── pd.read_csv() → each row → "col is val, ..." sentences
```

**Step 6 — AI Analysis (`ai_engine.py → analyze_medical_text()`):**

```
analyze_medical_text(extracted_text)
    │
    ├── get_text_hash(text) → SHA-256 hash
    ├── IF hash in CACHE → return cached result immediately (cache hit)
    │
    ├── build_prompt(text) → Structured medical prompt asking for JSON
    │
    ├── analyze_with_gemini(text)  [PRIMARY]
    │     └── gemini_client.models.generate_content(model="gemini-2.0-flash")
    │
    ├── IF Gemini fails → analyze_with_groq(text)  [FALLBACK]
    │     └── groq_client.chat.completions.create(model="llama-3.1-8b-instant")
    │
    ├── IF both fail → use error-fallback dict with empty params
    │
    ├── extract_json(response.text) → strip markdown code fences → json.loads()
    │
    └── normalize_result(raw, engine, proc_time, cache_hit=False)
          ├── Normalize all params → add confidence score
          ├── calculate_risk_score(params) → health_score, overall_risk
          ├── normalize organ_scores (5 systems)
          ├── normalize health_plan (10 days)
          ├── normalize disease_risks
          └── Build final dict with audit trail
```

**Step 7 — Risk Score Calculation:**
```
Starting score = 100
For each parameter:
  status == "critical" → score -= 25
  status == "high" or "low" → score -= 12
  status == "normal" → score -= 2

score = clamp(5, 100)

score >= 75 → "low-risk"
score >= 45 → "moderate-risk"
else        → "high-risk"
```

**Step 8 — Database save:**
```python
save_report(
    user_id=g.user_id,
    report_uid="REP-XXXXXXXXXX",  # unique 10-char hex
    filename=file.filename,
    file_type="PDF" | "PNG" | "CSV",
    health_score=ai_result["risk_metrics"]["health_score"],
    overall_risk=ai_result["risk_metrics"]["overall_risk"],
    analysis_data=ai_result  # stored as JSON string
)
```

**Step 9 — Cleanup:** Uploaded file deleted from disk (`safe_delete(filepath)`) in `finally` block.

**Response returned:**
```json
{
  "user_profile": { "name": "...", "age": "...", "gender": "..." },
  "parameters": [ { "name": "Hemoglobin", "value": "10.2", "unit": "g/dL",
                    "normalRange": "13.5-17.5", "status": "low",
                    "confidence": 0.87, "explanation": "...", "red_flag": false } ],
  "summary": "2-3 sentence clinical summary...",
  "recommendations": ["...", "..."],
  "doctor_perspective": "Based on these results, I would recommend...",
  "organ_scores": { "metabolic": 72, "cardiac": 80, "renal": 68, "hepatic": 75, "hematologic": 79 },
  "health_plan": [ { "day": 1, "focus": "...", "diet": "...", "exercise": "...",
                     "precautions": "...", "sleep": "...", "supplements": "..." }, ... ],
  "disease_risks": [ { "disease": "Anemia", "risk_level": "high", "probability": 75, "explanation": "..." } ],
  "prevention_tips": ["...", "..."],
  "risk_metrics": { "health_score": 63, "overall_risk": "moderate-risk",
                    "critical_count": 0, "abnormal_count": 3, "average_confidence": 0.84 },
  "medical_disclaimer": "⚕️ IMPORTANT: ...",
  "audit": { "analysis_id": "abc123", "timestamp": "...", "engine": "gemini",
             "engine_version": "v6.0-enhanced-prod", "processing_time_ms": 4521, "cache_hit": false },
  "meta": { "report_uid": "REP-A1B2C3D4E5", "session_id": "SES-12345678",
            "filename": "...", "health_score": 63, "overall_risk": "moderate-risk",
            "processing_time": 4.52 }
}
```

---

### 4.4 Feature: Report History

**Interface:** `HistoryDashboard.tsx`

**Input:** Authenticated GET request (no parameters — returns all reports for current user)

**Backend (`GET /reports`):**
1. `@auth_required` verifies JWT, sets `g.user_id`
2. `get_user_reports(user_id, limit=50)` — SELECT from reports, ORDER BY `created_at DESC`
3. Returns lightweight list (excludes `analysis_data` blob for speed)

**Response:**
```json
{
  "count": 5,
  "reports": [
    { "id": 5, "report_uid": "REP-...", "filename": "blood_test.pdf",
      "file_type": "PDF", "health_score": 72, "overall_risk": "low-risk",
      "created_at": "2026-03-14T06:00:00" }
  ],
  "metrics": { "total_files_processed": 12, "successful_scans": 11, ... }
}
```

**Frontend display:**
- Each report card shows: filename, date/time, health score, risk badge, trend icon
- Trend icon compares current report's health score to the previous one (TrendingUp / TrendingDown / Minus)
- Select 2 reports → "Compare Selected" button appears

---

### 4.5 Feature: View a Past Report

**Interface:** `HistoryDashboard.tsx` → `ResultsDashboard.tsx`

**Input:** Click "Eye" icon on a report card → `handleViewReport(uid)`

**Backend (`GET /reports/<report_uid>`):**
1. `get_report_by_uid(report_uid, user_id)` — SELECT * WHERE uid matches AND belongs to this user
2. `analysis_data` JSON string is parsed back to dict
3. Full report object returned including the AI analysis blob

**Frontend:** `App.tsx` sets `analysisResult = report.analysis_data`, navigates to `"results"` screen

---

### 4.6 Feature: Delete a Report

**Interface:** `HistoryDashboard.tsx`

**Input:** Click trash icon → browser `confirm()` dialog → `handleDelete(uid)`

**Backend (`DELETE /reports/<report_uid>`):**
1. `delete_report(report_uid, user_id)` — DELETE WHERE uid AND user_id match (prevents other users deleting your data)
2. Returns `rowcount > 0` to confirm deletion occurred

**Frontend:** On success, filters deleted report from local state array (no full reload)

---

### 4.7 Feature: Report Comparison

**Interface:** `HistoryDashboard.tsx` → `CompareReports.tsx`

**Input:** 2 report UIDs (older, newer)

**Frontend in CompareReports:**
On mount, calls `compareReports(oldUid, newUid)` from `api.ts`

**Backend (`POST /reports/compare`):**
1. Parse `{ report_old, report_new }` from request body
2. `get_two_reports(uid1, uid2, user_id)` — fetches both full reports
3. Extracts `parameters` array from both `analysis_data` blobs
4. Calls `compare_parameters(old_params, new_params)` from `utils.py`:
   - Merges parameter lists by name (lowercased)
   - For each shared parameter: computes numeric change, % change, trend (`improved/declined/stable`)
   - New parameters: marked with `trend: "new"`
5. Computes health score delta and trend
6. Computes organ score changes for all 5 systems

**Response:**
```json
{
  "comparison": {
    "parameters": [ { "name": "Hemoglobin", "old_value": "10.2", "new_value": "13.8",
                      "unit": "g/dL", "old_status": "low", "new_status": "normal",
                      "change": 3.6, "change_percent": 35.3, "trend": "improved" } ],
    "health_score": { "old": 63, "new": 82, "change": 19, "trend": "improved" },
    "organ_scores": {
      "metabolic": { "old": 70, "new": 85, "change": 15 },
      ...
    },
    "report_old": { "uid": "...", "filename": "...", "date": "...", "risk": "moderate-risk" },
    "report_new": { "uid": "...", "filename": "...", "date": "...", "risk": "low-risk" }
  }
}
```

---

### 4.8 Feature: 10-Day Health Plan

**Interface:** `HealthPlanView.tsx`

**Input:** `health_plan` array from `analysisResult` (already loaded — no new API call)

**Frontend:**
- Displays 10 day cards, each expandable
- Each day shows: focus, diet, exercise, sleep, supplements, precautions
- Each day has a "Mark Complete" checkbox button
- Progress bar tracks `completedDays.size / healthPlan.length * 100%`
- Completion state is local (in-memory, not persisted to backend)

**Data structure per day:**
```json
{
  "day": 1,
  "focus": "Hydration & Iron Intake",
  "diet": "Include iron-rich foods: spinach, lentils, red meat...",
  "exercise": "Light 20-min walk — avoid strenuous activity",
  "precautions": "Watch for dizziness or breathlessness",
  "sleep": "7-8 hours; elevate head slightly",
  "supplements": "Iron supplement with Vitamin C for absorption"
}
```

---

### 4.9 Feature: Dark / Light Mode

**Implementation:** Global theme toggle in `App.tsx`

- On mount: reads `localStorage["theme"]` — initializes to `"dark"` if saved
- `useEffect` toggles `document.documentElement.classList.toggle("dark", isDarkMode)`
- Every component receives `isDarkMode: boolean` as a prop
- Every component applies conditional Tailwind classes based on this prop
- Theme change saved back to localStorage on every toggle

---

### 4.10 Feature: PDF Export

**Implementation:** Single button in `ResultsDashboard.tsx`

```jsx
<button onClick={() => window.print()}>Export</button>
```

`index.css` defines print styles:
```css
@media print {
  nav, button, .no-print { display: none !important; }
  body { background: white !important; color: black !important; }
  main { max-width: 100% !important; padding: 10mm !important; }
}
```
All interactive elements with class `no-print` are hidden. The printed page shows only the analysis data in a clean layout.

---

### 4.11 Feature: Backend Health Monitoring

**Both `UploadInterface.tsx` and `ProcessingScreen.tsx` monitor backend health every 4-5 seconds:**

```typescript
const healthy = await checkHealth();  // GET /health
setApiStatus(healthy ? "online" : "offline");
```

If offline — the "Start Analysis" button is disabled and shows gray with "API Offline" status chip.

---

## 5. Backend Logic Flow

### 5.1 Authentication System (JWT)

```
Client sends → Authorization: Bearer eyJhbGci...

decode_token(token):
    jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    ├── Valid → return { user_id, email, iat, exp }
    ├── ExpiredSignatureError → return None
    └── InvalidTokenError → return None

auth_required decorator:
    ├── No "Bearer" header → 401
    ├── decode_token() = None → 401 "Invalid or expired token"
    └── Valid → sets g.user_id, g.user_email → proceeds to route
```

**Token payload structure:**
```json
{ "user_id": 1, "email": "user@example.com",
  "iat": 1710000000, "exp": 1710259200 }
```
Expiry: 72 hours from creation.

### 5.2 Request-Response Cycle

```
Frontend fetch() with Authorization header
        │
        ▼
Flask receives request
  → Flask-CORS adds CORS headers (allows all origins)
  → @auth_required decorator fires
      → decode JWT
      → set g.user_id
        │
        ▼
Route handler executes business logic
        │
        ▼
jsonify(result) → HTTP Response with JSON body
        │
        ▼
Frontend receives JSON
  → Updates React state
  → Re-renders UI
```

### 5.3 Error Handling Strategy

| Error Type | Backend Response | Frontend Behavior |
|---|---|---|
| No file in upload | `400 { "error": "No file received" }` | Shows error banner |
| Wrong file type | `400 { "error": "Unsupported file type" }` | Shows error banner |
| File > 10MB | `400 { "error": "File exceeds 10MB" }` | Shows error banner |
| Unreadable document | `500 { "error": "Empty or unreadable document" }` | Shows error banner |
| Both AI engines fail | `500` + fallback empty params | Shows "processing error" |
| Invalid/expired JWT | `401 { "error": "Invalid or expired token" }` | Auto-logout + redirect to Auth |
| 90s timeout (upload) | `AbortError` thrown | "Analysis timed out" message |
| Email already exists | `409 { "error": "Account with email exists" }` | Shows in form |

### 5.4 In-Memory Cache

`ai_engine.py` maintains a module-level `CACHE = {}` dict:
- **Key:** SHA-256 hash of the extracted text string
- **Value:** Full normalized result dict
- **Hit:** Returns cached result with `cache_hit=True` in audit, `engine="cache"`
- **Miss:** Runs full AI pipeline, stores result in CACHE
- Cache resets when backend server restarts

### 5.5 System Metrics Telemetry

`app.py` maintains session-scoped counters:
```python
SYSTEM_METRICS = {
    "total_files_processed": 0,
    "successful_scans": 0,
    "failed_scans": 0,
    "total_users": 0
}
```
These increment on each operation and are returned with `/reports` and `/history` responses for display in the Results Dashboard's "Infra Telemetry" strip.

---

## 6. Database Interaction

### 6.1 Connection Management

```python
def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row   # Rows behave like dicts
    conn.execute("PRAGMA journal_mode=WAL")     # Write-Ahead Logging for concurrency
    conn.execute("PRAGMA foreign_keys=ON")      # Enforce FK constraints
    return conn
```

Every function opens a fresh connection and closes it in a `finally` block. No connection pooling (SQLite is file-based, acceptable for local use).

### 6.2 User Operations

| Function | SQL | When Called |
|---|---|---|
| `create_user(email, hash, name)` | `INSERT INTO users ...` | Signup |
| `get_user_by_email(email)` | `SELECT * WHERE email=?` | Login / duplicate check |
| `get_user_by_id(user_id)` | `SELECT id,email,full_name ... WHERE id=?` | `/auth/me` endpoint |
| `update_user_login(user_id)` | `UPDATE users SET last_login=? WHERE id=?` | Every successful login |

### 6.3 Report Operations

| Function | SQL | When Called |
|---|---|---|
| `save_report(...)` | `INSERT INTO reports ...` | After successful analysis |
| `get_user_reports(user_id)` | `SELECT ... WHERE user_id=? ORDER BY created_at DESC LIMIT 50` | History page load |
| `get_report_by_uid(uid, user_id)` | `SELECT * WHERE report_uid=? AND user_id=?` | View single report |
| `get_two_reports(uid1, uid2, user_id)` | Two calls to `get_report_by_uid` | Report comparison |
| `delete_report(uid, user_id)` | `DELETE WHERE report_uid=? AND user_id=?` | Delete from history |
| `get_user_report_count(user_id)` | `SELECT COUNT(*) WHERE user_id=?` | `/auth/me` stats |

### 6.4 Data Security
- `user_id` is always included in report queries → a user can only access their own reports
- Passwords stored as `pbkdf2:sha256` hashes, never plain text
- `ON DELETE CASCADE` on `reports.user_id` → deleting a user clears all their reports

---

## 7. Complete End-to-End Working Flow

### 7.1 System Initialization

```
1. Backend starts: python app.py
   ├── load_dotenv() → reads .env for API keys and JWT_SECRET
   ├── database.init_db() called on import → CREATE TABLE IF NOT EXISTS
   ├── Tesseract path auto-detected on Windows (checks 4 candidate paths)
   ├── Gemini client initialized with API key
   ├── Groq client initialized with API key
   └── Flask app.run(host="0.0.0.0", port=5000, debug=True)

2. Frontend starts: npm run dev
   ├── Vite dev server starts on port 5173
   ├── React mounts <App /> in #root
   ├── App.tsx checks localStorage for existing token
   └── If token exists → setCurrentUser(stored user) → show Landing with user info
```

### 7.2 New User Journey (Complete)

```
Step 1: User opens http://localhost:5173
         → LandingPage renders with animated background, feature grid, hero CTA

Step 2: User clicks "Get Started"
         → handleGetStarted() in App.tsx
         → isAuthenticated() = false (no token)
         → setCurrentScreen("auth")

Step 3: AuthScreen loads
         → User types email, password, full name
         → toggles to "Sign Up" tab
         → Submits form

Step 4: signup() in api.ts
         → POST http://127.0.0.1:5000/auth/signup
         → Body: { email, password, full_name }

Step 5: Backend /auth/signup validates and creates user
         → Writes to users table
         → Generates JWT
         → Returns 201 { token, user }

Step 6: api.ts stores token in localStorage
         → App.tsx: setCurrentUser(user), setCurrentScreen("upload")

Step 7: UploadInterface renders
         → useEffect: checkHealth() every 5s → shows "API Online" green badge
         → User drags a PDF file into drop zone

Step 8: handleFileSelect(file)
         → Validates type and size
         → Shows preview (if image) or file icon
         → "Start Analysis" button becomes active

Step 9: User clicks "Start Analysis"
         → handleSubmit() called
         → uploadFile(file) starts
         → setInterval simulates progress 0→90% at 80ms intervals
         → uploadStatus text changes as progress advances

Step 10: Backend /upload receives file
          → Validates file, saves to uploads/
          → extract_text() called:
              PDF: fitz opens PDF → iterates pages → gets text
          → analyze_medical_text(text) called:
              SHA-256 hash computed (cache miss)
              build_prompt(text) creates detailed medical prompt
              analyze_with_gemini(text) → Gemini 2.0 Flash API call
              extract_json(response) → parses AI JSON
              normalize_result() → structures all data
              calculate_risk_score() → computes health_score
          → save_report() → INSERT into reports table
          → os.unlink() deletes uploaded file
          → Returns full JSON result

Step 11: Frontend receives result
          → clearInterval (stops fake progress)
          → setUploadProgress(100) → "Done! Loading results..."
          → setTimeout(600ms) → onUploadComplete(result, file)
          → App.tsx: setAnalysisResult(result), setUploadedFile(file)
          → setCurrentScreen("processing")

Step 12: ProcessingScreen renders
          → 5-stage animation runs (1.2s delay + 1.8s per step = ~11s total)
          → Each stage marks previous "complete" (green), current "processing" (blue spinner)
          → Log terminal shows simulated AI log messages
          → After all stages: setTimeout(1500ms) → onComplete() called
          → setCurrentScreen("results")

Step 13: ResultsDashboard renders
          → Reads analysisResult from props
          → Displays:
              • AI Summary banner
              • 4 metric cards (health score, normal count, abnormal count, critical count)
              • Infra telemetry strip (engine, latency, cache hit, analysis ID)
              • Patient profile card + health score radial chart + distribution pie chart
              • Critical findings alert strip (if any)
              • Doctor's perspective block
              • Full biomarker table (filterable, each row expandable)
              • Organ system health bar chart
              • 10-Day health plan CTA card + disease risk predictions
              • Prevention tips grid
              • Medical disclaimer footer

Step 14: User clicks "Export"
          → window.print() → browser print dialog → PDF saved
```

---

## 8. Interface Explanation (Screen-by-Screen)

### 8.1 Landing Page (`LandingPage.tsx`)

**What it shows:**
- Fixed navbar with MediQ logo, theme toggle, user info (if logged in), "Get Started" button
- Animated background: 3 large blurred radial gradient blobs + 8 floating colored orbs
- Hero section: badge, H1 headline with gradient animated text, subtitle, CTA button
- Trust row: "Privacy First", "Encrypted Data", "Local Processing" badges
- **Feature Grid** (4 cards): AI Analysis, 10-Day Health Plan, Compare Reports, Doctor's Perspective
- **How It Works** (4 steps): Upload → Extract → Analyze → Act
- **Stats section**: 98.5% Accuracy, <30s Response Time, 10-Day Plans, 100% Private
- Medical disclaimer card

**User interactions:**
- "Get Started" / "Upload Report" / "Analyze Report" → all call `handleGetStarted()`
- Theme toggle (Moon/Sun) → persisted to localStorage
- Logout button (when logged in) → `handleLogout()`

---

### 8.2 Auth Screen (`AuthScreen.tsx`)

**What it shows:**
- Animated DNA helix background (20 floating dot particles)
- MediQ logo centered
- **Tab switcher**: "Sign In" | "Sign Up"
- Form fields:
  - Full name (sign up only)
  - Email with Mail icon
  - Password with Lock icon + Eye/EyeOff toggle
- Error banner (rose-colored, shown on API error)
- Submit button with loading spinner
- Trust badges: "Encrypted", "AI-Powered"
- Back button (top-left)

**Internal behavior:**
- `isLogin` boolean state controls which tab is active and which fields show
- On submit: calls `login()` or `signup()` from `api.ts`
- Error from API displayed inline
- On success: `onAuthSuccess(user)` navigates to Upload

---

### 8.3 Upload Interface (`UploadInterface.tsx`)

**What it shows:**
- Sticky navbar: Back button, user name badge, logout, API status indicator
- Page title + subtitle
- **Upload Box** (large dashed border, rounded corners):
  - Empty state: upload icon, "Drop your file here", "Browse Files" button
  - File selected: file preview (image) or icon, filename, file size, remove (X) button
  - Uploading: progress bar (0→100%), status text, estimated time countdown
- Submit button: "Start Analysis →"
- Error banner (if validation or API fails)
- AI Disclaimer warning
- 3 info cards: OCR Scanning, AI Inference, Health Mapping

**Drag-and-drop logic:**
```javascript
onDragOver → setIsDragging(true) → visual scale + border color change
onDragLeave → setIsDragging(false)
onDrop → e.dataTransfer.files[0] → handleFileSelect(file)
```

**API health polling:**
```javascript
useEffect → checkHealth() immediately + every 5000ms
```

---

### 8.4 Processing Screen (`ProcessingScreen.tsx`)

**What it shows:**
- Pulsing animated brain icon (blue gradient with scan line animation)
- Status headline (changes per pipeline stage)
- Status chips: Backend Online/Offline, AI Engine (Gemini/Groq/Local cycling), "Neural Pipeline Active"
- **Log Terminal** (dark background mono-font): shows 4 recent log messages, newest highlighted blue
- **Progress bar**: fills as each of 5 stages completes
- **5-stage checklist**:
  1. Data Extraction (starts processing immediately)
  2. OCR Engine
  3. Biomarker Mapping
  4. Contextual AI
  5. Finalizing Report
- Footer: "256-Bit Encrypted", "AI-Generated • Not Medical Advice"

**Important note:** This screen is purely *animated* — the actual processing is already complete before this screen shows. The result JSON was received in Step 10 above. This screen runs a `setTimeout`-based animation pipeline for UX purposes, then auto-advances to Results after ~11 seconds.

---

### 8.5 Results Dashboard (`ResultsDashboard.tsx`)

**The most data-rich screen (662 lines of code). Sections:**

| Section | What It Shows |
|---|---|
| AI Summary Banner | 2-3 sentence clinical summary from AI |
| 4 Metric Cards | Health Score %, Normal count, Abnormal count, Critical count — each with mini progress bar |
| Infra Telemetry Strip | Analysis ID, Engine used, Version, Latency (ms), Cache HIT/MISS, Status |
| Patient Profile | Name, age, gender, date, filename |
| Health Score Radial | Circular radial bar chart (Recharts) showing score/100, colored by risk level |
| Distribution Pie | Donut chart showing Normal/Low/High/Critical distribution |
| Critical Alert Strip | Shown only if critical parameters exist — rose-colored grid of flagged biomarkers |
| Doctor's Perspective | AI-generated paragraph in physician's voice |
| Biomarker Table | Full filterable table (All/Critical/Abnormal/Normal); each row clickable to expand |
| Expanded Row | Clinical interpretation, visual range bar (marker at low/normal/high/critical position), AI confidence bar, Suggested Action |
| Organ System Health | 5 score badges + recharts BarChart for metabolic/cardiac/renal/hepatic/hematologic |
| 10-Day Plan CTA | Clickable card → navigates to HealthPlanView |
| Disease Risk Predictions | Up to 4 disease risks with probability bars and risk level badges |
| Prevention Tips | Grid of 6 tips |
| Clinical Governance Footer | Medical disclaimer text (dark background) |

**Filter buttons:** All / Critical / Abnormal / Normal — filters the biomarker table in-place.

**Expand row:** Clicking any biomarker row toggles `openRow === i` state — shows/hides the detailed interpretation panel.

---

### 8.6 History Dashboard (`HistoryDashboard.tsx`)

**What it shows:**
- Sticky nav with Back button and "Compare Selected" button (appears when 2 selected)
- Page title + report count + instructions
- Compare hint banner (when 1 selected: "Select one more to compare")
- Loading spinner / error state / empty state
- **Report cards** (one per report):
  - Select for compare (checkbox-style button, turns blue when selected)
  - Filename headline + date/time + file type badge
  - Health score number + trend icon (TrendingUp/Down/Minus vs previous)
  - Risk level badge (colored by risk)
  - View (Eye) button → loads full report → navigates to Results
  - Delete (Trash) button → confirm dialog → removes from DB and UI

---

### 8.7 Health Plan View (`HealthPlanView.tsx`)

**What it shows:**
- Sticky header with Back button + progress tracker (X/10 days completed + mini progress bar)
- Large Calendar icon + title "Your 10-Day Health Plan"
- AI disclaimer banner
- **Day cards** (10 of them):
  - Color-coded gradient number badge (10 unique gradients)
  - Day number + focus summary + expand/collapse chevron
  - Mark Complete checkbox (green checkmark when done)
  - Expanded: 4 plan cards (Diet, Exercise, Sleep, Supplements) + Precautions warning

**Completion tracking:** Local state using `Set<number>` — not persisted to backend.

---

### 8.8 Compare Reports (`CompareReports.tsx`)

**What it shows:**
- On mount: immediately calls `compareReports(oldUid, newUid)` API
- Loading spinner during fetch
- Error state if comparison fails
- **Health Score Comparison** (3-column grid):
  - Left: Previous report filename + score
  - Center: Score delta (±N) with TrendingUp/Down icon + trend label
  - Right: Latest report filename + score
- **Organ System Changes** (5 columns): Each shows old→new values + change (green/red)
- **Biomarker Changes Table**: Each parameter row shows: name, unit, old value → new value, trend badge (improved/declined/stable/new), change %
- AI Comparison Disclaimer footer

---

## 9. Technical Implementation Details

### 9.1 Frontend Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI component framework |
| TypeScript | 5.5.3 | Type-safe JavaScript |
| Vite | 5.4.2 | Build tool and dev server (port 5173) |
| Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| Recharts | 3.7.0 | Charts: BarChart, RadialBarChart, PieChart |
| lucide-react | 0.344.0 | Icon library (50+ icons used) |
| Inter font | — | Primary typeface (Google Fonts) |
| JetBrains Mono | — | Monospace font for terminal/log displays |

**No routing library** — navigation is a React state machine in `App.tsx`.

**Global animation library** — custom CSS keyframes in `index.css`:
- `float`, `fadeInUp`, `fadeIn`, `gradientFlow`, `scan`, `shimmer`, `orbit`, `helix`, `bounceSlow`
- Glassmorphism utilities: `.glass`, `.glass-dark`, `.glow-blue`, `.glow-emerald`
- 3D card perspective: `.perspective-container`, `.card-3d`

### 9.2 Backend Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.x | Backend runtime |
| Flask | Latest | Web framework + route handling |
| Flask-CORS | Latest | Cross-origin resource sharing |
| PyMuPDF (fitz) | Latest | Digital PDF text extraction |
| pytesseract | Latest | OCR wrapper for Tesseract |
| Pillow (PIL) | Latest | Image opening for OCR |
| pandas | Latest | CSV parsing |
| python-dotenv | Latest | `.env` file loading |
| google-genai | Latest | Gemini 2.0 Flash API client |
| groq | Latest | Groq Cloud / LLaMA API client |
| PyJWT | Latest | JWT encode/decode |
| werkzeug | Latest | Password hashing (pbkdf2:sha256) |
| sqlite3 | stdlib | Database (built into Python) |
| hashlib | stdlib | SHA-256 for cache keys, MD5 for analysis IDs |
| uuid | stdlib | Generating unique file/report/session IDs |

### 9.3 AI Prompt Engineering

The `build_prompt()` function in `ai_engine.py` instructs the AI:

1. **Identity**: "You are MediQ, a medical report analysis AI"
2. **Rules**: Extract ALL biomarkers, use medical reference ranges, no hallucination
3. **Output format**: Exact JSON schema with 9 top-level keys
4. **Data constraints**: Only flag disease risks supported by actual data, be conservative
5. **Text limit**: First 12,000 characters of extracted text used (`text[:12000]`)
6. **Temperature**: 0.1 for Groq (deterministic medical analysis)

### 9.4 Confidence Score System

```python
def generate_confidence(status: str) -> float:
    ranges = {
        "normal":   (0.85, 0.98),
        "low":      (0.75, 0.90),
        "high":     (0.75, 0.90),
        "critical": (0.65, 0.85)
    }
    return round(random.uniform(low, high), 2)
```
If AI provides a confidence value, it's used directly. Otherwise this generator provides a realistic pseudo-confidence. Normal parameters get higher confidence (AI is more certain of normal readings).

### 9.5 File Processing Pipeline Detail

**PDF Digital Text Extraction:**
```python
with fitz.open(file_path) as doc:
    for page in doc:
        text += page.get_text()
```

**PDF → Image OCR fallback (scanned PDFs):**
```python
# Render at 2x zoom for better OCR accuracy
mat = fitz.Matrix(2, 2)
pix = page.get_pixmap(matrix=mat)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
text = pytesseract.image_to_string(img, config="--psm 6")
# --psm 6 = Assume uniform block of text
```

**CSV to medical sentences:**
```python
for _, row in df.iterrows():
    sentence_parts = [f"{col} is {val}" for col, val in row.items() if pd.notna(val)]
    lines.append(", ".join(sentence_parts))
# Result: "Hemoglobin is 10.2, WBC is 5.5, Platelets is 150000"
```

### 9.6 JWT Implementation Details

```python
def create_token(user_id: int, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "iat": datetime.now(timezone.utc),          # issued at
        "exp": datetime.now(timezone.utc) + timedelta(hours=72)  # expiry
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
```

The `auth_required` decorator is a Python function decorator using `functools.wraps` to preserve the route function name. It wraps every protected route and short-circuits with a 401 response if auth fails.

---

## 10. System Workflow Diagrams

### 10.1 Complete Data Flow Diagram

```
USER (Browser)
     │
     │  1. GET http://localhost:5173
     │
     ▼
REACT APP (Vite Dev Server)
     │
     │  2. User logs in / signs up
     │  3. JWT token ← stored in localStorage
     │
     │  4. User selects and uploads file
     │  5. POST /upload + Authorization: Bearer <JWT>
     │     multipart/form-data (file binary)
     │
     ▼
FLASK API SERVER (port 5000)
     │
     ├── @auth_required → decode JWT → g.user_id set
     ├── validate_file() → extension + size check
     ├── file.save(UPLOAD_DIR / unique_filename)
     │
     ▼
EXTRACTORS MODULE
     │
     ├── detect_file_type() → "pdf" | "image" | "csv"
     ├── PDF: fitz.open() → page.get_text() per page
     │         └── If empty: convert_pdf_to_images() → OCR each page
     ├── IMAGE: PIL.Image.open() → pytesseract.image_to_string()
     └── CSV: pd.read_csv() → rows to natural language sentences
     │
     ▼  extracted_text (string of medical data)
     │
AI ENGINE MODULE
     │
     ├── get_text_hash(text) → SHA-256
     ├── CACHE check → HIT: return immediately
     │
     ├── build_prompt(text) → structured JSON-requesting prompt
     │
     ├── analyze_with_gemini(text)
     │         └── gemini_client.models.generate_content()
     │             → Gemini 2.0 Flash API (Google AI)
     │
     ├── [if Gemini fails] analyze_with_groq(text)
     │         └── groq_client.chat.completions.create()
     │             → Groq Cloud API (LLaMA 3.1 8B)
     │
     ├── extract_json(response.text) → parse AI JSON output
     │
     └── normalize_result(raw_data)
               ├── Normalize all parameters
               ├── calculate_risk_score() → health_score, overall_risk
               ├── Normalize organ_scores
               ├── Normalize health_plan (10 days)
               └── Normalize disease_risks
     │
     ▼  normalized result dict
     │
DATABASE MODULE
     │
     └── save_report(user_id, uid, filename, type, score, risk, data)
               └── INSERT INTO reports (analysis_data stored as JSON string)
     │
     ▼
FLASK API RESPONSE
     │
     └── json.dumps(ai_result) → HTTP 200 with full JSON body
     │
     ▼
REACT FRONTEND
     │
     ├── Receives JSON result
     ├── setAnalysisResult(result)
     ├── Navigates to ProcessingScreen (animated UX)
     └── After animation → navigates to ResultsDashboard
               └── Renders full analysis with charts and tables
```

### 10.2 Authentication Flow

```
SIGNUP:
email + password + name
        │
        ▼
POST /auth/signup
        │
        ├─ validate_email() ──── FAIL → 400
        ├─ validate_password() ─ FAIL → 400
        ├─ check full_name ───── FAIL → 400
        ├─ get_user_by_email() ─ EXISTS → 409
        │
        ├─ hash_password() ← pbkdf2:sha256 + 16-char salt
        ├─ create_user() → INSERT INTO users
        └─ create_token() → HS256 JWT (72hr expiry)
                │
                ▼
        { token, user } → localStorage["mediq_token"]

LOGIN:
email + password
        │
        ▼
POST /auth/login
        │
        ├─ get_user_by_email() ─ NOT FOUND → 401
        ├─ verify_password() ─── MISMATCH → 401
        │
        ├─ update_user_login() → UPDATE last_login
        └─ create_token() → JWT
                │
                ▼
        { token, user } → localStorage["mediq_token"]

PROTECTED ROUTES:
Request + Authorization: Bearer <token>
        │
        ▼
auth_required decorator
        │
        ├─ No Bearer header → 401
        ├─ decode_token() → None (expired/invalid) → 401
        └─ Valid → g.user_id set → route executes
```

### 10.3 Report Comparison Flow

```
HistoryDashboard
        │
        ├── User clicks compare checkbox on report A
        ├── User clicks compare checkbox on report B
        └── "Compare Selected" button appears → clicked
                │
                ▼
App.tsx: goToCompare(olderUid, newerUid)
        │
        ▼
CompareReports mounts → useEffect fires
        │
        ▼
POST /reports/compare
{ report_old: "REP-...", report_new: "REP-..." }
        │
        ▼
get_two_reports(uid1, uid2, user_id)
  → Two SELECT queries → parse JSON analysis_data
        │
        ▼
compare_parameters(old_params, new_params)
  → Build name-keyed maps (lowercased)
  → Union of all parameter names
  → For each: compute change, change%, trend
        │
        ▼
Compute health_score delta + organ_score deltas
        │
        ▼
Return comparison JSON
        │
        ▼
CompareReports renders:
  ├── 3-panel health score comparison
  ├── Organ system change grid
  └── Full biomarker diff table
```

### 10.4 AI Engine Failsafe Chain

```
analyze_medical_text(text)
        │
        ├─ CACHE HIT? → return cached → DONE
        │
        ├─ Try: analyze_with_gemini(text)
        │         └─ gemini_client API call
        │               ├─ SUCCESS → extract_json() → raw dict
        │               └─ EXCEPTION (API error, timeout, quota)
        │                         ↓
        ├─ Try: analyze_with_groq(text)
        │         └─ groq_client API call
        │               ├─ SUCCESS → extract_json() → raw dict
        │               └─ EXCEPTION
        │                         ↓
        └─ Use error-fallback dict
                  └─ { parameters: [], summary: "AI error. Retry.", ... }

→ normalize_result(raw) always runs regardless of which path was taken
→ CACHE[text_hash] = normalized_result  (store for future requests)
→ return normalized_result
```

---

## Summary Table: All API Endpoints

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| GET | `/` | No | Service info / status |
| GET | `/health` | No | Backend health check |
| POST | `/auth/signup` | No | Create new account |
| POST | `/auth/login` | No | Login + get JWT |
| GET | `/auth/me` | Yes | Get current user info + report count |
| POST | `/upload` | Yes | Upload file → extract → AI analyze → save |
| GET | `/reports` | Yes | Get all user's report summaries |
| GET | `/reports/<uid>` | Yes | Get single full report with analysis |
| DELETE | `/reports/<uid>` | Yes | Delete a report |
| POST | `/reports/compare` | Yes | Compare two reports side-by-side |
| GET | `/history` | Optional | Legacy endpoint (backward compat) |

---

## Summary Table: All Frontend Screens

| Screen | Component | Navigates To | API Calls |
|---|---|---|---|
| Landing | `LandingPage.tsx` | Auth or Upload | None |
| Auth | `AuthScreen.tsx` | Upload | `/auth/signup`, `/auth/login` |
| Upload | `UploadInterface.tsx` | Processing | `/upload`, `/health` |
| Processing | `ProcessingScreen.tsx` | Results | `/health` (monitor only) |
| Results | `ResultsDashboard.tsx` | History, HealthPlan | None (data already loaded) |
| History | `HistoryDashboard.tsx` | Results, Compare | `/reports`, `/reports/<uid>`, `DELETE /reports/<uid>` |
| Health Plan | `HealthPlanView.tsx` | Results | None (data from analysisResult) |
| Compare | `CompareReports.tsx` | History | `/reports/compare` |

---

*Documentation generated by full source code analysis — covers every module, route, component, and data flow in MediQ v6.0.*
