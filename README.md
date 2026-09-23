# BreatheWish — Clinical Chest Radiograph Screening Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3-EE4C2C)](https://pytorch.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC)](https://tailwindcss.com/)

BreatheWish is an AI-assisted clinical decision support system for chest radiograph screening (DenseNet-121 CheXNet architecture) paired with Grad-CAM explainability heatmaps, automated prescription drafting (Claude 3.5 Haiku), and strict human-in-the-loop physician governance.

---

## 🗺️ End-to-End Clinical Workflow & Architecture

### 1. Clinical Flowchart (Website Visit $\rightarrow$ Upload $\rightarrow$ AI Screening $\rightarrow$ Doctor Review)

```mermaid
flowchart TD
    %% Styling Definitions
    classDef startNode fill:#0F172A,stroke:#38BDF8,stroke-width:2px,color:#F8FAFC
    classDef patientNode fill:#064E3B,stroke:#34D399,stroke-width:2px,color:#ECFDF5
    classDef doctorNode fill:#1E3A8A,stroke:#60A5FA,stroke-width:2px,color:#EFF6FF
    classDef aiNode fill:#4C1D95,stroke:#A78BFA,stroke-width:2px,color:#F5F3FF
    classDef cloudNode fill:#78350F,stroke:#FBBF24,stroke-width:2px,color:#FFFBEB
    classDef decisionNode fill:#374151,stroke:#9CA3AF,stroke-width:2px,color:#F9FAFB

    subgraph Entry ["1. Landing & Role-Based Portal Access"]
        A["🌐 User visits BreatheWish (/)"]:::startNode
        B{"Select Portal"}:::decisionNode
        A --> B

        B -- "Patient" --> C["Patient Login / Register<br/>(/login or /register)"]:::patientNode
        B -- "Doctor" --> D["Hospital ID Badge Login<br/>(/login — e.g. BWD-ARUN01)"]:::doctorNode

        C --> E["Patient Dashboard (/patient/dashboard)"]:::patientNode
        D --> F["Doctor Worklist Dashboard (/doctor/dashboard)"]:::doctorNode
    end

    subgraph UploadFlow ["2. Patient Intake & Radiograph Submission"]
        E --> G["Click 'New Case' (/patient/new-case)"]:::patientNode
        G --> H["Step 1: Patient Demographics<br/>(Age, Sex, DOB, Blood Group)"]:::patientNode
        H --> I["Step 2: Symptoms Assessment<br/>(Fever days, Cough type, Chest pain, Dyspnea)"]:::patientNode
        I --> J["Step 3: Chest Radiograph Upload<br/>(Client validation: &lt;10 MB, PNG/JPEG/DICOM)"]:::patientNode
        J --> K["Submit Case via Reverse Proxy (POST /api/proxy/cases/)"]:::patientNode
    end

    subgraph AIPipeline ["3. Automated AI Screening & Cloud Storage"]
        K --> L["FastAPI Backend (POST /cases/)"]:::aiNode
        
        %% Parallel AI tasks
        L --> M["PyTorch DenseNet-121 Inference<br/>(Confidence %, Severity, Bacterial/Viral)"]:::aiNode
        L --> N["PyTorch Grad-CAM Layer Activation<br/>(Heatmap on features.denseblock4)"]:::aiNode
        
        M & N --> O["Cloudinary CDN Upload<br/>(Stores Diagnostic Radiograph & Grad-CAM)"]:::cloudNode
        
        L --> P["Triage Doctor Assignment<br/>(Matches case severity to pulmonologist)"]:::aiNode
        L --> Q["Claude 3.5 Haiku LLM<br/>(Provisional prescription & dosage draft)"]:::aiNode

        O & P & Q --> R[("Neon PostgreSQL Database<br/>Case Status: 'under_review'")]:::cloudNode
    end

    subgraph SafetyGate ["4. Safety Concealment Rule"]
        R --> S["Patient View (/patient/case/[id])"]:::patientNode
        S --> T["🔒 AI Concealment Active:<br/>Raw AI confidence, severity & Grad-CAM hidden.<br/>Status shown as 'Reviewing by Physician'."]:::patientNode
    end

    subgraph DoctorReview ["5. Physician Governance & Verification"]
        R --> U["Doctor views Worklist (/doctor/dashboard)<br/>Cases prioritized by clinical severity"]:::doctorNode
        U --> V["Doctor opens Diagnostic Case View (/doctor/case/[id])"]:::doctorNode

        V --> W1["Interactive X-Ray Viewer<br/>(Toggle Original / Grad-CAM / Blend / Zoom)"]:::doctorNode
        V --> W2["AI Pre-Read Radial Gauge<br/>(Confidence % & Severity Indicator)"]:::doctorNode
        V --> W3["Clinical Symptoms & Patient History"]:::doctorNode

        V --> X{"Specialist Second Opinion Needed?"}:::decisionNode
        X -- "Yes" --> Y["Request Second Opinion (POST /second-opinion/)<br/>Assigned specialist reviews & submits verdict"]:::doctorNode
        Y --> Z["Primary Physician Reviews Feedback"]:::doctorNode
        X -- "No" --> Z

        Z --> AA["Prescription Editor<br/>(Doctor edits AI draft medications, dosages & advice)"]:::doctorNode
        AA --> AB["Doctor Confirms Verdict & Verifies Case<br/>(PATCH /cases/{id} + POST /prescriptions/{id}/verify)"]:::doctorNode
        AB --> AC[("Neon PostgreSQL DB:<br/>Status updated to 'verified'")]:::cloudNode
    end

    subgraph Release ["6. Patient Notification & Care Plan Release"]
        AC --> AD["Status Stepper advances to 'Verified'"]:::patientNode
        AD --> AE["Verified Prescription Card Unlocked<br/>(Doctor signature, medications, dosage instructions)"]:::patientNode
        AE --> AF["Secure Clinical Consultation Chat<br/>(Patient-doctor bidirectional messaging)"]:::patientNode
    end
```

