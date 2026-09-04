import { NextRequest, NextResponse } from "next/server";

const squareUrl = "https://connect.squareup.com/v2";
const squareVersion = "2026-08-19";
const highLevelUrl = "https://services.leadconnectorhq.com";
const depositAmountCents = 5000;

function authorized(request: NextRequest) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

async function square(path: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: unknown) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("Square access token is not configured.");
  const response = await fetch(`${squareUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Square-Version": squareVersion },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data?.errors?.[0]?.detail ?? "Square request failed.");
  return data;
}

async function highLevel(path: string, method: "POST", body: unknown) {
  const token = process.env.HIGHLEVEL_ACCESS_TOKEN;
  if (!token) throw new Error("HighLevel access token is not configured.");
  const response = await fetch(`${highLevelUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Version: "v3" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data?.message ?? data?.error ?? "HighLevel request failed.");
  return data;
}

function required(input: Record<string, unknown>, fields: string[]) {
  return fields.filter((key) => input[key] === undefined || input[key] === null || input[key] === "");
}

async function findCustomer(input: Record<string, unknown>) {
  const phone = typeof input.phone_number === "string" ? input.phone_number.trim() : "";
  const email = typeof input.email_address === "string" ? input.email_address.trim() : "";
  if (!phone && !email) return null;
  const filters: Record<string, string> = {};
  if (phone) filters.phone_number = phone;
  else if (email) filters.email_address = email;
  const result = await square("/customers/search", "POST", { query: { filter: filters }, limit: 10 });
  return result.customers?.[0] ?? null;
}

async function resolveCustomer(input: Record<string, unknown>) {
  if (typeof input.customer_id === "string" && input.customer_id) return { id: input.customer_id, created: false };
  const existing = await findCustomer(input);
  if (existing?.id) return { id: existing.id, created: false, customer: existing };
  const missing = required(input, ["given_name", "phone_number"]);
  if (missing.length) throw new Error(`Customer not found. To create one, provide: ${missing.join(", ")}.`);
  const customerBody: Record<string, unknown> = {
    idempotency_key: crypto.randomUUID(),
    given_name: input.given_name,
    phone_number: input.phone_number,
  };
  if (input.family_name) customerBody.family_name = input.family_name;
  if (input.email_address) customerBody.email_address = input.email_address;
  if (input.note) customerBody.note = input.note;
  const created = await square("/customers", "POST", customerBody);
  return { id: created.customer.id, created: true, customer: created.customer };
}

async function createDepositLink(input: Record<string, unknown>, locationId: string) {
  const serviceName = typeof input.service_name === "string" && input.service_name.trim() ? input.service_name.trim() : "Blush Appointment";
  const prePopulatedData: Record<string, string> = {};
  if (typeof input.email_address === "string" && input.email_address.trim()) prePopulatedData.buyer_email = input.email_address.trim();
  if (typeof input.phone_number === "string" && input.phone_number.trim()) prePopulatedData.buyer_phone_number = input.phone_number.trim();
  const dateNote = typeof input.start_at === "string" && input.start_at ? ` for ${input.start_at}` : "";
  const clientName = [input.given_name, input.family_name].filter((value) => typeof value === "string" && value.trim()).join(" ");
  const paymentLinkBody: Record<string, unknown> = {
    idempotency_key: crypto.randomUUID(),
    description: `Blush $50 appointment deposit - ${serviceName}`,
    quick_pay: { name: `${serviceName} - Appointment Deposit`, price_money: { amount: depositAmountCents, currency: "USD" }, location_id: locationId },
    payment_note: `Blush appointment deposit${clientName ? ` for ${clientName}` : ""}${dateNote}`,
  };
  if (Object.keys(prePopulatedData).length) paymentLinkBody.pre_populated_data = prePopulatedData;
  return square("/online-checkout/payment-links", "POST", paymentLinkBody);
}

