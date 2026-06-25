// Backend "demo" — usado sem Supabase. Espelha o schema/seed em localStorage,
// para o app rodar e ser publicável como demo sempre-no-ar.

const LS_PRODUCTS = 'gf.demo.products'
const LS_SALES = 'gf.demo.sales'
const LS_SESSION = 'gf.demo.session'

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)

const read = (k, fb) => {
  try {
    const raw = localStorage.getItem(k)
    return raw ? JSON.parse(raw) : fb
  } catch {
    return fb
  }
}
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

// ---- Produtos base (espelham o seed.sql) -----------------------------------
const BASE_PRODUCTS = [
  ['Espresso', 'Cafés', 6.0, 1.5, 100, 10],
  ['Cappuccino', 'Cafés', 9.0, 2.5, 80, 10],
  ['Café com Leite', 'Cafés', 7.0, 2.0, 90, 10],
  ['Latte', 'Cafés', 10.0, 3.0, 70, 10],
  ['Mocha', 'Cafés', 12.0, 3.5, 60, 10],
  ['Café Coado', 'Cafés', 5.0, 1.2, 120, 10],
  ['Pão de Queijo', 'Salgados', 5.5, 1.8, 40, 8],
  ['Coxinha', 'Salgados', 8.0, 3.0, 30, 8],
  ['Misto Quente', 'Salgados', 9.5, 3.5, 25, 8],
  ['Empada de Frango', 'Salgados', 7.5, 2.8, 3, 8],
  ['Croissant', 'Salgados', 8.5, 3.2, 20, 8],
  ['Bolo de Cenoura', 'Doces', 8.0, 2.5, 15, 6],
  ['Brownie', 'Doces', 9.0, 3.0, 2, 6],
  ['Cookie', 'Doces', 6.0, 1.8, 50, 6],
  ['Cheesecake', 'Doces', 12.0, 4.0, 12, 6],
  ['Suco de Laranja', 'Bebidas', 8.0, 2.5, 35, 8],
  ['Água Mineral', 'Bebidas', 4.0, 1.0, 100, 10],
  ['Chocolate Quente', 'Bebidas', 11.0, 3.5, 4, 6],
]

function seedProducts() {
  return BASE_PRODUCTS.map(([nome, categoria, preco, custo, estoque, estoque_minimo], i) => ({
    id: 'p' + (i + 1),
    nome,
    categoria,
    preco,
    custo,
    estoque,
    estoque_minimo,
    ativo: true,
    created_at: new Date().toISOString(),
  }))
}

const rint = (min, max) => min + Math.floor(Math.random() * (max - min + 1))

function seedSales(products) {
  const sales = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let d = 120; d >= 0; d--) {
    const day = new Date(today)
    day.setDate(day.getDate() - d)
    const weekend = day.getDay() === 0 || day.getDay() === 6
    const count = (weekend ? 8 : 4) + rint(0, 7)
    for (let s = 0; s < count; s++) {
      const when = new Date(day)
      when.setHours(8 + rint(0, 10), rint(0, 59), 0, 0)
      const itemsCount = rint(1, 3)
      const chosen = [...products].sort(() => Math.random() - 0.5).slice(0, itemsCount)
      let total = 0
      let qtd_itens = 0
      const items = chosen.map((p) => {
        const qtd = rint(1, 3)
        total += p.preco * qtd
        qtd_itens += qtd
        return {
          id: uid(),
          product_id: p.id,
          qtd,
          preco_unit: p.preco,
          custo_unit: p.custo,
          produto_nome: p.nome,
          categoria: p.categoria,
        }
      })
      sales.push({
        id: uid(),
        created_at: when.toISOString(),
        total: Math.round(total * 100) / 100,
        qtd_itens,
        items,
      })
    }
  }
  return sales
}

function loadProducts() {
  let p = read(LS_PRODUCTS, null)
  if (!p) {
    p = seedProducts()
    write(LS_PRODUCTS, p)
  }
  return p
}
function loadSales() {
  let s = read(LS_SALES, null)
  if (!s) {
    s = seedSales(loadProducts())
    write(LS_SALES, s)
  }
  return s
}
const saveProducts = (p) => write(LS_PRODUCTS, p)
const saveSales = (s) => write(LS_SALES, s)

const within = (iso, from, to) => {
  const t = new Date(iso).getTime()
  if (from && t < new Date(from).getTime()) return false
  if (to && t > new Date(to).getTime()) return false
  return true
}

export const demo = {
  // produtos
  listProducts: async ({ activeOnly = false } = {}) => {
    const p = loadProducts()
    return (activeOnly ? p.filter((x) => x.ativo) : p).sort((a, b) => a.nome.localeCompare(b.nome))
  },
  createProduct: async (data) => {
    const row = {
      id: uid(),
      ativo: true,
      estoque_minimo: 5,
      custo: 0,
      categoria: 'Geral',
      created_at: new Date().toISOString(),
      ...data,
    }
    saveProducts([...loadProducts(), row])
    return row
  },
  updateProduct: async (id, patch) => {
    const next = loadProducts().map((p) => (p.id === id ? { ...p, ...patch } : p))
    saveProducts(next)
    return next.find((p) => p.id === id)
  },
  deleteProduct: async (id) => {
    saveProducts(loadProducts().filter((p) => p.id !== id))
  },

  // vendas
  listSales: async ({ from, to } = {}) => {
    return loadSales()
      .filter((s) => within(s.created_at, from, to))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },
  createSale: async (itens) => {
    if (!itens?.length) throw new Error('Adicione ao menos um item à venda.')
    const products = loadProducts()
    // valida estoque
    for (const it of itens) {
      const p = products.find((x) => x.id === it.product_id)
      if (!p) throw new Error('Produto inválido.')
      if (it.qtd <= 0) throw new Error('Quantidade inválida.')
      if (p.estoque < it.qtd) throw new Error(`Estoque insuficiente para ${p.nome}.`)
    }
    // grava
    let total = 0
    let qtd_itens = 0
    const items = itens.map((it) => {
      const p = products.find((x) => x.id === it.product_id)
      total += p.preco * it.qtd
      qtd_itens += it.qtd
      return {
        id: uid(),
        product_id: p.id,
        qtd: it.qtd,
        preco_unit: p.preco,
        custo_unit: p.custo,
        produto_nome: p.nome,
        categoria: p.categoria,
      }
    })
    const sale = { id: uid(), created_at: new Date().toISOString(), total: Math.round(total * 100) / 100, qtd_itens, items }
    saveSales([sale, ...loadSales()])
    // baixa estoque
    saveProducts(products.map((p) => {
      const it = itens.find((x) => x.product_id === p.id)
      return it ? { ...p, estoque: p.estoque - it.qtd } : p
    }))
    return sale
  },

  // auth (demo)
  signIn: async (email, password) => {
    if (email?.trim().toLowerCase() === 'dono@cafe.com' && password === 'cafe123') {
      const session = { user: { email: 'dono@cafe.com' }, demo: true }
      write(LS_SESSION, session)
      return session
    }
    throw new Error('E-mail ou senha inválidos. (demo: dono@cafe.com / cafe123)')
  },
  signOut: async () => write(LS_SESSION, null),
  getSession: async () => read(LS_SESSION, null),
}
