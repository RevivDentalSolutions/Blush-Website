import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Blush Ink & Beauty Studio handles booking, consultation, website, and messaging information.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This policy explains how Blush Ink &amp; Beauty Studio handles information when you visit our website, contact us, book, receive a service, or message us.</p>
      <section>
        <h2>Contact, booking, and treatment information</h2>
        <p>We collect the name, phone number, email address, service interest, and other details you provide when you contact us or request an appointment. We use this information to respond, assess service suitability, manage bookings and payments, and support aftercare.</p>
        <p>During intake, we may request relevant health and treatment history, signed consent, and identification. Arkansas body art rules require certain client and procedure records, including a copy of valid photo identification for covered procedures. Use the studio’s designated intake process for sensitive information.</p>
      </section>
      <section>
        <h2>Square booking and payments</h2>
        <p>We use Square Appointments for online scheduling and Square checkout for payments, including booking deposits. Square receives the booking, contact, and payment information needed for those services. Our website does not ask you to enter card numbers. The studio may receive booking and transaction details such as the amount and payment status. See <a href="https://squareup.com/us/en/legal/general/buyer-features">Square’s buyer privacy notice</a> for its buyer features.</p>
      </section>
      <section>
        <h2>Client photographs</h2>
        <p>We may request or take photos to assess existing work, plan treatment, or document results. We ask for separate permission before using identifiable client photos in a portfolio, social post, or ad. Contact the studio to withdraw permission for future promotional use.</p>
      </section>
      <section>
        <h2>Website analytics, cookies, and advertising</h2>
        <p>We measure clicks on booking links. Our website records which button or campaign link directed you to Square and, for certain follow-up links, a campaign group. These booking events log predefined labels.</p>
        <p>Our location page embeds Google Maps, and our site loads typefaces from Google Fonts. Those services receive requests from your browser when their content loads. When you follow a booking or ad link, the platform you visit may use cookies or similar technologies under its own privacy policy. This includes Square and the platforms where our ads appear, such as Facebook or Instagram. You can manage cookies through your browser and ad preferences through the platform.</p>
      </section>
      <section>
        <h2>Square communications and Google RCS</h2>
        <p>Square Appointments uses your contact and appointment details to send confirmations, reminders, and scheduling updates. When you communicate with us through Square Messages, Square and Blush process your contact details and conversation content to respond and provide service. Square and its delivery providers may process information needed to send messages and handle replies or opt-outs.</p>
        <p>Once Google Business Profile RCS is enabled for Blush, Google processes chat information on our behalf. Google, participating carriers, and Blush may handle information such as your mobile number, the content you send, and delivery or preference information to operate the conversation. Google’s automated assistant may use your messages to respond, and studio staff may access the conversation to help you. If you follow a Square link, Square handles the information you provide in its booking or checkout flow.</p>
        <p>We use messaging information to answer inquiries, manage appointments and communications, and honor your preferences. We do not share mobile opt-in information or messaging consent with third parties for their own marketing. To change your preferences, use the controls for the conversation you want to stop or contact the studio. See our <Link href="/terms">Terms of Service</Link> for separate Square and Google opt-out instructions.</p>
      </section>
      <section>
        <h2>Other disclosures, protection, and retention</h2>
        <p>We provide information to vendors as needed to host the site, book appointments, process payments, or deliver messages. We may disclose records when required by law or to the Arkansas Department of Health as required for body art oversight.</p>
        <p>We limit access to client records to people who need them for studio operations or required oversight. We retain information as needed for appointments, payments, disputes, messaging preferences, and legal recordkeeping. Arkansas requires covered body art records to be kept for at least one year from the last entry. Longer requirements can apply to some records.</p>
      </section>
      <section>
        <h2>Your privacy choices</h2>
        <p>Contact us to ask for access, correction, or deletion of your information, or to change your photo or messaging preferences. We may verify your identity and retain information where the law permits or requires it. Please use our designated intake process for identification, payment details, and sensitive treatment information.</p>
      </section>
    </LegalPage>
  );
}
