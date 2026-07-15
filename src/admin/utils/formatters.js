export function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value || 0));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

export function formatPercent(value) {
  return `${Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function formatMetricValue(metric) {
  if (metric.currency) return formatCurrency(metric.value);
  if (metric.suffix === "%") return formatPercent(metric.value);
  return formatNumber(metric.value);
}
