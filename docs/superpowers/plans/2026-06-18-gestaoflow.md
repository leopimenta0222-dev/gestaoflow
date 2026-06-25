# GestãoFlow (Café & Cia) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Painel de gestão (ferramenta interna) para a cafeteria fictícia "Café & Cia" — CRUD de produtos, PDV com baixa de estoque atômica, dashboard com gráficos, relatórios e exportação.

**Architecture:** SPA React 19 (Vite) protegida por login (Supabase Auth); camada de dados `src/lib/db` com modo demo (localStorage) quando não há Supabase; registro de venda numa função Postgres atômica que baixa estoque; métricas/gráficos calculados por funções puras testáveis em `src/lib/analytics.js`.

**Tech Stack:** React 19, Vite, Tailwind v4 (tema claro/escuro por classe), React Router, TanStack Query, Recharts, react-hook-form + zod, date-fns (pt-BR), jsPDF + jspdf-autotable, lucide-react, Supabase. JavaScript (JSX).

**Testing:** TDD para analytics e helpers (vitest); verificação da UI no navegador (Playwright/Chrome). Commits frequentes.

---

## File Structure
```
gestaoflow/
├─ index.html                       # fontes Sora + Hanken Grotesk
├─ supabase/migrations/0001_schema.sql  0002_rls.sql  0003_functions.sql
├─ supabase/seed.sql
├─ src/
│  ├─ main.jsx  App.jsx  index.css
│  ├─ lib/
│  │  ├─ supabase.js  format.js  csv.js  pdf.js  analytics.js
│  │  └─ db/  index? products.js  sales.js  auth.js  demo.js
│  ├─ hooks/data.js
│  ├─ context/ ThemeProvider.jsx  AuthProvider.jsx  ToastProvider.jsx
│  ├─ components/ ui.jsx  Modal.jsx  Sidebar.jsx  Topbar.jsx  ProtectedRoute.jsx
│  │             StatCard.jsx  charts/ (RevenueChart, CategoryDonut)
│  ├─ layouts/ AppLayout.jsx
│  └─ pages/ Login.jsx  Dashboard.jsx  Products.jsx  Sales.jsx  NewSale.jsx  Reports.jsx  NotFound.jsx
└─ README.md
```

---

## Phase 0 — Foundation

### Task 0.1: Scaffold + deps
- [ ] `npm create vite@latest . -- --template react` (ou scaffold manual reaproveitando o do AgendaPro).
- [ ] `npm i react-router-dom @supabase/supabase-js @tanstack/react-query recharts react-hook-form zod date-fns lucide-react jspdf jspdf-autotable`
- [ ] `npm i -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite vitest`
- [ ] `vite.config.js` com `react()` + `tailwindcss()`. Verificar `npm run dev`. Commit: `chore: scaffold`.

### Task 0.2: Fontes + tokens (claro/escuro, Bold Espresso)
**Files:** `index.html`, `src/index.css`
- [ ] `index.html`: Google Fonts **Sora** (500–700) + **Hanken Grotesk** (400–600).
- [ ] `src/index.css`:
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-display: "Sora", sans-serif;
  --font-body: "Hanken Grotesk", system-ui, sans-serif;
  --color-sidebar: #2b211b;     /* sempre escura */
  --color-sidebar-text: #e9ddd0;
  --color-accent: #b5731f;
  --color-accent-bright: #e0a458;
}

/* Tokens semânticos — tema claro (default) */
:root {
  --bg: #f4efe9; --surface: #ffffff; --surface-2: #f7f2ec;
  --border: #e6dccf; --text: #2b211b; --text-muted: #8a7766; --text-faint: #b3a392;
}
/* Tema escuro */
.dark {
  --bg: #1a1410; --surface: #241c16; --surface-2: #2c231c;
  --border: #3a2f26; --text: #efe7dd; --text-muted: #a8978a; --text-faint: #75665a;
}

body { background: var(--bg); color: var(--text); font-family: var(--font-body);
  -webkit-font-smoothing: antialiased; transition: background .2s, color .2s; }
h1,h2,h3,h4 { font-family: var(--font-display); font-weight: 600; }
.tnum { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce){ *{transition:none!important} }
```
- [ ] Commit: `style: tokens claro/escuro (bold espresso)`.

### Task 0.3: Supabase client + env (reusar padrão AgendaPro)
- [ ] `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), `src/lib/supabase.js` exportando `supabase` e `isSupabaseConfigured`. Commit.

---

## Phase 1 — Banco de dados

