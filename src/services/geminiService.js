import { buildReportPrompt } from "./reportPrompt";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateNarrativeReport({ scores, openAnswers }) {
  if (!API_KEY) {
    throw new Error("Chave da API Gemini não configurada.");
  }

  const prompt = buildReportPrompt({
    scores,
    openAnswers,
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao gerar relatório com Gemini.");
  }

  const data = await response.json();

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Não foi possível gerar o relatório narrativo."
  );
}