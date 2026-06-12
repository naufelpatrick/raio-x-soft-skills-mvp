export async function generateNarrativeReport() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
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
                text: "Responda apenas: Olá mundo",
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  console.log("RESPOSTA COMPLETA:");
  console.log(data);

  return JSON.stringify(data, null, 2);
}