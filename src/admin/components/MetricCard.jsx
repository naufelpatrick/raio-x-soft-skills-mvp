import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { formatMetricValue, formatPercent } from "../utils/formatters";

export function MetricCard({ metric }) {
  const positive = Number(metric.change || 0) >= 0;
  return (
    <div className="rounded-sm border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{metric.label}</span>
            {metric.help && <Info className="w-3.5 h-3.5" title={metric.help} />}
          </div>
          <div className="mt-3 text-2xl font-semibold">{formatMetricValue(metric)}</div>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${positive ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {formatPercent(Math.abs(metric.change))}
        </div>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">em relação ao período anterior</p>
    </div>
  );
}
