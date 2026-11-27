import type { ReactNode } from "react";
import { site } from "@/data/site";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="page-hero container legal-page">
      <header>
        <p className="eyebrow">{site.name}</p>
        <h1>{title}</h1>
      </header>
      <div className="legal-copy">
        {children}
        <section>
          <h2>Contact the studio</h2>
          <p>Call <a href={site.phoneHref}>{site.phone}</a> or write to {site.name} at {site.address}.</p>
        </section>
      </div>
    </article>
  );
}
