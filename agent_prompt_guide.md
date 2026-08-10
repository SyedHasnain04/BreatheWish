# Agent Prompt Guide — Pneumonia Detection System
> Use these prompts in order. Never move to the next phase until the current one is running cleanly.
> Designed for Claude Code desktop app. Works with Cursor and Windsurf too.

---

## Before You Start — Setup Prompt

Run this once before any phase. Sets the agent's context for the entire project.

```
I am building a hospital-scoped pneumonia detection web application.
I have an implementation plan document called pneumonia_detection_implementation_plan.md.
Read it fully before doing anything. Do not generate any code yet.

When you are done reading, summarize back to me:
1. The tech stack
2. The 7 phases
3. The critical rules (human in the loop, prescription visibility, etc.)

I will tell you when to start building.
```

**Why:** Forces the agent to internalize the full plan before touching any files. Agents that skip straight to generating code lose context halfway through.

---

## Phase 1 — Foundation

### Prompt 1A — Project scaffolding
```
Begin Phase 1 of the implementation plan.

Step 1 only: Initialize both projects.

For the frontend:
- Create a Next.js 14 app in /frontend using the App Router, TypeScript, and Tailwind CSS
- Install these additional packages: framer-motion, recharts, next-auth@beta
- Copy the exact tailwind.config.ts and globals.css from the implementation plan

For the backend:
- Create a FastAPI project in /backend
- Create requirements.txt with all packages from the implementation plan
- Create the full folder structure from the plan (routers/, services/, models/, schemas/, ml/)
- Create placeholder __init__.py files so imports don't break

For the root:
- Create docker-compose.yml exactly as in the plan
- Create .env.example exactly as in the plan
- Create a real .env file and ask me to fill in the values

Do not write any route logic yet. Scaffold only.
When done, show me the full directory tree of both projects.
```

### Prompt 1B — Database
```
Phase 1, Step 2: Database setup.

1. Install SQLAlchemy, Alembic, asyncpg, psycopg2-binary in the backend
2. Create backend/app/database.py with SQLAlchemy engine and session setup
3. Create all SQLAlchemy ORM models from the database schema in the implementation plan:
   - user.py
   - case.py
   - prescription.py
   - second_opinion.py
   - consultation.py
   - follow_up.py
   - audit.py
   - notification.py
4. Initialize Alembic and create the first migration from these models
5. Run docker-compose up -d to start PostgreSQL and Redis
6. Run the migration and confirm all tables are created
7. Show me the output of \dt in psql to confirm

Do not move on until the migration runs without errors.
```

### Prompt 1C — Authentication
```
Phase 1, Step 3: Authentication.

Backend:
1. Install python-jose, passlib, python-multipart in the backend
2. Create backend/app/routers/auth.py with:
   - POST /auth/register (email, password, full_name, role, specializations if doctor)
   - POST /auth/login (returns JWT access token)
   - GET /auth/me (returns current user from token)
3. Create backend/app/middleware/auth.py with get_current_user dependency
4. Wire auth router into main.py
5. Test with curl: register a patient, register a doctor, login as both, hit /auth/me

Frontend:
1. Set up NextAuth in frontend/app/api/auth/[...nextauth]/route.ts exactly as in the plan
2. Create frontend/middleware.ts for role-based route protection exactly as in the plan
3. Create a basic login page at frontend/app/(auth)/login/page.tsx:
   - Email + password form
   - Role selector (patient / doctor)
   - Calls NextAuth signIn
   - Redirects patient → /dashboard, doctor → /dashboard
4. Create stub dashboard pages for both roles (just a heading is fine)
5. Test: login as patient → see patient dashboard, login as doctor → see doctor dashboard,
   try accessing the other role's dashboard → get redirected

Show me the curl outputs and confirm routing works before stopping.
```

### Prompt 1D — Seed data
```
Phase 1, Step 4: Seed the database.

Create backend/seed.py that inserts:

Doctors (all specialization: pulmonology):
- Dr. Arun Mehta, senior, arun@hospital.com, password: doctor123
- Dr. Priya Sharma, consultant, priya@hospital.com, password: doctor123
- Dr. Vikram Nair, junior, vikram@hospital.com, password: doctor123

Additional doctors for second opinion:
- Dr. Rajan Pillai, specialization: cardiology, senior, rajan@hospital.com, password: doctor123
- Dr. Sunita Rao, specialization: radiology, senior, sunita@hospital.com, password: doctor123

Patients:
- Ravi Kumar, ravi@patient.com, password: patient123
- Priya Nair, priya@patient.com, password: patient123

Run the seed script and confirm all users appear in the database.
Show me SELECT id, full_name, role, specializations FROM users;
```

**Phase 1 is done when:**
- [ ] Docker containers running (postgres, redis, backend, frontend)
- [ ] All database tables created
- [ ] Login works for both roles
- [ ] Role-based routing redirects correctly
- [ ] Seed data inserted

---

## Phase 2 — Hero Page

