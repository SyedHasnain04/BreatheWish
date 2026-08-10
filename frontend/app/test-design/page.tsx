import React from "react";
import SeverityBadge from "../../components/shared/SeverityBadge";
import StatusBadge from "../../components/shared/StatusBadge";
import VerifiedBadge from "../../components/shared/VerifiedBadge";

export default function TestDesignPage() {
  return (
    <div className="min-h-screen bg-background p-10 font-sans space-y-12">
      <section>
        <h2 className="text-2xl text-text-primary mb-4">Severity Badges</h2>
        <div className="flex gap-4">
          <SeverityBadge severity="severe" />
          <SeverityBadge severity="moderate" />
          <SeverityBadge severity="mild" />
          <SeverityBadge severity="none" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl text-text-primary mb-4">Status Badges</h2>
        <div className="flex gap-4">
          <StatusBadge status="pending" />
          <StatusBadge status="in_review" />
          <StatusBadge status="second_opinion" />
          <StatusBadge status="completed" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl text-text-primary mb-4">Verified Badge</h2>
        <VerifiedBadge doctorName="Dr. Arun Mehta" />
      </section>

      <section>
        <h2 className="text-2xl text-text-primary mb-4">Cards</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="card-dark">
            <h3 className="text-text-primary font-bold mb-2">Dark Card</h3>
            <p className="text-text-muted">This is for the doctor's theme.</p>
          </div>
          <div className="card-light">
            <h3 className="text-text-dark font-bold mb-2">Light Card</h3>
            <p className="text-text-dark-muted">This is for the patient's theme.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl text-text-primary mb-4">Buttons</h2>
        <div className="flex gap-4">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-outline-light">Outline Light Button</button>
        </div>
      </section>
    </div>
  );
}
