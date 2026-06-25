-- GestãoFlow — 0002: Row Level Security
-- Ferramenta interna: acesso somente para usuários autenticados (o dono).

alter table products   enable row level security;
alter table sales      enable row level security;
alter table sale_items enable row level security;

drop policy if exists p_products on products;
create policy p_products on products for all to authenticated using (true) with check (true);

drop policy if exists p_sales on sales;
create policy p_sales on sales for all to authenticated using (true) with check (true);

drop policy if exists p_sale_items on sale_items;
create policy p_sale_items on sale_items for all to authenticated using (true) with check (true);
