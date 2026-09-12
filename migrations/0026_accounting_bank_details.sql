-- Bank details for invoices — held as their own fields on accounting_settings
-- so every invoice prints account name, sort code and account number with the
-- invoice number as the payment reference. Seeds the company's current account.

begin;

alter table public.accounting_settings
  add column bank_account_name text not null default '',
  add column bank_account_number text not null default '',
  add column bank_sort_code text not null default '';

update public.accounting_settings
set
  company_name = case when company_name = '' then 'Your Business Today Ltd' else company_name end,
  bank_account_name = 'Your Business Today Ltd',
  bank_account_number = '42213507',
  bank_sort_code = '608371',
  updated_at = now()
where id;

commit;