### 2. Technical & Network Architecture

```mermaid
graph TB
    subgraph Client ["Client Browser (Next.js 14 Frontend)"]
        direction TB
        UI_P["Patient Portal<br/>- Dashboard & Case Tracker<br/>- Stepper Component<br/>- Consultation Thread"]
        UI_D["Doctor Portal<br/>- Worklist Dashboard<br/>- Multi-mode X-Ray Viewer<br/>- Prescription Editor<br/>- Second Opinion Panel"]
        AUTH_C["NextAuth v4 Session<br/>- JWT stored in HttpOnly Cookie<br/>- Role-based Edge Middleware"]
    end

    subgraph ProxyLayer ["Next.js Server-Side Proxy (/api/proxy)"]
        PROXY["Same-Origin Reverse Proxy<br/>- Injects Bearer token into upstream header<br/>- 50s timeout for cold-start resilience"]
    end

    subgraph Backend ["FastAPI Backend (Render Cloud)"]
        direction TB
        ROUTER_AUTH["/auth (Login, OAuth, Register)"]
        ROUTER_CASES["/cases (Upload, Triage, Verdict)"]
        ROUTER_RX["/prescriptions (Draft, Verify)"]
        ROUTER_SO["/second-opinion (Consultation, Agreement)"]
        ROUTER_MSG["/consultations (Secure Messaging)"]
        SCHEDULER["APScheduler (Daily 9am Follow-up Reminders)"]
    end

    subgraph AI_Engine ["PyTorch & LLM Inference Engines"]
        DENSENET["DenseNet-121 (CheXNet)<br/>- 1024-dim features<br/>- Single-thread CPU optimization"]
        GRADCAM["Grad-CAM Layer Activation<br/>- features.denseblock4.denselayer16<br/>- Heatmap overlay generation"]
        CLAUDE["Anthropic Claude 3.5 Haiku<br/>- Clinical prescription drafting<br/>- Medication & dosage structuring"]
    end

    subgraph External_Storage ["Storage & Database"]
        DB[(Neon PostgreSQL<br/>Users, Cases, Prescriptions,<br/>Second Opinions, Audit Logs)]
        CLOUDINARY["Cloudinary CDN<br/>- Diagnostic Radiographs<br/>- Grad-CAM Heatmaps"]
    end

    %% Connections
    UI_P & UI_D --> AUTH_C
    AUTH_C --> PROXY
    PROXY --> ROUTER_AUTH & ROUTER_CASES & ROUTER_RX & ROUTER_SO & ROUTER_MSG

    ROUTER_CASES --> DENSENET
    ROUTER_CASES --> GRADCAM
    ROUTER_CASES --> CLAUDE
    ROUTER_CASES --> CLOUDINARY
    ROUTER_CASES & ROUTER_AUTH & ROUTER_RX & ROUTER_SO & ROUTER_MSG --> DB

    SCHEDULER --> DB
```

