import type { InventoryItem } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const hasSupabase = Boolean(url && anon);
const headers = { apikey: anon || "", Authorization: `Bearer ${anon || ""}`, "Content-Type": "application/json" };

export async function fetchSupabaseItems(): Promise<InventoryItem[]> {
  if (!hasSupabase) return [];
  const res = await fetch(`${url}/rest/v1/inventory_items?select=*&order=created_at.desc`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error("Unable to load Supabase inventory");
  return res.json();
}

export async function uploadSupabaseImage(file: File) {
  if (!hasSupabase) return "";
  const path = `labels/${crypto.randomUUID()}-${file.name}`;
  const res = await fetch(`${url}/storage/v1/object/blush-vault/${path}`, { method: "POST", headers: { apikey: anon || "", Authorization: `Bearer ${anon || ""}`, "Content-Type": file.type }, body: file });
  if (!res.ok) return "";
  return `${url}/storage/v1/object/public/blush-vault/${path}`;
}
