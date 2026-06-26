create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  product_name text,
  brand text,
  category text,
  shade text,
  lot_number text,
  date_opened date,
  expiration_date date,
  quantity numeric,
  low_stock_threshold numeric,
  notes text,
  image_url text,
  status text
);

create table if not exists reminder_settings (
  id uuid primary key default gen_random_uuid(),
  remind_90_days boolean default true,
  remind_30_days boolean default true,
  remind_7_days boolean default true,
  remind_expired boolean default true
);
