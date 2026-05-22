import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/components/Layout";

export const metadata: Metadata = {
  title: "Blush Ink & Beauty Studio | Luxury Permanent Makeup",
  description: "Luxury permanent makeup studio in North Little Rock offering powder brows, lip blushing, permanent eyeliner, scar camouflage, and ProCell microchanneling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Layout>{children}</Layout></body></html>;
}
