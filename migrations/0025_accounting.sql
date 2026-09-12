-- Accounting — the business's own books, visible only to admins. A lightweight
-- double-entry ledger: every invoice, payment, expense, accrual and prepayment
-- release posts a balanced journal against a chart of ledger accounts, and the
-- monthly profit and loss and balance sheet are derived from those journals.
-- Cost centres tag journal lines so the profit and loss can be cut by centre.
-- Invoices are numbered from accounting_settings at creation via
-- allocate_invoice_number() so two admins can never take the same number.

begin;

create or replace function public.is_accounting_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin);
$$;

create table public.accounting_settings (
  id boolean primary key default true check (id),
  company_name text not null default '',
  company_address text not null default '',
  company_email text not null default '',
  payment_instructions text not null default '',
  payment_terms_days integer not null default 30,
  financial_year_start_month integer not null default 4
    check (financial_year_start_month between 1 and 12),
  invoice_prefix text not null default 'INV',
  next_invoice_number integer not null default 1,
  updated_at timestamptz not null default now()
);

insert into public.accounting_settings default values;

create table public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  account_type text not null
    check (account_type in ('asset', 'liability', 'equity', 'income', 'expense')),
  is_system boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.ledger_accounts (code, name, account_type, is_system) values
  ('1100', 'Trade debtors', 'asset', true),
  ('1200', 'Bank', 'asset', true),
  ('1300', 'Prepayments', 'asset', true),
  ('2100', 'Trade creditors', 'liability', true),
  ('2200', 'Accruals', 'liability', true),
  ('3000', 'Owner''s capital', 'equity', false),
  ('3100', 'Drawings', 'equity', false),
  ('4000', 'Sales', 'income', true),
  ('4100', 'Other income', 'income', false),
  ('5000', 'Cost of sales', 'expense', false),
  ('6000', 'Software and subscriptions', 'expense', false),
  ('6100', 'Marketing', 'expense', false),
  ('6200', 'Travel', 'expense', false),
  ('6300', 'Office and admin', 'expense', false),
  ('6400', 'Professional fees', 'expense', false),
  ('6500', 'Bank charges', 'expense', false),
  ('6900', 'Other expenses', 'expense', false);

create table public.cost_centres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text not null default '',
  email text not null default '',
  address text not null default '',
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.journals (
  id uuid primary key default gen_random_uuid(),
  journal_date date not null,
  description text not null,
  kind text not null check (kind in (
    'manual', 'invoice', 'invoice_void', 'invoice_payment', 'expense', 'expense_payment',
    'accrual', 'accrual_reversal', 'prepayment_release'
  )),
  reverses_journal_id uuid references public.journals (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.journals (id) on delete cascade,
  account_id uuid not null references public.ledger_accounts (id),
  cost_centre_id uuid references public.cost_centres (id) on delete set null,
  debit numeric(12, 2) not null default 0 check (debit >= 0),
  credit numeric(12, 2) not null default 0 check (credit >= 0),
  position integer not null default 0,
  check (debit = 0 or credit = 0)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id),
  invoice_number integer not null unique,
  status text not null default 'draft' check (status in ('draft', 'issued', 'paid', 'void')),
  issue_date date not null,
  due_date date not null,
  reference text not null default '',
  notes text not null default '',
  issued_journal_id uuid references public.journals (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  income_account_id uuid not null references public.ledger_accounts (id),
  cost_centre_id uuid references public.cost_centres (id) on delete set null,
  position integer not null default 0
);

create table public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  paid_on date not null,
  amount numeric(12, 2) not null check (amount > 0),
  journal_id uuid references public.journals (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  supplier text not null,
  description text not null default '',
  amount numeric(12, 2) not null check (amount > 0),
  expense_account_id uuid not null references public.ledger_accounts (id),
  cost_centre_id uuid references public.cost_centres (id) on delete set null,
  paid_on date,
  recorded_journal_id uuid references public.journals (id) on delete set null,
  payment_journal_id uuid references public.journals (id) on delete set null,
  created_at timestamptz not null default now()
);

create index journals_by_date on public.journals (journal_date);
create index journal_lines_by_journal on public.journal_lines (journal_id, position);
create index journal_lines_by_account on public.journal_lines (account_id);
create index invoices_by_client on public.invoices (client_id, issue_date desc);
create index invoice_lines_by_invoice on public.invoice_lines (invoice_id, position);
create index expenses_by_date on public.expenses (expense_date desc);

create view public.ledger_entries with (security_invoker = true) as
  select
    journal_lines.id,
    journals.id as journal_id,
    journals.journal_date,
    journals.description,
    journals.kind,
    ledger_accounts.id as account_id,
    ledger_accounts.code as account_code,
    ledger_accounts.name as account_name,
    ledger_accounts.account_type,
    journal_lines.cost_centre_id,
    journal_lines.debit,
    journal_lines.credit
  from public.journal_lines
  join public.journals on journals.id = journal_lines.journal_id
  join public.ledger_accounts on ledger_accounts.id = journal_lines.account_id;

create or replace function public.allocate_invoice_number()
returns integer language sql volatile security definer set search_path = public as $$
  update accounting_settings
  set next_invoice_number = next_invoice_number + 1, updated_at = now()
  where id and is_accounting_admin()
  returning next_invoice_number - 1;
$$;

alter table public.accounting_settings enable row level security;
alter table public.ledger_accounts enable row level security;
alter table public.cost_centres enable row level security;
alter table public.clients enable row level security;
alter table public.journals enable row level security;
alter table public.journal_lines enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.expenses enable row level security;

create policy "Admins manage accounting settings" on public.accounting_settings
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage ledger accounts" on public.ledger_accounts
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage cost centres" on public.cost_centres
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage clients" on public.clients
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage journals" on public.journals
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage journal lines" on public.journal_lines
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage invoices" on public.invoices
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage invoice lines" on public.invoice_lines
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage invoice payments" on public.invoice_payments
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());
create policy "Admins manage expenses" on public.expenses
  for all using (public.is_accounting_admin()) with check (public.is_accounting_admin());

commit;
