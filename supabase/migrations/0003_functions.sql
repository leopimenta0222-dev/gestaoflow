-- GestãoFlow — 0003: Função de venda atômica
-- Recebe os itens como jsonb: [{ "product_id": "...", "qtd": 2 }, ...]
-- Numa transação só: valida estoque, cria a venda + itens e baixa o estoque.

create or replace function create_sale(p_itens jsonb)
returns sales
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item  jsonb;
  v_prod  products;
  v_qtd   int;
  v_total numeric := 0;
  v_itens int := 0;
  v_sale  sales;
begin
  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'Adicione ao menos um item à venda.';
  end if;

  insert into sales (total, qtd_itens) values (0, 0) returning * into v_sale;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item->>'qtd')::int;

    select * into v_prod from products where id = (v_item->>'product_id')::uuid for update;
    if v_prod.id is null then
      raise exception 'Produto inválido.';
    end if;
    if v_qtd <= 0 then
      raise exception 'Quantidade inválida.';
    end if;
    if v_prod.estoque < v_qtd then
      raise exception 'Estoque insuficiente para %.', v_prod.nome;
    end if;

    insert into sale_items (sale_id, product_id, qtd, preco_unit, custo_unit)
      values (v_sale.id, v_prod.id, v_qtd, v_prod.preco, v_prod.custo);

    update products set estoque = estoque - v_qtd where id = v_prod.id;

    v_total := v_total + v_prod.preco * v_qtd;
    v_itens := v_itens + v_qtd;
  end loop;

  update sales set total = v_total, qtd_itens = v_itens where id = v_sale.id returning * into v_sale;
  return v_sale;
end;
$$;

grant execute on function create_sale(jsonb) to authenticated;