### Task 1.1: Schema
**Files:** `supabase/migrations/0001_schema.sql`
```sql
create extension if not exists pgcrypto;
create table products (
  id uuid primary key default gen_random_uuid(),
  nome text not null, categoria text not null default 'Geral',
  preco numeric(10,2) not null check (preco >= 0),
  custo numeric(10,2) not null default 0 check (custo >= 0),
  estoque int not null default 0, estoque_minimo int not null default 5,
  ativo boolean not null default true, created_at timestamptz not null default now()
);
create table sales (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  total numeric(10,2) not null default 0, qtd_itens int not null default 0
);
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id),
  qtd int not null check (qtd > 0),
  preco_unit numeric(10,2) not null, custo_unit numeric(10,2) not null default 0
);
create index on sale_items(sale_id);
create index on sales(created_at);
```
- [ ] Commit: `feat(db): schema`.

### Task 1.2: RLS (somente autenticado)
**Files:** `0002_rls.sql`
```sql
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
create policy p_products on products for all to authenticated using (true) with check (true);
create policy p_sales on sales for all to authenticated using (true) with check (true);
create policy p_sale_items on sale_items for all to authenticated using (true) with check (true);
```
- [ ] Commit: `feat(db): rls`.

### Task 1.3: Função create_sale (atômica)
**Files:** `0003_functions.sql`
```sql
create or replace function create_sale(p_itens jsonb)
returns sales language plpgsql security definer set search_path = public as $$
declare v_item jsonb; v_prod products; v_qtd int;
        v_total numeric := 0; v_itens int := 0; v_sale sales;
begin
  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'Adicione ao menos um item à venda.'; end if;
  insert into sales(total, qtd_itens) values (0,0) returning * into v_sale;
  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item->>'qtd')::int;
    select * into v_prod from products where id = (v_item->>'product_id')::uuid for update;
    if v_prod.id is null then raise exception 'Produto inválido.'; end if;
    if v_qtd <= 0 then raise exception 'Quantidade inválida.'; end if;
    if v_prod.estoque < v_qtd then
      raise exception 'Estoque insuficiente para %.', v_prod.nome; end if;
    insert into sale_items(sale_id, product_id, qtd, preco_unit, custo_unit)
      values (v_sale.id, v_prod.id, v_qtd, v_prod.preco, v_prod.custo);
    update products set estoque = estoque - v_qtd where id = v_prod.id;
    v_total := v_total + v_prod.preco * v_qtd; v_itens := v_itens + v_qtd;
  end loop;
  update sales set total = v_total, qtd_itens = v_itens where id = v_sale.id returning * into v_sale;
  return v_sale;
end; $$;
grant execute on function create_sale(jsonb) to authenticated;
```
- [ ] Commit: `feat(db): create_sale atomico`.

### Task 1.4: Seed (produtos + ~4 meses de vendas)
**Files:** `supabase/seed.sql`
- [ ] ~18 produtos de cafeteria (categorias: Cafés, Salgados, Doces, Bebidas) com preço/custo/estoque; 2–3 abaixo do `estoque_minimo`.
- [ ] Gerar vendas dos últimos 120 dias:
```sql
do $$
declare v_day date; v_sale uuid; i int; v_prod products; v_qtd int; v_total numeric; v_itens int;
begin
  for v_day in select generate_series(current_date - 120, current_date, interval '1 day')::date loop
    for i in 1..(3 + floor(random()*10)::int) loop
      insert into sales(created_at, total, qtd_itens)
        values (v_day + interval '9 hours' + (random()*interval '10 hours'), 0, 0) returning id into v_sale;
      v_total := 0; v_itens := 0;
      for v_prod in select * from products where ativo order by random() limit (1+floor(random()*3)::int) loop
        v_qtd := 1 + floor(random()*3)::int;
        insert into sale_items(sale_id, product_id, qtd, preco_unit, custo_unit)
          values (v_sale, v_prod.id, v_qtd, v_prod.preco, v_prod.custo);
        v_total := v_total + v_prod.preco*v_qtd; v_itens := v_itens + v_qtd;
      end loop;
      update sales set total=v_total, qtd_itens=v_itens where id=v_sale;
    end loop;
  end loop;
end $$;
```
- [ ] Commit: `feat(db): seed`.

---

## Phase 2 — Dados, analytics, tema, auth

### Task 2.1: Camada de dados + demo backend
**Files:** `src/lib/db/*`, `src/hooks/data.js`
- [ ] `db/products.js`: list/create/update/remove. `db/sales.js`: `createSale(itens)` (rpc `create_sale`), `listSales({from,to})` retornando vendas **com itens e categoria do produto** (`select '*, sale_items(*, products(nome,categoria))'`), `getProductsForSale`. `db/auth.js` (reusar AgendaPro).
- [ ] `db/demo.js`: dados base (18 produtos) + vendas geradas em JS por ~120 dias (mesma forma do retorno do Supabase), persistidas em localStorage; `createSale` valida estoque, baixa e grava.
- [ ] Hooks TanStack: `useProducts`, `useProductMutations`, `useSales(range)`, `useCreateSale`.
- [ ] Commit: `feat(data): camada db + demo`.

