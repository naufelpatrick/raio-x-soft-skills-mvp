import { AlertTriangle, ExternalLink } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatNumber } from "../utils/formatters";

export function DashboardAlerts({ alerts = [] }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Alertas e insights</h2>
      <div className="mt-5 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.title} className="flex gap-3 rounded-sm border border-amber-400/30 bg-amber-400/5 p-4">
            <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{alert.description}</p>
            </div>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum alerta crítico no período selecionado.</p>}
      </div>
    </div>
  );
}

export function RevenueChart({ data = [] }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Receita por dia</h2>
      <div className="mt-6 h-72">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.12)", color: "#EEF2FF" }} />
              <Bar dataKey="revenue" fill="#FBBF24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-sm border border-dashed border-border text-sm text-muted-foreground">Sem receita no período.</div>
        )}
      </div>
    </div>
  );
}

export function EmptyIntegrationState({ title, message, actionLabel, href }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
      {href && (
        <a href={href} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground">
          {actionLabel}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

export function NpsSummary({ nps }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">NPS do relatório pago</h2>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Média</p>
          <p className="mt-1 text-3xl font-semibold">{nps?.average ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Respostas</p>
          <p className="mt-1 text-3xl font-semibold">{formatNumber(nps?.responses || 0)}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-sm bg-red-500/10 p-3 text-red-200">Detratores<br />{formatNumber(nps?.detractors || 0)}</div>
        <div className="rounded-sm bg-amber-500/10 p-3 text-amber-200">Neutros<br />{formatNumber(nps?.neutrals || 0)}</div>
        <div className="rounded-sm bg-emerald-500/10 p-3 text-emerald-200">Promotores<br />{formatNumber(nps?.promoters || 0)}</div>
      </div>
    </div>
  );
}
