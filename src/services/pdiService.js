import { developmentActions } from "../data/developmentActions";

export function generatePDI(opportunities) {
  return opportunities.map((item) => ({
    competency: item.name,
    score: item.score,
    actions:
      developmentActions[item.id] || {
        days30: ["Definir ações práticas para evolução."],
        days60: ["Aplicar aprendizados em situações reais."],
        days90: ["Consolidar hábitos e compartilhar resultados."],
      },
  }));
}