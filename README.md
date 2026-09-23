# BreatheWish — Clinical Chest Radiograph Screening Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3-EE4C2C)](https://pytorch.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC)](https://tailwindcss.com/)

BreatheWish is an AI-assisted clinical decision support system for chest radiograph screening (DenseNet-121 CheXNet architecture) paired with Grad-CAM explainability heatmaps, automated prescription drafting (Claude 3.5 Haiku), and strict human-in-the-loop physician governance.

---

## 🔑 Demo & Test Login Credentials

Run `python backend/seed.py` once to seed the database with these verified test accounts:

### 1. Attending Physicians (Doctors)
All doctors are pre-configured with the default password: **`doctor123`**

| Name | Role / Specialty | Hospital ID (Badge) | Email | Password |
|---|---|---|---|---|
| **Dr. Arun Mehta** | Pulmonology (Primary) | `BWD-ARUN01` | `arun@hospital.com` | `doctor123` |
| **Dr. Priya Sharma** | Pulmonology (Primary) | `BWD-PRIYA1` | `priya@hospital.com` | `doctor123` |
| **Dr. Vikram Nair** | Pulmonology (Primary) | `BWD-VIKR01` | `vikram@hospital.com` | `doctor123` |
| **Dr. Rajan Pillai** | Cardiology (Second Opinion) | `BWD-RAJA01` | `rajan@hospital.com` | `doctor123` |
| **Dr. Sunita Rao** | Radiology (Second Opinion) | `BWD-SUNI01` | `sunita@hospital.com` | `doctor123` |

### 2. Patient Test Accounts
All pre-seeded patients use the password: **`patient123`**

| Name | Role | Email | Password |
|---|---|---|---|
| **Ravi Kumar** | Patient | `ravi@patient.com` | `patient123` |
| **Priya Nair** | Patient | `priya@patient.com` | `patient123` |

> **Self-Registration**: Patients can also self-register at `/register` (passwords must be at least 8 characters). Public registration is locked to patient accounts; doctor accounts cannot be registered publicly.

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
1. Open an incognito browser window, navigate to `/login`, and sign in as `arun@hospital.com` (`doctor123`).
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
3. Log out and log in as `sunita@hospital.com` (Radiologist).
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