### Task 2.2: analytics.js (TDD — funções puras)
**Files:** `src/lib/analytics.js`, `src/lib/analytics.test.js`
- [ ] **Testes primeiro** (vitest), depois implementar:
  - `revenueTotal(sales)` → soma de `total`.
  - `avgTicket(sales)` → total / nº vendas (0 se vazio).
  - `revenueByDay(sales, fromDate, toDate)` → `[{date, total}]` cobrindo todos os dias do range (dias sem venda = 0).
  - `revenueByCategory(sales)` → `[{categoria, receita, custo, lucro}]` a partir dos `sale_items`.
  - `topProducts(sales, n)` → `[{nome, qtd, receita}]` ordenado por receita.
  - `lowStock(products)` → produtos com `estoque <= estoque_minimo`.
  - `deltaPct(atual, anterior)` → variação % (trata anterior 0).
- [ ] Exemplos de teste:
```js
import { revenueTotal, avgTicket, deltaPct } from './analytics'
test('revenueTotal soma', () => expect(revenueTotal([{total:10},{total:5}])).toBe(15))
test('avgTicket vazio', () => expect(avgTicket([])).toBe(0))
test('deltaPct', () => expect(deltaPct(120,100)).toBe(20))
```
- [ ] `npm run test` verde. Commit: `feat: analytics + testes`.

### Task 2.3: format.js + ThemeProvider + AuthProvider + ToastProvider
**Files:** `src/lib/format.js`, `src/context/*`
- [ ] `format.js`: `formatBRL` (NBSP normalizado, igual AgendaPro), `formatDateShort/Long`, `formatPct`.
- [ ] `ThemeProvider`: estado `theme` ('light'|'dark'), aplica/remove `.dark` na `<html>`, persiste em localStorage, default 'light'; expõe `useTheme()`.
- [ ] `AuthProvider`: reusar do AgendaPro (session, signIn, signOut). Demo: `dono@cafe.com` / `cafe123`.
- [ ] `ToastProvider`: `useToast().show(msg, type)`, renderiza toasts empilhados (auto-some em 3s).
- [ ] Commit: `feat: tema, auth, toasts`.

---

## Phase 3 — App shell

### Task 3.1: UI primitives
**Files:** `src/components/ui.jsx`
- [ ] `cx`, `Button` (variantes solid/outline/ghost/subtle/danger usando `--accent`), `Card`, `Input`, `Select`, `Field`, `Badge`, `Spinner`, `Loading`, `Skeleton`, `Container`, `SectionTitle`, `EmptyState`. Suportam claro/escuro via tokens. Commit.

### Task 3.2: Sidebar + Topbar + layout + rotas
**Files:** `src/components/Sidebar.jsx Topbar.jsx ProtectedRoute.jsx`, `src/layouts/AppLayout.jsx`, `src/App.jsx`, `src/main.jsx`
- [ ] `Sidebar` (escura sempre): logo "Café & Cia", links (Dashboard, Produtos, Vendas, Relatórios), item ativo dourado; colapsa em drawer no mobile.
- [ ] `Topbar`: título da página + **toggle de tema** (sol/lua) + avatar/sair.
- [ ] `AppLayout` (sidebar + topbar + Outlet). `ProtectedRoute`. Rotas: `/login`, `/`, `/produtos`, `/vendas`, `/vendas/nova`, `/relatorios`, `*`.
- [ ] `main.jsx`: providers (QueryClient, Router, Theme, Auth, Toast).
- [ ] Commit: `feat: app shell + rotas`.

### Task 3.3: Login
**Files:** `src/pages/Login.jsx`
- [ ] Form email/senha (Supabase Auth), demo pré-preenchido quando `!isSupabaseConfigured` (`dono@cafe.com`/`cafe123`), erro amigável, redireciona pra `/`. Commit.

---

## Phase 4 — Produtos

### Task 4.1: CRUD de produtos
**Files:** `src/pages/Products.jsx`
- [ ] Tabela (nome, categoria, preço, custo, estoque com **badge de baixo estoque**, ativo) + busca + filtro por categoria. Modal de criar/editar (react-hook-form + zod: nome, categoria, preço, custo, estoque, estoque_minimo, ativo). Excluir com confirmação. Toast ao salvar. Verificar no navegador. Commit.

---

## Phase 5 — PDV (registrar venda)

