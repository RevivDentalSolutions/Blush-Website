"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { bookingLinkFor, type BookingSource } from "@/data/site";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  source: BookingSource;
  href?: string;
};

export function BookingLink({ source, href, onClick, ...props }: Props) {
  const destination = href ?? bookingLinkFor(source);

  function trackClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || typeof navigator === "undefined") return;

    const payload = JSON.stringify({ source });
    try {
      if (typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/booking-click",
          new Blob([payload], { type: "application/json" }),
        );
      } else {
        void fetch("/api/booking-click", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    } catch {
      // Tracking is best effort and must never block the Square navigation.
    }
  }

  return <a {...props} href={destination} data-booking-source={source} onClick={trackClick} />;
}