### Prompt 2A — Design system
```
Phase 2, Step 1: Design system only. No page content yet.

1. Implement the complete tailwind.config.ts from the implementation plan exactly
   (all colors: background, surface, border, patient-bg, patient-surface,
   severity colors, verified, doctor-accent, patient-accent, all text variants,
   all animations, font families)

2. Implement globals.css from the plan exactly
   (Google Fonts import, CSS variables for both themes,
   all @layer components: severity-badge-*, verified-badge, card-dark, card-light,
   btn-primary, btn-outline-light)

3. Create frontend/components/shared/ folder with these utility components:
   - SeverityBadge.tsx — takes severity prop, renders correct badge class
   - StatusBadge.tsx — takes CaseStatus prop, renders label + color
   - VerifiedBadge.tsx — takes doctorName prop, renders verified badge with checkmark

4. Create frontend/types/index.ts with ALL types from the implementation plan

5. Create a test page at /test-design that renders:
   - All severity badges (severe, moderate, mild, none)
   - All status badges
   - A verified badge
   - A card-dark and a card-light
   - Both buttons
   - Text in all defined colors

Show me a screenshot or describe what renders. Fix any Tailwind class resolution issues.
```

### Prompt 2B — Scan line animation
```
Phase 2, Step 2: ScanLineAnimation component.

Create frontend/components/hero/ScanLineAnimation.tsx exactly as in the implementation plan.

Requirements:
- Uses useAnimationFrame from Framer Motion for the scan line
- SVG ribcage outline, spine, lung ellipses, heart shadow — all in #1E293B
- Scan line moves top to bottom, repeats every 4 seconds
- Scan line has glow filter (#38BDF8 with feGaussianBlur)
- 3 data point cards (Confidence, Severity, Type) fade in as scan passes their Y position
- AI Assisted Detection badge bottom right with pulsing dot

Render it standalone at /test-scan to verify the animation before putting it in the hero.
The background should be #0F172A. The animation should loop cleanly with no jumps.

Fix any animation timing issues before moving on.
```

### Prompt 2C — Full hero page
```
Phase 2, Step 3: Complete hero page.

Build these components in order, testing each before the next:

1. frontend/components/hero/LandingNav.tsx
   - Logo left, Login + Register buttons right
   - Transparent background that becomes surface/80 on scroll (use Framer Motion scroll)
   - Sticky top

2. frontend/components/hero/FloatingCards.tsx
   - 3 TiltCard components with 3D mouse-tracking tilt (useMotionValue, useSpring, useTransform)
   - Card 1 (dark): Doctor worklist preview with 3 fake cases and severity badges
   - Card 2 (dark): AI analysis preview with animated confidence bar (Recharts or motion div)
   - Card 3 (light/warm): Patient prescription preview with verified badge
   - Animate in on scroll with whileInView

3. frontend/components/hero/HowItWorks.tsx
   - 3 steps: Upload X-Ray, AI Scans, Doctor Verifies
   - Icons (use lucide-react: Upload, Cpu, ShieldCheck)
   - Animate in sequentially on scroll

4. frontend/components/hero/StatStrip.tsx
   - Dark band: "DenseNet-121  ·  112,000+ X-rays  ·  Human verified  ·  Grad-CAM explainability"
   - Subtle separator dots between items

5. frontend/components/hero/ForPatients.tsx
   - Switches to patient warm theme (#FAFAF9 background)
   - Patient benefits: Upload from anywhere, Calm clear results, Doctor verified always
   - CTA: Register as Patient

6. frontend/components/hero/ForDoctors.tsx
   - Back to dark theme
   - Doctor benefits: Severity-sorted queue, AI pre-analysis, Grad-CAM heatmap
   - CTA: Doctor Login

7. frontend/components/hero/HeroSection.tsx
   - Assembles ScanLineAnimation + copy + FloatingCards as in the plan

8. frontend/app/page.tsx
   - Assembles all sections in order

The scroll transition from dark (hero) → warm (ForPatients) → dark (ForDoctors)
should feel smooth. Use section background colors, not scroll-triggered JS.

Test at localhost:3000. Show me what each section looks like.
```

**Phase 2 is done when:**
- [ ] Design tokens working — all colors resolve in Tailwind
- [ ] Scan line animates smoothly, data points fade in correctly
- [ ] Hero section renders with correct dark theme
- [ ] Floating cards tilt on mouse move
- [ ] Scroll through landing — dark → warm → dark transition works
- [ ] Login / Register buttons in nav go to correct pages

---

## Phase 3 — ML Pipeline

