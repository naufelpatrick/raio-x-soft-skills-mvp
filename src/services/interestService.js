export async function submitInterest(interest) {
  const response = await fetch("/api/submit-interest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(interest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Não foi possível registrar seu interesse.");
  }

  return data;
}
