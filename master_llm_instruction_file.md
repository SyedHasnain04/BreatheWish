# BreatheWish — Master LLM Instruction File
> Feed this file to the LLM along with the implementation plan and agent prompt guide.
> The LLM must read all three documents before doing anything.
> Follow every section in the exact order written.

---

## STEP 0 — Read and Understand First (Do Nothing Else Yet)

Read these three documents completely before writing any code or making any changes:

1. `pneumonia_detection_implementation_plan.md`
2. `agent_prompt_guide.md`
3. This file (read to the end before starting)

When you have read all three, confirm back with the following:

```
CONFIRMATION:
- Tech stack: [list every technology]
- Architecture: [describe how services connect]
- Roles: [patient and doctor — their themes, their access]
- Business rules: [list every human-in-the-loop rule]
- Page structure: [list every page per role]
- Database schema: [list every table and its purpose]
- API endpoints: [list every endpoint group]
- Design system: [colors, fonts, tokens]
```

Do not write any code, do not make any changes, do not start any fix or audit
until you have confirmed the above and received explicit instruction to proceed.

---

## STEP 1 — UI/UX Fixes

Apply these in order. Fix one, verify it visually, then move to the next.
Do not batch them — they affect each other and need individual verification.

---

### Fix 1 — Patient Theme (No White)

**Problem:**
The patient theme used `#FAFAF9` warm white background with `#1C1917` dark text.
This creates a completely different visual language from the doctor theme.
It also caused white-on-white text bugs on inputs and cards.

**Required change:**
The patient theme must be a **softer darker variant of the doctor theme** —
same dark family, slightly lighter so the two roles feel like one system
with two perspectives rather than two completely different applications.

**Patient theme tokens (replace all existing patient theme values):**

```css
[data-theme="patient"] {
  --bg: #1A2234;
  --surface: #243044;
  --border: #2E3D55;
  --text: #E2E8F0;
  --text-muted: #94A3B8;
  --accent: #0D9488;
}
```

Update `tailwind.config.ts`:
```typescript
// Replace all patient-* color values with:
'patient-bg': '#1A2234',
'patient-surface': '#243044',
'patient-border': '#2E3D55',
'patient-text': '#E2E8F0',
'patient-text-muted': '#94A3B8',
'patient-accent': '#0D9488',
```

Update `globals.css` — remove all warm color overrides:
```css
/* Remove these entirely: */
[data-theme="patient"] .text-text-primary { color: #1C1917 !important; }
[data-theme="patient"] .text-text-muted { color: #78716C !important; }

/* Replace with: */
[data-theme="patient"] {
  color: #E2E8F0;
  background-color: #1A2234;
}
[data-theme="patient"] .text-text-primary {
  color: #E2E8F0 !important;
}
[data-theme="patient"] .text-text-muted {
  color: #94A3B8 !important;
}
```

Update every patient page root div:
```tsx
// All patient pages:
<div data-theme="patient" className="min-h-screen bg-[#1A2234] text-[#E2E8F0]">

// All doctor pages (unchanged):
<div data-theme="doctor" className="min-h-screen bg-[#0F172A] text-[#F1F5F9]">
```

Update all patient page inputs — they must use dark-on-dark styling:
```tsx
// All inputs on patient pages:
className="w-full px-4 py-3 rounded-xl
           bg-[#243044] border border-[#2E3D55]
           text-[#E2E8F0] placeholder-[#64748B]
           focus:outline-none focus:ring-2 focus:ring-[#0D9488]
           focus:border-transparent transition-all text-sm"
```

**Verification:**
- Open patient dashboard — background should be dark navy, not white or warm
- Open doctor dashboard — background should be deeper navy (`#0F172A`)
- The two should look like siblings, not strangers
- No white backgrounds anywhere on any page
- No white text on white or light backgrounds anywhere

---

### Fix 2 — Login Page Redesign

**Problem:**
- White/light inputs with white text — unreadable
- No visual hierarchy
- No branding
- No role selector that feels intentional
- No error state styling
- Plain button