### Prompt 3A — Model setup
```
Phase 3, Step 1: ML model setup.

1. Install in backend: torch torchvision pytorch-grad-cam Pillow numpy opencv-python-headless

2. Create backend/app/ml/model.py exactly as in the implementation plan
   (DenseNet-121, classifier replaced with Linear(1024, 2), loads from weights path)

3. Create backend/app/ml/preprocess.py:
   - TRANSFORM pipeline: Resize(224,224), Grayscale(3 channels), ToTensor, Normalize
   - Function: preprocess_image(image_bytes: bytes) -> torch.Tensor

4. Create backend/app/ml/gradcam.py exactly as in the implementation plan
   (GradCAM on denseblock4.denselayer16.conv2, overlay on original image, returns PNG bytes)

5. Create a test script backend/test_inference.py:
   - Downloads a sample chest X-ray from a public URL (use requests)
   - Runs it through the full pipeline: preprocess → model → confidence → gradcam
   - Saves gradcam output as test_gradcam.png
   - Prints confidence score

Run the test script. It will use random weights (no pretrained file yet) so confidence
will be ~50% — that is expected. What matters is the pipeline runs without errors
and test_gradcam.png is created.

Note for pretrained weights: Download from
https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
and fine-tune, or use CheXNet weights from https://github.com/arnoweng/CheXNet
Place weights at backend/app/ml/weights/densenet121_chexnet.pth

Show me the test script output.
```

### Prompt 3B — Cloudinary service
```
Phase 3, Step 2: Cloudinary file storage.

1. Install cloudinary in the backend

2. Create backend/app/services/cloudinary_service.py:
   - configure() — reads CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET from env
   - upload_image(image_bytes: bytes, folder: str) -> dict with keys: url, public_id
   - delete_image(public_id: str) -> bool
   - Call configure() on module import

3. Create a test: upload a small PNG to Cloudinary and print the returned URL
   Confirm the URL is publicly accessible

4. Add Cloudinary credentials to .env (ask me to fill them in if not set)
```

### Prompt 3C — ML service + inference endpoint
```
Phase 3, Step 3: ML service and inference route.

1. Create backend/app/services/ml_service.py exactly as in the implementation plan:
   - Loads model once at module level (singleton)
   - run_inference(image_bytes) -> dict with confidence, severity, type, gradcam_image, raw_output
   - classify_severity thresholds: severe>=80%, moderate>=50%, mild>=20%, else none
   - bacterial if confidence>75%, viral if>20%, else none

2. Add a test endpoint to backend/app/routers/cases.py (temporary, remove later):
   POST /cases/test-inference
   - Accepts file upload
   - Runs ml_service.run_inference
   - Uploads gradcam to Cloudinary
   - Returns: confidence, severity, type, gradcam_url (no database write)

3. Test with curl using a real chest X-ray image:
   curl -X POST http://localhost:8000/cases/test-inference \
     -F "xray=@path/to/xray.jpg"

Show me the JSON response. Confirm gradcam_url is a valid Cloudinary URL.
Fix any import or path errors before moving on.
```

**Phase 3 is done when:**
- [ ] Model loads without errors (random weights are fine for now)
- [ ] Inference returns confidence %, severity, type
- [ ] Grad-CAM generates a valid overlay image
- [ ] Grad-CAM uploads to Cloudinary successfully
- [ ] Test endpoint returns correct JSON shape

---

## Phase 4 — Case Flow (largest phase, take your time)

### Prompt 4A — Symptom intake form
```
Phase 4, Step 1: Patient symptom intake form.

Create frontend/app/(patient)/new-case/page.tsx — a multi-step form.

Step 1 of form — Patient details:
- Age (number input)
- Weight in kg (number input)
- Sex (radio: male / female / other)
- Date of birth (date picker — use native HTML input type=date)
- Blood group (select: A+, A-, B+, B-, O+, O-, AB+, AB-)
- Existing conditions (checkboxes: Diabetes, Asthma, Heart Disease, Hypertension, None)
- Current medications (textarea — optional)

Step 2 of form — Symptoms:
- Fever (toggle yes/no) — if yes, show: how many days? (number)
- Cough type (radio: None / Dry / Wet / Bloody)
- Breathing difficulty (slider 1-5 with labels: Fine / Mild / Moderate / Difficult / Severe)
- Chest pain (toggle yes/no)
- Symptom duration in days (number input)

Step 3 of form — Upload X-ray:
- Drag and drop zone (or click to browse)
- Accepts: .jpg, .jpeg, .png, .dcm
- Preview thumbnail after selection
- File size limit: 10MB, show error if exceeded

Navigation:
- Back / Next buttons between steps
- Progress indicator (Step 1 of 3, Step 2 of 3, Step 3 of 3)
- Submit button on Step 3

On submit:
- POST to /api/proxy/cases/ with FormData (xray file + symptoms as JSON string)
- Show loading state: "Uploading X-ray... Analysing... Assigning doctor..."
   (fake 3-stage loading — the real API call happens in one request)
- On success: redirect to /dashboard with success toast
- On error: show error message, allow retry

Styling: use patient warm theme (data-theme="patient" on root div)
All form elements should use patient-border and patient-surface colors.

Doctor-initiated case: also create frontend/app/(doctor)/new-case/page.tsx
Same form but with an additional field at the top:
- Patient email or patient ID (doctor looks up patient)
- Auto-fills patient name if found
```

