# Migrations

Files `0001`–`0051` are the shared history of Your Business Today, from before the
split into a consultancy (Your Business Today) and a product (Your Brain Today).
They are kept for provenance. Several of them create consultancy tables — projects,
tasks, goals, clients, people, accounting — that this database does not have.

The Your Brain Today database was not built by replaying them. It was created on
12 September 2026 from a snapshot of the live production schema, restricted to the
brain tables, and the schema in Supabase is the source of truth for what exists today.

New migrations start at `0052` and are the only ones that have been applied here.
