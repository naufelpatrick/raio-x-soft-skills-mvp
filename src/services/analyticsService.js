import { storeLocalEvent } from "./sessionService";

let initialized = false;
let activeSessionId = null;

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
]);

export function initializeAnalytics(sessionId) {
  activeSessionId = sessionId;

  if (initialized) return;
  initialized = true;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: false,
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