**Required change:**
Full redesign of `frontend/app/(auth)/login/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email, password, redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex">

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12
                      bg-gradient-to-br from-[#0F172A] to-[#1E293B]
                      border-r border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1D4ED8] rounded-xl flex items-center
                          justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682
                   a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318
                   a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-[#F1F5F9] font-bold text-xl tracking-tight">
            BreatheWish
          </span>
        </div>

        <div>
          <h2 className="text-[#F1F5F9] text-2xl font-bold mb-4 leading-snug">
            AI reads the scan.<br />
            Your doctor makes the call.
          </h2>
          <div className="space-y-4 mt-6">
            {[
              { icon: '🔬', text: 'DenseNet-121 trained on 112,000+ X-rays' },
              { icon: '👨‍⚕️', text: 'Every result verified by a real doctor' },
              { icon: '🔒', text: 'Patients never see raw AI output' },
              { icon: '📋', text: 'Full audit trail on every action' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3
                                      text-[#64748B] text-sm">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#334155] text-xs">
          Hospital-scoped system · Demo environment
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#1D4ED8] rounded-lg flex items-center
                            justify-center">
              <svg className="w-5 h-5 text-white" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364
                     l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636
                     l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-[#F1F5F9] font-bold text-lg">BreatheWish</span>
          </div>

          <h1 className="text-[#F1F5F9] text-3xl font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-[#64748B] text-sm mb-8">
            Sign in to your account to continue
          </p>

          {/* Role selector */}
          <div className="flex gap-2 mb-6 p-1 bg-[#1E293B] rounded-xl
                          border border-[#334155]">
            {(['patient', 'doctor'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium
                            capitalize transition-all duration-200 ${
                  role === r
                    ? 'bg-[#1D4ED8] text-white shadow-lg'
                    : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                {r === 'patient' ? '🏥 Patient' : '👨‍⚕️ Doctor'}
              </button>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-[#450A0A] border border-[#DC2626]/40
                         rounded-lg text-[#F87171] text-sm
                         flex items-center gap-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor"
                   viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0
                     11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0
                     102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[#94A3B8] text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                required
                className="w-full px-4 py-3 rounded-xl
                           bg-[#1E293B] border border-[#334155]
                           text-[#F1F5F9] placeholder-[#475569]
                           focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]
                           focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#94A3B8] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl
                             bg-[#1E293B] border border-[#334155]
                             text-[#F1F5F9] placeholder-[#475569]
                             focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]
                             focus:border-transparent transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[#475569] hover:text-[#94A3B8] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                           0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029
                           m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242
                           4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
                           M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0
                           8.268 2.943 9.543 7a10.025 10.025 0 01-4.132
                           5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                           8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                           7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF]
                         text-white font-semibold text-sm transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none"
                       viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[#475569] text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/register"
                  className="text-[#38BDF8] hover:underline font-medium">
              Register here
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[#1E293B] rounded-xl border border-[#334155]">
            <p className="text-[#64748B] text-xs font-medium mb-2
                          uppercase tracking-widest">
              Demo credentials
            </p>
            <div className="space-y-1 text-xs text-[#475569] font-mono">
              <p>Patient: ravi@patient.com / patient123</p>
              <p>Doctor:  priya@hospital.com / doctor123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
```

Apply the same two-panel layout and input styling to
`frontend/app/(auth)/register/page.tsx`.

**Verification:**
- Login page: dark background, readable inputs, role selector works
- No white text on any input
- Error message shows in red banner on wrong credentials
- Password show/hide toggle works
- Mobile: left panel hidden, form full width

---

### Fix 3 — Accuracy Card and Graphs on Patient Dashboard

**Problem:**
Patient dashboard shows no health summary, no graphs, no visual feedback
on their case history. Empty feeling after verification.

**Required change:**
Add `AccuracyCard` component to patient dashboard.
Shows only after at least one verified case exists.
Never shows raw AI scores — only doctor-verified verdicts.