### Prompt 4B — Full case creation API
```
Phase 4, Step 2: Complete case creation endpoint.

Implement backend/app/routers/cases.py POST / exactly as in the implementation plan:

Full flow in order:
1. Accept multipart form: xray file + symptoms JSON string + optional patient_id
2. Read image bytes
3. Run ml_service.run_inference(image_bytes)
4. Upload X-ray to Cloudinary (folder: xrays)
5. Upload Grad-CAM to Cloudinary (folder: gradcam)
6. Call assign_doctor(db, severity=ml_result["severity"]) from doctor_assignment.py
7. If no doctor available: return 503 with message
8. Call llm_service.generate_prescription_draft(...) — pass all relevant fields
9. Determine patient_id: if current_user is doctor use form patient_id, else use current_user.id
10. Create Case record with all fields
11. Create Prescription record with llm_draft and final_prescription both set to llm_draft
12. Update case status to "under_review"
13. Create notification for assigned doctor
14. Create audit log entry
15. Return created case

Also implement:
- GET /cases/patient/:patient_id — return all cases for patient (no AI fields)
- GET /cases/doctor/:doctor_id — return all cases for doctor (WITH AI fields)
  Accept query param: ?status_group=pending|active|closed
  pending = uploaded, under_review
  active = prescription_draft, second_opinion_requested, second_opinion_received
  closed = verified, closed
- GET /cases/:id — return single case, filter AI fields based on caller's role

Also implement backend/app/services/llm_service.py exactly as in the plan.
Test the LLM call with a real Anthropic API key (set ANTHROPIC_API_KEY in .env).
Print the LLM draft response to console to confirm it returns valid JSON.

Test the full flow end-to-end:
1. Login as patient ravi@patient.com
2. POST /cases/ with a real chest X-ray image and symptom JSON
3. Confirm case appears in GET /cases/patient/:id
4. Login as assigned doctor
5. Confirm case appears in GET /cases/doctor/:id with AI fields present
6. Confirm patient GET /cases/:id does NOT return AI fields

Show me the API responses for both patient and doctor views.
```

### Prompt 4C — Doctor case detail page
```
Phase 4, Step 3: Doctor case detail page.

Create frontend/app/(doctor)/case/[id]/page.tsx

Layout (dark theme, two-column on desktop, single column on mobile):

Left column:
1. Patient info header: name, age, sex, blood group
2. Symptom summary card — all symptom fields in a clean grid
3. X-ray viewer (XRayViewer component below)

Right column:
4. AI Analysis card (doctor only — never rendered for patient)
5. Prescription editor
6. Action buttons

--- Component: XRayViewer ---
Create frontend/components/doctor/XRayViewer.tsx:
- Shows two images side by side: Original X-ray | Grad-CAM overlay
- Toggle button group: Original / Overlay / Blend (blend = CSS mix-blend-mode overlay)
- Click to zoom (modal with full-size image)
- Label "AI Assisted — Grad-CAM Visualization" below with ai-badge styling

--- Component: ConfidenceChart ---
Create frontend/components/doctor/ConfidenceChart.tsx:
- Uses Recharts
- RadialBarChart: large circle showing confidence % with doctor-accent color (#38BDF8)
- Below it: two horizontal bars — Normal probability vs Pneumonia probability
- Severity badge and type badge displayed alongside
- All values come from case.aiOutput
- Animate bars on mount (use Recharts animation props)

--- Component: PrescriptionEditor ---
Create frontend/components/doctor/PrescriptionEditor.tsx:
- Receives llm_draft as initial value
- Editable fields per medication row: name, dosage, frequency (select), duration, notes
- Add medication row button (+)
- Remove medication row button (×) — minimum 1 row
- General advice textarea
- Follow-up notes textarea
- Auto-save draft every 30 seconds (PATCH /prescriptions/:id silently)
- "Save Draft" button (manual save, shows saved timestamp)
- "Verify & Send to Patient" button:
  - Confirmation modal: "This will make the prescription visible to the patient. Continue?"
  - On confirm: POST /prescriptions/:id/verify
  - On success: show success toast, update case status badge to Verified
  - Disable button after verification (cannot unverify)

--- Doctor verdict fields ---
Before the prescription editor, show:
- Doctor verdict radio: Pneumonia / No Pneumonia / Inconclusive
- If Pneumonia: severity select (mild/moderate/severe) + type select (bacterial/viral)
- Doctor notes textarea
- "Save Verdict" button → PATCH /cases/:id with verdict fields

Show me the page renders correctly with real case data.
The prescription editor should be pre-populated with the LLM draft.
```

