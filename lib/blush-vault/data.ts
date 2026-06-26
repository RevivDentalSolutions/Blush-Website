import type { InventoryItem, ReminderSettings, ExpirationStatus } from "./types";

export const categories = ["Pigment", "Needle", "Numbing", "ProCell", "Aftercare", "Disposable", "Other"] as const;
export const statuses = ["Expired", "Urgent", "Soon", "Watch", "Good"] as const;

export const defaultReminderSettings: ReminderSettings = {
  id: "local-settings",
  remind_90_days: true,
  remind_30_days: true,
  remind_7_days: true,
  remind_expired: true,
};

const today = new Date();
const iso = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export function getExpirationStatus(expirationDate: string): ExpirationStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiration = new Date(`${expirationDate}T00:00:00`);
  const days = Math.ceil((expiration.getTime() - now.getTime()) / 86400000);
  if (days < 0) return "Expired";
  if (days <= 7) return "Urgent";
  if (days <= 30) return "Soon";
  if (days <= 90) return "Watch";
  return "Good";
}

export function daysUntil(date: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - now.getTime()) / 86400000);
}

const make = (item: Omit<InventoryItem, "id" | "created_at" | "updated_at" | "status">, i: number): InventoryItem => {
  const stamp = new Date(Date.now() - i * 86400000).toISOString();
  return { id: `sample-${i}`, created_at: stamp, updated_at: stamp, status: getExpirationStatus(item.expiration_date), ...item };
};

export const sampleInventory: InventoryItem[] = [
  make({ product_name: "Dark Forest Brown", brand: "Perma Blend", category: "Pigment", shade: "Dark Forest Brown", lot_number: "PB-DFB-2407", date_opened: iso(-42), expiration_date: iso(86), quantity: 2, low_stock_threshold: 1, notes: "Brow pigment for deeper brunettes.", image_url: "" }, 1),
  make({ product_name: "Blonde", brand: "Tina Davies", category: "Pigment", shade: "Blonde", lot_number: "TD-BLD-2411", date_opened: iso(-14), expiration_date: iso(24), quantity: 1, low_stock_threshold: 1, notes: "Keep upright; verify label before each appointment.", image_url: "" }, 2),
  make({ product_name: "Lip Set", brand: "Evenflo", category: "Pigment", shade: "Lip collection", lot_number: "EV-LIP-2330", date_opened: iso(-80), expiration_date: iso(6), quantity: 3, low_stock_threshold: 2, notes: "Review opened date before lip blush clients.", image_url: "" }, 3),
  make({ product_name: "Serum", brand: "ProCell", category: "ProCell", shade: "Clear", lot_number: "PC-SRM-2401", date_opened: iso(-9), expiration_date: iso(130), quantity: 7, low_stock_threshold: 3, notes: "Treatment room back bar.", image_url: "" }, 4),
  make({ product_name: "Needle Cartridge 1RL", brand: "Blush Vault Supply", category: "Needle", shade: "1RL", lot_number: "NC-1RL-2502", date_opened: iso(-2), expiration_date: iso(365), quantity: 18, low_stock_threshold: 10, notes: "Sterile single-use cartridges.", image_url: "" }, 5),
  make({ product_name: "Numbing Cream", brand: "Zensa", category: "Numbing", shade: "Topical", lot_number: "ZEN-924A", date_opened: iso(-120), expiration_date: iso(-3), quantity: 1, low_stock_threshold: 2, notes: "Replace before next service day.", image_url: "" }, 6),
];
