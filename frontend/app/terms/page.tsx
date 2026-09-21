import type { Metadata } from "next";
import LegalPage from "../../components/shared/LegalPage";

export const metadata: Metadata = { title: "Terms of service — BreatheWish" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="21 September 2026">
      <section>
        <p>
          This is a working draft. It has not been reviewed by a lawyer and must be before real patients use the
          service.
        </p>
      </section>

      <section>
        <h2>What BreatheWish is</h2>
        <p>
          BreatheWish is a screening aid. An AI model gives a pre-read of a chest X-ray, and a doctor reviews it. It
          does not replace an in-person examination or a clinical diagnosis.
        </p>
      </section>

      <section>
        <h2>Doctor review</h2>
        <p>
          Results and prescriptions are shown to patients only after a doctor has verified them. The doctor is
          responsible for their own clinical decisions. The AI output is an input to those decisions, not a substitute
          for them.
        </p>
      </section>

      <section>
        <h2>Emergencies</h2>
        <p>
          Do not use BreatheWish in an emergency. If you have severe breathlessness, chest pain, blue lips, confusion or
          a very high fever, contact emergency services or go to a hospital straight away.
        </p>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <ul>
          <li>Give accurate information, and upload only your own X-ray, or a patient&apos;s X-ray with their consent if you are a doctor.</li>
          <li>Keep your login details private.</li>
          <li>Do not change or stop prescribed medicine without asking your doctor.</li>
        </ul>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>Patients can register themselves. Doctor accounts are created by an administrator after their credentials are checked.</p>
      </section>

      <section>
        <h2>Liability and governing law</h2>
        <p>
          To the maximum extent permitted by applicable law, BreatheWish is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
          basis as an assistive diagnostic support system. Under no circumstances shall BreatheWish or its healthcare providers
          be liable for indirect, incidental, punitive, or consequential damages resulting from tele-triage consultations.
          Final medical decisions and prescriptions remain the sole legal responsibility of the verifying licensed physician.
          These terms are governed by the applicable laws of the jurisdiction in which medical care is rendered.
        </p>
      </section>
    </LegalPage>
  );
}
