# Pneumonia Detection System — Production Implementation Plan
> Feed this document directly to a code agent or LLM. Every section is self-contained and ordered for sequential implementation.

---

## 0. Project Overview

A hospital-scoped, AI-assisted pneumonia detection system from chest X-rays. The AI detects and scores — a human doctor always verifies. Patients never see raw AI output.

**Core principle: Human in the loop for everything.**

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | Next.js | 14 (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Animation | Framer Motion | 11.x |
| Charts | Recharts | 2.x |
| Auth | NextAuth.js | 5.x (beta) |
| Backend | FastAPI | 0.111.x |
| ML framework | PyTorch | 2.x |
| Grad-CAM | pytorch-grad-cam | latest |
| Database | PostgreSQL | 16 |
| ORM (Python) | SQLAlchemy + Alembic | 2.x |
| Cache / Queue | Redis | 7.x |
| File storage | Cloudinary | latest SDK |
| LLM | Anthropic Claude API | claude-sonnet-4-6 |
| Scheduler | APScheduler | 3.x |
| Email | Resend | latest |
| Containerization | Docker + Docker Compose | latest |

---

## 2. Repository Structure

```
pneumonia-detection/
├── frontend/                          # Next.js app
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (patient)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── new-case/page.tsx
│   │   │   ├── case/[id]/page.tsx
│   │   │   ├── consultation/[caseId]/page.tsx
│   │   │   └── follow-up/page.tsx
│   │   ├── (doctor)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── case/[id]/page.tsx
│   │   │   ├── second-opinion/[caseId]/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── page.tsx                   # Hero / landing
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       └── proxy/[...path]/route.ts   # Proxy to FastAPI
│   ├── components/
│   │   ├── hero/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ScanLineAnimation.tsx
│   │   │   ├── FloatingCards.tsx
│   │   │   └── HowItWorks.tsx
│   │   ├── shared/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── VerifiedBadge.tsx
│   │   │   └── AuditTag.tsx
│   │   ├── patient/
│   │   │   ├── CaseStatusStepper.tsx
│   │   │   ├── PrescriptionCard.tsx
│   │   │   ├── ConsultationThread.tsx
│   │   │   └── FollowUpCard.tsx
│   │   └── doctor/
│   │       ├── WorklistTable.tsx
│   │       ├── XRayViewer.tsx
│   │       ├── GradCamOverlay.tsx
│   │       ├── ConfidenceChart.tsx
│   │       ├── PrescriptionEditor.tsx
│   │       └── SecondOpinionPanel.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── index.ts
│   └── tailwind.config.ts
│
├── backend/                           # FastAPI app
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── case.py
│   │   │   ├── prescription.py
│   │   │   ├── consultation.py
│   │   │   └── audit.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── case.py
│   │   │   ├── prescription.py
│   │   │   └── consultation.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── cases.py
│   │   │   ├── prescriptions.py
│   │   │   ├── consultations.py
│   │   │   ├── second_opinion.py
│   │   │   ├── follow_up.py
│   │   │   └── notifications.py
│   │   ├── services/
│   │   │   ├── ml_service.py
│   │   │   ├── llm_service.py
│   │   │   ├── cloudinary_service.py
│   │   │   ├── notification_service.py
│   │   │   └── doctor_assignment.py
│   │   ├── ml/
│   │   │   ├── model.py
│   │   │   ├── gradcam.py
│   │   │   ├── preprocess.py
│   │   │   └── weights/              # DenseNet-121 weights here
│   │   ├── scheduler.py
│   │   └── middleware/
│   │       ├── auth.py
│   │       └── audit.py
│   ├── alembic/
│   │   └── versions/
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 3. Environment Variables

### `.env.example` (root)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pneumonia_db
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# Resend (email)
RESEND_API_KEY=

# Backend
BACKEND_URL=http://localhost:8000
ML_MODEL_PATH=app/ml/weights/densenet121_chexnet.pth

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/proxy
```

---

## 4. Database Schema

```sql
-- Users (patients and doctors in one table, role discriminates)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor')),
  -- Doctor-specific fields (null for patients)
  specializations TEXT[],           -- e.g. ['pulmonology', 'cardiology']
  seniority_level VARCHAR(20),      -- 'junior', 'senior', 'consultant'
  is_available BOOLEAN DEFAULT true,
  -- Patient-specific fields (null for doctors)
  date_of_birth DATE,
  blood_group VARCHAR(5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cases (one per X-ray submission)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  primary_doctor_id UUID REFERENCES users(id),
  initiated_by VARCHAR(10) CHECK (initiated_by IN ('patient', 'doctor')),
  status VARCHAR(30) NOT NULL DEFAULT 'uploaded'
    CHECK (status IN (
      'uploaded',
      'under_review',
      'prescription_draft',
      'verified',
      'second_opinion_requested',
      'second_opinion_received',
      'closed'
    )),
  -- X-ray
  xray_url VARCHAR(500) NOT NULL,
  xray_public_id VARCHAR(255) NOT NULL,       -- Cloudinary ID
  gradcam_url VARCHAR(500),
  gradcam_public_id VARCHAR(255),
  -- AI output (visible to doctor only)
  ai_confidence DECIMAL(5,2),                 -- 0.00 to 100.00
  ai_severity VARCHAR(10) CHECK (ai_severity IN ('mild', 'moderate', 'severe', 'none')),
  ai_type VARCHAR(10) CHECK (ai_type IN ('bacterial', 'viral', 'none')),
  ai_raw_output JSONB,                        -- full model output
  -- Doctor verdict (what patient eventually sees)
  doctor_verdict VARCHAR(20) CHECK (doctor_verdict IN ('pneumonia', 'no_pneumonia', 'inconclusive')),
  doctor_severity VARCHAR(10),
  doctor_type VARCHAR(10),
  doctor_notes TEXT,
  verified_at TIMESTAMPTZ,
  -- Symptom intake
  symptoms JSONB NOT NULL,                    -- structured symptom form
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prescriptions
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  doctor_id UUID REFERENCES users(id),
  llm_draft JSONB NOT NULL,                   -- raw LLM output
  final_prescription JSONB NOT NULL,          -- doctor-edited version
  -- Structure: { medications: [{name, dosage, frequency, duration, notes}], general_advice, follow_up_notes }
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,                  -- increments on follow-up
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Second opinions
CREATE TABLE second_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  requested_by VARCHAR(10) CHECK (requested_by IN ('patient', 'doctor')),
  requested_by_id UUID REFERENCES users(id),
  second_doctor_id UUID REFERENCES users(id),
  specialty_requested VARCHAR(50),            -- for doctor-initiated specialty routing
  reason TEXT NOT NULL,
  verdict VARCHAR(20),
  verdict_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'submitted', 'declined')),
  -- Agreement tracking
  agrees_with_primary BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Consultations (async Q&A)
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  sender_id UUID REFERENCES users(id),
  sender_role VARCHAR(10),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Follow-ups
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  doctor_id UUID REFERENCES users(id),
  scheduled_date DATE NOT NULL,
  suggested_date DATE,                        -- system suggestion
  reason TEXT,
  status VARCHAR(20) DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Color System & Design Tokens

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base
        background: '#0F172A',        // deep navy (hero + doctor)
        surface: '#1E293B',
        border: '#334155',
        
        // Patient warm palette
        'patient-bg': '#FAFAF9',
        'patient-surface': '#FFFFFF',
        'patient-border': '#E7E5E4',
        
        // Primary
        primary: '#1D4ED8',
        'primary-hover': '#1E40AF',
        'primary-light': '#EFF6FF',
        
        // Doctor accent
        'doctor-accent': '#38BDF8',
        
        // Patient accent
        'patient-accent': '#0D9488',
        
        // Text
        'text-primary': '#F1F5F9',
        'text-muted': '#94A3B8',
        'text-dark': '#0F172A',
        'text-dark-muted': '#64748B',
        
        // Severity
        severe: '#DC2626',
        'severe-soft': '#F87171',
        'severe-bg': '#450A0A',
        moderate: '#D97706',
        'moderate-soft': '#FBBF24',
        'moderate-bg': '#451A03',
        mild: '#16A34A',
        'mild-soft': '#4ADE80',
        'mild-bg': '#052E16',
        
        // States
        verified: '#0D9488',
        'verified-bg': '#042F2E',
        'second-opinion': '#4F46E5',
        'ai-badge': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        hero: ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-sub': ['1.25rem', { lineHeight: '1.6' }],
      },
      animation: {
        'scan-line': 'scanLine 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### `globals.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --scan-glow: 0 0 20px rgba(56, 189, 248, 0.4);
    --card-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  }

  /* Doctor theme (dark) */
  [data-theme="doctor"] {
    --bg: #0F172A;
    --surface: #1E293B;
    --border: #334155;
    --text: #F1F5F9;
    --text-muted: #94A3B8;
    --accent: #38BDF8;
  }

  /* Patient theme (warm) */
  [data-theme="patient"] {
    --bg: #FAFAF9;
    --surface: #FFFFFF;
    --border: #E7E5E4;
    --text: #1C1917;
    --text-muted: #78716C;
    --accent: #0D9488;
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
}