Create `frontend/components/patient/AccuracyCard.tsx`:

```tsx
'use client'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { Case } from '@/types'

interface Props { cases: Case[] }

export default function AccuracyCard({ cases }: Props) {
  const verified = cases.filter(c =>
    c.status === 'verified' && c.doctorVerdict
  )
  if (verified.length === 0) return null

  const latest = verified[0]

  const counts = {
    pneumonia: verified.filter(c => c.doctorVerdict === 'pneumonia').length,
    normal: verified.filter(c => c.doctorVerdict === 'no_pneumonia').length,
    inconclusive: verified.filter(c => c.doctorVerdict === 'inconclusive').length,
  }

  const severityCounts = [
    { name: 'Severe', value: verified.filter(c => c.doctorSeverity === 'severe').length, color: '#DC2626' },
    { name: 'Moderate', value: verified.filter(c => c.doctorSeverity === 'moderate').length, color: '#D97706' },
    { name: 'Mild', value: verified.filter(c => c.doctorSeverity === 'mild').length, color: '#16A34A' },
    { name: 'Normal', value: counts.normal, color: '#38BDF8' },
  ].filter(d => d.value > 0)

  const radialData = [{
    name: 'Cases',
    value: verified.length,
    fill: '#0D9488'
  }]

  return (
    <div className="bg-[#243044] border border-[#2E3D55] rounded-xl p-6 mt-6">
      <h3 className="font-semibold text-[#E2E8F0] text-lg mb-6">
        Health Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Stat counters */}
        <div className="space-y-3">
          <p className="text-[#94A3B8] text-xs uppercase tracking-widest mb-3">
            Case Overview
          </p>
          {[
            { label: 'Total Cases', value: verified.length, color: '#38BDF8' },
            { label: 'Pneumonia Detected', value: counts.pneumonia, color: '#DC2626' },
            { label: 'Normal', value: counts.normal, color: '#16A34A' },
            { label: 'Inconclusive', value: counts.inconclusive, color: '#D97706' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-3
                         bg-[#1A2234] rounded-lg border border-[#2E3D55]"
            >
              <span className="text-[#94A3B8] text-sm">{s.label}</span>
              <span className="font-bold font-mono text-lg"
                    style={{ color: s.color }}>
                {s.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Severity distribution bar chart */}
        <div>
          <p className="text-[#94A3B8] text-xs uppercase tracking-widest mb-3">
            Severity Distribution
          </p>
          {severityCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={severityCounts} barSize={28}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: '#2E3D55' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#64748B] text-sm text-center mt-8">
              No data yet
            </p>
          )}
        </div>

        {/* Radial total + latest verdict */}
        <div>
          <p className="text-[#94A3B8] text-xs uppercase tracking-widest mb-3">
            Total Reviewed
          </p>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width={120} height={120}>
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="60%" outerRadius="100%"
                data={radialData}
                startAngle={90} endAngle={-270}
              >
                <RadialBar dataKey="value" fill="#0D9488" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-3xl font-bold text-[#0D9488] -mt-2">
              {verified.length}
            </p>
            <p className="text-[#64748B] text-xs mt-1">
              verified {verified.length === 1 ? 'case' : 'cases'}
            </p>
          </div>

          {/* Latest verdict */}
          {latest.doctorVerdict && (
            <div className={`mt-4 p-3 rounded-xl border text-sm ${
              latest.doctorVerdict === 'pneumonia'
                ? 'bg-[#450A0A]/50 border-[#DC2626]/30 text-[#F87171]'
                : latest.doctorVerdict === 'no_pneumonia'
                ? 'bg-[#052E16]/50 border-[#16A34A]/30 text-[#4ADE80]'
                : 'bg-[#451A03]/50 border-[#D97706]/30 text-[#FBBF24]'
            }`}>
              <p className="text-[#64748B] text-xs mb-1">Latest verdict</p>
              <p className="font-semibold">
                {latest.doctorVerdict === 'pneumonia'
                  ? `Pneumonia — ${latest.doctorSeverity}`
                  : latest.doctorVerdict === 'no_pneumonia'
                  ? 'No pneumonia detected'
                  : 'Inconclusive'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

Add `AccuracyCard` to patient dashboard:
```tsx
// In app/(patient)/dashboard/page.tsx, after the case list:
<AccuracyCard cases={cases} />
```

**Verification:**
- No verified cases: AccuracyCard does not render
- One verified case: renders with correct counts
- Multiple cases: bar chart shows distribution correctly
- No raw AI confidence scores visible anywhere

---

## STEP 2 — Full Software Audit

Run every audit category below in order.
For each one: run the check, record what fails, fix it, verify the fix.
Do not move to the next audit until the current one is clean.

---

### Audit 1 — Security

```bash
# 1. Check for hardcoded secrets
grep -r "sk-ant\|password\|secret\|api_key" \
  --include="*.ts" --include="*.tsx" --include="*.py" \
  --exclude-dir=node_modules --exclude-dir=.git .

