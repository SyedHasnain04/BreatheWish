# BreatheWish — Master LLM Instruction & Architecture Reference
> Current as of: September 2026
> This document specifies the complete architecture, design system tokens, security rules, and deployment procedures for BreatheWish.

---

## 1. System Architecture & Tech Stack

BreatheWish is a clinical chest radiograph screening and verification platform with human-in-the-loop doctor governance.

### Core Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS v3, Framer Motion.
- **Auth**: NextAuth v4 (Credentials Provider with JWT session storage and Edge Middleware role protection).
- **Backend API**: FastAPI (Python 3.11+), Uvicorn, SQLAlchemy 2.0, PostgreSQL (psycopg2-binary).
- **Machine Learning**: PyTorch (DenseNet-121 CheXNet architecture for pneumonia detection), Torchvision, Grad-CAM activation heatmap generator.
- **Storage**: Cloudinary (radiograph and Grad-CAM image hosting).
- **LLM Assistance**: Anthropic Claude (`claude-3-5-haiku-20241022`) for initial prescription drafting.
- **Deployment**: Vercel (Frontend & Edge Proxy) + Render (FastAPI Web Service & Managed PostgreSQL via `render.yaml`).

---

## 2. Design System Tokens & Aesthetics

The design system enforces a restrained, clinical visual language:
- **Single Accent**: Muted teal (`doctor-accent: #6FB5AC` on dark, `patient-accent: #1F7A72` on light). No blue, indigo, purple accents, or decorative gradients.
- **Neutral Family (Green-Tinted)**:
  - **Doctor / Dark Base**:
    - `background`: `#0B1113`
    - `surface`: `#121A1D`
    - `surface-raised`: `#182226`
    - `border`: `#25333A`
    - `text-primary`: `#EAF0EE`
    - `text-muted`: `#8A9A9C`
  - **Patient / Light Base**:
    - `patient-bg`: `#F6F8F7`
    - `patient-surface`: `#FFFFFF`
    - `patient-border`: `#E1E7E5`
    - `text-dark`: `#14201F`
    - `text-dark-muted`: `#5B6B69`
- **Severity Colors (Desaturated Semantic)**:
  - Severe: `text: #E58A85`, `bg: #2A1214`, `border: #C24545/30`
  - Moderate: `text: #E0B25C`, `bg: #2A1D0B`, `border: #B8791F/30`
  - Mild: `text: #7CC79A`, `bg: #0E2418`, `border: #3F8F5B/30`
  - Verified: `text: #5FB3A8`, `bg: #0F2624`, `border: #5FB3A8/30`
- **Typography**:
  - Primary text: `Geist Sans`
  - Numbers, dates, dosages, case IDs, and metrics: `Geist Mono` with `tabular` alignment.
- **Components & Iconography**:
  - Badges use `rounded-md`, not pills.
  - Zero external icon dependencies (all icons are semantic inline SVGs with `stroke-width="1.5"`).
  - Cards communicate hierarchy through borders and subtle elevation; no heavy drop shadows.

---

## 3. Human-in-the-Loop Clinical Safety Rules

1. **Patient AI Concealment**:
   - Patients **never** see raw AI pre-read outputs (confidence scores, model severity, or Grad-CAM heatmaps) before physician verification.
   - On `GET /cases/{id}` and `GET /cases/patient/{id}`, the backend suppresses `ai_confidence`, `ai_severity`, `ai_type`, and `gradcam_url` when requested by a patient.
   - The patient UI displays a reassuring "Under Review by Attending Physician" status banner until verified.
2. **Prescription Verification**:
   - Prescriptions drafted by the LLM are provisional drafts only.
   - They become visible to the patient only when explicitly verified and signed off by the attending doctor via `POST /prescriptions/{id}/verify`.
3. **Emergency Disclaimers**:
   - Every patient screen clearly indicates BreatheWish is an assistive screening aid and directs acute emergency symptoms to immediate hospital emergency care.

---

## 4. Backend Security & Access Control

1. **Doctor Registration Lockdown**:
   - Public registration via `/auth/register` only permits `role: "patient"`.
   - Creating a `doctor` account requires an administrative header `X-Admin-Key` matching `ADMIN_SECRET_KEY`.
2. **Endpoint Ownership Authorization**:
   - `PATCH /cases/{id}`: Only the assigned primary physician (`case.primary_doctor_id == current_user.id`) can update clinical verdicts.
   - `PATCH /prescriptions/{id}`: Only the prescribing physician (`rx.doctor_id == current_user.id`) can edit drafts.
   - `POST /prescriptions/{id}/verify`: Only the assigned doctor can finalize and send the prescription.
   - `PATCH /second-opinion/{id}/verdict`: Only the assigned second doctor can submit a review verdict.
3. **Upload Validation**:
   - File size enforced server-side: Maximum **10 MB** (`10,485,760` bytes).
   - Extension and MIME validation: Allowed types are `.png`, `.jpg`, `.jpeg`, `.dcm` (`image/png`, `image/jpeg`, `application/dicom`).
   - Empty or oversized uploads are rejected with `400 Bad Request`.