@layer components {
  .severity-badge-severe {
    @apply bg-severe-bg text-severe-soft border border-severe/30 px-3 py-1 rounded-full text-xs font-medium;
  }
  .severity-badge-moderate {
    @apply bg-moderate-bg text-moderate-soft border border-moderate/30 px-3 py-1 rounded-full text-xs font-medium;
  }
  .severity-badge-mild {
    @apply bg-mild-bg text-mild-soft border border-mild/30 px-3 py-1 rounded-full text-xs font-medium;
  }
  .verified-badge {
    @apply bg-verified-bg text-verified border border-verified/30 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1;
  }
  .card-dark {
    @apply bg-surface border border-border rounded-xl p-6 shadow-lg;
  }
  .card-light {
    @apply bg-white border border-patient-border rounded-xl p-6 shadow-sm;
  }
  .btn-primary {
    @apply bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200;
  }
  .btn-outline-light {
    @apply border border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition-colors duration-200;
  }
}
```

---

## 6. TypeScript Types

### `types/index.ts`
```typescript
export type Role = 'patient' | 'doctor'
export type Severity = 'mild' | 'moderate' | 'severe' | 'none'
export type PneumoniaType = 'bacterial' | 'viral' | 'none'
export type CaseStatus =
  | 'uploaded'
  | 'under_review'
  | 'prescription_draft'
  | 'verified'
  | 'second_opinion_requested'
  | 'second_opinion_received'
  | 'closed'

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  specializations?: string[]
  seniorityLevel?: 'junior' | 'senior' | 'consultant'
  isAvailable?: boolean
  dateOfBirth?: string
  bloodGroup?: string
}

export interface SymptomForm {
  fever: boolean
  feverDays?: number
  coughType: 'dry' | 'wet' | 'bloody' | 'none'
  breathingDifficulty: 1 | 2 | 3 | 4 | 5
  chestPain: boolean
  age: number
  weight: number
  sex: 'male' | 'female' | 'other'
  existingConditions: string[]   // ['diabetes', 'asthma', 'heart_disease', 'hypertension']
  currentMedications: string
  symptomDurationDays: number
}

export interface AIOutput {
  confidence: number
  severity: Severity
  type: PneumoniaType
  gradcamUrl: string
  rawOutput: Record<string, number>  // class probabilities
}

