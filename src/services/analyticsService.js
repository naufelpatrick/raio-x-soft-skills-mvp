import { storeLocalEvent } from "./sessionService";

let initialized = false;
let activeSessionId = null;
const COOKIE_PREFERENCES_KEY = "raio_x_cookie_preferences_v1";
const DEFAULT_MEASUREMENT_ID = "G-RFRY1LERDY";

const allowedEvents = new Set([
  "assessment_started",
  "session_resumed",
  "profile_completed",
  "assessment_step_completed",
  "assessment_completed",
  "report_viewed",
  "ai_report_requested",
  "ai_report_succeeded",
  "ai_report_failed",
  "feedback_submitted",
  "interest_form_opened",
  "interest_submitted",
]);

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

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;
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
}

export function trackEvent(name, parameters = {}) {
  if (!initialized || !allowedEvents.has(name)) return;

  const event = {
    name,
    sessionId: activeSessionId,
    timestamp: new Date().toISOString(),
    parameters,
  };

  storeLocalEvent(event);

  if (window.gtag) {
    window.gtag("event", name, {
      session_id: activeSessionId,
      ...parameters,
    });
  }
}
