import React from "react";
import NewCaseForm from "../../../components/cases/NewCaseForm";

export default function DoctorNewCasePage() {
  return (
    <div className="min-h-screen bg-background p-8 pt-24" data-theme="doctor">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Doctor Initiated Case</h1>
        <p className="text-text-muted mt-2">
          Upload a patient X-ray and fill symptoms on their behalf for immediate AI analysis.
        </p>
      </div>
      {/* 
        The prompt says 'Styling: use patient warm theme on root div'.
        The NewCaseForm is hardcoded to render with patient theme data-theme="patient" internally. 
      */}
      <NewCaseForm isDoctor={true} />
    </div>
  );
}