export interface Case {
  id: string
  patientId: string
  patient?: User
  primaryDoctorId: string
  primaryDoctor?: User
  initiatedBy: 'patient' | 'doctor'
  status: CaseStatus
  xrayUrl: string
  gradcamUrl?: string
  aiOutput?: AIOutput             // doctor-only
  doctorVerdict?: 'pneumonia' | 'no_pneumonia' | 'inconclusive'
  doctorSeverity?: Severity
  doctorType?: PneumoniaType
  doctorNotes?: string
  verifiedAt?: string
  symptoms: SymptomForm
  prescription?: Prescription
  secondOpinion?: SecondOpinion
  followUps?: FollowUp[]
  consultations?: Consultation[]
  createdAt: string
  updatedAt: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

export interface Prescription {
  id: string
  caseId: string
  doctorId: string
  llmDraft: {
    medications: Medication[]
    generalAdvice: string
    followUpNotes: string
  }
  finalPrescription: {
    medications: Medication[]
    generalAdvice: string
    followUpNotes: string
  }
  isVerified: boolean
  verifiedAt?: string
  version: number
  createdAt: string
}

export interface SecondOpinion {
  id: string
  caseId: string
  requestedBy: 'patient' | 'doctor'
  requestedById: string
  secondDoctorId: string
  secondDoctor?: User
  specialtyRequested?: string
  reason: string
  verdict?: string
  verdictNotes?: string
  status: 'pending' | 'accepted' | 'submitted' | 'declined'
  agreeesWithPrimary?: boolean
  createdAt: string
}

export interface FollowUp {
  id: string
  caseId: string
  doctorId: string
  scheduledDate: string
  suggestedDate: string
  reason?: string
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled'
  reminderSent: boolean
}

export interface Consultation {
  id: string
  caseId: string
  senderId: string
  senderRole: Role
  message: string
  isRead: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: string
  entityId?: string
  isRead: boolean
  createdAt: string
}
```

---

## 7. Hero Page Implementation

### `app/page.tsx`
```tsx
import HeroSection from '@/components/hero/HeroSection'
import HowItWorks from '@/components/hero/HowItWorks'
import ForPatients from '@/components/hero/ForPatients'
import ForDoctors from '@/components/hero/ForDoctors'
import StatStrip from '@/components/hero/StatStrip'
import LandingNav from '@/components/hero/LandingNav'
import LandingFooter from '@/components/hero/LandingFooter'

export default function LandingPage() {
  return (
    <main className="bg-background">
      <LandingNav />
      <HeroSection />       {/* Dark — X-ray scan line animation */}
      <HowItWorks />        {/* Dark — 3 step flow */}
      <StatStrip />         {/* Dark — model stats strip */}
      <ForPatients />       {/* Warm — transitions to patient palette */}
      <ForDoctors />        {/* Dark — back to dark for doctor section */}
      <LandingFooter />
    </main>
  )
}
```

### `components/hero/ScanLineAnimation.tsx`
```tsx
'use client'
import { motion, useAnimationFrame } from 'framer-motion'
import { useRef, useState } from 'react'

// Chest X-ray outline as SVG path (simplified ribcage silhouette)
const CHEST_PATH = `
  M 200 80 C 200 60 220 50 250 50 C 280 50 300 60 300 80
  L 320 200 C 340 220 340 260 320 280 L 300 320
  C 280 360 220 360 200 320 L 180 280
  C 160 260 160 220 180 200 Z
`

interface DataPoint {
  x: number
  y: number
  label: string
  value: string
  opacity: number
}

export default function ScanLineAnimation() {
  const [scanY, setScanY] = useState(0)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { x: 340, y: 120, label: 'Confidence', value: '94.2%', opacity: 0 },
    { x: 60, y: 180, label: 'Severity', value: 'Moderate', opacity: 0 },
    { x: 320, y: 260, label: 'Type', value: 'Bacterial', opacity: 0 },
  ])
  const startTime = useRef(Date.now())

  useAnimationFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000
    const cycle = elapsed % 4
    const progress = cycle / 4
    setScanY(progress * 100)

    setDataPoints(prev => prev.map(dp => ({
      ...dp,
      opacity: progress > (dp.y / 400) ? Math.min(1, (progress - dp.y / 400) * 8) : 0
    })))
  })

  return (
    <div className="relative w-full h-[420px] overflow-hidden">
      {/* X-ray background — dark with subtle vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-slate-800/40 to-background rounded-2xl border border-border" />

      {/* Chest outline — barely visible ghost */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified ribcage lines */}
        {[100, 140, 180, 220, 260, 300].map((y, i) => (
          <line
            key={i}
            x1="120" y1={y} x2="380" y2={y}
            stroke="#1E293B" strokeWidth="1.5"
            strokeDasharray="8 4"
          />
        ))}
        {/* Spine */}
        <line x1="250" y1="60" x2="250" y2="360" stroke="#1E293B" strokeWidth="2" />
        {/* Lung outlines */}
        <ellipse cx="185" cy="210" rx="70" ry="110" stroke="#1E293B" strokeWidth="1.5" fill="none" />
        <ellipse cx="315" cy="210" rx="70" ry="110" stroke="#1E293B" strokeWidth="1.5" fill="none" />
        {/* Heart shadow */}
        <ellipse cx="230" cy="230" rx="35" ry="45" stroke="#1E293B" strokeWidth="1" fill="none" opacity="0.5" />

        {/* Scan line */}
        <line
          x1="20" y1={`${scanY * 3.8 + 20}`}
          x2="480" y2={`${scanY * 3.8 + 20}`}
          stroke="#38BDF8"
          strokeWidth="1.5"
          opacity="0.9"
          filter="url(#glow)"
        />
        {/* Scan glow filter */}
        <defs>
          <filter id="glow" x="-20%" y="-100%" width="140%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Data point cards that fade in as scan passes */}
      {dataPoints.map((dp, i) => (
        <motion.div
          key={i}
          className="absolute bg-surface/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2"
          style={{ left: dp.x, top: dp.y, opacity: dp.opacity }}
        >
          <p className="text-text-muted text-xs font-medium">{dp.label}</p>
          <p className="text-doctor-accent font-mono text-sm font-semibold">{dp.value}</p>
        </motion.div>
      ))}

      {/* AI assisted badge */}
      <div className="absolute bottom-4 right-4 bg-ai-badge text-text-muted text-xs px-3 py-1.5 rounded-full border border-border flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-doctor-accent rounded-full animate-pulse-slow" />
        AI Assisted Detection
      </div>
    </div>
  )
}
```

### `components/hero/HeroSection.tsx`
```tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ScanLineAnimation from './ScanLineAnimation'
import FloatingCards from './FloatingCards'