# Expected: no matches in source files
# If found: move to environment variables immediately

# 2. Check JWT configuration
grep -r "algorithm\|expiry\|expire" backend/app/middleware/auth.py
# Expected: algorithm="HS256", expiry set to 60 minutes

# 3. Check password hashing
grep -r "bcrypt\|hash\|rounds" backend/app/routers/auth.py
# Expected: bcrypt with rounds >= 12

# 4. Check CORS
grep -r "allow_origins" backend/app/main.py
# Expected: specific origins listed, never ["*"]

# 5. Check file upload validation
grep -r "content_type\|mime\|allowed" backend/app/routers/cases.py
# Expected: server-side mime type validation present

# 6. Check rate limiting
grep -r "limiter\|rate_limit\|slowapi" backend/app/
# Expected: login and upload endpoints rate limited

# 7. Check .gitignore
cat .gitignore | grep -E "\.env|\.pth|secrets"
# Expected: .env, *.pth, all secret files listed

# 8. Check Docker image for exposed secrets
docker history pneumonia_backend --no-trunc | grep -i "env\|secret\|key"
# Expected: no secrets in docker layer history

# 9. Dependency vulnerability check
cd frontend && npm audit --audit-level=high
cd ../backend && pip-audit
```

**Record every finding. Fix before moving on.**

Fixes to apply if found:
- Hardcoded secrets → move to .env, access via os.getenv()
- JWT no expiry → add `expire = datetime.utcnow() + timedelta(minutes=60)`
- Weak bcrypt rounds → set `pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12)`
- CORS wildcard → replace `["*"]` with `["http://localhost:3000"]`
- No file mime validation → add check before inference:
  ```python
  ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png"}
  if xray.content_type not in ALLOWED_MIME:
      raise HTTPException(400, "Only JPG and PNG files accepted")
  ```
- No rate limiting → install slowapi, add to login and upload endpoints
- Missing .gitignore entries → add them

---

### Audit 2 — Code Quality

```bash
# TypeScript errors
cd frontend && npx tsc --noEmit 2>&1

# Unused imports
cd frontend && npx eslint . --ext .ts,.tsx \
  --rule '{"@typescript-eslint/no-unused-vars": "error"}' 2>&1

# Any types
cd frontend && grep -r ": any" --include="*.ts" --include="*.tsx" . \
  | grep -v node_modules

# Console logs in production code
grep -r "console\.log\|console\.error\|print(" \
  --include="*.ts" --include="*.tsx" --include="*.py" \
  --exclude-dir=node_modules .

# Hardcoded URLs
grep -r "localhost:8000\|localhost:3000" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules .

# Dead code (Python)
cd backend && python -m py_compile app/main.py
cd backend && python -c "import ast; import sys;
[ast.parse(open(f).read()) for f in
 __import__('glob').glob('app/**/*.py', recursive=True)]
