import Link from "next/link";
import { services, site } from "@/data/site";

export const Hero = () => (
  <section className="hero">
    <div className="container">
      <h1>Luxury Permanent Makeup in North Little Rock</h1>
      <p>Professional, warm, and results-driven artistry for brows, lips, eyeliner, and skin renewal.</p>
      <p><a className="btn btn-primary" href={site.bookingLink}>Book Your Appointment</a> <Link className="btn btn-secondary" href="/contact">Ask a Question</Link></p>
    </div>
  </section>
);

export const ServicesGrid = () => (
  <section className="section container">
    <h2>Signature Services</h2>
    <div className="grid three-col">{services.map(s => <article key={s.slug} className="card"><h3>{s.name}</h3><p>{s.desc}</p><p><strong>{s.price}</strong></p><Link href={`/${s.slug}`}>Learn more →</Link></article>)}</div>
  </section>
);

export const ContactStrip = () => (
  <section className="section"><div className="container card"><h2>Ready to feel confident?</h2><p><a className="btn btn-primary" href={site.bookingLink}>Book Your Appointment</a> <a className="btn btn-secondary" href={site.phoneHref}>Call Now</a></p></div></section>
);