export default function HeroSection() {
  return (
    <>
      {/* Main hero — dark */}
      <section className="min-h-screen bg-background flex flex-col justify-center px-6 pt-24 pb-16">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 bg-surface border border-border text-text-muted text-sm px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-doctor-accent rounded-full animate-pulse-slow" />
              Hospital-grade AI detection
            </span>
            <h1 className="text-hero font-bold text-text-primary mb-6 tracking-tight">
              Pneumonia detection,<br />
              <span className="text-doctor-accent">verified by doctors.</span>
            </h1>
            <p className="text-hero-sub text-text-muted mb-10 max-w-lg">
              Upload a chest X-ray. Our AI analyses it instantly.
              Your assigned doctor reviews, verifies, and prescribes.
              You see only what your doctor confirms.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/login" className="btn-primary text-base">
                Get Started
              </Link>
              <a href="#how-it-works" className="btn-outline-light text-base">
                How it works
              </a>
            </div>
          </motion.div>

          {/* Right — scan animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          >
            <ScanLineAnimation />
          </motion.div>
        </div>
      </section>

      {/* Floating cards product preview — below hero */}
      <section className="bg-background pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.p
            className="text-center text-text-muted text-sm uppercase tracking-widest mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What you'll see inside
          </motion.p>
          <FloatingCards />
        </div>
      </section>
    </>
  )
}
```

### `components/hero/FloatingCards.tsx`
```tsx
'use client'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

function TiltCard({ children, className, delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 20 })
  const springY = useSpring(y, { stiffness: 150, damping: 20 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function FloatingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Doctor worklist card preview */}
      <TiltCard className="card-dark" delay={0}>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-4">Doctor — Worklist</p>
        <div className="space-y-3">
          {[
            { name: 'Ravi Kumar', severity: 'severe', status: 'Awaiting Review' },
            { name: 'Priya Nair', severity: 'moderate', status: 'Under Review' },
            { name: 'Arjun Das', severity: 'mild', status: 'Prescription Sent' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
              <div>
                <p className="text-text-primary text-sm font-medium">{item.name}</p>
                <p className="text-text-muted text-xs">{item.status}</p>
              </div>
              <span className={`severity-badge-${item.severity}`}>
                {item.severity}
              </span>
            </div>
          ))}
        </div>
      </TiltCard>

      {/* AI result card preview */}
      <TiltCard className="card-dark" delay={0.1}>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-4">AI Analysis</p>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-text-muted text-sm">Confidence</span>
            <span className="text-doctor-accent font-mono text-sm">94.2%</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-doctor-accent rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: '94.2%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-lg p-3 border border-border">
            <p className="text-text-muted text-xs">Type</p>
            <p className="text-text-primary text-sm font-medium">Bacterial</p>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border">
            <p className="text-text-muted text-xs">Severity</p>
            <span className="severity-badge-moderate text-xs">Moderate</span>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-ai-badge rounded-full" /> Visible to doctor only
        </p>
      </TiltCard>

      {/* Patient prescription card preview */}
      <TiltCard className="bg-white border border-patient-border rounded-xl p-6 shadow-sm" delay={0.2}>
        <p className="text-text-dark-muted text-xs uppercase tracking-widest mb-4">Patient — Prescription</p>
        <div className="verified-badge mb-4 w-fit">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Verified by Dr. Mehta
        </div>
        <div className="space-y-2">
          {[
            { drug: 'Amoxicillin', dose: '500mg', freq: '3x daily' },
            { drug: 'Azithromycin', dose: '250mg', freq: '1x daily' },
          ].map((med, i) => (
            <div key={i} className="flex justify-between p-2 bg-patient-bg rounded-lg text-sm">
              <span className="text-text-dark font-medium">{med.drug}</span>
              <span className="text-text-dark-muted font-mono">{med.dose} · {med.freq}</span>
            </div>
          ))}
        </div>
      </TiltCard>
    </div>
  )
}
```

---

## 8. Authentication

### `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        })
        if (!res.ok) return null
        const user = await res.json()
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
        token.backendToken = (user as any).access_token
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role as string
      session.user.id = token.id as string
      session.user.backendToken = token.backendToken as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})

