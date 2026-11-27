import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Booking, service, and messaging terms for Blush Ink & Beauty Studio.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>These terms apply to the {site.name} website, appointments, cosmetic services, and business messaging.</p>
      <section>
        <h2>Appointments and deposits</h2>
        <p>Book through Square and review the price and instructions shown for your service. A $50 booking deposit is required to secure your appointment. Keep your Square confirmation and contact the studio if you have questions about your booking or remaining balance.</p>
        <p>Cancel or request a reschedule at least 24 hours before your appointment using your Square confirmation or by contacting the studio. If you need to make a change with less than 24 hours’ notice, contact the studio directly. If you miss your appointment without notice, you forfeit the $50 deposit. A new booking requires a new deposit.</p>
      </section>
      <section>
        <h2>Refunds, touch-ups, and gift cards</h2>
        <p>Contact the studio to request a refund or resolve a payment issue. Deposit and refund eligibility depends on these terms, the terms disclosed at booking or purchase, and applicable law.</p>
        <p>Touch-ups and annual refreshes have their own timing, eligibility, and pricing. Follow the instructions provided at your initial appointment and check the <Link href="/touch-ups">touch-up options</Link> before booking. If another artist performed your original service, contact the studio for an assessment first.</p>
        <p>Review the terms shown at gift card purchase for redemption and any promotional conditions. Gift card refunds, expiration, and cash redemption are subject to applicable law. Ask the studio if you are unsure how to redeem a card or whether a promotion applies.</p>
      </section>
      <section>
        <h2>Treatment eligibility and results</h2>
        <p>Permanent makeup and other cosmetic services are subject to a suitability review, applicable age and identification requirements, and informed consent. Disclose prior permanent makeup, allergies, medications, pregnancy, skin conditions, and healing concerns during your consultation. The studio may postpone or decline a service when it cannot safely or appropriately perform the treatment.</p>
        <p>Healing, pigment retention, color, and longevity vary with skin, prior work, lifestyle, and aftercare. Photos illustrate possible results. The studio cannot guarantee a specific outcome. Follow the aftercare instructions given for your service.</p>
      </section>
      <section>
        <h2>Website use</h2>
        <p>The website provides general service information. Confirm current prices, availability, and treatment suitability with the studio. Use the site lawfully and provide accurate information when booking or contacting us. Get permission before reusing studio photography or other original content.</p>
      </section>
      <section>
        <h2>SMS and RCS messaging</h2>
        <p>If you start a conversation by text or RCS, we may reply about your inquiry. If you opt in to studio messages, you may receive appointment confirmations or reminders, scheduling updates, and Square deposit links. Promotional messages require a separate opt-in. Consent to promotional messaging is optional and is never a condition of purchase.</p>
        <p>Message frequency varies with your appointments, requests, and preferences. Message and data rates may apply. Reply <strong>STOP</strong> to opt out of the studio messaging program. After the opt-out confirmation, program messages stop until you opt in again. For help, call <a href={site.phoneHref}>{site.phone}</a>. Read the <Link href="/privacy">Privacy Policy</Link> for how messaging data is handled.</p>
      </section>
    </LegalPage>
  );
}
