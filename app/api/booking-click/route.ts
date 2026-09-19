import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedSources = new Set([
  "homepage",
  "service:powder-brows",
  "service:lip-blushing",
  "service:permanent-eyeliner",
  "service:procell-microchanneling",
  "service:scar-camouflage",
  "service:stretch-mark-revision",
  "service:corrections",
  "touch-ups",
  "book-now",
  "contact",
  "header",
  "sticky",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { source?: unknown };
    const source = typeof body.source === "string" ? body.source : "";
    if (!allowedSources.has(source)) return new Response(null, { status: 204 });

    // Only an allowlisted source token is logged. No names, contact details,
    // cookies, IPs, referrers, or booking IDs are collected.
    console.info(JSON.stringify({ event: "blush_booking_click", source, version: 1 }));
  } catch {
    // Tracking is best effort and must never block the booking journey.
  }
  return NextResponse.json({ ok: true });
}
