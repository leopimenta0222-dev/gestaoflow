-- GestãoFlow — Café & Cia
-- 0001: Schema (produtos, vendas, itens de venda)

create extension if not exists pgcrypto;

create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  categoria      text not null default 'Geral',
  preco          numeric(10,2) not null check (preco >= 0),
  custo          numeric(10,2) not null default 0 check (custo >= 0),
  estoque        int not null default 0,
  estoque_minimo int not null default 5,
  ativo          boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists sales (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  total      numeric(10,2) not null default 0,
  qtd_itens  int not null default 0
);

create table if not exists sale_items (
  id         uuid primary key default gen_random_uuid(),
  sale_id    uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id),
  qtd        int not null check (qtd > 0),
  preco_unit numeric(10,2) not null,
  custo_unit numeric(10,2) not null default 0
);

create index if not exists sale_items_sale_idx on sale_items(sale_id);
create index if not exists sales_created_idx on sales(created_at);
create index if not exists products_categoria_idx on products(categoria);
