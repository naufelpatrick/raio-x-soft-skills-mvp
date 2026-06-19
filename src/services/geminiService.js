export async function generateNarrativeReport({ profile, scores, openAnswers }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 70_000);
  let response;

  try {
    response = await fetch("/api/generate-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({ profile, scores, openAnswers }),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("A análise demorou mais que o esperado. Tente novamente.", {
        cause: error,
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json();

  if (!response.ok) {
    console.error("ERRO GEMINI:", data);
    throw new Error(
      data?.error?.message ||
        data?.error ||
        "Erro ao gerar relatório com Gemini."
    );
  }

  return {
    text: data.text,
    truncated: Boolean(data.truncated),
  };
}
