import { site } from "../../../data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedSources = new Set(["reactivation", "lead_follow_up"]);
const allowedCohorts = new Set(["due_now", "likely_due_soon", "recently_serviced", "insufficient_information"]);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const source = params.get("blush_source") ?? "";
  const cohort = params.get("blush_cohort") ?? "";
  const valid = allowedSources.has(source) && allowedCohorts.has(cohort);

  if (valid) {
    // Only allowlisted source and cohort tokens are logged. No names, contact
    // details, cookies, IPs, referrers, or booking IDs are collected.
    console.info(JSON.stringify({ event: "blush_booking_click", source, cohort, version: 2 }));
  }

  const destination = new URL(site.bookingLink);
  if (valid) {
    destination.searchParams.set("blush_source", source);
    destination.searchParams.set("blush_cohort", cohort);
  }
  return Response.redirect(destination, 302);
}
