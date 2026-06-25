-- GestãoFlow — seed Café & Cia
-- Limpa e repovoa. Gera ~120 dias de vendas para os gráficos ficarem cheios.

truncate sale_items, sales, products restart identity cascade;

-- Produtos (alguns abaixo do estoque mínimo, de propósito, p/ o alerta)
insert into products (nome, categoria, preco, custo, estoque, estoque_minimo) values
  ('Espresso',            'Cafés',    6.00, 1.50, 100, 10),
  ('Cappuccino',          'Cafés',    9.00, 2.50,  80, 10),
  ('Café com Leite',      'Cafés',    7.00, 2.00,  90, 10),
  ('Latte',               'Cafés',   10.00, 3.00,  70, 10),
  ('Mocha',               'Cafés',   12.00, 3.50,  60, 10),
  ('Café Coado',          'Cafés',    5.00, 1.20, 120, 10),
  ('Pão de Queijo',       'Salgados', 5.50, 1.80,  40,  8),
  ('Coxinha',             'Salgados', 8.00, 3.00,  30,  8),
  ('Misto Quente',        'Salgados', 9.50, 3.50,  25,  8),
  ('Empada de Frango',    'Salgados', 7.50, 2.80,   3,  8),  -- baixo
  ('Croissant',           'Salgados', 8.50, 3.20,  20,  8),
  ('Bolo de Cenoura',     'Doces',    8.00, 2.50,  15,  6),
  ('Brownie',             'Doces',    9.00, 3.00,   2,  6),  -- baixo
  ('Cookie',              'Doces',    6.00, 1.80,  50,  6),
  ('Cheesecake',          'Doces',   12.00, 4.00,  12,  6),
  ('Suco de Laranja',     'Bebidas',  8.00, 2.50,  35,  8),
  ('Água Mineral',        'Bebidas',  4.00, 1.00, 100, 10),
  ('Chocolate Quente',    'Bebidas', 11.00, 3.50,   4,  6);  -- baixo

-- Vendas dos últimos 120 dias (não baixam estoque — é histórico)
do $$
declare
  v_day   date;
  v_sale  uuid;
  i       int;
  v_prod  products;
  v_qtd   int;
  v_total numeric;
  v_itens int;
begin
  for v_day in select generate_series(current_date - 120, current_date, interval '1 day')::date loop
    -- fim de semana movimenta mais
    for i in 1..(case when extract(dow from v_day) in (0,6) then 8 else 4 end + floor(random()*8)::int) loop
      insert into sales (created_at, total, qtd_itens)
        values (v_day + interval '8 hours' + (random() * interval '11 hours'), 0, 0)
        returning id into v_sale;
      v_total := 0; v_itens := 0;
      for v_prod in
        select * from products where ativo order by random() limit (1 + floor(random()*3)::int)
      loop
        v_qtd := 1 + floor(random()*3)::int;
        insert into sale_items (sale_id, product_id, qtd, preco_unit, custo_unit)
          values (v_sale, v_prod.id, v_qtd, v_prod.preco, v_prod.custo);
        v_total := v_total + v_prod.preco * v_qtd;
        v_itens := v_itens + v_qtd;
      end loop;
      update sales set total = v_total, qtd_itens = v_itens where id = v_sale;
    end loop;
  end loop;
end $$;
