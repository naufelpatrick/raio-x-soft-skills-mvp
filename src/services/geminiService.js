import { buildReportPrompt } from "./reportPrompt";

export async function generateNarrativeReport({ profile, scores, openAnswers }) {
  const prompt = buildReportPrompt({ profile, scores, openAnswers });

  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("ERRO GEMINI:", data);
    throw new Error(
      data?.error?.message ||
        data?.error ||
        "Erro ao gerar relatório com Gemini."
    );
  }

  return data.text;
}
