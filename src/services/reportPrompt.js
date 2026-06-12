export function buildReportPrompt({ scores, openAnswers }) {
  return `
Você é o Analista Oficial do Raio-X de Soft Skills.

Gere um relatório profissional, humano, estratégico e acionável com base nos dados abaixo.

Índice Geral: ${scores.generalScore}
Nível Geral: ${scores.generalLevel}

Perfil Predominante:
${scores.profile?.name}
${scores.profile?.description}

Principais Forças:
${scores.strengths.map((item) => `- ${item.name}: ${item.score} (${item.level})`).join("\n")}

Oportunidades de Desenvolvimento:
${scores.opportunities.map((item) => `- ${item.name}: ${item.score} (${item.level})`).join("\n")}

Cruzamentos Comportamentais:
${scores.crossAnalysis.map((item) => `- ${item.title}: ${item.interpretation}`).join("\n")}

Respostas abertas:
1. ${openAnswers.open_1 || "Não informado"}
2. ${openAnswers.open_2 || "Não informado"}
3. ${openAnswers.open_3 || "Não informado"}

Responda em português do Brasil com:
1. Resumo Executivo
2. Leitura Geral da Maturidade Profissional
3. Principais Forças
4. Pontos de Atenção
5. Recomendações Prioritárias
6. Plano de Desenvolvimento Individual para 30, 60 e 90 dias
7. Conclusão Final

Evite clichês motivacionais. Seja direto, humano, analítico e prático.
`;
}