4. **Password Length & Rate Limiting**:
   - Minimum password length of 8 characters enforced in `UserCreate` schema and auth router.
   - Sliding-window IP rate limiter protects `/auth/login` (15 req/min) and `/auth/register` (10 req/min).
5. **Idempotent Seeding**:
   - `backend/seed.py` seeds default pulmonologists, radiologists, cardiologists, and test patients using upsert logic to prevent foreign key errors.

---

## 5. Route Architecture & Directory Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Split-screen auth with credential validation
│   │   └── register/page.tsx      # Split-screen patient registration
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler (typed session & JWT callbacks)
│   │   └── proxy/[...path]/       # Authenticated backend proxy route
│   ├── doctor/
│   │   ├── dashboard/page.tsx     # Dense severity worklist table with row skeletons
│   │   ├── case/[id]/page.tsx     # Radiograph diagnostic viewer, Grad-CAM toggle, Rx editor
│   │   └── new-case/page.tsx      # Physician intake form
│   ├── patient/
│   │   ├── dashboard/page.tsx     # Patient timeline and case progress
│   │   ├── case/[id]/page.tsx     # Verified prescription and doctor consultation
│   │   └── new-case/page.tsx      # Patient radiograph and symptom intake
│   ├── error.tsx                  # Global client error boundary
│   ├── not-found.tsx              # 404 page with navigation recovery
│   ├── privacy/page.tsx           # Clinical data retention and privacy policy
│   ├── terms/page.tsx             # Tele-screening terms and liability limitations
│   └── layout.tsx                 # Root layout with Geist font injection
├── components/
│   ├── cases/NewCaseForm.tsx      # Multi-step intake with client validation (10MB limit)
│   ├── doctor/
│   │   ├── ConfidenceChart.tsx    # Recharts radial probability pre-read
│   │   ├── PrescriptionEditor.tsx # Interactive prescription builder with auto-save
│   │   ├── SecondOpinionPanel.tsx # Specialist second-opinion consultation
│   │   └── XRayViewer.tsx         # Radiograph viewer with zoom modal & Grad-CAM toggle
│   ├── patient/
│   │   ├── AccuracyCard.tsx       # Verified case summary chart
│   │   ├── CaseStatusStepper.tsx  # Accessible milestone progress stepper
│   │   ├── ConsultationThread.tsx # Two-way clinical messaging
│   │   ├── FollowUpCard.tsx       # Scheduled appointment card
│   │   └── PrescriptionCard.tsx   # Verified patient prescription display
│   └── shared/
│       ├── NotificationBell.tsx   # Unread notifications with role-based routing
│       ├── PortalHeader.tsx       # Unified doctor/patient top navigation
│       ├── SeverityBadge.tsx      # Standardized severity badge
│       └── StatusBadge.tsx        # Standardized case status badge
└── middleware.ts                  # Edge route protection requiring NEXTAUTH_SECRET

backend/
├── app/
│   ├── main.py                    # FastAPI entrypoint, lifespan table creation, health check
│   ├── config.py                  # Pydantic BaseSettings loading .env
│   ├── database.py                # SQLAlchemy engine & session factory
│   ├── models/                    # User, Case, Prescription, SecondOpinion, AuditLog, etc.
│   ├── routers/                   # auth, cases, prescriptions, second_opinion, consultations
│   ├── schemas/                   # Pydantic request/response validation schemas
│   └── services/
│       ├── cloudinary_service.py  # Image upload handling
│       ├── doctor_assignment.py   # Workload and severity-based assignment
│       ├── llm_service.py         # Claude prescription drafting with fallback
│       └── ml_service.py          # PyTorch DenseNet-121 inference & Grad-CAM
├── seed.py                        # Idempotent database seeder
└── requirements.txt               # Backend dependencies
```

---

## 6. Deployment Procedure

### Render (Backend & Database)
1. In Render Dashboard, select **New +** $\rightarrow$ **Blueprint**.
2. Select repository `SyedHasnain04/BreatheWish`.
3. Render parses `render.yaml`:
   - Builds `breathewish-db` (Postgres 16).
   - Builds `breathewish-api` (FastAPI with CPU PyTorch wheels).
4. Enter production environment variables:
   - `JWT_SECRET`, `ADMIN_SECRET_KEY`, `CLOUDINARY_*`, `ANTHROPIC_*`.
5. Once live, run database seeding in the Render Shell:
   ```bash
   python seed.py
   ```

### Vercel (Frontend)
1. In Vercel, select **Add New Project** $\rightarrow$ `SyedHasnain04/BreatheWish`.
2. Set **Root Directory** to `frontend`.
3. Configure Environment Variables:
   - `NEXTAUTH_SECRET`: Rotated 32-byte secret key.
   - `BACKEND_URL`: `https://<your-render-api>.onrender.com`
   - `NEXT_PUBLIC_API_URL`: `/api/proxy`
4. Click **Deploy**. Vercel will run `next build` and deploy production edge routes.