---

## 🔑 Demo & Test Login Credentials

Run `python backend/seed.py` once to seed the database with these verified test accounts:

### 1. Attending Physicians (Doctors)
Doctor accounts use hospital badge authentication. In the login portal (`/login`), select the **Doctor** tab and enter the **Hospital ID Card Number** (no password required):

| Name | Role / Specialty | Hospital ID Card (Badge No.) | Seniority |
|---|---|---|---|
| **Dr. Arun Mehta** | Pulmonology (Primary) | `BWD-ARUN01` | Senior Attending |
| **Dr. Priya Sharma** | Pulmonology (Primary) | `BWD-PRIYA1` | Consultant |
| **Dr. Vikram Nair** | Pulmonology (Primary) | `BWD-VIKR01` | Junior Attending |
| **Dr. Rajan Pillai** | Cardiology (Second Opinion) | `BWD-RAJA01` | Senior Specialist |
| **Dr. Sunita Rao** | Radiology (Second Opinion) | `BWD-SUNI01` | Senior Specialist |

### 2. Patient Test Accounts
All pre-seeded patients use the password: **`patient123`**

| Name | Role | Username / Email | Password |
|---|---|---|---|
| **Ravi Kumar** | Patient | `ravi_kumar` or `ravi@patient.com` | `patient123` |
| **Priya Nair** | Patient | `priya_nair` or `priya@patient.com` | `patient123` |

> **Self-Registration**: Patients can also self-register at `/register` (passwords must be at least 8 characters). Public registration is locked to patient accounts; doctor accounts are provisioned via hospital administration.

---

## 🧪 Clinical Verification Test Cases

Execute these test scenarios to verify the full clinical workflow:

### Test Case 1: Patient Self-Registration & Radiograph Submission
1. Navigate to `/register` and sign up with a new patient account (`test@patient.com`, password: `patient1234`).
2. Log in and click **New Case** (`/patient/new-case`).
3. Fill out symptoms (age, weight, fever duration, cough type) and upload a sample chest radiograph (e.g., `frontend/public/chest-xray.png`).
4. **Expected Result**: File passes client validation (< 10 MB, valid PNG/JPEG/DICOM), backend returns `201 Created`, and redirects to patient dashboard.

### Test Case 2: Human-in-the-Loop AI Concealment (Safety Rule)
1. In the patient dashboard, open the newly created case (`/patient/case/[id]`).
2. **Expected Result**: 
   - Raw model outputs (`ai_confidence`, `ai_severity`, `ai_type`) and Grad-CAM heatmaps are strictly hidden.
   - Status stepper displays **Reviewing** with a reassuring notice: *"Your scan is currently under review by your assigned physician."*
   - Direct API call `GET /cases/{id}` with the patient's token does not expose AI pre-read fields.