async function sendDepositSms(input: Record<string, unknown>, paymentUrl: string) {
  const locationId = process.env.HIGHLEVEL_LOCATION_ID;
  if (!locationId) throw new Error("HighLevel location ID is not configured.");
  const missing = required(input, ["given_name", "family_name", "phone_number"]);
  if (missing.length) throw new Error(`Missing SMS contact details: ${missing.join(", ")}`);
  const contactBody: Record<string, unknown> = {
    firstName: input.given_name,
    lastName: input.family_name,
    phone: input.phone_number,
    locationId,
    source: "Riley - Blush AI Receptionist",
  };
  if (input.email_address) contactBody.email = input.email_address;
  const contactResult = await highLevel("/contacts/upsert", "POST", contactBody);
  const contactId = contactResult.contact?.id;
  if (!contactId) throw new Error("HighLevel did not return a contact ID.");
  const serviceName = typeof input.service_name === "string" && input.service_name.trim() ? input.service_name.trim() : "your Blush appointment";
  const message = `Hi ${String(input.given_name)}, this is Blush Ink & Beauty Studio. Your $50 deposit for ${serviceName} can be paid securely through Square here: ${paymentUrl} The deposit is required to secure your appointment.`;
  const messageResult = await highLevel("/conversations/messages", "POST", {
    type: "SMS",
    contactId,
    message,
    status: "pending",
  });
  return { contactId, messageId: messageResult.messageId ?? messageResult.id, message: messageResult };
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = (await request.json()) as Record<string, unknown>;
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) throw new Error("Square location ID is not configured.");

    if (input.action === "search_availability") {
      const missing = required(input, ["start_at", "end_at", "service_variation_id", "team_member_id"]);
      if (missing.length) return NextResponse.json({ error: `Missing availability details: ${missing.join(", ")}` }, { status: 400 });
      const result = await square("/bookings/availability/search", "POST", { query: { filter: { start_at_range: { start_at: input.start_at, end_at: input.end_at }, location_id: locationId, segment_filters: [{ service_variation_id: input.service_variation_id, team_member_id_filter: { any: [input.team_member_id] } }] } } });
      return NextResponse.json({ success: true, availabilities: result.availabilities ?? [] });
    }

    if (input.action === "find_or_create_customer") {
      const customer = await resolveCustomer(input);
      return NextResponse.json({ success: true, ...customer });
    }

    if (input.action === "create_booking") {
      const missing = required(input, ["start_at", "service_variation_id", "team_member_id"]);
      if (missing.length) return NextResponse.json({ error: `Missing booking details: ${missing.join(", ")}` }, { status: 400 });
      const customer = await resolveCustomer(input);
      const segment: Record<string, unknown> = { duration_minutes: input.duration_minutes ?? 180, service_variation_id: input.service_variation_id, team_member_id: input.team_member_id };
      if (input.service_variation_version) segment.service_variation_version = input.service_variation_version;
      const result = await square("/bookings", "POST", { idempotency_key: crypto.randomUUID(), booking: { location_id: locationId, customer_id: customer.id, start_at: input.start_at, appointment_segments: [segment], customer_note: input.customer_note } });
      return NextResponse.json({ success: true, customer_id: customer.id, customer_created: customer.created, booking: result.booking });
    }

    if (input.action === "create_deposit_link") {
      const result = await createDepositLink(input, locationId);
      return NextResponse.json({ success: true, amount: depositAmountCents, currency: "USD", payment_link_id: result.payment_link?.id, order_id: result.payment_link?.order_id, url: result.payment_link?.url, long_url: result.payment_link?.long_url });
    }

    if (input.action === "create_and_send_deposit_link") {
      const missing = required(input, ["given_name", "family_name", "phone_number"]);
      if (missing.length) return NextResponse.json({ error: `Missing deposit details: ${missing.join(", ")}` }, { status: 400 });
      const result = await createDepositLink(input, locationId);
      const paymentUrl = result.payment_link?.url ?? result.payment_link?.long_url;
      if (!paymentUrl) throw new Error("Square did not return a deposit payment URL.");
      const sms = await sendDepositSms(input, paymentUrl);
      return NextResponse.json({ success: true, amount: depositAmountCents, currency: "USD", payment_link_id: result.payment_link?.id, order_id: result.payment_link?.order_id, url: paymentUrl, highlevel_contact_id: sms.contactId, highlevel_message_id: sms.messageId, sms_sent: true });
    }

    if (input.action === "check_deposit_status") {
      const missing = required(input, ["order_id"]);
      if (missing.length) return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
      const result = await square(`/orders/${encodeURIComponent(String(input.order_id))}`, "GET");
      const state = result.order?.state ?? "UNKNOWN";
      return NextResponse.json({ success: true, order_id: input.order_id, state, paid: state === "COMPLETED", order: result.order });
    }

    if (input.action === "get_booking") {
      const missing = required(input, ["booking_id"]);
      if (missing.length) return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });
      return NextResponse.json(await square(`/bookings/${encodeURIComponent(String(input.booking_id))}`, "GET"));
    }

    if (input.action === "update_booking") {
      const missing = required(input, ["booking_id", "booking_version"]);
      if (missing.length) return NextResponse.json({ error: `Missing update details: ${missing.join(", ")}` }, { status: 400 });
      const booking: Record<string, unknown> = { version: input.booking_version };
      if (input.start_at) booking.start_at = input.start_at;
      if (input.customer_note !== undefined) booking.customer_note = input.customer_note;
      if (input.service_variation_id && input.team_member_id) {
        const segment: Record<string, unknown> = { duration_minutes: input.duration_minutes ?? 180, service_variation_id: input.service_variation_id, team_member_id: input.team_member_id };
        if (input.service_variation_version) segment.service_variation_version = input.service_variation_version;
        booking.appointment_segments = [segment];
      }
      const result = await square(`/bookings/${encodeURIComponent(String(input.booking_id))}`, "PUT", { booking });
      return NextResponse.json({ success: true, booking: result.booking });
    }

    if (input.action === "cancel_booking") {
      const missing = required(input, ["booking_id", "booking_version"]);
      if (missing.length) return NextResponse.json({ error: `Missing cancellation details: ${missing.join(", ")}` }, { status: 400 });
      const result = await square(`/bookings/${encodeURIComponent(String(input.booking_id))}/cancel`, "POST", { booking_version: input.booking_version });
      return NextResponse.json({ success: true, booking: result.booking });
    }

    return NextResponse.json({ error: "Unsupported action. Use search_availability, find_or_create_customer, create_booking, create_deposit_link, create_and_send_deposit_link, check_deposit_status, get_booking, update_booking, or cancel_booking." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Square booking request failed." }, { status: 500 });
  }
}