### Prompt 4D — Prescription API
```
Phase 4, Step 4: Prescription routes.

Create backend/app/routers/prescriptions.py:

GET /prescriptions/:case_id
- If caller is doctor: return prescription regardless of verification status
- If caller is patient: return prescription ONLY if is_verified = true, else 404
- This rule is enforced server-side, not client-side

PATCH /prescriptions/:id
- Doctor only
- Updates final_prescription fields (medications, generalAdvice, followUpNotes)
- Does NOT change is_verified
- Updates updated_at
- Logs to audit

POST /prescriptions/:id/verify
- Doctor only
- Sets is_verified = true, verified_at = now()
- Updates case status to "verified"
- Creates notification for patient: "Your prescription is ready — verified by Dr. X"
- Sends email via Resend (or skips if RESEND_API_KEY not set)
- Logs to audit
- Returns updated prescription

Test:
1. As doctor: GET /prescriptions/:case_id → should return draft
2. As patient: GET /prescriptions/:case_id → should return 404 (not verified yet)
3. As doctor: POST /prescriptions/:id/verify
4. As patient: GET /prescriptions/:case_id → should now return the prescription
5. Confirm patient notification was created

Show me all 5 API responses.
```

**Phase 4 is done when:**
- [ ] Patient can fill symptom form and upload X-ray
- [ ] Case is created with ML inference result
- [ ] LLM prescription draft is generated
- [ ] Doctor is auto-assigned based on severity
- [ ] Doctor sees case in worklist
- [ ] Doctor case detail page shows X-ray + Grad-CAM + confidence chart
- [ ] Prescription editor pre-filled with LLM draft
- [ ] Doctor can edit and verify prescription
- [ ] Patient cannot see prescription until doctor verifies
- [ ] Patient sees prescription after verification

---

## Phase 5 — Patient Dashboard

### Prompt 5A — Patient dashboard and case view
```
Phase 5, Step 1: Patient dashboard and case detail.

1. Build frontend/app/(patient)/dashboard/page.tsx:
   - Fetch GET /cases/patient/:id on load
   - List all cases, newest first
   - Each case shows: date, case status stepper, follow-up date if set
   - If verified: show prescription card below the stepper
   - "+ New Case" button top right
   - Empty state if no cases: "Upload your first X-ray to get started"
   - Patient warm theme throughout

2. Build frontend/components/patient/CaseStatusStepper.tsx exactly as in the plan:
   - 4 steps: Uploaded → Under Review → Prescription Ready → Verified
   - Uses STATUS_STEP_MAP from the plan
   - Active step pulses (Framer Motion animate scale)
   - Completed steps show checkmark in patient-accent color
   - Second opinion states map to step 1 (under_review equivalent)

3. Build frontend/components/patient/PrescriptionCard.tsx exactly as in the plan:
   - Returns null if prescription.isVerified is false (hard rule)
   - Shows verified badge with doctor name
   - Shows second opinion agreement status if exists
   - Medication rows with drug name, dosage, frequency, duration
   - General advice section
   - Follow-up notes section
   - "AI assisted — reviewed and verified by your doctor" disclaimer at bottom

4. Build frontend/app/(patient)/case/[id]/page.tsx:
   - Shows case stepper
   - Shows prescription card (if verified)
   - Shows second opinion request section (if not already requested)
   - Shows consultation thread
   - Shows follow-up dates

Warm theme on all patient pages. No AI data anywhere on these pages.
Show me the patient dashboard with a verified case visible.
```

### Prompt 5B — Second opinion (patient side)
```
Phase 5, Step 2: Second opinion — patient request flow.

Backend:
1. Create backend/app/routers/second_opinion.py:

POST /second-opinion/
- Accept: case_id, requested_by (patient or doctor), reason, specialty_requested (doctor only)
- Validate: only one second opinion per case (reject if already exists)
- If requested_by = patient: assign another pulmonologist from pool (exclude primary doctor)
- If requested_by = doctor: assign from specialty_requested pool (exclude primary doctor)
- Use assign_second_opinion_doctor() from doctor_assignment.py
- Create SecondOpinion record with status = pending
- Update case status to second_opinion_requested
- Notify second doctor
- Log to audit

GET /second-opinion/:case_id
- Return second opinion for the case

Frontend:
2. On patient case detail page, add second opinion section:
- Show only if: case is verified AND no second opinion exists yet
- Button: "Request Second Opinion"
- On click: expand a panel with reason textarea
- Submit: POST /second-opinion/ with requested_by = patient
- After submission: show "Second opinion requested — awaiting review" status

3. Once second opinion is submitted (status = submitted):
- If agrees_with_primary = true: show green banner "Confirmed by second doctor"
- If agrees_with_primary = false: show amber banner "Second opinion differs —
  primary doctor's assessment has been applied"
- Show both opinions side by side

Test: request second opinion as patient, confirm a different doctor is assigned,
confirm case status updates.
```

