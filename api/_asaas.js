const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = (process.env.ASAAS_ENVIRONMENT || "production").toLowerCase();

const BASE_URL =
  ASAAS_ENVIRONMENT === "sandbox"
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3";

export function isAsaasConfigured() {
  return Boolean(ASAAS_API_KEY);
}

export function getAsaasBaseUrl() {
  return BASE_URL;
}

export function sanitizePhone(value = "") {
  return String(value).replace(/\D/g, "");
}

async function requestAsaas(path, { method = "GET", body } = {}) {
  if (!isAsaasConfigured()) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = data?.errors?.map((error) => error.description).join("; ") || data?.message || response.statusText;
    throw new Error(`Asaas API error (${response.status}): ${details}`);
  }

  return data;
}

export async function createAsaasCustomer({ name, email, whatsapp }) {
  const phone = sanitizePhone(whatsapp);

  return requestAsaas("/customers", {
    method: "POST",
    body: {
      name,
      email,
      mobilePhone: phone || undefined,
      notificationDisabled: false,
    },
  });
}

export async function createAsaasPayment({ customerId, sessionId, name, value, appUrl }) {
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const successUrl = `${appUrl}/?payment=success&sessionId=${encodeURIComponent(sessionId)}`;

  return requestAsaas("/payments", {
    method: "POST",
    body: {
      customer: customerId,
      billingType: "UNDEFINED",
      value,
      dueDate,
      description: `Raio-X do Designer — Diagnóstico Completo (${name})`,
      externalReference: sessionId,
      callback: {
        successUrl,
        autoRedirect: true,
      },
    },
  });
}

export async function getAsaasPayment(paymentId) {
  return requestAsaas(`/payments/${encodeURIComponent(paymentId)}`);
}

export function isPaidAsaasStatus(status) {
  return ["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(String(status || "").toUpperCase());
}

export function extractWebhookToken(req) {
  const headers = req.headers || {};
  const authorization = headers.authorization || headers.Authorization || "";
  return (
    headers["asaas-access-token"] ||
    headers["Asaas-Access-Token"] ||
    headers["access_token"] ||
    headers["x-asaas-token"] ||
    (authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7) : "")
  );
}