### Test Case 3: Doctor Worklist Triage & Grad-CAM Analysis
1. Open an incognito browser window, navigate to `/login`, select the **Doctor** tab, and enter Hospital ID card number: `BWD-ARUN01` (Dr. Arun Mehta).
2. In the Doctor Dashboard (`/doctor/dashboard`), verify the case is displayed in the worklist sorted by clinical severity.
3. Click into the case (`/doctor/case/[id]`):
   - Inspect the **AI Pre-Read Radial Gauge** showing pneumonia probability and severity band.
   - Use the **X-Ray Viewer** toggle to switch between **Original**, **Grad-CAM**, and **Blend** modes.
   - Click the radiograph to test the enlarged diagnostic modal, and press <kbd>Esc</kbd> to dismiss.

### Test Case 4: Prescription Editing & Physician Verification
1. In the Doctor Case view, scroll to the **Prescription Editor**.
2. Notice the AI-generated provisional draft. Add/edit medications, frequency, dosages, and follow-up notes.
3. Click **Save draft** to persist edits without releasing to the patient.
4. Click **Verify and send to patient** and confirm.
5. **Expected Result**: Case status transitions to `verified`. Audit log and patient notification are created.

### Test Case 5: Verified Patient View
1. Return to the patient session and reload `/patient/case/[id]`.
2. **Expected Result**: 
   - Milestone stepper advances to **Verified**.
   - The verified clinical prescription card appears, displaying doctor details, dosages, and administration instructions.

### Test Case 6: Specialist Second Opinion Workflow
1. As the primary doctor, expand the **Request a second opinion** drawer on a case.
2. Select specialty (e.g., *Radiology*) and enter clinical reasoning.
3. Log out, return to `/login`, select the **Doctor** tab, and enter `BWD-SUNI01` (Dr. Sunita Rao, Radiologist).
4. Review the requested consultation, choose **Agree** / **Disagree**, enter verdict notes, and submit.
5. **Expected Result**: Primary doctor sees the specialist's feedback with matching badges.

### Test Case 7: Secure Clinical Messaging Thread
1. In the patient case view, type a message into the **Clinical Consultation** box and click **Send**.
2. Switch to the doctor view: the message appears in real-time or within the 15-second polling interval.
3. Doctor replies: messages are rendered with theme-aware patient/doctor chat bubbles.

### Test Case 8: Server-Side Security & Access Guards
- **Upload Size Guard**: Attempt uploading a file > 10 MB $\rightarrow$ backend returns `400 Bad Request`.
- **Doctor Ownership Guard**: Doctor B attempting to update Doctor A's case verdict via `PATCH /cases/{id}` $\rightarrow$ backend returns `403 Forbidden`.
- **Public Doctor Signup Guard**: Calling `POST /auth/register` with `role: "doctor"` without `X-Admin-Key` $\rightarrow$ backend rejects with `403 Forbidden`.
- **Rate Limiting**: Sending > 15 login requests within 60 seconds from the same IP $\rightarrow$ backend returns `429 Too Many Requests`.

---

## 📊 Model Pipeline Verification & Benchmarks

The inference pipeline performs image preprocessing, PyTorch DenseNet-121 forward pass, and Grad-CAM layer activation mapping on target layer `features.denseblock4.denselayer16.conv2`.

### Benchmark Results (Standard Sample `frontend/public/chest-xray.png`)
```text
Inference Verification:
- Confidence = 63.8%
- Severity = moderate
- Type = viral
- Grad-CAM output bytes = 80,348
- Inference Execution Latency = ~2.4 seconds (CPU execution)
```

### Pre-seeded Demo Cloud Assets
All demonstration seed records link to live, high-resolution diagnostic radiograph assets on Cloudinary:
- **Original Chest Radiograph**: `https://res.cloudinary.com/act3ugiy/image/upload/v1790138908/breathewish/demo/demo_chest_xray.jpg`
- **PyTorch DenseNet-121 Grad-CAM**: `https://res.cloudinary.com/act3ugiy/image/upload/v1790138910/breathewish/demo/demo_chest_gradcam.png`