### Prompt 5C — Async consultation
```
Phase 5, Step 3: Async consultation (patient asks doctor).

Backend:
1. Create backend/app/routers/consultations.py:

POST /consultations/
- Accept: case_id, message
- sender_id = current_user.id, sender_role = current_user.role
- Notify the other party (patient sends → notify doctor, doctor sends → notify patient)
- Return created message

GET /consultations/:case_id
- Return all messages for the case, ordered by created_at ascending
- Both patient and doctor can fetch

PATCH /consultations/:id/read
- Mark message as read

Frontend:
2. Build frontend/components/patient/ConsultationThread.tsx:
- Chat-style thread layout
- Patient messages: right-aligned, patient-accent bubble
- Doctor messages: left-aligned, surface bubble
- Timestamp below each message
- Text input + send button at bottom
- Auto-scroll to bottom on new message
- Poll for new messages every 15 seconds (simple setInterval — no websockets needed)
- Shows doctor name and specialization above their messages

3. Add ConsultationThread to patient case detail page below prescription card
4. Add ConsultationThread to doctor case detail page (same component, different styling context)

Test: patient sends message → doctor sees it in case detail → doctor replies →
patient sees reply on next poll.
```

**Phase 5 is done when:**
- [ ] Patient dashboard shows all cases with correct status stepper
- [ ] Verified prescription visible to patient, hidden before verification
- [ ] Patient can request second opinion
- [ ] Second opinion result shows on patient dashboard
- [ ] Patient and doctor can exchange messages async

---

## Phase 6 — Second Opinion (Doctor) + Follow-up

### Prompt 6A — Second opinion doctor flow
```
Phase 6, Step 1: Second opinion — doctor side.

Backend:
1. Add to second opinion router:

PATCH /second-opinion/:id/verdict
- Second doctor only (validate they are the assigned second_doctor_id)
- Accept: verdict, verdict_notes, agrees_with_primary (boolean)
- Set status = submitted
- Update case status to second_opinion_received
- Notify primary doctor: "Second opinion received from Dr. X"
- Notify patient: "Your second opinion has been reviewed"
- Log to audit

Frontend:
2. Build frontend/components/doctor/SecondOpinionPanel.tsx:

For the second doctor receiving the request:
- Show in their worklist as a separate tab or badge "Second Opinion Needed"
- Case detail shows: original case summary, primary doctor verdict (open review — they can see it)
- Verdict form: agrees_with_primary toggle (Yes/No), verdict notes textarea
- Submit verdict button

For the primary doctor requesting second opinion:
- Collapsed panel at bottom of case detail
- Select specialty from dropdown (pulmonology, cardiology, radiology)
- Reason textarea
- Submit request button
- After submission: shows pending/submitted status

For the second opinion worklist:
- Add a "Second Opinions" tab to the doctor dashboard worklist
- Shows cases where current doctor is second_doctor_id
- Same severity sorting applies

Test full second opinion flow:
1. Doctor requests second opinion (cardiology)
2. Cardiologist sees it in their second opinions tab
3. Cardiologist submits verdict (agrees)
4. Primary doctor notified
5. Patient sees "Confirmed by 2 doctors" banner
```

### Prompt 6B — Follow-up system
```
Phase 6, Step 2: Follow-up system.

Backend:
1. Create backend/app/routers/follow_up.py:

POST /follow-up/
- Doctor only
- Accept: case_id, scheduled_date, reason
- Auto-calculate suggested_date:
  if case severity is severe: today + 3 days
  else: today + 7 days
- Create FollowUp record
- Notify patient: "Follow-up scheduled for [date]"
- Log to audit

GET /follow-up/:case_id
- Return all follow-ups for the case

PATCH /follow-up/:id
- Doctor only
- Update scheduled_date, status, reason

2. Implement backend/app/scheduler.py exactly as in the plan:
- APScheduler background scheduler
- Runs daily at 9am
- Finds follow-ups scheduled for tomorrow with reminder_sent = false
- Sends notification to patient
- Marks reminder_sent = true
- Start scheduler in main.py startup event

Frontend:
3. Build frontend/components/patient/FollowUpCard.tsx:
- Shows upcoming follow-up date prominently
- Days remaining count (e.g. "in 3 days")
- Reason if set
- List of all past follow-ups with status badges

4. Build follow-up setter on doctor case detail page:
- Date picker (native HTML input type=date)
- Shows system suggestion: "Suggested: [date] based on severity"
- Doctor can change the date
- Reason textarea (optional)
- Save button → POST /follow-up/

5. Add FollowUpCard to patient dashboard (shown if follow-up exists)

Test: doctor sets follow-up → patient sees it on dashboard → manually trigger
scheduler to confirm notification is created.
```

**Phase 6 is done when:**
- [ ] Second doctor can see assigned second opinion cases in their dashboard
- [ ] Second doctor can submit verdict
- [ ] Agreement/disagreement handled and shown to patient
- [ ] Doctor can set follow-up date with system suggestion
- [ ] Patient sees follow-up on dashboard
- [ ] Scheduler creates notification for tomorrow's follow-ups

---

## Phase 7 — Notifications, Polish, Testing

