import { ContactStrip, Hero, ServicesGrid } from "@/components/Sections";

export default function Home() {
  return <><Hero /><ServicesGrid /><section className="section container"><h2>Why clients choose Blush Ink</h2><div className="grid two-col"><div className="card"><h3>Natural luxury results</h3><p>Personalized mapping and pigment design with timeless elegance.</p></div><div className="card"><h3>Trusted clinical location</h3><p>Located inside Dr. Stephen Boatright&apos;s Endodontic practice for a clean, professional setting.</p></div></div></section><ContactStrip /></>;
}
