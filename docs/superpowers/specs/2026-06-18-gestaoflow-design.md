# GestãoFlow — Café & Cia · Design / Spec

> Painel de gestão (ferramenta interna) para pequeno negócio. Projeto 2 do portfólio
> freelance do Leonardo Pimenta. Data: 2026-06-18.

## 1. Objetivo
Mostrar capacidade de entregar **ferramenta interna com dados**: CRUD completo,
dashboard com gráficos, relatórios e controle de estoque. Tipo de sistema que empresa
paga caro. Tem que ficar bonito, profissional e deployado.

## 2. Negócio fictício
**Café & Cia** — cafeteria. Controla produtos, vendas, estoque e faturamento.

## 3. Identidade visual ("Bold Espresso")
- **Conteúdo (claro):** fundo `#f4efe9`, cards `#ffffff`, texto `#2b211b`.
- **Sidebar (sempre escura):** `#2b211b`, itens creme, item ativo dourado.
- **Acento:** dourado `#b5731f` (texto/ações) e `#e0a458` (gráficos/destaques).
- **Modo escuro (toggle):** fundo `#1a1410`, superfícies `#241c16`, bordas suaves,
  acento dourado. Persistido em localStorage; alterna via classe na `<html>`.
- **Tipografia:** títulos **Sora**; corpo **Hanken Grotesk** (com `tabular-nums` nos números).
- **Gráficos:** Recharts estilizado com a paleta.
- **Tom:** SaaS premium, alto contraste, branded.

## 4. Stack
- React 19 + Vite + Tailwind CSS v4, React Router, TanStack Query.
- Recharts (gráficos). Datas: date-fns (pt-BR).
- Supabase (Postgres + Auth + RLS).
- Exportação: CSV (gerado no front) e PDF (jsPDF + autotable).
- Camada de dados `src/lib/db/*` com **modo demo sempre-no-ar** (sem env → localStorage;
  com env → Supabase real), mesmo padrão do AgendaPro.
- Deploy: Vercel. Repo: GitHub.

## 5. Rotas / telas (tudo protegido por login)
- `/login`
- `/` — Dashboard
- `/produtos` — CRUD de produtos
- `/vendas` — lista de vendas + filtro por período
- `/vendas/nova` — PDV (registrar venda)
- `/relatorios` — relatórios + exportação CSV/PDF

## 6. Modelo de dados (Postgres / Supabase)
- **`products`**: `id`, `nome`, `categoria` (texto), `preco` numeric, `custo` numeric,
  `estoque` int, `estoque_minimo` int (default 5), `ativo` bool, `created_at`.
- **`sales`**: `id`, `created_at`, `total` numeric, `qtd_itens` int.
- **`sale_items`**: `id`, `sale_id` (fk, on delete cascade), `product_id` (fk),
  `qtd` int, `preco_unit` numeric, `custo_unit` numeric.
- RLS: acesso só para `authenticated` (ferramenta interna, sem público).

## 7. Registro de venda + baixa de estoque (núcleo)
**Função `create_sale(p_itens jsonb)` no Postgres**, em transação única:
1. Para cada item: lê preço/custo/estoque atuais do produto.
2. Valida estoque suficiente — senão `raise exception 'Estoque insuficiente para <produto>.'`.
3. Insere `sales` (total e qtd_itens calculados).
4. Insere os `sale_items` (gravando `preco_unit`/`custo_unit` do momento).
5. **Baixa o estoque** de cada produto.
6. Retorna a venda criada.

Atômico: nunca grava venda sem baixar estoque, nunca baixa pela metade.
> Alternativa descartada: inserts/updates soltos no front (risco de inconsistência).

## 8. Dashboard
- **Cards** com valor + **comparação vs período anterior** (ex: "+12%") + **sparkline**:
  Faturamento do mês, Nº de vendas, Ticket médio, Produto mais vendido.
- **Alerta de estoque baixo**: contador + lista de produtos abaixo do mínimo (destaque).
- **Gráfico principal**: faturamento por dia (últimos 30 dias) com alternância mês a mês.
- **Donut por categoria** (participação no faturamento) + **feed de vendas recentes**.
- Métricas/gráficos calculados a partir das vendas (uma implementação, igual em demo e Supabase).

## 9. Relatórios + exportação
- Filtro por período (data início/fim) com presets (hoje, 7d, 30d, mês, tudo).
- **Faturamento por período**, **por categoria** (com **lucro** = receita − custo e margem %),
  **top produtos** (qtd e receita).
- **Exportar CSV** e **PDF** (cabeçalho com marca Café & Cia, período e totais).

## 10. Extras / inovações além do brief
- Sparklines e deltas de período nos cards.
- Donut por categoria + feed de vendas recentes no dashboard.
- Lucro/margem nos relatórios.
- **Toasts** de feedback, **skeleton loaders** e empty states caprichados.
- PDV ágil (busca de produto, clique para adicionar, steppers de quantidade, total ao vivo).

## 11. Seed realista
- ~18 produtos de cafeteria (cafés, salgados, doces, bebidas) com preço/custo/estoque;
  alguns abaixo do mínimo (pro alerta aparecer).
- **Vendas distribuídas por ~4 meses** com variação realista (volume por dia/semana),
  itens coerentes — pros gráficos ficarem cheios e bonitos.

## 12. Critério de "pronto" (do brief)
- [ ] Cadastrar produto, registrar venda e ver refletir no dashboard.
- [ ] Gráficos com dados reais do banco.
- [ ] Relatórios filtram por período corretamente.
- [ ] Estoque baixa ao vender.
- [ ] Deploy na Vercel + repo no GitHub com README.
- [ ] Seed com bastante dado realista.
- [ ] Exportar CSV/PDF e alerta de estoque baixo funcionando.
- [ ] Modo claro/escuro com toggle.

## 13. Verificação
Rodar no navegador (Playwright/Chrome): cadastrar produto, registrar venda no PDV,
conferir baixa de estoque e atualização do dashboard/gráficos, filtrar relatório por
período, exportar CSV/PDF, alternar tema. Evidência antes de declarar pronto.

## 14. Deploy / handoff
Repo no GitHub + Vercel. Modo demo já publica sem Supabase; instruções de Supabase
(migrations + seed + env) no README.

## 15. Fora de escopo (YAGNI)
- Multiusuário/multi-loja real (estrutura simples, 1 negócio).
- Pagamentos/integração fiscal.
- Categorias como tabela separada (fica como texto no produto).
