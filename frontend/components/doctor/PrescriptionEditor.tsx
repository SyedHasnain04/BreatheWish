"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface Props {
  caseId: string;
  prescriptionId?: string;
  llmDraft: { draft: string };
  isVerified: boolean;
}

export default function PrescriptionEditor({ caseId, prescriptionId, llmDraft, isVerified }: Props) {
  const router = useRouter();
  
  // Parse draft simply for initial state if not parsed yet
  const [medications, setMedications] = useState<Medication[]>([{ id: "1", name: "", dosage: "", frequency: "1x daily", duration: "", notes: "" }]);
  const [generalAdvice, setGeneralAdvice] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initial parse of LLM draft
  useEffect(() => {
    if (llmDraft?.draft && !isVerified) {
      const draft = llmDraft.draft;
      // Extract General Advice
      const adviceMatch = draft.match(/General Advice:\s*([\s\S]*?)(?=Follow-up:|$)/i);
      if (adviceMatch) setGeneralAdvice(adviceMatch[1].trim().replace(/-/g, '').trim());
      
      // Extract Follow-up
      const followUpMatch = draft.match(/Follow-up:\s*([\s\S]*?)$/i);
      if (followUpMatch) setFollowUpNotes(followUpMatch[1].trim().replace(/-/g, '').trim());

      // Try to extract some meds from "Medications:" block
      const medsMatch = draft.match(/Medications:\s*([\s\S]*?)(?=General Advice:|$)/i);
      if (medsMatch) {
        const lines = medsMatch[1].split('\n').filter(l => l.trim().length > 0);
        const parsedMeds = lines.map((line, idx) => ({
          id: Date.now().toString() + idx,
          name: line.replace(/^-/, '').trim(),
          dosage: "",
          frequency: "As directed",
          duration: "",
          notes: ""
        }));
        if (parsedMeds.length > 0) setMedications(parsedMeds);
      }
    }
  }, [llmDraft, isVerified]);

  const addMed = () => {
    setMedications([...medications, { id: Date.now().toString(), name: "", dosage: "", frequency: "1x daily", duration: "", notes: "" }]);
  };

  const removeMed = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(m => m.id !== id));
    }
  };

  const updateMed = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const saveDraft = async () => {
    if (!prescriptionId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/proxy/prescriptions/${prescriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          final_prescription: { medications, generalAdvice, followUpNotes }
        })
      });
      setLastSaved(new Date());
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const verifyAndSend = async () => {
    if (!prescriptionId) return;
    if (!window.confirm("This will make the prescription visible to the patient. Continue?")) return;
    
    // Auto-save first
    await saveDraft();
    
    setIsSaving(true);
    try {
      await fetch(`/api/proxy/prescriptions/${prescriptionId}/verify`, {
        method: "POST"
      });
      alert("Prescription verified successfully!");
      router.refresh();
    } catch (e) {
      alert("Error verifying prescription");
    }
    setIsSaving(false);
  };

  if (isVerified) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-semibold">Prescription Verified & Sent</span>
        </div>
        <p className="text-text-secondary text-sm">This prescription is finalized and locked.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 bg-[#1E293B] border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-text-primary">Prescription Editor</h3>
        {lastSaved && <span className="text-xs text-text-muted">Saved: {lastSaved.toLocaleTimeString()}</span>}
      </div>

      <div className="p-6 space-y-6">
        {/* Raw LLM Draft reference */}
        <div className="bg-[#0F172A] p-4 rounded-lg text-sm text-text-secondary whitespace-pre-wrap border border-[#1E293B]">
          <span className="text-doctor-accent font-semibold block mb-2">AI Draft Recommendation:</span>
          {llmDraft?.draft}
        </div>

        {/* Medications */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Medications</h4>
            <button onClick={addMed} className="text-doctor-accent hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>
          
          <div className="space-y-3">
            {medications.map((med, idx) => (
              <div key={med.id} className="grid grid-cols-12 gap-3 bg-[#1E293B] p-3 rounded-lg border border-border relative group">
                <div className="col-span-12 md:col-span-4">
                  <input type="text" placeholder="Drug Name" value={med.name} onChange={(e) => updateMed(med.id, "name", e.target.value)} className="w-full bg-[#0F172A] border border-border rounded px-3 py-1.5 text-sm" />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <input type="text" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(med.id, "dosage", e.target.value)} className="w-full bg-[#0F172A] border border-border rounded px-3 py-1.5 text-sm" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <select value={med.frequency} onChange={(e) => updateMed(med.id, "frequency", e.target.value)} className="w-full bg-[#0F172A] border border-border rounded px-3 py-1.5 text-sm">
                    <option>1x daily</option>
                    <option>2x daily</option>
                    <option>3x daily</option>
                    <option>As needed</option>
                    <option>As directed</option>
                  </select>
                </div>
                <div className="col-span-10 md:col-span-2">
                  <input type="text" placeholder="Duration" value={med.duration} onChange={(e) => updateMed(med.id, "duration", e.target.value)} className="w-full bg-[#0F172A] border border-border rounded px-3 py-1.5 text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                  <button onClick={() => removeMed(med.id)} disabled={medications.length === 1} className="text-red-400 hover:text-red-300 disabled:opacity-30">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="col-span-12">
                  <input type="text" placeholder="Additional instructions..." value={med.notes} onChange={(e) => updateMed(med.id, "notes", e.target.value)} className="w-full bg-[#0F172A] border border-border rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Advice */}
        <div>
          <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">General Advice</h4>
          <textarea 
            value={generalAdvice}
            onChange={(e) => setGeneralAdvice(e.target.value)}
            className="w-full h-24 bg-[#1E293B] border border-border rounded-lg p-3 text-sm"
            placeholder="Rest, hydration, specific things to watch out for..."
          />
        </div>

        {/* Follow Up */}
        <div>
          <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">Follow-up Notes</h4>
          <textarea 
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            className="w-full h-16 bg-[#1E293B] border border-border rounded-lg p-3 text-sm"
            placeholder="When to return, what symptoms require ER..."
          />
        </div>
      </div>

      <div className="p-4 bg-[#1E293B] border-t border-border flex justify-between">
        <button 
          onClick={saveDraft}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-text-primary rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button 
          onClick={verifyAndSend}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-doctor-accent text-white rounded-lg text-sm font-medium hover:bg-sky-500 transition-colors shadow-lg shadow-doctor-accent/20"
        >
          <ShieldCheck className="w-4 h-4" /> Verify & Send to Patient
        </button>
      </div>
    </div>
  );
}