export const { GET, POST } = handlers
```

### Route protection middleware — `middleware.ts`
```typescript
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  // Redirect unauthenticated
  if (!req.auth && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based route protection
  if (pathname.startsWith('/(patient)') && role !== 'patient') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (pathname.startsWith('/(doctor)') && role !== 'doctor') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 9. FastAPI Backend

### `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, cases, prescriptions, consultations, second_opinion, follow_up, notifications
from app.database import engine, Base
from app.scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pneumonia Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(cases.router, prefix="/cases", tags=["cases"])
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
app.include_router(consultations.router, prefix="/consultations", tags=["consultations"])
app.include_router(second_opinion.router, prefix="/second-opinion", tags=["second-opinion"])
app.include_router(follow_up.router, prefix="/follow-up", tags=["follow-up"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

@app.on_event("startup")
async def startup():
    start_scheduler()

@app.get("/health")
def health(): return {"status": "ok"}
```

### `backend/app/services/doctor_assignment.py`
```python
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.case import Case

SEVERITY_SENIORITY_MAP = {
    "severe": "consultant",
    "moderate": "senior",
    "mild": None,  # any available
}

def assign_doctor(db: Session, severity: str, specialty: str = "pulmonology") -> User | None:
    """
    Assign doctor based on severity and specialty.
    Severe → consultant pulmonologist
    Moderate → senior pulmonologist
    Mild → any available pulmonologist
    """
    required_seniority = SEVERITY_SENIORITY_MAP.get(severity)
    query = db.query(User).filter(
        User.role == "doctor",
        User.is_available == True,
        User.specializations.any(specialty)
    )
    if required_seniority:
        query = query.filter(User.seniority_level == required_seniority)

    # Order by current case load (least busy first)
    doctor = query.outerjoin(
        Case, (Case.primary_doctor_id == User.id) & (Case.status != "closed")
    ).order_by(db.func.count(Case.id)).first()

    return doctor

def assign_second_opinion_doctor(
    db: Session,
    specialty: str,
    exclude_doctor_id: str
) -> User | None:
    """Assign second opinion doctor from a different specialist pool."""
    return db.query(User).filter(
        User.role == "doctor",
        User.is_available == True,
        User.specializations.any(specialty),
        User.id != exclude_doctor_id
    ).first()
```

### `backend/app/services/ml_service.py`
```python
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np
from app.ml.model import load_model
from app.ml.gradcam import generate_gradcam

model = load_model()

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

SEVERITY_THRESHOLDS = {
    "severe": 0.80,
    "moderate": 0.50,
    "mild": 0.20,
}

def classify_severity(confidence: float) -> str:
    if confidence >= SEVERITY_THRESHOLDS["severe"]: return "severe"
    if confidence >= SEVERITY_THRESHOLDS["moderate"]: return "moderate"
    if confidence >= SEVERITY_THRESHOLDS["mild"]: return "mild"
    return "none"

def run_inference(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = TRANSFORM(image).unsqueeze(0)

    with torch.no_grad():
        output = model(tensor)
        probs = torch.softmax(output, dim=1)
        pneumonia_conf = probs[0][1].item()  # class 1 = pneumonia

    severity = classify_severity(pneumonia_conf)

    # Bacterial vs viral heuristic (simplified — in production use a separate classifier)
    # Bacterial: high confidence, rapid onset → confidence > 0.75
    ptype = "bacterial" if pneumonia_conf > 0.75 else "viral" if pneumonia_conf > 0.20 else "none"

    gradcam_overlay = generate_gradcam(model, tensor, image)

    return {
        "confidence": round(pneumonia_conf * 100, 2),
        "severity": severity,
        "type": ptype,
        "gradcam_image": gradcam_overlay,  # bytes
        "raw_output": {
            "normal": round(probs[0][0].item(), 4),
            "pneumonia": round(probs[0][1].item(), 4),
        }
    }
```

### `backend/app/services/llm_service.py`
```python
import anthropic
import json
from app.schemas.case import SymptomFormSchema

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are an expert medical assistant helping doctors draft initial prescription recommendations 
for pneumonia patients. You output ONLY valid JSON — no preamble, no markdown.
The doctor will review and edit everything before it reaches the patient.
Base your recommendation on the severity, type, symptoms, and patient details provided."""

def generate_prescription_draft(
    severity: str,
    pneumonia_type: str,
    confidence: float,
    symptoms: dict,
) -> dict:
    """Generate structured prescription draft for doctor review."""

    user_prompt = f"""
Generate a prescription draft for a pneumonia patient with the following profile:

AI Detection:
- Confidence: {confidence}%
- Severity: {severity}
- Type: {pneumonia_type}

Patient Symptoms:
- Fever: {symptoms.get('fever')}, Duration: {symptoms.get('feverDays', 'N/A')} days
- Cough type: {symptoms.get('coughType')}
- Breathing difficulty: {symptoms.get('breathingDifficulty')}/5
- Chest pain: {symptoms.get('chestPain')}
- Symptom duration: {symptoms.get('symptomDurationDays')} days
- Age: {symptoms.get('age')}, Weight: {symptoms.get('weight')}kg, Sex: {symptoms.get('sex')}
- Existing conditions: {', '.join(symptoms.get('existingConditions', [])) or 'None'}
- Current medications: {symptoms.get('currentMedications') or 'None'}

Respond ONLY with this JSON structure:
{{
  "medications": [
    {{
      "name": "medication name",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. twice daily",
      "duration": "e.g. 7 days",
      "notes": "e.g. take with food"
    }}
  ],
  "generalAdvice": "general care instructions string",
  "followUpNotes": "follow up recommendation string"
}}
"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}]
    )

    raw = message.content[0].text.strip()
    return json.loads(raw)
```

### `backend/app/routers/cases.py`
```python
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.services import ml_service, cloudinary_service, llm_service
from app.services.doctor_assignment import assign_doctor
from app.models.case import Case
from app.models.user import User
from app.schemas.case import CaseCreateSchema, CaseResponseSchema
from app.middleware.audit import log_action
import json

router = APIRouter()

@router.post("/", response_model=CaseResponseSchema)
async def create_case(
    xray: UploadFile = File(...),
    symptoms: str = Form(...),           # JSON string
    patient_id: str = Form(None),        # doctor-initiated: pass patient id
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symptoms_data = json.loads(symptoms)
    image_bytes = await xray.read()

    # 1. Run ML inference
    ml_result = ml_service.run_inference(image_bytes)

    # 2. Upload X-ray and Grad-CAM to Cloudinary
    xray_upload = cloudinary_service.upload_image(image_bytes, folder="xrays")
    gradcam_upload = cloudinary_service.upload_image(
        ml_result["gradcam_image"], folder="gradcam"
    )

    # 3. Assign doctor based on severity
    assigned_doctor = assign_doctor(db, ml_result["severity"])
    if not assigned_doctor:
        raise HTTPException(status_code=503, detail="No available doctor found")

    # 4. Generate LLM prescription draft
    llm_draft = llm_service.generate_prescription_draft(
        severity=ml_result["severity"],
        pneumonia_type=ml_result["type"],
        confidence=ml_result["confidence"],
        symptoms=symptoms_data,
    )

    # 5. Determine patient
    the_patient_id = (
        patient_id if current_user.role == "doctor" else str(current_user.id)
    )

    # 6. Create case record
    case = Case(
        patient_id=the_patient_id,
        primary_doctor_id=str(assigned_doctor.id),
        initiated_by=current_user.role,
        status="uploaded",
        xray_url=xray_upload["url"],
        xray_public_id=xray_upload["public_id"],
        gradcam_url=gradcam_upload["url"],
        gradcam_public_id=gradcam_upload["public_id"],
        ai_confidence=ml_result["confidence"],
        ai_severity=ml_result["severity"],
        ai_type=ml_result["type"],
        ai_raw_output=ml_result["raw_output"],
        symptoms=symptoms_data,
    )
    db.add(case)
    db.flush()

    # 7. Create prescription stub
    from app.models.prescription import Prescription
    prescription = Prescription(
        case_id=str(case.id),
        doctor_id=str(assigned_doctor.id),
        llm_draft=llm_draft,
        final_prescription=llm_draft,   # doctor edits this
    )
    db.add(prescription)
    db.commit()

    # 8. Notify doctor
    from app.services.notification_service import notify_user
    notify_user(
        db=db,
        user_id=str(assigned_doctor.id),
        title="New case assigned",
        body=f"Severity: {ml_result['severity'].upper()} — Review required",
        type="new_case",
        entity_id=str(case.id),
    )

    log_action(db, current_user.id, "case_created", "case", str(case.id))

    return case
```

---

## 10. Doctor Dashboard — Worklist

### `app/(doctor)/dashboard/page.tsx`
```tsx
import { auth } from '@/app/api/auth/[...nextauth]/route'
import WorklistTable from '@/components/doctor/WorklistTable'
import DoctorStats from '@/components/doctor/DoctorStats'
import NotificationBell from '@/components/shared/NotificationBell'

export default async function DoctorDashboard() {
  const session = await auth()

  return (
    <div data-theme="doctor" className="min-h-screen bg-background text-text-primary">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Worklist</h1>
            <p className="text-text-muted text-sm mt-1">Cases assigned to you, sorted by severity</p>
          </div>
          <NotificationBell />
        </div>

        {/* Stats strip */}
        <DoctorStats />

        {/* Tabs + table */}
        <WorklistTable doctorId={session!.user.id} />
      </div>
    </div>
  )
}
```

### `components/doctor/WorklistTable.tsx`
```tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Case } from '@/types'
import SeverityBadge from '@/components/shared/SeverityBadge'
import StatusBadge from '@/components/shared/StatusBadge'
import { api } from '@/lib/api'

type Tab = 'pending' | 'active' | 'closed'

const SEVERITY_ORDER = { severe: 0, moderate: 1, mild: 2, none: 3 }

export default function WorklistTable({ doctorId }: { doctorId: string }) {
  const [tab, setTab] = useState<Tab>('pending')
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/cases/doctor/${doctorId}?status_group=${tab}`)
      .then(data => {
        const sorted = data.sort((a: Case, b: Case) =>
          (SEVERITY_ORDER[a.aiOutput?.severity || 'none'] ?? 3) -
          (SEVERITY_ORDER[b.aiOutput?.severity || 'none'] ?? 3)
        )
        setCases(sorted)
        setLoading(false)
      })
  }, [tab, doctorId])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'closed', label: 'Closed' },
  ]

  return (
    <div className="card-dark mt-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-background rounded-lg w-fit mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-surface text-text-primary shadow-sm border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-text-muted text-xs uppercase tracking-widest border-b border-border">
              <th className="pb-3 text-left font-medium">Patient</th>
              <th className="pb-3 text-left font-medium">Submitted</th>
              <th className="pb-3 text-left font-medium">Severity</th>
              <th className="pb-3 text-left font-medium">Type</th>
              <th className="pb-3 text-left font-medium">Status</th>
              <th className="pb-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {cases.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-background/50 transition-colors"
                >
                  <td className="py-4">
                    <p className="text-text-primary font-medium text-sm">{c.patient?.fullName}</p>
                    <p className="text-text-muted text-xs">{c.patient?.email}</p>
                  </td>
                  <td className="py-4 text-text-muted text-sm">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="py-4">
                    <SeverityBadge severity={c.aiOutput?.severity || 'none'} />
                  </td>
                  <td className="py-4 text-text-muted text-sm capitalize">
                    {c.aiOutput?.type || '—'}
                  </td>
                  <td className="py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/case/${c.id}`}
                      className="text-doctor-accent text-sm hover:underline font-medium"
                    >
                      Review →
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {!loading && cases.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            No {tab} cases
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 11. Doctor Case Detail Page

### Key components on this page (build each as separate component):

**`components/doctor/XRayViewer.tsx`**
- Side-by-side: original X-ray | Grad-CAM overlay
- Toggle button to switch between original / overlay / blend
- Zoom on hover

**`components/doctor/ConfidenceChart.tsx`**
- Recharts RadialBarChart showing confidence %
- Bar chart showing raw class probabilities (normal vs pneumonia)
- Animated on mount

**`components/doctor/PrescriptionEditor.tsx`**
- Renders LLM draft as editable structured form
- Fields per medication: name (text), dosage (text), frequency (select), duration (text), notes (text)
- Add/remove medication rows
- General advice textarea
- Follow-up notes textarea
- Save draft button (auto-saves) + Verify & Send button
- Verify button → confirmation modal → POST /prescriptions/:id/verify → triggers patient notification

**`components/doctor/SecondOpinionPanel.tsx`**
- Request second opinion section (collapsed by default)
- Doctor selects specialty from dropdown (populated from available specializations in system)
- Reason textarea
- Submit → POST /second-opinion/
- Shows incoming second opinion if already submitted

---

## 12. Patient Dashboard

### `app/(patient)/dashboard/page.tsx`
```tsx
import { auth } from '@/app/api/auth/[...nextauth]/route'
import CaseStatusStepper from '@/components/patient/CaseStatusStepper'
import PrescriptionCard from '@/components/patient/PrescriptionCard'
import FollowUpCard from '@/components/patient/FollowUpCard'
import Link from 'next/link'

export default async function PatientDashboard() {
  const session = await auth()

  return (
    <div data-theme="patient" className="min-h-screen bg-patient-bg text-text-dark">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Cases</h1>
          <Link href="/new-case" className="btn-primary">
            + New Case
          </Link>
        </div>
        {/* Case list — each shows stepper + prescription if verified */}
        {/* Fetch from /cases/patient/:id */}
      </div>
    </div>
  )
}
```

### `components/patient/CaseStatusStepper.tsx`
```tsx
'use client'
import { motion } from 'framer-motion'
import { CaseStatus } from '@/types'

const STEPS = [
  { key: 'uploaded', label: 'Uploaded', desc: 'X-ray received' },
  { key: 'under_review', label: 'Under Review', desc: 'Doctor reviewing' },
  { key: 'prescription_draft', label: 'Prescription Ready', desc: 'Doctor finalising' },
  { key: 'verified', label: 'Verified', desc: 'Ready for you' },
]

const STATUS_STEP_MAP: Record<CaseStatus, number> = {
  uploaded: 0,
  under_review: 1,
  prescription_draft: 2,
  verified: 3,
  second_opinion_requested: 1,
  second_opinion_received: 2,
  closed: 3,
}

export default function CaseStatusStepper({ status }: { status: CaseStatus }) {
  const currentStep = STATUS_STEP_MAP[status] ?? 0

  return (
    <div className="flex items-start gap-0 w-full">
      {STEPS.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              {/* Line left */}
              {i > 0 && (
                <div className={`flex-1 h-0.5 ${done || active ? 'bg-patient-accent' : 'bg-patient-border'} transition-colors duration-500`} />
              )}
              {/* Circle */}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors duration-500 ${
                  done ? 'bg-patient-accent border-patient-accent' :
                  active ? 'border-patient-accent bg-white' :
                  'border-patient-border bg-white'
                }`}
                animate={active ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {done ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${active ? 'text-patient-accent' : 'text-text-dark-muted'}`}>{i + 1}</span>
                )}
              </motion.div>
              {/* Line right */}
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${done ? 'bg-patient-accent' : 'bg-patient-border'} transition-colors duration-500`} />
              )}
            </div>
            <div className="mt-3 text-center px-1">
              <p className={`text-xs font-semibold ${active ? 'text-patient-accent' : done ? 'text-text-dark' : 'text-text-dark-muted'}`}>
                {step.label}
              </p>
              <p className="text-xs text-text-dark-muted mt-0.5">{step.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### `components/patient/PrescriptionCard.tsx`
```tsx
import { Prescription, SecondOpinion } from '@/types'

interface Props {
  prescription: Prescription
  doctorName: string
  secondOpinion?: SecondOpinion
}

export default function PrescriptionCard({ prescription, doctorName, secondOpinion }: Props) {
  if (!prescription.isVerified) return null   // Never shown until verified

  const { finalPrescription } = prescription

  return (
    <div className="card-light mt-6">
      {/* Verified badge */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-text-dark text-lg">Prescription</h3>
        <div className="verified-badge">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified by {doctorName}
        </div>
      </div>

      {/* Second opinion status */}
      {secondOpinion && secondOpinion.status === 'submitted' && (
        <div className={`mb-4 p-3 rounded-lg border text-sm ${
          secondOpinion.agreesWithPrimary
            ? 'bg-mild-bg/10 border-mild/20 text-mild'
            : 'bg-moderate-bg/10 border-moderate/20 text-moderate-soft'
        }`}>
          {secondOpinion.agreesWithPrimary
            ? '✓ Confirmed by second doctor'
            : `Second opinion differs — primary doctor's assessment applied`
          }
        </div>
      )}

      {/* Medications */}
      <div className="space-y-3 mb-6">
        {finalPrescription.medications.map((med, i) => (
          <div key={i} className="flex items-start justify-between p-4 bg-patient-bg rounded-xl border border-patient-border">
            <div>
              <p className="font-semibold text-text-dark">{med.name}</p>
              {med.notes && <p className="text-text-dark-muted text-xs mt-1">{med.notes}</p>}
            </div>
            <div className="text-right">
              <p className="font-mono text-text-dark text-sm">{med.dosage}</p>
              <p className="text-text-dark-muted text-xs">{med.frequency} · {med.duration}</p>
            </div>
          </div>
        ))}
      </div>

      {/* General advice */}
      <div className="p-4 bg-patient-bg rounded-xl border border-patient-border mb-4">
        <p className="text-xs text-text-dark-muted uppercase tracking-widest mb-2">General Advice</p>
        <p className="text-text-dark text-sm">{finalPrescription.generalAdvice}</p>
      </div>

      {/* Follow-up notes */}
      <div className="p-4 bg-patient-bg rounded-xl border border-patient-border">
        <p className="text-xs text-text-dark-muted uppercase tracking-widest mb-2">Follow-up</p>
        <p className="text-text-dark text-sm">{finalPrescription.followUpNotes}</p>
      </div>

      {/* AI disclaimer */}
      <p className="text-xs text-text-dark-muted mt-4 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-text-dark-muted rounded-full" />
        AI-assisted prescription, reviewed and verified by your assigned doctor
      </p>
    </div>
  )
}
```

---

## 13. ML Model Setup

### `backend/app/ml/model.py`
```python
import torch
import torchvision.models as models
from pathlib import Path

