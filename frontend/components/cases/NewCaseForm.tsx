"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Props {
  isDoctor?: boolean;
}

export default function NewCaseForm({ isDoctor = false }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    patient_email: "", // Doctor only
    age: "",
    weight: "",
    sex: "",
    date_of_birth: "",
    blood_group: "",
    conditions: {
      Diabetes: false,
      Asthma: false,
      "Heart Disease": false,
      Hypertension: false,
      None: false,
    },
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

  const handleCheckbox = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [name]: !prev.conditions[name as keyof typeof prev.conditions],
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMsg("File exceeds 10MB limit.");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setErrorMsg("");
    }
  };

  const submitForm = async () => {
    if (!file) {
      setErrorMsg("Please upload an X-ray image.");
      return;
    }
    setIsSubmitting(true);
    
    // Fake loading states for UI feedback as requested
    setLoadingMsg("Uploading X-ray...");
    setTimeout(() => setLoadingMsg("Analysing with AI..."), 1500);
    setTimeout(() => setLoadingMsg("Assigning doctor..."), 3000);

    const payload = new FormData();
    payload.append("xray", file);
    
    // Convert form to JSON string for backend
    const symptoms = {
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      sex: formData.sex,
      date_of_birth: formData.date_of_birth,
      blood_group: formData.blood_group,
      existing_conditions: Object.entries(formData.conditions)
        .filter(([_, val]) => val)
        .map(([key]) => key),
      current_medications: formData.current_medications,
      fever: formData.fever,
      fever_days: formData.fever ? parseInt(formData.fever_days) : null,
      cough_type: formData.cough_type,
      breathing_difficulty: formData.breathing_difficulty,
      chest_pain: formData.chest_pain,
      symptom_duration_days: parseInt(formData.symptom_duration_days),
    };
    
    payload.append("symptoms", JSON.stringify(symptoms));
    if (isDoctor && formData.patient_email) {
      payload.append("patient_email", formData.patient_email);
    }

    try {
      const res = await fetch("/api/proxy/cases/", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        throw new Error("Failed to create case");
      }
      
      // Navigate to dashboard
      const dashPath = isDoctor ? "/doctor/dashboard" : "/patient/dashboard";
      router.push(dashPath);
      
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-patient-surface border border-patient-border rounded-xl shadow-sm overflow-hidden" data-theme="patient">
      {/* Progress */}
      <div className="flex border-b border-patient-border text-sm">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 text-center py-3 font-medium transition-colors ${
              step >= s ? "bg-patient-accent text-white" : "text-text-muted bg-patient-bg"
            }`}
          >
            Step {s} of 3
          </div>
        ))}
      </div>

      <div className="p-8 text-text-dark">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold mb-6">Patient Details</h2>
            
            {isDoctor && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Patient Email / ID *</label>
                <input
                  type="text"
                  className="w-full border border-patient-border rounded-lg px-4 py-2 bg-white"
                  value={formData.patient_email}
                  onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                  placeholder="Look up patient..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  className="w-full border border-patient-border rounded-lg px-4 py-2 bg-white"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  className="w-full border border-patient-border rounded-lg px-4 py-2 bg-white"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="w-full border border-patient-border rounded-lg px-4 py-2 bg-white"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blood Group</label>
                <select
                  className="w-full border border-patient-border rounded-lg px-4 py-2 bg-white"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                >
                  <option value="">Select...</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Biological Sex</label>
              <div className="flex gap-4">
                {["Male", "Female", "Other"].map((s) => (
                  <label key={s} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sex"
                      value={s.toLowerCase()}
                      checked={formData.sex === s.toLowerCase()}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Existing Conditions</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(formData.conditions).map((cond) => (
                  <label key={cond} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.conditions[cond as keyof typeof formData.conditions]}
                      onChange={() => handleCheckbox(cond)}
                    />
                    {cond}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Current Medications</label>
              <textarea
                className="w-full border border-patient-border rounded-lg px-4 py-2 bg-white h-24"
                value={formData.current_medications}
                onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                placeholder="List any medications currently being taken..."
              />
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold mb-6">Symptoms</h2>

            <div className="mb-6 p-4 bg-patient-bg rounded-lg border border-patient-border">
              <label className="flex items-center gap-2 mb-2 font-medium">
                <input
                  type="checkbox"
                  checked={formData.fever}
                  onChange={(e) => setFormData({ ...formData, fever: e.target.checked })}
                />
                Fever present
              </label>
              {formData.fever && (
                <div className="mt-3 pl-6 border-l-2 border-patient-accent">
                  <label className="block text-sm mb-1">How many days?</label>
                  <input
                    type="number"
                    className="w-full border border-patient-border rounded-lg px-3 py-1 bg-white max-w-[150px]"
                    value={formData.fever_days}
                    onChange={(e) => setFormData({ ...formData, fever_days: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Cough Type</label>
              <div className="flex gap-4">
                {["None", "Dry", "Wet", "Bloody"].map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cough"
                      value={c}
                      checked={formData.cough_type === c}
                      onChange={(e) => setFormData({ ...formData, cough_type: e.target.value })}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Breathing Difficulty (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full accent-patient-accent"
                value={formData.breathing_difficulty}
                onChange={(e) => setFormData({ ...formData, breathing_difficulty: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-xs text-text-dark-muted mt-1">
                <span>Fine</span>
                <span>Mild</span>
                <span>Moderate</span>
                <span>Difficult</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={formData.chest_pain}
                  onChange={(e) => setFormData({ ...formData, chest_pain: e.target.checked })}
                />
                Experiencing Chest Pain
              </label>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Overall Symptom Duration (Days)</label>
              <input
                type="number"
                className="w-full border border-patient-border rounded-lg px-4 py-2 bg-white"
                value={formData.symptom_duration_days}
                onChange={(e) => setFormData({ ...formData, symptom_duration_days: e.target.value })}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold mb-6">Upload Chest X-Ray</h2>

            {!preview ? (
              <div className="border-2 border-dashed border-patient-border rounded-xl p-10 text-center bg-patient-bg relative hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.dcm"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg className="w-12 h-12 text-patient-accent mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="font-medium text-text-dark mb-1">Click to browse or drag & drop</p>
                <p className="text-sm text-text-dark-muted">Supports JPG, PNG, DCM (Max 10MB)</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-patient-border">
                <img src={preview} alt="X-ray preview" className="w-full object-cover max-h-[400px]" />
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-4 right-4 bg-white/90 text-red-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm hover:bg-white"
                >
                  Remove
                </button>
              </div>
            )}

            {isSubmitting && (
              <div className="mt-8 text-center bg-patient-bg rounded-lg p-6 border border-patient-border">
                <div className="w-8 h-8 border-4 border-patient-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="font-medium text-patient-accent">{loadingMsg}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-patient-border">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              disabled={isSubmitting}
              className="px-6 py-2 border border-patient-border rounded-lg font-medium hover:bg-patient-bg transition-colors"
            >
              Back
            </button>
          ) : <div></div>}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-patient-accent text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={submitForm}
              disabled={isSubmitting || !file}
              className="px-8 py-2 bg-patient-accent text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              Submit Case
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
