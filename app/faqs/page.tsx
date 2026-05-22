import type { Metadata } from "next";
export const metadata: Metadata = { title: "FAQs | Blush Ink & Beauty Studio", description: "Frequently asked questions about permanent makeup, healing, and appointments." };
const faqs=[['How long do results last?','Most services last 1-3 years depending on skin, lifestyle, and aftercare.'],['Does it hurt?','Most guests describe mild discomfort; topical numbing is used throughout.'],['How do I book?','Use any Book Your Appointment button, call, or text us.']];
export default function Page(){return <section className="section container faq"><h1>Frequently Asked Questions</h1>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