def load_model(weights_path: str = "app/ml/weights/densenet121_chexnet.pth"):
    """
    Load pretrained DenseNet-121 (CheXNet architecture).
    Download weights from: https://github.com/arnoweng/CheXNet
    Or use torchvision pretrained and fine-tune on:
    https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
    """
    model = models.densenet121(pretrained=False)
    # Replace classifier for binary classification (normal vs pneumonia)
    model.classifier = torch.nn.Sequential(
        torch.nn.Linear(1024, 2),
    )

    weights_file = Path(weights_path)
    if weights_file.exists():
        checkpoint = torch.load(weights_path, map_location='cpu')
        model.load_state_dict(checkpoint.get('state_dict', checkpoint))
    else:
        print(f"WARNING: No weights found at {weights_path}. Using random weights.")
        print("Download CheXNet weights or train on Kaggle chest X-ray dataset.")

    model.eval()
    return model
```

### `backend/app/ml/gradcam.py`
```python
import torch
import numpy as np
import cv2
from PIL import Image
import io
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

def generate_gradcam(model, tensor: torch.Tensor, original_image: Image.Image) -> bytes:
    """Generate Grad-CAM overlay and return as PNG bytes."""
    target_layers = [model.features.denseblock4.denselayer16.conv2]
    cam = GradCAM(model=model, target_layers=target_layers)
    targets = [ClassifierOutputTarget(1)]  # class 1 = pneumonia
    grayscale_cam = cam(input_tensor=tensor, targets=targets)[0]

    # Resize original to 224x224 for overlay
    rgb_img = np.array(original_image.resize((224, 224)).convert('RGB')) / 255.0
    visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

    # Convert to PNG bytes
    img = Image.fromarray(visualization)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()
