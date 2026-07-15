export const adminDateRanges = [
  ["today", "Hoje"],
  ["yesterday", "Ontem"],
  ["last_7_days", "Últimos 7 dias"],
  ["last_30_days", "Últimos 30 dias"],
  ["this_month", "Este mês"],
  ["previous_month", "Mês anterior"],
];

export function getRangeLabel(value) {
  return adminDateRanges.find(([key]) => key === value)?.[1] || "Últimos 7 dias";
}