---

## ⚙️ Operational & Performance Architecture

Key architectural optimizations implemented across frontend and backend:

1. **Render Free-Tier Cold Start Resilience**:
   - Free instances on Render spin down after 15 minutes of inactivity. Cold starts can take 20–30s.
   - NextAuth `authorize` handler and Next.js reverse proxy (`/api/proxy/[...path]`) use an extended **50-second timeout** with `AbortSignal.timeout(50000)` to prevent premature 502 / auth abort failures.
   - The login UI includes an intelligent progress timer that informs users when the backend is waking up.

2. **CPU Threading & Event Loop Protection**:
   - PyTorch is constrained to single-thread execution via `torch.set_num_threads(1)` and `torch.set_num_interop_threads(1)`. On fractional/shared CPU cloud containers, this eliminates thread contention and prevents gateway timeouts.
   - CPU-bound endpoints (`create_case`, `test_inference`) run as synchronous worker functions (`def`) so FastAPI offloads them to a background threadpool, keeping the main async event loop responsive for keep-alives and health checks.

3. **Resilient Cloudinary Uploads**:
   - Cloudinary image uploads are wrapped with an execution timeout (15s) and automatic fallback to verified diagnostic sample assets. If cloud storage connectivity is delayed, case creation still completes without raising unhandled 500 errors.

4. **Zero-Downtime Data Migrations**:
   - Database table creation, unique constraint indexes (`ix_users_username`, `ix_users_doctor_id`), and image URL repairs execute idempotently inside FastAPI's `lifespan` handler on server boot.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- PostgreSQL & Redis (or Docker)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS / Linux

pip install -r requirements.txt
```

Create `.env` in the root directory (or use `.env.example`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pneumonia_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=r1brWGgIhqRPR8Yy0txgYy2_PyqVabi3dWgKYqX2VxU
ADMIN_SECRET_KEY=7SpcqsKk1ybL6TrnOUJR8ewx4BCnWY5zIEapFm0lZSA
NEXTAUTH_SECRET=zIJ9iyeeqk0M16QGhqS4-K8zaY3R5Dc30F0rSGP3N6w
NEXTAUTH_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/proxy
CLOUDINARY_CLOUD_NAME=act3ugiy
CLOUDINARY_API_KEY=642116481284122
CLOUDINARY_API_SECRET=aeRpaOmipFvHZuDchx6ytk4EmzQ
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
ML_MODEL_PATH=app/ml/weights/densenet121_chexnet.pth
```

Seed the database:
```bash
python seed.py
```

Start the FastAPI server:
```bash
uvicorn app.main:app --port 8000 --reload
```
API Documentation is available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To run type checking and production builds:
```bash
npx tsc --noEmit
npm run build
```

---

## 🌐 Production Deployment

### Backend on Render (via Blueprint)
1. Push your repository to GitHub.
2. Open [dashboard.render.com](https://dashboard.render.com) $\rightarrow$ **New +** $\rightarrow$ **Blueprint**.
3. Select your repository. Render automatically reads [`render.yaml`](./render.yaml), provisions PostgreSQL (`breathewish-db`), and deploys the FastAPI API service (`breathewish-api`).
4. Enter the environment secrets prompted by Render.
5. In the Render service shell, run `python seed.py`.

### Frontend on Vercel
1. Open [vercel.com/new](https://vercel.com/new) and select the repository.
2. Set **Root Directory** to `frontend`.
3. Add environment variables:
   - `NEXTAUTH_SECRET`: (Your 32-byte secret)
   - `BACKEND_URL`: `https://<your-render-service>.onrender.com`
   - `NEXT_PUBLIC_API_URL`: `/api/proxy`
4. Click **Deploy**.
