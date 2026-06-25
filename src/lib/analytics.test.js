import { describe, it, expect } from 'vitest'
import {
  revenueTotal, avgTicket, deltaPct, revenueByDay, revenueByCategory, topProducts, mostSold, lowStock,
} from './analytics'

// Datas construídas como locais (à prova de fuso no teste)
const sales = [
  {
    created_at: new Date(2026, 5, 1, 10).toISOString(),
    total: 30,
    items: [
      { produto_nome: 'Espresso', categoria: 'Cafés', qtd: 2, preco_unit: 6, custo_unit: 1.5 },
      { produto_nome: 'Brownie', categoria: 'Doces', qtd: 2, preco_unit: 9, custo_unit: 3 },
    ],
  },
  {
    created_at: new Date(2026, 5, 3, 10).toISOString(),
    total: 18,
    items: [{ produto_nome: 'Espresso', categoria: 'Cafés', qtd: 3, preco_unit: 6, custo_unit: 1.5 }],
  },
]

describe('métricas básicas', () => {
  it('revenueTotal soma', () => expect(revenueTotal(sales)).toBe(48))
  it('avgTicket', () => expect(avgTicket(sales)).toBe(24))
  it('avgTicket vazio', () => expect(avgTicket([])).toBe(0))
})

describe('deltaPct', () => {
  it('crescimento', () => expect(deltaPct(120, 100)).toBe(20))
  it('anterior zero', () => expect(deltaPct(50, 0)).toBe(100))
})

describe('revenueByDay', () => {
  it('preenche dias sem venda com 0', () => {
    const out = revenueByDay(sales, new Date(2026, 5, 1), new Date(2026, 5, 3))
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual({ date: '2026-06-01', total: 30 })
    expect(out[1]).toEqual({ date: '2026-06-02', total: 0 })
    expect(out[2]).toEqual({ date: '2026-06-03', total: 18 })
  })
})

describe('revenueByCategory', () => {
  it('agrupa receita/custo/lucro', () => {
    const out = revenueByCategory(sales)
    const cafes = out.find((c) => c.categoria === 'Cafés')
    expect(cafes.receita).toBe(30) // 2*6 + 3*6
    expect(cafes.custo).toBe(7.5) // 5*1.5
    expect(cafes.lucro).toBe(22.5)
  })
})

describe('topProducts / mostSold', () => {
  it('ordena por receita', () => {
    const out = topProducts(sales, 5)
    expect(out[0].nome).toBe('Espresso')
    expect(out[0].qtd).toBe(5)
    expect(out[0].receita).toBe(30)
  })
  it('mostSold por quantidade', () => {
    expect(mostSold(sales).nome).toBe('Espresso')
  })
})

describe('lowStock', () => {
  it('filtra estoque <= mínimo', () => {
    const products = [
      { nome: 'A', estoque: 2, estoque_minimo: 5, ativo: true },
      { nome: 'B', estoque: 50, estoque_minimo: 10, ativo: true },
    ]
    expect(lowStock(products).map((p) => p.nome)).toEqual(['A'])
  })
})