print('No syntax errors')"
```

**Fix all TypeScript errors, remove all `any` types, remove all console.logs,
replace hardcoded URLs with environment variables.**

---

### Audit 3 — Database

```bash
# Enter database container
docker-compose exec postgres psql -U pneumonia_user -d pneumonia_db

# Check indexes exist
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

# Expected indexes:
# cases: patient_id, primary_doctor_id, status
# prescriptions: case_id
# second_opinions: case_id, second_doctor_id
# consultations: case_id, sender_id
# follow_ups: case_id
# audit_log: user_id, entity_id
# notifications: user_id, is_read

# Check for missing NOT NULL constraints
SELECT column_name, is_nullable, table_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND is_nullable = 'YES'
ORDER BY table_name, column_name;

# Check for N+1 queries — enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();
# Then run a typical page load and check logs for repeated queries

# Check cascade rules
SELECT
  tc.table_name, kcu.column_name,
  ccu.table_name AS foreign_table,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

**Add missing indexes via Alembic migration:**
```python
# New migration file:
def upgrade():
    op.create_index('idx_cases_patient_id', 'cases', ['patient_id'])
    op.create_index('idx_cases_doctor_id', 'cases', ['primary_doctor_id'])
    op.create_index('idx_cases_status', 'cases', ['status'])
    op.create_index('idx_prescriptions_case_id', 'prescriptions', ['case_id'])
    op.create_index('idx_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('idx_notifications_is_read', 'notifications', ['is_read'])
    op.create_index('idx_audit_log_user_id', 'audit_log', ['user_id'])
    op.create_index('idx_audit_log_entity', 'audit_log', ['entity_type', 'entity_id'])
    op.create_index('idx_consultations_case_id', 'consultations', ['case_id'])
    op.create_index('idx_follow_ups_case_id', 'follow_ups', ['case_id'])
    op.create_index('idx_second_opinions_case_id', 'second_opinions', ['case_id'])
```

---

### Audit 4 — API

```bash
# Check all endpoints return consistent response shape
# Every endpoint should return: { data: ..., error: null } or { data: null, error: "..." }

# Check HTTP status codes
grep -r "status_code" backend/app/routers/ --include="*.py"
# Verify: 201 for POST creates, 404 for not found, 403 for forbidden, 422 for validation

# Check authorization on every route
grep -r "Depends(get_current_user)" backend/app/routers/ --include="*.py"
# Every protected endpoint must have this dependency

# Check Pydantic validation on all inputs
grep -r "BaseModel\|Schema" backend/app/schemas/ --include="*.py"
# Every router should use schema for input, not raw dict

# Test unauthorized access
curl -X GET http://localhost:8000/cases/ -w "\n%{http_code}"
# Expected: 401 or 403, never 200

# Test patient accessing doctor endpoint
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@patient.com","password":"patient123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
curl -X GET http://localhost:8000/cases/doctor/some-id \
  -H "Authorization: Bearer $TOKEN" -w "\n%{http_code}"
# Expected: 403

# Check no stack traces in error responses
curl -X POST http://localhost:8000/cases/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"invalid": "data"}' -w "\n"
# Expected: clean error message, no Python traceback
```

**Fix every issue found:**
- Add consistent response wrapper to all endpoints
- Fix incorrect status codes
- Add authorization checks to any unprotected routes
- Add Pydantic schemas to any endpoint missing them
- Add exception handler to suppress stack traces:

```python
# In main.py:
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"data": None, "error": "An internal error occurred"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"data": None, "error": "Invalid input data"}
    )
```

---

### Audit 5 — Accessibility (WCAG 2.1 AA)

