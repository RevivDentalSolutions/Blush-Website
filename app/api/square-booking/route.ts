import {NextRequest, NextResponse} from "next/server";

const squareUrl = "https://connect.squareup.com/v2";

function authorized(request: NextRequest) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

async function square(path: string, method: "GET"|"POST", body?: unknown) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("Square access token is not configured.");
  const response = await fetch(`${squareUrl}${path}`, {method, headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json","Square-Version":"2025-01-23"},body:body ? JSON.stringify(body) : undefined});
  const data = await response.json();
  if (!response.ok) throw new Error(data?.errors?.[0]?.detail ?? "Square request failed.");
  return data;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({error:"Unauthorized"},{status:401});
  try {
    const input = await request.json();
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) throw new Error("Square location ID is not configured.");
    if (input.action === "create_booking") {
      const required = ["customer_id","start_at","service_variation_id","team_member_id"];
      const missing = required.filter(key=>!input[key]);
      if (missing.length) return NextResponse.json({error:`Missing booking details: ${missing.join(", ")}`},{status:400});
      const result = await square("/bookings", "POST", {idempotency_key:crypto.randomUUID(),booking:{location_id:locationId,customer_id:input.customer_id,start_at:input.start_at,appointment_segments:[{duration_minutes:input.duration_minutes ?? 180,service_variation_id:input.service_variation_id,team_member_id:input.team_member_id,service_variation_version:input.service_variation_version}]}});
      return NextResponse.json({success:true,booking:result.booking});
    }
    if (input.action === "get_booking") return NextResponse.json(await square(`/bookings/${encodeURIComponent(input.booking_id)}`, "GET"));
    return NextResponse.json({error:"Unsupported action. Use create_booking or get_booking."},{status:400});
  } catch (error) {
    return NextResponse.json({error:error instanceof Error ? error.message : "Booking request failed."},{status:500});
  }
}
