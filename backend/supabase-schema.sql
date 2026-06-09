create extension if not exists pgcrypto;

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  name text,
  email text unique,
  university_name text not null,
  city text not null,
  state text not null,
  country text not null,
  dob date not null,
  password_hash text not null,
  wallet_balance numeric(12, 2) not null default 0,
  status text not null default 'active',
  card_status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table students add column if not exists name text;
alter table students add column if not exists email text unique;
alter table students add column if not exists status text not null default 'active';
alter table students add column if not exists card_status text not null default 'active';

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
  sku text,
  category text,
  stock_qty integer not null default 0,
  low_stock_threshold integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table products add column if not exists sku text;
alter table products add column if not exists category text;
alter table products add column if not exists stock_qty integer not null default 0;
alter table products add column if not exists low_stock_threshold integer not null default 5;
alter table products add column if not exists is_active boolean not null default true;

create table if not exists payment_devices (
  id uuid primary key default gen_random_uuid(),
  device_id text unique not null,
  device_secret_hash text not null,
  shopkeeper_id uuid not null references shopkeepers(id) on delete cascade,
  university_id uuid references universities(id) on delete set null,
  label text,
  status text not null default 'active',
  state text not null default 'idle',
  last_seen timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payment_sessions (
  id uuid primary key default gen_random_uuid(),
  payment_session_id text unique not null,
  device_id uuid not null references payment_devices(id) on delete cascade,
  shopkeeper_id uuid not null references shopkeepers(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  items jsonb not null default '[]'::jsonb,
  status text not null default 'waiting-card',
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  transaction_id uuid,
  failure_reason text,
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

create table if not exists wallets (
  student_id uuid primary key references students(id) on delete cascade,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

create table if not exists rfid_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  uid_hash text unique not null,
  uid_last4 text,
  label text,
  status text not null default 'active',
  issued_by uuid references universities(id) on delete set null,
  issued_at timestamptz not null default now(),
  frozen_at timestamptz,
  lost_reported_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  receipt_no text unique not null,
  student_id uuid not null references students(id) on delete restrict,
  shopkeeper_id uuid references shopkeepers(id) on delete restrict,
  card_id uuid references rfid_cards(id) on delete set null,
  device_id uuid references payment_devices(id) on delete set null,
  payment_session_id uuid references payment_sessions(id) on delete set null,
  type text not null default 'purchase',
  amount numeric(12, 2) not null check (amount >= 0),
  balance_before numeric(12, 2) not null,
  balance_after numeric(12, 2) not null,
  products jsonb not null default '[]'::jsonb,
  status text not null default 'success',
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table transactions alter column shopkeeper_id drop not null;
alter table transactions add column if not exists device_id uuid references payment_devices(id) on delete set null;
alter table transactions add column if not exists payment_session_id uuid references payment_sessions(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'payment_sessions_transaction_id_fkey'
      and table_name = 'payment_sessions'
  ) then
    alter table payment_sessions
      add constraint payment_sessions_transaction_id_fkey
      foreign key (transaction_id) references transactions(id) on delete set null;
  end if;
end $$;

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  reason text,
  status text not null default 'processed',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role text not null,
  recipient_id uuid,
  title text not null,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_role text not null,
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_shopkeepers_university_registration_id
  on shopkeepers(university_registration_id);

create index if not exists idx_products_shopkeeper_id
  on products(shopkeeper_id);

create index if not exists idx_payment_devices_shopkeeper_id
  on payment_devices(shopkeeper_id);

create index if not exists idx_payment_devices_device_id
  on payment_devices(device_id);

create index if not exists idx_payment_sessions_public_id
  on payment_sessions(payment_session_id);

create index if not exists idx_payment_sessions_device_id
  on payment_sessions(device_id);

create index if not exists idx_wallet_topups_student_id
  on wallet_topups(student_id);

create index if not exists idx_rfid_cards_student_id
  on rfid_cards(student_id);

create index if not exists idx_rfid_cards_uid_hash
  on rfid_cards(uid_hash);

create index if not exists idx_transactions_student_id
  on transactions(student_id);

create index if not exists idx_transactions_shopkeeper_id
  on transactions(shopkeeper_id);

create index if not exists idx_transactions_device_id
  on transactions(device_id);

create index if not exists idx_transactions_created_at
  on transactions(created_at desc);

create index if not exists idx_notifications_recipient
  on notifications(recipient_role, recipient_id);

create index if not exists idx_audit_logs_action
  on audit_logs(action, created_at desc);

-- Temporary RFID testing layer. This is intentionally separate from the
-- production students/transactions schema so test data does not disturb
-- real onboarding, card issuance, or wallet records.
create table if not exists rfid_test_students (
  id serial primary key,
  student_id varchar(50) unique,
  name varchar(100),
  email varchar(150),
  rfid_uid varchar(50) unique,
  wallet_balance int default 0,
  status varchar(20) default 'active',
  created_at timestamp default now()
);

create table if not exists rfid_test_transactions (
  id serial primary key,
  payment_id varchar(50),
  device_id varchar(50),
  student_id varchar(50),
  uid varchar(50),
  amount int,
  balance_after int,
  status varchar(20),
  failure_reason text,
  created_at timestamp default now()
);

alter table rfid_test_transactions add column if not exists payment_id varchar(50);
alter table rfid_test_transactions add column if not exists device_id varchar(50);
alter table rfid_test_transactions add column if not exists failure_reason text;

insert into rfid_test_students (
  student_id,
  name,
  email,
  rfid_uid,
  wallet_balance
)
values
  (
    '2024010007368',
    'Harsh Dev Singh',
    '2024010007368@student.unitap.test',
    '6EA2D8DB',
    1000
  ),
  (
    '2025010012892',
    'Sehajpreet Kaur',
    '2025010012892@student.unitap.test',
    '1391E839',
    1000
  ),
  (
    '2025010007274',
    'Ankita Rani',
    '2025010007274@student.unitap.test',
    '83B8B039',
    1000
  ),
  (
    '2025010003544',
    'Arshnoor Kaur',
    '2025010003544@student.unitap.test',
    'C3F4CB38',
    1000
  )
on conflict (rfid_uid) do update set
  student_id = excluded.student_id,
  name = excluded.name,
  email = excluded.email,
  wallet_balance = excluded.wallet_balance,
  status = 'active';