```

---

## 14. Follow-up Scheduler

### `backend/app/scheduler.py`
```python
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.models.follow_up import FollowUp
from app.services.notification_service import notify_user
from datetime import date, timedelta

def check_follow_ups():
    db = SessionLocal()
    try:
        tomorrow = date.today() + timedelta(days=1)
        due = db.query(FollowUp).filter(
            FollowUp.scheduled_date == tomorrow,
            FollowUp.status == "scheduled",
            FollowUp.reminder_sent == False
        ).all()

        for f in due:
            case = f.case
            notify_user(
                db=db,
                user_id=str(case.patient_id),
                title="Follow-up reminder",
                body=f"Your follow-up is scheduled for tomorrow ({tomorrow.strftime('%d %b')})",
                type="follow_up_reminder",
                entity_id=str(f.case_id)
            )
            f.reminder_sent = True

        db.commit()
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        check_follow_ups,
        trigger=CronTrigger(hour=9, minute=0),  # runs every day at 9am
        id="follow_up_check",
        replace_existing=True,
    )
    scheduler.start()
```

---

## 15. Docker Compose

### `docker-compose.yml`
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: pneumonia_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/pneumonia_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - model_weights:/app/app/ml/weights

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      BACKEND_URL: http://backend:8000
    depends_on:
      - backend

volumes:
  postgres_data:
  model_weights:
```

