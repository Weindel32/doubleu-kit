-- Analisi ordine salvate dal Kit Builder (pagina "Analisi ordine").
-- Già applicata al progetto Supabase doubleu-kit come migrazione
-- "create_order_analyses". Qui come riferimento.
-- Si salvano solo scelte (builder inclusi), simulazione e impronta dei
-- builder: i numeri si ricalcolano sempre dai builder.
create table if not exists public.order_analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  club_key text not null,
  club_label text,
  data jsonb not null default '{}'::jsonb   -- { builders: [nomi], sim: { nome: { price, qty } }, fp: { nome: impronta }, totals }
);
create index if not exists order_analyses_club_key_idx on public.order_analyses (club_key);
alter table public.order_analyses enable row level security;
create policy "Allow all for authenticated" on public.order_analyses
  for all to authenticated using (true) with check (true);
