import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as productsDb from '../lib/db/products'
import * as salesDb from '../lib/db/sales'

/* ---------- Produtos ---------- */
export const useProducts = (opts = {}) =>
  useQuery({ queryKey: ['products', opts], queryFn: () => productsDb.listProducts(opts) })

export function useProductMutations() {
  const qc = useQueryClient()
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['products'] })
    qc.invalidateQueries({ queryKey: ['sales'] })
  }
  return {
    create: useMutation({ mutationFn: productsDb.createProduct, onSuccess: inv }),
    update: useMutation({ mutationFn: ({ id, patch }) => productsDb.updateProduct(id, patch), onSuccess: inv }),
    remove: useMutation({ mutationFn: productsDb.deleteProduct, onSuccess: inv }),
  }
}

/* ---------- Vendas ---------- */
// Busca todas as vendas; o filtro por período é feito no cliente (analytics).
export const useSales = () => useQuery({ queryKey: ['sales'], queryFn: () => salesDb.listSales() })

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesDb.createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