---

## 16. Implementation Order for Code Agent

Execute in this exact sequence. Each phase is independently testable before moving to the next.

### Phase 1 — Foundation (Days 1-2)
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up FastAPI project structure
3. Docker Compose up — PostgreSQL + Redis running
4. Run Alembic migrations — all tables created
5. Implement auth — NextAuth + FastAPI JWT
6. Basic role-based routing working
7. Seed database with test doctor pool (3-4 doctors with specializations)

### Phase 2 — Hero Page (Days 3-4)
1. Implement design tokens (tailwind.config.ts + globals.css)
2. Build LandingNav
3. Build ScanLineAnimation component
4. Build HeroSection with copy + animation
5. Build FloatingCards with 3D tilt
6. Build HowItWorks section
7. Build StatStrip, ForPatients, ForDoctors sections
8. Build LandingFooter
9. Full scroll experience working end-to-end

### Phase 3 — ML Pipeline (Days 5-6)
1. Download DenseNet-121 weights (CheXNet or Kaggle fine-tuned)
2. Implement model.py + gradcam.py
3. Implement preprocess.py
4. Test inference with sample X-ray locally
5. Implement cloudinary_service.py
6. Implement ml_service.py end-to-end
7. Test: POST image → confidence + Grad-CAM URL returned

### Phase 4 — Case Flow (Days 7-9)
1. Build symptom intake form (patient)
2. Build X-ray upload with preview
3. Implement POST /cases/ — full pipeline
4. Doctor assignment logic working
5. LLM prescription draft generated on case creation
6. Build doctor worklist (WorklistTable)
7. Build doctor case detail — XRayViewer + GradCamOverlay
8. Build ConfidenceChart (Recharts)
9. Build PrescriptionEditor — LLM draft editable
10. Verify button → patient notified → prescription visible

### Phase 5 — Patient Dashboard (Days 10-11)
1. Build CaseStatusStepper
2. Build PrescriptionCard (post-verify only)
3. Build second opinion request flow (patient side)
4. Build async consultation thread
5. Build follow-up date display + reminder

### Phase 6 — Second Opinion + Follow-up (Days 12-13)
1. Implement second opinion router (POST, GET, PATCH)
2. Specialty routing — doctor selects specialty, system assigns
3. Second doctor case view (read-only + verdict form)
4. Agreement/disagreement handling
5. Build FollowUpCard + doctor follow-up setter
6. APScheduler follow-up reminder running

### Phase 7 — Notifications + Polish (Days 14-15)
1. In-app notifications — NotificationBell + dropdown
2. Email notifications via Resend (new case, verified, follow-up)
3. Audit log middleware wired to all routes
4. Loading states, error boundaries
5. Empty states for all list views
6. Mobile responsive pass
7. End-to-end test: full patient journey + full doctor journey

---

## 17. Key API Endpoints Reference

```
POST   /auth/register
POST   /auth/login
GET    /auth/me

POST   /cases/                         # create case (patient or doctor)
GET    /cases/patient/:id              # patient's own cases
GET    /cases/doctor/:id               # doctor's worklist
GET    /cases/:id                      # single case detail
PATCH  /cases/:id/status               # update case status

GET    /prescriptions/:caseId          # get prescription for case
PATCH  /prescriptions/:id              # doctor edits prescription
POST   /prescriptions/:id/verify       # doctor verifies → notifies patient

POST   /second-opinion/                # request second opinion
GET    /second-opinion/:caseId         # get second opinion for case
PATCH  /second-opinion/:id/verdict     # second doctor submits verdict

POST   /consultations/                 # patient sends message
GET    /consultations/:caseId          # get thread for case
PATCH  /consultations/:id/read         # mark as read

POST   /follow-up/                     # doctor creates follow-up
GET    /follow-up/:caseId              # get follow-ups for case
PATCH  /follow-up/:id                  # doctor edits date/status

GET    /notifications/:userId          # get all notifications
PATCH  /notifications/:id/read         # mark as read
```

---

## 18. Notes for Code Agent

- **Never expose AI output to patient** — all case detail routes must check role before returning `ai_confidence`, `ai_severity`, `ai_type`, `gradcam_url`, `ai_raw_output`
- **Prescription hidden until `is_verified = true`** — enforce in the GET /prescriptions/:caseId route
- **Doctor assignment is automatic** — never ask patient to choose
- **Second opinion max = 2 doctors** — enforce at POST /second-opinion/ (reject if one already exists)
- **Audit log every state change** — use the audit middleware on all PATCH/POST routes
- **All images served via Cloudinary URL** — never serve from local filesystem in production
- **LLM draft is always editable** — `final_prescription` starts as copy of `llm_draft`, doctor edits `final_prescription` only
- **Follow-up suggested dates**: severe → today + 3 days, others → today + 7 days. Doctor overrides.
- **Severity color is always consistent** — severe=red, moderate=amber, mild=green across both doctor and patient views
- **data-theme attribute** drives CSS variable switching — set on the root div of every page based on session role
