import type {Metadata} from "next";
import {site} from "@/data/site";

export const metadata:Metadata={
  title:"Permanent Makeup Touch-Ups & Refreshes in North Little Rock",
  description:"Plan a brow, lip blush, or permanent eyeliner touch-up or refresh with Blush Ink & Beauty Studio in North Little Rock, serving Central Arkansas.",
  alternates:{canonical:"/touch-ups"},
};

export default function Page(){return <section className="section container">
  <p className="eyebrow">Returning clients</p>
  <h1>Refresh your results<br/><em>when the time feels right.</em></h1>
  <div className="detail-intro">
    <div>
      <p>Permanent makeup changes as your skin, lifestyle, and preferences change. If you are ready to revisit your brows, lips, or eyeliner, start with the current Square appointment options.</p>
      <a className="btn btn-dark" href={site.bookingLink}>View Square appointments</a>
    </div>
    <div>
      <h3>Not sure which option fits?</h3>
      <p>Text Jessica with a little context about your previous service and what you are noticing now. If your work was done elsewhere, include clear, unfiltered photos before booking a correction or refresh.</p>
      <a className="text-link" href={site.smsHref}>Text the studio <span>↗</span></a>
      <h3>After a recent service</h3>
      <p>If you are still within the aftercare or perfection window discussed at your appointment, text the studio first so the right next step can be confirmed.</p>
    </div>
  </div>
</section>}