### Task 5.1: Nova venda
**Files:** `src/pages/NewSale.jsx`
- [ ] Layout 2 colunas: esquerda = busca + grid de produtos (clique adiciona ao carrinho); direita = **carrinho** com itens, steppers de quantidade, remoção, **total ao vivo**, botão "Finalizar venda".
- [ ] Ao finalizar: `useCreateSale` → `create_sale`. Sucesso: toast + limpar carrinho + opção de ir pra lista. Erro (estoque insuficiente): toast vermelho com a mensagem da função.
- [ ] Bloquear adicionar acima do estoque disponível. Verificar no navegador (inclui caso de estoque insuficiente). Commit.

---

## Phase 6 — Vendas (lista)

### Task 6.1: Lista de vendas + filtro por período
**Files:** `src/pages/Sales.jsx`
- [ ] Filtro por período com presets (hoje, 7d, 30d, este mês, tudo) + range custom. Tabela (data/hora, nº itens, total) + total do período no topo. Expandir linha para ver itens da venda. Empty/skeleton states. Commit.

---

## Phase 7 — Dashboard

### Task 7.1: Cards + sparklines + deltas
**Files:** `src/pages/Dashboard.jsx`, `src/components/StatCard.jsx`
- [ ] 4 cards (Faturamento do mês, Nº de vendas, Ticket médio, Produto mais vendido) com valor (`.tnum`), **delta vs mês anterior** (`deltaPct`, verde/vermelho) e **sparkline** (Recharts `<LineChart>` mini) dos últimos 14 dias. Commit.

### Task 7.2: Gráfico principal + donut + low stock + recentes
**Files:** `src/pages/Dashboard.jsx`, `src/components/charts/RevenueChart.jsx CategoryDonut.jsx`
- [ ] `RevenueChart`: faturamento por dia (30 dias) com toggle "mês a mês" (Recharts `AreaChart`/`BarChart`, cor `--accent-bright`, tooltip BRL).
- [ ] `CategoryDonut`: participação por categoria (Recharts `PieChart` donut, legenda).
- [ ] **Alerta de estoque baixo**: card com contador + lista (`lowStock`).
- [ ] **Vendas recentes**: últimas 6 vendas. Verificar no navegador. Commit.

---

## Phase 8 — Relatórios + exportação

### Task 8.1: Relatórios
**Files:** `src/pages/Reports.jsx`
- [ ] Filtro de período (presets + custom). Três blocos: **Resumo** (receita, lucro, margem, nº vendas, ticket), **Por categoria** (tabela: receita, custo, lucro, margem%), **Top produtos** (tabela: qtd, receita). Tudo via `analytics.js`. Commit.

### Task 8.2: Exportar CSV + PDF
**Files:** `src/lib/csv.js`, `src/lib/pdf.js`, wire em `Reports.jsx`
- [ ] `csv.js`: `toCsv(rows, headers)` + download (Blob). **Teste**: `toCsv([{a:1,b:2}],['a','b'])` contém `"a,b"` e `"1,2"`.
- [ ] `pdf.js`: `exportReportPdf({ negocio, periodo, resumo, categorias, topProdutos })` usando jsPDF + autotable, com cabeçalho "Café & Cia", período e tabelas.
- [ ] Botões "Exportar CSV" / "Exportar PDF" no relatório. Verificar download no navegador. Commit.

---

## Phase 9 — Acabamento, deploy

### Task 9.1: Verificação ponta-a-ponta (navegador)
- [ ] Login; cadastrar produto; registrar venda no PDV; conferir baixa de estoque; ver dashboard/gráficos atualizarem; filtrar relatório por período; exportar CSV/PDF; alternar tema claro/escuro; checar mobile.

### Task 9.2: README + deploy
- [ ] README (o que é, stack, features, screenshots, como rodar, setup Supabase, deploy). GitHub via `gh repo create`. Vercel (handoff). Atualizar `00-PLANO-GERAL.md`.

---

## Self-review notes
- Cobertura do spec: identidade/tema(0.2, 2.3, 3.2), stack(0.1), rotas(3.2), modelo de dados(1.1), create_sale/estoque(1.3, 5.1), dashboard(7.1, 7.2), relatórios+export(8.1, 8.2), analytics(2.2), seed(1.4), extras(sparkline/delta 7.1; donut/recentes 7.2; lucro 8.1; toasts 2.3; low stock 7.2; PDV 5.1), pronto(9.1), deploy(9.2). ✔
- Sem placeholders nas partes críticas (SQL, tokens, create_sale, analytics, seed completos).
- Consistência: `create_sale(jsonb)`, `listSales({from,to})` com `sale_items(*, products(nome,categoria))`, analytics nomes (`revenueByDay`, `revenueByCategory`, `topProducts`, `lowStock`, `deltaPct`), tokens `--bg/--surface/--text/--accent`, demo login `dono@cafe.com`/`cafe123`.
