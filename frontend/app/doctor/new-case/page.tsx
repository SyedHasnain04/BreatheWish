import React from "react";
import NewCaseForm from "@/components/cases/NewCaseForm";
import PortalHeader from "@/components/shared/PortalHeader";

export default function DoctorNewCasePage() {
  return (
    <div className="min-h-[100dvh] bg-background" data-theme="doctor">
      <PortalHeader portal="doctor" current="New case" backHref="/doctor/dashboard" backLabel="All cases" />
      <main id="main" className="px-6 py-10">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Start a case</h1>
          <p className="text-text-muted mt-2 max-w-[56ch]">
            Upload a patient&apos;s X-ray and enter their symptoms on their behalf. The AI pre-read runs straight away.
          </p>
        </div>
        <NewCaseForm isDoctor={true} />
      </main>
    </div>
  );
}
