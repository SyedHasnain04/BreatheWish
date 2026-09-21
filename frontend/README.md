# BreatheWish — Frontend Application

This directory contains the Next.js 14 frontend for the BreatheWish platform.

For the full system documentation, backend configuration, and deployment guides, please see the [Root README](../README.md).

---

## 🔑 Demo & Test Login Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Doctor** (Pulmonologist) | Dr. Arun Mehta | `arun@hospital.com` | `doctor123` |
| **Doctor** (Consultant) | Dr. Priya Sharma | `priya@hospital.com` | `doctor123` |
| **Doctor** (Junior) | Dr. Vikram Nair | `vikram@hospital.com` | `doctor123` |
| **Doctor** (Cardiologist) | Dr. Rajan Pillai | `rajan@hospital.com` | `doctor123` |
| **Doctor** (Radiologist) | Dr. Sunita Rao | `sunita@hospital.com` | `doctor123` |
| **Patient** | Ravi Kumar | `ravi@patient.com` | `patient123` |
| **Patient** | Priya Nair | `priya@patient.com` | `patient123` |

> Patients can also self-register at `/register`.

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
