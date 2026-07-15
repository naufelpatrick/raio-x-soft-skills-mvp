import { formatCurrency, formatDate } from "../utils/formatters";

export function RecentLeadsTable({ leads = [] }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Leads recentes</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-3 font-medium">Nome</th>
              <th className="py-3 font-medium">E-mail</th>
              <th className="py-3 font-medium">Data</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Diagnóstico</th>
              <th className="py-3 font-medium">Compra</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={`${lead.email}-${lead.createdAt}`} className="border-b border-border/60 last:border-0">
                <td className="py-3">{lead.name || "—"}</td>
                <td className="py-3 text-muted-foreground">{lead.email || "—"}</td>
                <td className="py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                <td className="py-3">{lead.status}</td>
                <td className="py-3">{lead.assessmentCompleted ? "Concluído" : "—"}</td>
                <td className="py-3">{lead.purchased ? "Sim" : "Não"}</td>
              </tr>
            ))}
            {leads.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum lead no período.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RecentSalesTable({ sales = [] }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Vendas recentes</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-3 font-medium">Data</th>
              <th className="py-3 font-medium">Cliente</th>
              <th className="py-3 font-medium">Produto</th>
              <th className="py-3 font-medium">Valor</th>
              <th className="py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={`${sale.customer}-${sale.date}-${sale.status}`} className="border-b border-border/60 last:border-0">
                <td className="py-3 text-muted-foreground">{formatDate(sale.date)}</td>
                <td className="py-3">{sale.customer || "—"}</td>
                <td className="py-3 text-muted-foreground">{sale.product}</td>
                <td className="py-3">{formatCurrency(sale.value)}</td>
                <td className="py-3">{sale.status}</td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhuma venda no período.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
