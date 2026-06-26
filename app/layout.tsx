import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Layout } from "@/components/Layout";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Blush Ink & Beauty Studio | Luxury Permanent Makeup",
  description: "Luxury permanent makeup studio in North Little Rock offering powder brows, lip blushing, permanent eyeliner, scar camouflage, and ProCell microchanneling.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Blush Vault", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#d99ca7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><PwaRegister /><Layout>{children}</Layout></body></html>;
}
