export async function submitFeedback(feedback) {
  const response = await fetch("/api/submit-feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(feedback),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Não foi possível enviar seu feedback.");
  }

  return data;
}
