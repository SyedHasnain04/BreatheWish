import React from "react";
import NewCaseForm from "../../../components/cases/NewCaseForm";

export default function PatientNewCasePage() {
  return (
    <div className="min-h-screen bg-patient-bg p-8 pt-24" data-theme="patient">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-text-dark">New Case Submission</h1>
        <p className="text-text-dark-muted mt-2">
          Please provide accurate details to help our AI and doctors assess your chest X-ray.
        </p>
      </div>
      <NewCaseForm isDoctor={false} />
    </div>
  );
}
