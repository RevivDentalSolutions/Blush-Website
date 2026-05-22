import type { Metadata } from "next";
export const metadata: Metadata = { title: "Before & After Gallery | Blush Ink & Beauty Studio", description: "Before and after permanent makeup transformations." };
export default function Page(){return <section className="section container"><h1>Before & After Gallery</h1><p>Replace these placeholders with optimized web images.</p><div className="grid three-col">{Array.from({length:6}).map((_,i)=><div key={i} className="card"><p>Photo Placeholder {i+1}</p></div>)}</div></section>}
