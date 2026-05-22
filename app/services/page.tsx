import type { Metadata } from "next";
import { services } from "@/data/site";
export const metadata: Metadata = { title: "Services & Pricing | Blush Ink & Beauty Studio", description: "Explore permanent makeup and skin services with placeholder pricing." };
export default function Page(){return <section className="section container"><h1>Services & Pricing</h1><div className="grid two-col">{services.map(s=><article key={s.slug} className="card"><h2>{s.name}</h2><p>{s.desc}</p><p><strong>Starting at {s.price}</strong></p><p>Prep and aftercare details are reviewed in your consultation and take-home guide.</p></article>)}</div></section>}