```bash
# Install axe-core for automated a11y testing
cd frontend && npm install --save-dev @axe-core/react

# Run Lighthouse from Chrome DevTools:
# Open http://localhost:3000
# DevTools → Lighthouse → Accessibility → Generate report
# Target score: 90+

# Check color contrast manually:
# Text on patient surface #E2E8F0 on #1A2234:
# Contrast ratio should be >= 4.5:1
# Use https://webaim.org/resources/contrastchecker/

# Check all images have alt text
grep -r "<img" frontend/app/ frontend/components/ --include="*.tsx" \
  | grep -v "alt="
# Expected: no matches (every img has alt)

# Check all icon-only buttons have aria-label
grep -r "<button" frontend/components/ --include="*.tsx" -A2 \
  | grep -B1 "aria-label" | grep -v "aria-label"

# Check form labels
grep -r "<input" frontend/components/ --include="*.tsx" -B3 \
  | grep -v "label\|aria-label\|aria-labelledby"

# Check focus rings not removed
grep -r "outline-none\|outline: none" \
  --include="*.tsx" --include="*.css" \
  frontend/ | grep -v "focus:ring"
# Every outline-none must be paired with a focus:ring replacement
```

**Fix every finding:**
- Missing alt text → add descriptive alt to every image
- Missing aria-label → add to every icon-only button
- Missing form labels → add `<label htmlFor>` to every input
- `outline-none` without `focus:ring` → add `focus:ring-2 focus:ring-[#0D9488]`
- Add skip to content link at top of every page:
  ```tsx
  <a href="#main-content"
     className="sr-only focus:not-sr-only focus:absolute focus:top-4
                focus:left-4 bg-[#1D4ED8] text-white px-4 py-2 rounded-lg z-50">
    Skip to main content
  </a>
  ```
- Add `prefers-reduced-motion` to all animations:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important; }
  }
  ```

---

### Audit 6 — Performance

```bash
# Run Next.js bundle analyzer
cd frontend
ANALYZE=true npm run build
# Check for any dependency over 100KB that could be lazy loaded

# Run Lighthouse performance audit
# Target scores: Performance > 80, Best Practices > 90

# Check for unoptimized images
grep -r "<img " frontend/ --include="*.tsx"
# Expected: none — all images use Next.js <Image> component

# Check for missing React.memo on heavy components
# These should be memoized:
# - WorklistTable (re-renders on every notification poll)
# - ConfidenceChart (heavy Recharts render)
# - XRayViewer (image loading)
# - ConsultationThread (re-renders on poll)

# Check API response times
curl -w "\nTime: %{time_total}s\n" http://localhost:8000/health
curl -w "\nTime: %{time_total}s\n" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/cases/patient/$PATIENT_ID
# Expected: all non-ML endpoints under 500ms

# Check ML inference time
time curl -X POST http://localhost:8000/cases/test-inference \
  -F "xray=@demo_severe.jpg"
# Expected: under 10 seconds, loading state shown on frontend
```

**Fix every finding:**
- Large bundles → add dynamic imports for heavy components:
  ```tsx
  const ConfidenceChart = dynamic(
    () => import('@/components/doctor/ConfidenceChart'),
    { loading: () => <div className="animate-pulse h-32 bg-surface rounded-xl" /> }
  )
  ```
- Plain `<img>` → replace with Next.js `<Image>`
- Missing memo → wrap heavy list components with `React.memo()`
- Slow API → add Redis caching for doctor worklist

---

### Audit 7 — Dependency

```bash
# Frontend
cd frontend
npm outdated
npm audit --audit-level=moderate

# Backend
cd backend
pip list --outdated
pip-audit

# Check for unused frontend packages
npx depcheck

# Check license compatibility
npx license-checker --onlyAllow \
  'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0'
```

**Fix every finding:**
- High severity npm vulnerabilities → `npm audit fix`
- High severity pip vulnerabilities → update the specific package
- Unused packages → remove from package.json / requirements.txt
- Incompatible licenses → flag and document

---

### Audit 8 — Action/Event Audit Log

Verify every meaningful state change in the system is recorded in `audit_log`.

```bash
# Run a complete case flow, then check:
docker-compose exec postgres psql -U pneumonia_user -d pneumonia_db \
  -c "SELECT action, entity_type, created_at FROM audit_log ORDER BY created_at;"

