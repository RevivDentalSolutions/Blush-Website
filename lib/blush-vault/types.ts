export type Category = "Pigment" | "Needle" | "Numbing" | "ProCell" | "Aftercare" | "Disposable" | "Other";
export type ExpirationStatus = "Expired" | "Urgent" | "Soon" | "Watch" | "Good";

export type InventoryItem = {
  id: string;
  created_at: string;
  updated_at: string;
  product_name: string;
  brand: string;
  category: Category;
  shade: string;
  lot_number: string;
  date_opened: string;
  expiration_date: string;
  quantity: number;
  low_stock_threshold: number;
  notes: string;
  image_url: string;
  status: ExpirationStatus;
};

export type ReminderSettings = {
  id: string;
  remind_90_days: boolean;
  remind_30_days: boolean;
  remind_7_days: boolean;
  remind_expired: boolean;
};
