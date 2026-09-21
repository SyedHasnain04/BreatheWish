import React from "react";
import NewCaseForm from "@/components/cases/NewCaseForm";
import PortalHeader from "@/components/shared/PortalHeader";

export default function PatientNewCasePage() {
  return (
    <div className="min-h-[100dvh] bg-patient-bg text-text-dark" data-theme="patient">
      <PortalHeader portal="patient" current="New case" backHref="/patient/dashboard" backLabel="My cases" />
      <main id="main" className="px-6 py-10">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-text-dark">Upload an X-ray</h1>
          <p className="text-text-dark-muted mt-2 max-w-[56ch]">
            The more accurately you fill this in, the more useful the review will be. A doctor sees everything you enter.
          </p>
        </div>
        <NewCaseForm isDoctor={false} />
      </main>
    </div>
  );
}
