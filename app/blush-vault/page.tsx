"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { categories, daysUntil, defaultReminderSettings, getExpirationStatus, sampleInventory, statuses } from "@/lib/blush-vault/data";
import type { InventoryItem, ReminderSettings } from "@/lib/blush-vault/types";

type Page = "Dashboard" | "Inventory" | "Add Item" | "Reminders" | "Reports";
const nav: Page[] = ["Dashboard", "Inventory", "Add Item", "Reminders", "Reports"];
const blank = (): InventoryItem => ({ id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_name: "", brand: "", category: "Pigment", shade: "", lot_number: "", date_opened: new Date().toISOString().slice(0, 10), expiration_date: "", quantity: 1, low_stock_threshold: 1, notes: "", image_url: "", status: "Good" });

export default function BlushVaultPage() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [items, setItems] = useState<InventoryItem[]>(sampleInventory);
  const [settings, setSettings] = useState<ReminderSettings>(defaultReminderSettings);
  const [draft, setDraft] = useState<InventoryItem>(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    const savedItems = localStorage.getItem("blush-vault-items");
    const savedSettings = localStorage.getItem("blush-vault-reminders");
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => { localStorage.setItem("blush-vault-items", JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem("blush-vault-reminders", JSON.stringify(settings)); }, [settings]);

  const enriched = useMemo(() => items.map((i) => ({ ...i, status: getExpirationStatus(i.expiration_date) })), [items]);
  const filtered = enriched.filter((i) => [i.product_name, i.brand, i.shade, i.lot_number].join(" ").toLowerCase().includes(query.toLowerCase()) && (cat === "All" || i.category === cat) && (status === "All" || i.status === status));
  const counts = { total: enriched.length, expired: enriched.filter(i => i.status === "Expired").length, d7: enriched.filter(i => daysUntil(i.expiration_date) >= 0 && daysUntil(i.expiration_date) <= 7).length, d30: enriched.filter(i => daysUntil(i.expiration_date) >= 0 && daysUntil(i.expiration_date) <= 30).length, d90: enriched.filter(i => daysUntil(i.expiration_date) >= 0 && daysUntil(i.expiration_date) <= 90).length, low: enriched.filter(i => i.quantity <= i.low_stock_threshold).length };
  const reminders = enriched.filter(i => (settings.remind_expired && i.status === "Expired") || (settings.remind_7_days && daysUntil(i.expiration_date) >= 0 && daysUntil(i.expiration_date) <= 7) || (settings.remind_30_days && daysUntil(i.expiration_date) > 7 && daysUntil(i.expiration_date) <= 30) || (settings.remind_90_days && daysUntil(i.expiration_date) > 30 && daysUntil(i.expiration_date) <= 90));

  function saveItem() {
    if (!draft.product_name || !draft.brand || !draft.lot_number || !draft.expiration_date) return;
    const saved = { ...draft, status: getExpirationStatus(draft.expiration_date), updated_at: new Date().toISOString() };
    setItems((prev) => editingId ? prev.map(i => i.id === editingId ? saved : i) : [saved, ...prev]);
    setDraft(blank()); setEditingId(null); setPage("Inventory");
  }
  function editItem(item: InventoryItem) { setDraft(item); setEditingId(item.id); setPage("Add Item"); }
  function removeItem(id: string) { setItems(prev => prev.filter(i => i.id !== id)); }
  function onPhoto(file?: File) { if (!file) return; const reader = new FileReader(); reader.onload = () => setDraft(d => ({ ...d, image_url: String(reader.result) })); reader.readAsDataURL(file); }
  function exportCsv() {
    const rows = [["Product","Brand","Category","Shade","Lot","Opened","Expires","Qty","Low Stock","Status","Notes"], ...enriched.map(i => [i.product_name,i.brand,i.category,i.shade,i.lot_number,i.date_opened,i.expiration_date,String(i.quantity),String(i.low_stock_threshold),i.status,i.notes])];
    const blob = new Blob([rows.map(r => r.map(v => `"${v.replaceAll('"','""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "blush-vault-inventory.csv"; a.click();
  }

  return <main className="vault-shell">
    <section className="vault-hero"><div><p className="eyebrow">Luxury PMU inventory</p><h1>Blush Vault</h1><p>Track opened pigments, lot numbers, expirations, low stock, and reminders from your treatment room.</p></div><button onClick={() => setPage("Add Item")} className="vault-button">+ Quick add</button></section>
    <section className="install-card"><strong>Add Blush Vault to your Home Screen.</strong><span>On iPhone tap Share → Add to Home Screen. On Android tap menu → Install app.</span></section>
    {page === "Dashboard" && <><div className="metric-grid">{[["Active items",counts.total],["90 days",counts.d90],["30 days",counts.d30],["Expired",counts.expired],["Low stock",counts.low],["Added recently",enriched.slice(0,3).length]].map(([l,v])=><article className="metric" key={l}><span>{l}</span><strong>{v}</strong></article>)}</div><Panel title="In-app reminders">{reminders.length ? reminders.map(i => <ItemRow key={i.id} item={i} onEdit={editItem} onDelete={removeItem} />) : <p className="muted">No active reminders. Your vault is beautifully current.</p>}</Panel><Panel title="Recent items added">{enriched.slice(0,4).map(i => <ItemRow key={i.id} item={i} onEdit={editItem} onDelete={removeItem} />)}</Panel></>}
    {page === "Inventory" && <Panel title="Inventory"><div className="filters"><input placeholder="Search product, brand, shade, lot" value={query} onChange={e=>setQuery(e.target.value)} /><select value={cat} onChange={e=>setCat(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>{filtered.map(i => <ItemRow key={i.id} item={i} onEdit={editItem} onDelete={removeItem} />)}<button className="vault-button ghost" onClick={exportCsv}>Export CSV</button></Panel>}
    {page === "Add Item" && <Panel title={editingId ? "Edit inventory item" : "Fast add inventory item"}><div className="form-grid"><Field label="Product name" value={draft.product_name} onChange={v=>setDraft({...draft, product_name:v})}/><Field label="Brand" value={draft.brand} onChange={v=>setDraft({...draft, brand:v})}/><label>Category<select value={draft.category} onChange={e=>setDraft({...draft, category:e.target.value as InventoryItem["category"]})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><Field label="Color / shade" value={draft.shade} onChange={v=>setDraft({...draft, shade:v})}/><Field label="Lot number" value={draft.lot_number} onChange={v=>setDraft({...draft, lot_number:v})}/><Field label="Date opened" type="date" value={draft.date_opened} onChange={v=>setDraft({...draft, date_opened:v})}/><Field label="Expiration date" type="date" value={draft.expiration_date} onChange={v=>setDraft({...draft, expiration_date:v})}/><Field label="Quantity" type="number" value={String(draft.quantity)} onChange={v=>setDraft({...draft, quantity:Number(v)})}/><Field label="Low stock threshold" type="number" value={String(draft.low_stock_threshold)} onChange={v=>setDraft({...draft, low_stock_threshold:Number(v)})}/><label className="wide">Bottle / label photo<input type="file" accept="image/*" capture="environment" onChange={e=>onPhoto(e.target.files?.[0])}/></label><label className="wide">Notes<textarea value={draft.notes} onChange={e=>setDraft({...draft, notes:e.target.value})}/></label></div><button className="vault-button full" onClick={saveItem}>{editingId ? "Save changes" : "Add to vault"}</button></Panel>}
    {page === "Reminders" && <Panel title="Reminder Settings"><p className="muted">In-app reminder rules are isolated here so email reminders can be added later.</p>{[["remind_90_days","90 days"],["remind_30_days","30 days"],["remind_7_days","7 days"],["remind_expired","Expired"]].map(([k,l])=><label className="toggle" key={k}><span>{l}</span><input type="checkbox" checked={Boolean(settings[k as keyof ReminderSettings])} onChange={e=>setSettings({...settings,[k]:e.target.checked})}/></label>)}</Panel>}
    {page === "Reports" && <Panel title="Printable inventory report"><button className="vault-button" onClick={() => print()}>Print report</button><button className="vault-button ghost" onClick={exportCsv}>Export CSV</button><div className="report-table"><table><thead><tr><th>Item</th><th>Lot</th><th>Opened</th><th>Expires</th><th>Status</th><th>Qty</th></tr></thead><tbody>{enriched.map(i=><tr key={i.id}><td>{i.brand} {i.product_name}</td><td>{i.lot_number}</td><td>{i.date_opened}</td><td>{i.expiration_date}</td><td>{i.status}</td><td>{i.quantity}</td></tr>)}</tbody></table></div></Panel>}
    <nav className="bottom-nav">{nav.map(n=><button className={page===n ? "active" : ""} key={n} onClick={()=>setPage(n)}>{n}</button>)}</nav>
  </main>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="vault-panel"><h2>{title}</h2>{children}</section>; }
function Field({ label, value, onChange, type="text" }: { label: string; value: string; onChange: (v:string)=>void; type?: string }) { return <label>{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)}/></label>; }
function ItemRow({ item, onEdit, onDelete }: { item: InventoryItem; onEdit: (i:InventoryItem)=>void; onDelete:(id:string)=>void }) { return <article className="item-row"><div className="label-thumb">{item.image_url ? <Image src={item.image_url} alt="Bottle label" width={52} height={52} unoptimized /> : item.product_name.slice(0,1)}</div><div><strong>{item.brand} {item.product_name}</strong><p>{item.category} • {item.shade || "No shade"} • Lot {item.lot_number}</p><p>Opened {item.date_opened} • Expires {item.expiration_date}</p></div><span className={`pill ${item.status.toLowerCase()}`}>{item.status}</span><div className="row-actions"><button onClick={()=>onEdit(item)}>Edit</button><button onClick={()=>onDelete(item.id)}>Delete</button></div></article>; }
