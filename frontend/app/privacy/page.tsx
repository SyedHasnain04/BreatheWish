import type { Metadata } from "next";
import LegalPage from "../../components/shared/LegalPage";

export const metadata: Metadata = { title: "Privacy policy — BreatheWish" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="21 September 2026">
      <section>
        <p>
          This is a working draft that describes how BreatheWish handles data today. It has not been reviewed by a
          lawyer and must be before real patients use the service.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your name, email address and a hashed password.</li>
          <li>Health information you enter: age, weight, sex, blood group, existing conditions, medications and symptoms.</li>
          <li>The chest X-ray image you upload.</li>
          <li>Messages between you and your doctor, and notifications about your case.</li>
        </ul>
      </section>

      <section>
        <h2>How it is used</h2>
        <p>
          Your X-ray is analysed by a machine-learning model that produces a pneumonia probability and a heatmap. A
          doctor reviews the result. Your symptoms, age, weight and the model result are also sent to a third-party
          language model (Anthropic) to draft a prescription for the doctor to edit. Your name and the X-ray image
          are not part of that request.
        </p>
      </section>

      <section>
        <h2>Who can see it</h2>
        <ul>
          <li>You can see your own cases. Automated findings are not shown to you before a doctor has verified the case.</li>
          <li>The doctor assigned to your case, and any doctor asked for a second opinion, can see the case.</li>
          <li>Service providers that store your X-ray images (Cloudinary) and host the application process data on our behalf.</li>
        </ul>
      </section>

      <section>
        <h2>Retention and deletion</h2>
        <p>
          Clinical case records and radiograph scans are retained for a minimum of 7 years in compliance with medical
          record-keeping regulations, or until a patient submits a verified right-to-erasure request. Patients may
          request an export or deletion of their account and associated health data by contacting our privacy team.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For privacy inquiries, regulatory compliance matters, or data access requests, please email our data protection
          office at <a href="mailto:privacy@breathewish.com" className="text-doctor-accent hover:underline">privacy@breathewish.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}
