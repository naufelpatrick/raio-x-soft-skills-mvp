import { formatNumber, formatPercent } from "../utils/formatters";

export function ConversionFunnel({ steps = [] }) {
  const max = Math.max(...steps.map((step) => step.count), 1);

  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <div className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">Funil de conversão</p>
        <h2 className="mt-2 text-xl font-semibold">Da visita ao pagamento aprovado</h2>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.label} className={`rounded-sm border p-4 ${step.biggestDrop ? "border-amber-400/50 bg-amber-400/5" : "border-border bg-background/30"}`}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatPercent(step.stepConversion)} da etapa anterior · {formatPercent(step.totalConversion)} do total
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg">{formatNumber(step.count)}</p>
                {step.drop > 0 && <p className="text-[11px] text-muted-foreground">perda: {formatNumber(step.drop)}</p>}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (step.count / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
