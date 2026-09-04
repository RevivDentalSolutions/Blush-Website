import { NextRequest, NextResponse } from "next/server";

const squareUrl = "https://connect.squareup.com/v2";
const squareVersion = "2026-08-20";

function authorized(request: NextRequest) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  return Boolean(
    secret && request.headers.get("authorization") === `Bearer ${secret}`,
  );
}

async function square(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("Square access token is not configured.");

  const response = await fetch(`${squareUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": squareVersion,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.detail ?? "Square request failed.");
  }
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

  const result = await square("/customers/search", "POST", {
    query: { filter: filters },
    limit: 10,
  });
  return result.customers?.[0] ?? null;
}

async function resolveCustomer(input: Record<string, unknown>) {
  if (typeof input.customer_id === "string" && input.customer_id) {
    return { id: input.customer_id, created: false };
  }

  const existing = await findCustomer(input);
  if (existing?.id) return { id: existing.id, created: false, customer: existing };

  const missing = required(input, ["given_name", "phone_number"]);
  if (missing.length) {
    throw new Error(
      `Customer not found. To create one, provide: ${missing.join(", ")}.`,
    );
  }

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

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = (await request.json()) as Record<string, unknown>;
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) throw new Error("Square location ID is not configured.");

    if (input.action === "search_availability") {
      const missing = required(input, [
        "start_at",
        "end_at",
        "service_variation_id",
        "team_member_id",
      ]);
      if (missing.length) {
        return NextResponse.json(
          { error: `Missing availability details: ${missing.join(", ")}` },
          { status: 400 },
        );
      }

      const result = await square("/bookings/availability/search", "POST", {
        query: {
          filter: {
            start_at_range: {
              start_at: input.start_at,
              end_at: input.end_at,
            },
            location_id: locationId,
            segment_filters: [
              {
                service_variation_id: input.service_variation_id,
                team_member_id_filter: { any: [input.team_member_id] },
              },
            ],
          },
        },
      });

      return NextResponse.json({
        success: true,
        availabilities: result.availabilities ?? [],
      });
    }

    if (input.action === "find_or_create_customer") {
      const customer = await resolveCustomer(input);
      return NextResponse.json({ success: true, ...customer });
    }

    if (input.action === "create_booking") {
      const missing = required(input, [
        "start_at",
        "service_variation_id",
        "team_member_id",
      ]);
      if (missing.length) {
        return NextResponse.json(
          { error: `Missing booking details: ${missing.join(", ")}` },
          { status: 400 },
        );
      }

      const customer = await resolveCustomer(input);
      const segment: Record<string, unknown> = {
        duration_minutes: input.duration_minutes ?? 180,
        service_variation_id: input.service_variation_id,
        team_member_id: input.team_member_id,
      };
      if (input.service_variation_version) {
        segment.service_variation_version = input.service_variation_version;
      }

      const result = await square("/bookings", "POST", {
        idempotency_key: crypto.randomUUID(),
        booking: {
          location_id: locationId,
          customer_id: customer.id,
          start_at: input.start_at,
          appointment_segments: [segment],
          customer_note: input.customer_note,
        },
      });

      return NextResponse.json({
        success: true,
        customer_id: customer.id,
        customer_created: customer.created,
        booking: result.booking,
      });
    }

    if (input.action === "get_booking") {
      const missing = required(input, ["booking_id"]);
      if (missing.length) {
        return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });
      }
      return NextResponse.json(
        await square(`/bookings/${encodeURIComponent(String(input.booking_id))}`, "GET"),
      );
    }

    if (input.action === "update_booking") {
      const missing = required(input, ["booking_id", "booking_version"]);
      if (missing.length) {
        return NextResponse.json(
          { error: `Missing update details: ${missing.join(", ")}` },
          { status: 400 },
        );
      }

      const booking: Record<string, unknown> = {
        version: input.booking_version,
      };
      if (input.start_at) booking.start_at = input.start_at;
      if (input.customer_note !== undefined) booking.customer_note = input.customer_note;
      if (input.service_variation_id && input.team_member_id) {
        const segment: Record<string, unknown> = {
          duration_minutes: input.duration_minutes ?? 180,
          service_variation_id: input.service_variation_id,
          team_member_id: input.team_member_id,
        };
        if (input.service_variation_version) {
          segment.service_variation_version = input.service_variation_version;
        }
        booking.appointment_segments = [segment];
      }

      const result = await square(
        `/bookings/${encodeURIComponent(String(input.booking_id))}`,
        "PUT",
        { booking },
      );
      return NextResponse.json({ success: true, booking: result.booking });
    }

    if (input.action === "cancel_booking") {
      const missing = required(input, ["booking_id", "booking_version"]);
      if (missing.length) {
        return NextResponse.json(
          { error: `Missing cancellation details: ${missing.join(", ")}` },
          { status: 400 },
        );
      }
      const result = await square(
        `/bookings/${encodeURIComponent(String(input.booking_id))}/cancel`,
        "POST",
        { booking_version: input.booking_version },
      );
      return NextResponse.json({ success: true, booking: result.booking });
    }

    return NextResponse.json(
      {
        error:
          "Unsupported action. Use search_availability, find_or_create_customer, create_booking, get_booking, update_booking, or cancel_booking.",
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Square booking request failed." },
      { status: 500 },
    );
  }
}