### Prompt 7A — Notification system
```
Phase 7, Step 1: In-app notification system.

Backend:
1. Ensure backend/app/services/notification_service.py is complete:
   notify_user(db, user_id, title, body, type, entity_id) → creates Notification record

2. Add to backend/app/routers/notifications.py:
   GET /notifications/:user_id — return all, unread first, limit 20
   PATCH /notifications/:id/read — mark as read
   PATCH /notifications/read-all/:user_id — mark all as read

Frontend:
3. Build frontend/components/shared/NotificationBell.tsx:
- Bell icon (lucide-react Bell)
- Red dot badge with unread count (hide if 0)
- Click to open dropdown panel
- Panel shows last 20 notifications
- Each notification: title, body, time ago, click → navigate to entity
- "Mark all as read" button at top of panel
- Polls every 30 seconds for new notifications
- Animate badge in when new notification arrives

4. Add NotificationBell to:
- Doctor dashboard header
- Patient dashboard header

5. Optional — email notifications via Resend:
- Install resend package in backend
- Create backend/app/services/notification_service.py send_email() function
- Send email for: new case assigned (doctor), prescription verified (patient),
  second opinion requested (doctor), follow-up reminder (patient)
- Wrap in try/except — email failure should never break the main flow
- Skip if RESEND_API_KEY not set in env
```

### Prompt 7B — Audit middleware
```
Phase 7, Step 2: Audit logging.

1. Create backend/app/middleware/audit.py:
   log_action(db, user_id, action, entity_type, entity_id, metadata=None)
   - Inserts into audit_log table
   - action is a string like: case_created, prescription_verified,
     second_opinion_requested, follow_up_set, verdict_submitted

2. Ensure log_action is called in every POST and PATCH route:
   - POST /cases/ → case_created
   - POST /prescriptions/:id/verify → prescription_verified
   - POST /second-opinion/ → second_opinion_requested
   - PATCH /second-opinion/:id/verdict → verdict_submitted
   - POST /follow-up/ → follow_up_set
   - PATCH /cases/:id/status → status_changed

3. Confirm audit_log table has entries after running the full case flow
   Show me: SELECT action, entity_type, created_at FROM audit_log ORDER BY created_at;
```

### Prompt 7C — Error states and loading
```
Phase 7, Step 3: Error states, loading states, empty states.

For every page and component that fetches data, add:

Loading states:
- Skeleton loaders (not spinners) for all list views and cards
- Use Tailwind animate-pulse on placeholder divs
- Match the shape of the real content (card skeleton, table row skeleton)

Error states:
- If API returns error: show error card with message and retry button
- Network error: "Unable to connect. Check your connection and try again."
- 403: "You don't have permission to view this."
- 404: "This case doesn't exist or has been removed."

Empty states:
- Doctor worklist — pending tab empty: "No pending cases. You're all caught up."
- Doctor worklist — active tab empty: "No active cases."
- Patient dashboard — no cases: "Upload your first X-ray to get started" + button
- Consultation thread — no messages: "No messages yet. Ask your doctor a question."
- Notifications — none: "You're all caught up."

Form validation:
- Symptom form: all required fields validated before Next step
- Show inline error messages below each invalid field (not alerts)
- Prescription editor: medication name and dosage are required, show error on verify attempt

Toast notifications (use a simple custom toast or install react-hot-toast):
- Success: green, 3 seconds
- Error: red, 5 seconds, dismiss button
- Info: blue, 3 seconds
```

### Prompt 7D — Mobile responsiveness
```
Phase 7, Step 4: Mobile responsive pass.

Review every page on a 375px wide viewport and fix:

Hero page:
- Headline font size: reduce from text-hero to text-4xl on mobile
- Floating cards: stack vertically on mobile
- HowItWorks: stack steps vertically
- Nav: collapse Login/Register into a hamburger menu on mobile

Doctor dashboard:
- Worklist table: on mobile, hide lesser columns (keep Patient, Severity, Action)
- Or convert table to card list on mobile (each case is a card)

Doctor case detail:
- Two-column → single column on mobile
- X-ray viewer: full width
- Prescription editor: full width

Patient dashboard:
- Case status stepper: ensure labels don't overlap on small screens
  (consider abbreviating: Uploaded / Reviewing / Ready / Verified)
- Prescription card: full width, medication rows stack vertically

General:
- All buttons: minimum 44px touch target
- All inputs: minimum 16px font (prevents iOS zoom)
- No horizontal scroll on any page

Test on Chrome DevTools at 375px (iPhone SE) and 768px (tablet).
```