# Expected entries after a full flow:
# case_created
# prescription_generated
# case_status_changed (uploaded → under_review)
# prescription_edited
# case_status_changed (under_review → prescription_draft)
# prescription_verified
# case_status_changed (prescription_draft → verified)
# second_opinion_requested
# second_opinion_verdict_submitted
# follow_up_created
# consultation_sent (patient)
# consultation_sent (doctor)
# login_success
# login_failure (if wrong password attempted)
```

**Add any missing audit log entries.**

---

### Audit 9 — Data Privacy

```bash
# Check what patient data is returned in API responses
# Patient endpoint should NEVER return:
# - ai_confidence
# - ai_severity
# - ai_type
# - gradcam_url
# - ai_raw_output
# - other patients' data

TOKEN_PATIENT=$(# patient login token)
curl -H "Authorization: Bearer $TOKEN_PATIENT" \
  http://localhost:8000/cases/$CASE_ID | python3 -m json.tool \
  | grep -E "ai_confidence|ai_severity|gradcam"
# Expected: no matches

# Check prescription hidden before verification
curl -H "Authorization: Bearer $TOKEN_PATIENT" \
  http://localhost:8000/prescriptions/$CASE_ID -w "\n%{http_code}"
# Expected: 404 if not verified

# Verify one patient cannot see another patient's cases
TOKEN_PATIENT2=$(# second patient login token)
curl -H "Authorization: Bearer $TOKEN_PATIENT2" \
  http://localhost:8000/cases/$CASE_ID_OF_PATIENT1 -w "\n%{http_code}"
# Expected: 403
```

**Fix every privacy violation found.**

---

### Audit 10 — DevOps

```bash
# Check all containers have health checks
docker-compose ps
# All services should show "healthy" not "starting" after 2 minutes

# Check containers not running as root
docker-compose exec backend whoami
docker-compose exec frontend whoami
# Expected: not "root"

# Fix if root: add to Dockerfiles:
# RUN adduser --disabled-password --gecos '' appuser
# USER appuser

# Check .dockerignore exists and is correct
cat backend/.dockerignore
cat frontend/.dockerignore
# Expected: node_modules, .env, .git, __pycache__, *.pth excluded

# Check Docker image sizes
docker images | grep pneumonia
# Backend should be under 2GB, Frontend under 500MB

# Check volumes are named (not anonymous)
docker volume ls | grep pneumonia
# Expected: pneumonia-detection_postgres_data, _redis_data, _model_weights

# Check restart policies
docker-compose config | grep restart
# Expected: unless-stopped on all services

# Check logs not filling disk
docker-compose exec backend ls -lh app/*.log 2>/dev/null
# Expected: no unbounded log files
```

**Fix every finding.**

---

### Audit 11 — Documentation

```bash
# Check Swagger UI is accessible and accurate
curl http://localhost:8000/docs -w "\n%{http_code}"
# Expected: 200

# Check every endpoint has a description in Swagger
# Open http://localhost:8000/docs in browser
# Every endpoint should have: summary, description, request body schema,
# response schema, error responses documented

# Check .env.example is complete
diff <(grep -o '^[A-Z_]*' .env) <(grep -o '^[A-Z_]*' .env.example)
# Expected: no diff — every variable in .env is also in .env.example

# Check README exists (will be written after audits)
ls README.md 2>/dev/null || echo "README not yet written — correct, written last"
```

---

## STEP 3 — Verify All Fixes

After completing all audits and fixes, run this complete verification:

```bash
# Security
echo "=== SECURITY ===" && \
grep -r "sk-ant\|password.*=.*['\"]" --include="*.py" --include="*.ts" \
  --exclude-dir=node_modules . | grep -v ".env" | wc -l && \
echo "Hardcoded secrets (expect 0):"

# TypeScript
echo "=== TYPESCRIPT ===" && \
cd frontend && npx tsc --noEmit 2>&1 | wc -l && \
echo "TypeScript errors (expect 0):"

# Tests
echo "=== API TESTS ===" && \
curl -s http://localhost:8000/health | grep "ok" && \
echo "Health check: PASS"

# Database
echo "=== DATABASE ===" && \
docker-compose exec postgres psql -U pneumonia_user -d pneumonia_db \
  -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';" && \
echo "Indexes present"

# Accessibility
echo "=== ACCESSIBILITY ===" && \
cd frontend && grep -r "<img " app/ components/ --include="*.tsx" \
  | grep -v "alt=" | wc -l && \
echo "Images without alt (expect 0):"

# Privacy
echo "=== PRIVACY ===" && \
echo "Run manual check: patient API response contains no AI fields"

echo "=== ALL AUDITS COMPLETE ==="
```

Record the output of every check. This output becomes the audit results fed to the README generator.

---

## STEP 4 — Generate README

After all audits pass and all fixes are verified, feed this prompt to the LLM
along with the full audit results:

```
You are writing a professional README.md for the BreatheWish pneumonia
detection system.

You have already read:
- pneumonia_detection_implementation_plan.md
- agent_prompt_guide.md
- This master instruction file

You now also have the complete audit results below.

Write a complete README.md that includes:

1. Project title and badges (build status, docker, license)
2. One paragraph — what is BreatheWish and what problem does it solve
3. Why this approach — human in the loop, why AI alone is insufficient
4. What changed during development and why
   (use the audit findings as the source of truth for this section)
5. Architecture diagram (ASCII)
6. Tech stack table with versions
7. Prerequisites (Docker, Docker Desktop)
8. Setup instructions (clone, fill .env, docker-compose up)
9. Demo credentials table
10. Every audit performed:
    - What was checked
    - What was found
    - What was fixed
    - How it was verified
11. Known limitations (be honest)
12. Future roadmap
13. License

Tone: professional, honest, technical. No marketing language.
Do not invent findings — use only what the audit results show.
Do not use placeholder text — every section must be complete.

AUDIT RESULTS:
[paste full audit output here]
```

The README is generated from real data, not assumptions.

---

## Quick Reference — All Credentials

```
Patient:              ravi@patient.com        / patient123
Patient 2:            priya@patient.com       / patient123
Doctor (consultant):  priya@hospital.com      / doctor123
Doctor (senior):      arun@hospital.com       / doctor123
Doctor (junior):      vikram@hospital.com     / doctor123
Cardiologist:         rajan@hospital.com      / doctor123
Radiologist:          sunita@hospital.com     / doctor123
```

---

## Quick Reference — Docker Commands

```bash
# Start everything
docker-compose up --build

# Start in background
docker-compose up -d

# Stop
docker-compose down

# Full reset (deletes all data)
docker-compose down -v

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run migrations
docker-compose exec backend alembic upgrade head

# Seed database
docker-compose exec backend python seed.py

# Open database shell
docker-compose exec postgres psql -U pneumonia_user -d pneumonia_db

# Restart one service
docker-compose restart backend
```

---

## Order of Execution Summary

```
1. LLM reads all 3 documents → confirms understanding
2. Fix 1: Patient theme → no white → dark variant
3. Fix 2: Login page redesign
4. Fix 3: Accuracy card + graphs on patient dashboard
5. Audit 1: Security → fix all findings
6. Audit 2: Code quality → fix all findings
7. Audit 3: Database → fix all findings
8. Audit 4: API → fix all findings
9. Audit 5: Accessibility → fix all findings
10. Audit 6: Performance → fix all findings
11. Audit 7: Dependencies → fix all findings
12. Audit 8: Action/event audit log → verify coverage
13. Audit 9: Data privacy → fix all findings
14. Audit 10: DevOps → fix all findings
15. Audit 11: Documentation → fix all findings
16. Run complete verification script → record all outputs
17. Feed audit results to LLM → generate README
```

Do not skip steps. Do not reorder steps.
Every fix must be verified before the next audit begins.
