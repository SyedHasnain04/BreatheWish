"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Props {
  isDoctor?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;
// The backend decodes with PIL, so DICOM would fail there. Keep this in step with it.
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const CONDITIONS = ["Diabetes", "Asthma", "Heart disease", "Hypertension", "None"] as const;

type Errors = Record<string, string>;

export default function NewCaseForm({ isDoctor = false }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [formData, setFormData] = useState({
    patient_email: "",
    age: "",
    weight: "",
    sex: "",
    date_of_birth: "",
    blood_group: "",
    conditions: [] as string[],
    current_medications: "",
    fever: false,
    fever_days: "",
    cough_type: "None",
    breathing_difficulty: 1,
    chest_pain: false,
    symptom_duration_days: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Revoke object URLs so previews don't leak memory
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Move focus to the step heading when the step changes
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  // Theme: the form follows the portal it is rendered in
  const t = isDoctor
    ? {
        card: "bg-surface border-border text-text-primary",
        muted: "text-text-muted",
        divider: "border-border",
        input:
          "bg-background border-border text-text-primary hover:border-text-muted/50 focus:border-doctor-accent focus:ring-doctor-accent [color-scheme:dark]",
        panel: "bg-background border-border",
        accent: "accent-[#6FB5AC]",
        accentText: "text-doctor-accent",
        accentBorder: "border-doctor-accent",
        stepOn: "bg-doctor-accent",
        stepOff: "bg-border",
        drop: "border-border bg-background hover:border-text-muted/60",
        secondary: "btn-outline-light",
      }
    : {
        card: "bg-patient-surface border-patient-border text-text-dark",
        muted: "text-text-dark-muted",
        divider: "border-patient-border",
        input:
          "bg-white border-patient-border text-text-dark hover:border-text-dark-muted/50 focus:border-patient-accent focus:ring-patient-accent",
        panel: "bg-patient-bg border-patient-border",
        accent: "accent-[#1F7A72]",
        accentText: "text-patient-accent",
        accentBorder: "border-patient-accent",
        stepOn: "bg-patient-accent",
        stepOff: "bg-patient-border",
        drop: "border-patient-border bg-patient-bg hover:border-text-dark-muted/60",
        secondary:
          "inline-flex items-center justify-center border border-patient-border text-text-dark hover:bg-patient-bg px-6 py-2.5 rounded-lg font-medium transition duration-200 active:scale-[0.98]",
      };

  const input = `w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-200 focus:outline-none focus:ring-1 aria-[invalid=true]:border-severe ${t.input}`;
  const label = `block text-sm mb-1.5 ${t.muted}`;
  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-err`} className="text-xs text-severe-soft mt-1.5">
        {errors[k]}
      </p>
    ) : null;
  const inv = (k: string) =>
    ({
      "aria-invalid": !!errors[k],
      "aria-describedby": errors[k] ? `${k}-err` : undefined,
    } as const);

  const toggleCondition = (name: string) => {
    setFormData((prev) => {
      const has = prev.conditions.includes(name);
      let next = has ? prev.conditions.filter((c) => c !== name) : [...prev.conditions, name];
      // "None" excludes the others, and vice versa
      if (!has && name === "None") next = ["None"];
      if (!has && name !== "None") next = next.filter((c) => c !== "None");
      return { ...prev, conditions: next };
    });
  };

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setErrors((e) => ({
        ...e,
        file: "Upload a JPG or PNG image. Other formats, including DICOM, aren't supported yet.",
      }));
      return;
    }
    if (selected.size > MAX_BYTES) {
      setErrors((e) => ({
        ...e,
        file: `That file is ${(selected.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB.`,
      }));
      return;
    }
    setErrors((e) => {
      const rest = { ...e };
      delete rest.file;
      return rest;
    });
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 1) {
      if (isDoctor) {
        if (!formData.patient_email.trim())
          e.patient_email = "Enter the patient's registered email.";
        else if (!/^\S+@\S+\.\S+$/.test(formData.patient_email))
          e.patient_email = "That doesn't look like an email address.";
      }
      const age = Number(formData.age);
      if (!formData.age) e.age = "Enter an age.";
      else if (!Number.isFinite(age) || age < 0 || age > 120)
        e.age = "Enter an age between 0 and 120.";
      const w = Number(formData.weight);
      if (!formData.weight) e.weight = "Enter a weight in kilograms.";
      else if (!Number.isFinite(w) || w < 1 || w > 400)
        e.weight = "Enter a weight between 1 and 400 kg.";
      if (!formData.sex) e.sex = "Choose one.";
    }
    if (s === 2) {
      if (formData.fever) {
        const d = Number(formData.fever_days);
        if (!formData.fever_days || d < 1) e.fever_days = "Enter how many days.";
      }
      if (
        formData.symptom_duration_days === "" ||
        Number(formData.symptom_duration_days) < 0
      )
        e.symptom_duration_days = "Enter how many days, or 0 if it just started.";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(step + 1);
  };

  const submitForm = async () => {
    if (!file) {
      setErrors({ file: "Choose an X-ray image to upload." });
      return;
    }
    setSubmitError("");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("xray", file);
    const symptoms = {
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      sex: formData.sex,
      date_of_birth: formData.date_of_birth || null,
      blood_group: formData.blood_group,
      existing_conditions: formData.conditions.filter((c) => c !== "None"),
      current_medications: formData.current_medications,
      fever: formData.fever,
      fever_days: formData.fever ? parseInt(formData.fever_days) : null,
      cough_type: formData.cough_type,
      breathing_difficulty: formData.breathing_difficulty,
      chest_pain: formData.chest_pain,
      symptom_duration_days: parseInt(formData.symptom_duration_days),
    };
    payload.append("symptoms", JSON.stringify(symptoms));
    if (isDoctor) payload.append("patient_email", formData.patient_email.trim());

    try {
      const res = await fetch("/api/proxy/cases/", { method: "POST", body: payload });
      if (!res.ok) {
        let detail = "";
        try {
          detail = (await res.json())?.detail;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(
          typeof detail === "string" && detail
            ? detail
            : "The case couldn't be created. Try again."
        );
      }
      router.push(isDoctor ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (e) {
      setSubmitError(
        e instanceof Error && e.message ? e.message : "Something went wrong. Try again."
      );
      setIsSubmitting(false);
    }
  };

  const titles = ["About the patient", "Symptoms", "Chest X-ray"];

  return (
    <div className={`max-w-2xl mx-auto border rounded-2xl overflow-hidden ${t.card}`}>
      <div className={`px-8 pt-7 pb-6 border-b ${t.divider}`}>
        <div className="flex gap-1.5 mb-4" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                step >= s ? t.stepOn : t.stepOff
              }`}
            />
          ))}
        </div>
        <p className={`font-mono text-[11px] uppercase tracking-[0.16em] ${t.muted}`}>
          Step {step} of 3
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold tracking-tight mt-1 outline-none"
        >
          {titles[step - 1]}
        </h2>
      </div>

      <div className="p-8">
        {/* Step 1 */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {isDoctor && (
              <div>
                <label htmlFor="patient_email" className={label}>
                  Patient email
                </label>
                <input
                  id="patient_email"
                  type="email"
                  autoComplete="off"
                  className={input}
                  value={formData.patient_email}
                  onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                  {...inv("patient_email")}
                />
                {err("patient_email")}
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label htmlFor="age" className={label}>
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  className={`${input} tabular`}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  {...inv("age")}
                />
                {err("age")}
              </div>
              <div>
                <label htmlFor="weight" className={label}>
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  className={`${input} tabular`}
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  {...inv("weight")}
                />
                {err("weight")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label htmlFor="dob" className={label}>
                  Date of birth (optional)
                </label>
                <input
                  id="dob"
                  type="date"
                  className={input}
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="blood" className={label}>
                  Blood group (optional)
                </label>
                <select
                  id="blood"
                  className={input}
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                >
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset>
              <legend className={label}>Sex</legend>
              <div className="flex gap-6">
                {["Male", "Female", "Other"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      className={`w-4 h-4 ${t.accent}`}
                      value={s.toLowerCase()}
                      checked={formData.sex === s.toLowerCase()}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    />
                    {s}
                  </label>
                ))}
              </div>
              {err("sex")}
            </fieldset>

            <fieldset>
              <legend className={label}>Existing conditions</legend>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {CONDITIONS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className={`w-4 h-4 ${t.accent}`}
                      checked={formData.conditions.includes(c)}
                      onChange={() => toggleCondition(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="meds" className={label}>
                Current medications (optional)
              </label>
              <textarea
                id="meds"
                className={`${input} h-24 resize-y`}
                value={formData.current_medications}
                onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
              />
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className={`p-4 rounded-lg border ${t.panel}`}>
              <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className={`w-4 h-4 ${t.accent}`}
                  checked={formData.fever}
                  onChange={(e) => setFormData({ ...formData, fever: e.target.checked })}
                />
                Fever
              </label>
              {formData.fever && (
                <div className={`mt-4 pl-4 border-l-2 ${t.accentBorder}`}>
                  <label htmlFor="fever_days" className={label}>
                    For how many days?
                  </label>
                  <input
                    id="fever_days"
                    type="number"
                    inputMode="numeric"
                    className={`${input} tabular max-w-[9rem]`}
                    value={formData.fever_days}
                    onChange={(e) => setFormData({ ...formData, fever_days: e.target.value })}
                    {...inv("fever_days")}
                  />
                  {err("fever_days")}
                </div>
              )}
            </div>

            <fieldset>
              <legend className={label}>Cough</legend>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {["None", "Dry", "Wet", "Bloody"].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="cough"
                      className={`w-4 h-4 ${t.accent}`}
                      value={c}
                      checked={formData.cough_type === c}
                      onChange={(e) => setFormData({ ...formData, cough_type: e.target.value })}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="breath" className={label}>
                Difficulty breathing:{" "}
                <span className="tabular font-medium">{formData.breathing_difficulty}</span> of 5
              </label>
              <input
                id="breath"
                type="range"
                min={1}
                max={5}
                className={`w-full ${t.accent}`}
                value={formData.breathing_difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, breathing_difficulty: parseInt(e.target.value) })
                }
              />
              <div
                className={`flex justify-between text-xs mt-1 ${t.muted}`}
                aria-hidden="true"
              >
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                className={`w-4 h-4 ${t.accent}`}
                checked={formData.chest_pain}
                onChange={(e) => setFormData({ ...formData, chest_pain: e.target.checked })}
              />
              Chest pain
            </label>

            <div>
              <label htmlFor="duration" className={label}>
                How long have symptoms lasted? (days)
              </label>
              <input
                id="duration"
                type="number"
                inputMode="numeric"
                className={`${input} tabular max-w-[9rem]`}
                value={formData.symptom_duration_days}
                onChange={(e) =>
                  setFormData({ ...formData, symptom_duration_days: e.target.value })
                }
                {...inv("symptom_duration_days")}
              />
              {err("symptom_duration_days")}
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!preview ? (
              <div
                className={`relative border border-dashed rounded-xl p-12 text-center transition-colors duration-200 ${t.drop}`}
              >
                <input
                  id="xray"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Chest X-ray image"
                  {...inv("file")}
                />
                <p className="font-medium mb-1">Choose a chest X-ray</p>
                <p className={`text-sm ${t.muted}`}>
                  or drop it here. JPG or PNG, up to 10 MB.
                </p>
              </div>
            ) : (
              <div className={`relative rounded-xl overflow-hidden border ${t.divider}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview of the selected X-ray"
                  className="w-full object-contain max-h-[400px] bg-black"
                />
                <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span className={`truncate ${t.muted}`}>{file?.name}</span>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className={`${t.accentText} hover:underline underline-offset-4 disabled:opacity-40`}
                  >
                    Choose another
                  </button>
                </div>
              </div>
            )}
            {err("file")}

            {isSubmitting && (
              <div
                role="status"
                className={`mt-6 rounded-lg p-5 border ${t.panel}`}
              >
                <p className="text-sm font-medium mb-1">Analysing your X-ray</p>
                <p className={`text-sm mb-4 ${t.muted}`}>
                  This can take up to a minute. Please keep this page open.
                </p>
                <div className={`h-1 rounded-full overflow-hidden ${t.stepOff}`}>
                  <div
                    className={`h-full w-1/3 rounded-full ${t.stepOn} animate-pulse`}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {(Object.keys(errors).length > 0 || submitError) && (
          <div
            role="alert"
            className="mt-6 p-4 bg-severe-bg text-severe-soft border border-severe/30 rounded-lg text-sm"
          >
            {submitError || "Fix the highlighted fields to continue."}
          </div>
        )}

        <div className={`flex justify-between items-center mt-10 pt-6 border-t ${t.divider}`}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep(step - 1);
              }}
              disabled={isSubmitting}
              className={`${t.secondary} disabled:opacity-40`}
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button type="button" onClick={next} className="btn-primary">
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submitForm}
              disabled={isSubmitting || !file}
              className="btn-primary disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Submitting…" : "Submit case"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
