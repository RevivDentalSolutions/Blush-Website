import Link from "next/link";
import { site } from "@/data/site";

const links = [
  ["Home", "/"], ["About", "/about"], ["Services", "/services"], ["Gallery", "/gallery"], ["FAQs", "/faqs"], ["Policies", "/policies"], ["Book", "/contact"]
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <div className="container">
          <nav>
            <Link href="/"><strong>{site.name}</strong></Link>
            <ul>{links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
          </nav>
        </div>
      </header>
      {children}
      <div className="sticky-cta"><a className="btn btn-primary" href={site.bookingLink}>Book Your Appointment</a></div>
      <footer>
        <div className="container">
          <p><strong>{site.name}</strong></p>
          <p>{site.address}</p>
          <p><a href={site.phoneHref}>Call {site.phone}</a> • <a href={site.smsHref}>Text Us</a></p>
        </div>
      </footer>
    </>
  );
}
