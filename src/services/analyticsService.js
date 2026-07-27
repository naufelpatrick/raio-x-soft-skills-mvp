import { storeLocalEvent } from "./sessionService.js";

let initialized = false;
let activeSessionId = null;
const COOKIE_PREFERENCES_KEY = "raio_x_cookie_preferences_v1";
const PURCHASE_DEDUPE_KEY = "raio_x_purchase_dedupe_v1";
const DEFAULT_MEASUREMENT_ID = "G-RFRY1LERDY";
const DEFAULT_CLARITY_PROJECT_ID = "xkxrzsnluj";

const allowedEvents = new Set([
  "assessment_started",
  "session_resumed",
  "profile_completed",
  "assessment_step_completed",
  "assessment_completed",
  "free_report_viewed",
  "checkout_started",
  "payment_approved",
  "report_viewed",
  "ai_report_requested",
  "ai_report_succeeded",
  "ai_report_failed",
  "feedback_submitted",
  "interest_form_opened",
  "interest_submitted",
  "purchase",
  "experiment_view",
  "select_experiment_cta",
]);
let experimentParameters = {};

export function setAnalyticsExperiment(parameters = {}) {
  experimentParameters = { ...parameters };
}

export function getAnalyticsExperiment() {
  return { ...experimentParameters };
}

export function resetAnalyticsForTests() {
  initialized = false;
  activeSessionId = null;
  experimentParameters = {};
}

export function initializeAnalytics(sessionId) {
  activeSessionId = sessionId;

  if (initialized) return;

  try {
    const preferences = JSON.parse(localStorage.getItem(COOKIE_PREFERENCES_KEY) || "null");
    if (!preferences?.analytics) return;
  } catch {
    return;
  }

  initialized = true;

  const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;
  if (!measurementId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const clarityProjectId = import.meta.env?.VITE_CLARITY_PROJECT_ID || DEFAULT_CLARITY_PROJECT_ID;
  if (clarityProjectId && !document.querySelector(`script[src="https://www.clarity.ms/tag/${clarityProjectId}"]`)) {
    window.clarity = window.clarity || function clarity() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

    const clarityScript = document.createElement("script");
    clarityScript.async = true;
    clarityScript.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
    document.head.appendChild(clarityScript);
  }
}

export function trackEvent(name, parameters = {}) {
  if (!initialized || !allowedEvents.has(name)) return;

  const event = {
    name,
    sessionId: activeSessionId,
    timestamp: new Date().toISOString(),
    parameters: { ...experimentParameters, ...parameters },
  };

  storeLocalEvent(event);

  if (window.gtag) {
    window.gtag("event", name, {
      session_id: activeSessionId,
      ...experimentParameters,
      ...parameters,
    });
  }
}

export function trackPurchase({ transactionId, value, currency = "BRL", items = [] }) {
  if (!transactionId || !Number.isFinite(value) || value <= 0) return false;

  let trackedTransactions = [];
  try {
    trackedTransactions = JSON.parse(localStorage.getItem(PURCHASE_DEDUPE_KEY) || "[]");
    if (!Array.isArray(trackedTransactions)) trackedTransactions = [];
    if (trackedTransactions.includes(transactionId)) return false;
  } catch {
    // Falhas no armazenamento não devem impedir o envio da conversão.
  }

  if (!initialized || !window.gtag) return false;

  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });

  try {
    localStorage.setItem(
      PURCHASE_DEDUPE_KEY,
      JSON.stringify([...trackedTransactions, transactionId].slice(-100))
    );
  } catch {
    // O transaction_id também permite que o GA4 deduplique reenvios.
  }

  return true;
}
