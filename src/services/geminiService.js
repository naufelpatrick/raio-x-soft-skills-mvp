export async function generateNarrativeReport({ profile, scores, openAnswers }) {
  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile, scores, openAnswers }),
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