### Prompt 7E — End-to-end test
```
Phase 7, Step 5: Full end-to-end test. Fix anything that breaks.

Run through this complete flow without any manual database edits:

PATIENT JOURNEY:
1. Register as new patient at /register
2. Login as patient
3. Fill symptom form completely
4. Upload a chest X-ray (use any JPG)
5. Submit — confirm loading states show
6. Arrive at dashboard — confirm case shows with status "Under Review"
7. Confirm no prescription visible yet

DOCTOR JOURNEY (primary):
8. Login as the auto-assigned doctor
9. Confirm new case appears at top of pending worklist (severity badge visible)
10. Open case detail
11. Confirm X-ray and Grad-CAM both load
12. Confirm confidence chart renders with real data
13. Confirm prescription editor is pre-filled with LLM draft
14. Edit one medication (change dosage)
15. Save verdict: Pneumonia, Moderate, Bacterial
16. Click Verify & Send to Patient
17. Confirm modal appears, confirm it
18. Confirm success toast, case moves to verified

PATIENT JOURNEY (post-verify):
19. Return to patient dashboard
20. Confirm case status stepper shows Verified
21. Confirm prescription card appears with verified badge and correct doctor name
22. Confirm edited medication shows correctly
23. Send a consultation message to doctor

DOCTOR JOURNEY (consultation + second opinion):
24. Login as doctor, open case
25. Confirm consultation message visible
26. Reply to patient
27. Request second opinion — select Cardiology, enter reason

SECOND DOCTOR JOURNEY:
28. Login as Dr. Rajan Pillai (cardiologist)
29. Find case in second opinions tab
30. Submit verdict: agrees with primary

PATIENT JOURNEY (second opinion result):
31. Login as patient
32. Confirm "Confirmed by 2 doctors" banner on prescription card

FOLLOW-UP:
33. Login as primary doctor
34. Set follow-up date for 3 days from now
35. Login as patient — confirm follow-up card shows with correct date

Report every step: pass or fail. For each failure, fix it before moving on.
Do not mark Phase 7 complete until all 35 steps pass.
```

**Phase 7 is done when:**
- [ ] All 35 test steps pass
- [ ] Skeleton loaders on all data-fetching views
- [ ] Error states handled gracefully
- [ ] Empty states on all list views
- [ ] Form validation working
- [ ] Toast notifications working
- [ ] Mobile layout clean at 375px
- [ ] Audit log has entries for all major actions
- [ ] Notifications appear in the bell dropdown

---

## Final Checklist Before Calling It Done

### Security
- [ ] Patient routes return 403 if accessed by doctor and vice versa
- [ ] AI fields (confidence, gradcam_url, ai_severity, ai_type) never in patient API responses
- [ ] Prescription returns 404 to patient if not verified
- [ ] JWT validated on every protected route
- [ ] File upload validates mime type (reject non-image files)
- [ ] File upload validates size (reject >10MB)

### Data integrity
- [ ] Second opinion creation rejected if one already exists for the case
- [ ] Prescription verify button disabled after verification
- [ ] Doctor cannot verify another doctor's case
- [ ] Follow-up scheduled_date cannot be in the past

### Performance
- [ ] Images served via Cloudinary URL (not base64 in JSON)
- [ ] Notification poll is 30s interval, clears on component unmount
- [ ] Consultation poll is 15s interval, clears on component unmount
- [ ] No console errors in production build

### Build
```bash
# Frontend
cd frontend && npm run build
# Should complete with 0 errors

# Backend
cd backend && python -m pytest  # if tests exist
uvicorn app.main:app --reload   # should start cleanly
```

---

## If The Agent Gets Stuck — Recovery Prompts

### Agent lost context
```
Stop. Read pneumonia_detection_implementation_plan.md again from the top.
Then read agent_prompt_guide.md and tell me which phase and step we are on.
Do not generate any code until you have confirmed the current state.
```

### Import errors across files
```
There are import errors. Do the following:
1. List every file that has an import error
2. For each file, show me the exact import line that fails
3. Fix them one file at a time, starting with the deepest dependency
Do not touch any other files while fixing imports.
```

### Database migration conflict
```
The Alembic migration has a conflict. Do the following:
1. Show me the current state of alembic/versions/
2. Show me the error message
3. If the database is in a bad state, drop all tables and re-run from scratch:
   - alembic downgrade base
   - alembic upgrade head
Do not create a new migration file unless I tell you to.
```

### Styles not applying
```
Tailwind classes are not resolving. Check:
1. tailwind.config.ts content array includes all file paths
2. globals.css is imported in layout.tsx
3. The specific class exists in the config (custom classes must be in theme.extend)
4. Run: npx tailwindcss --content './app/**/*.tsx' --output test.css
   and search for the missing class in test.css
```

### LLM returning invalid JSON
```
The LLM prescription generation is failing JSON parse. Fix llm_service.py:
1. Add strip() to the raw response
2. Remove any ```json ``` fences with regex before parsing
3. Wrap json.loads in try/except and log the raw string on failure
4. Add to the system prompt: "Respond ONLY with raw JSON. No markdown, no backticks, no explanation."
```

### ML model not loading
```
The DenseNet model is failing to load. Check:
1. Does the weights file exist at the path in ML_MODEL_PATH env variable?
2. If not: the model should fall back to random weights with a warning (not crash)
3. Ensure model.py has the try/except around torch.load
4. Ensure the classifier layer matches: Linear(1024, 2) for binary classification
5. Print model.eval() confirmation to console on startup
```
