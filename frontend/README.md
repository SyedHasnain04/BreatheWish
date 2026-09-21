# BreatheWish — Frontend Application

This directory contains the Next.js 14 frontend for the BreatheWish platform.

For the full system documentation, backend configuration, and deployment guides, please see the [Root README](../README.md).

---

## 🔑 Demo & Test Login Credentials

BreatheWish uses role-split authentication:

### 🩺 Doctors (Hospital ID Card Login — No Password)
Verified doctors authenticate directly with their assigned hospital ID badge number:

| Role | Doctor Name | Hospital ID Card Number | Password |
|---|---|---|---|
| **Doctor** (Pulmonologist) | Dr. Arun Mehta | `BWD-ARUN01` | *(None required)* |
| **Doctor** (Consultant) | Dr. Priya Sharma | `BWD-PRIYA1` | *(None required)* |
| **Doctor** (Junior) | Dr. Vikram Nair | `BWD-VIKR01` | *(None required)* |
| **Doctor** (Cardiologist) | Dr. Rajan Pillai | `BWD-RAJA01` | *(None required)* |
| **Doctor** (Radiologist) | Dr. Sunita Rao | `BWD-SUNI01` | *(None required)* |

### 👤 Patients (Username + Password)
Patients log in using their username and password:

| Role | Patient Name | Username | Password |
|---|---|---|---|
| **Patient** | Ravi Kumar | `ravi_kumar` | `patient123` |
| **Patient** | Priya Nair | `priya_nair` | `patient123` |

> New patients can self-register at `/register` with any username.

---

## 🛠️ Development Scripts

Run the Next.js local development server:
```bash
npm run dev
```

Run strict TypeScript type checking:
```bash
npx tsc --noEmit
```

Build the production bundle (with strict type and lint verification):
```bash
npm run build
```

---

## 🔒 Required Environment Variables

When running locally or on Vercel:

| Name | Purpose | Example |
|---|---|---|
| `NEXTAUTH_SECRET` | Session & JWT encryption key (must be set) | 32-byte secure key |
| `BACKEND_URL` | Upstream FastAPI backend URL | `http://localhost:8000` or `https://<api>.onrender.com` |
| `NEXT_PUBLIC_API_URL` | Client proxy target | `/api/proxy` |
| `NEXTAUTH_URL` | Canonical app URL (optional on Vercel) | `http://localhost:3000` |
