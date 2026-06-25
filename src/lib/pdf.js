import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatBRL } from './format'

const ACCENT = [181, 115, 31] // #b5731f
const INK = [43, 33, 27]
const MUTED = [138, 119, 102]

export function exportReportPdf({ negocio, periodo, resumo, categorias, topProdutos }) {
  const doc = new jsPDF()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...INK)
  doc.text(negocio, 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...MUTED)
  doc.text(`Relatório de vendas · ${periodo}`, 14, 25)

  autoTable(doc, {
    startY: 32,
    head: [['Resumo', '']],
    body: [
      ['Faturamento', formatBRL(resumo.receita)],
      ['Lucro', formatBRL(resumo.lucro)],
      ['Margem', `${resumo.margem}%`],
      ['Vendas', String(resumo.vendas)],
      ['Ticket médio', formatBRL(resumo.ticket)],
    ],
    theme: 'striped',
    headStyles: { fillColor: ACCENT },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Categoria', 'Receita', 'Custo', 'Lucro', 'Margem']],
    body: categorias.map((c) => [
      c.categoria,
      formatBRL(c.receita),
      formatBRL(c.custo),
      formatBRL(c.lucro),
      `${c.receita ? Math.round((c.lucro / c.receita) * 100) : 0}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: ACCENT },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Top produtos', 'Qtd', 'Receita']],
    body: topProdutos.map((p) => [p.nome, String(p.qtd), formatBRL(p.receita)]),
    theme: 'striped',
    headStyles: { fillColor: ACCENT },
  })

  doc.save('relatorio-cafe-cia.pdf')
}
