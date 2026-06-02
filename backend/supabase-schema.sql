create extension if not exists pgcrypto;

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  university_name text not null,
  city text not null,
  state text not null,
  country text not null,
  dob date not null,
  password_hash text not null,
  wallet_balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  official_email text unique not null,
  phone text not null,
  website text not null,
  registration_id text unique not null,
  password_hash text not null,
  status text not null default 'pending-approval',
  created_at timestamptz not null default now()
);

create table if not exists shopkeepers (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null,
  location text not null,
  email text unique not null,
  phone text unique not null,
  university_registration_id text not null references universities(registration_id) on update cascade,
  password_hash text not null,
  status text not null default 'pending-approval',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  shopkeeper_id uuid not null references shopkeepers(id) on delete cascade,
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists super_admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists auth_events (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  identifier text not null,
  created_at timestamptz not null default now()
);

create table if not exists signup_events (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  identifier text not null,
  created_at timestamptz not null default now()
);

create table if not exists wallet_topups (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'created',
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz not null default now()
);

create index if not exists idx_shopkeepers_university_registration_id
  on shopkeepers(university_registration_id);

create index if not exists idx_products_shopkeeper_id
  on products(shopkeeper_id);

create index if not exists idx_wallet_topups_student_id
  on wallet_topups(student_id);
