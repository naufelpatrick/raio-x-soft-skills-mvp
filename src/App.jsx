import { useEffect, useState } from "react";
import LandingPage from "./components/landing/LandingPage";
import AssessmentForm from "./components/form/AssessmentForm";
import ProfileForm from "./components/form/ProfileForm";
import { calculateAssessmentResults } from "./services/scoringService";
import { generateNarrativeReport } from "./services/geminiService";
import { initializeAnalytics, trackEvent } from "./services/analyticsService";
import {
  clearSession,
  createSessionId,
  loadSession,
  saveSession,
} from "./services/sessionService";
import GeneralScoreCard from "./components/report/GeneralScoreCard";
import ProfileCard from "./components/report/ProfileCard";
import RadarChartBlock from "./components/report/RadarChartBlock";
import CrossAnalysisSection from "./components/report/CrossAnalysisSection";
import CompetencyTable from "./components/report/CompetencyTable";
import StrengthsSection from "./components/report/StrengthsSection";
import OpportunitiesSection from "./components/report/OpportunitiesSection";
import RecommendationsSection from "./components/report/RecommendationsSection";
import PDISection from "./components/report/PDISection";
import NarrativeReport from "./components/report/NarrativeReport";
import DesignerProfileCard from "./components/report/DesignerProfileCard";
import FeedbackSection from "./components/report/FeedbackSection";
import InterestSection from "./components/report/InterestSection";

export default function App() {
  const [initialSession] = useState(loadSession);
  const [showLanding, setShowLanding] = useState(true);
  const [hasSavedSession, setHasSavedSession] = useState(
    Boolean(initialSession?.consented && initialSession?.stage !== "landing")
  );
  const [consented, setConsented] = useState(Boolean(initialSession?.consented));
  const [sessionId, setSessionId] = useState(
    initialSession?.sessionId || createSessionId()
  );
  const [stage, setStage] = useState(initialSession?.stage || "landing");
  const [startedAt, setStartedAt] = useState(
    initialSession?.startedAt || null
  );
  const [profile, setProfile] = useState(initialSession?.profile || null);
  const [assessmentDraft, setAssessmentDraft] = useState(
    initialSession?.assessmentDraft || null
  );
  const [completedSteps, setCompletedSteps] = useState(
    initialSession?.completedSteps || []
  );
  const [result, setResult] = useState(initialSession?.result || null);
  const [narrativeReport, setNarrativeReport] = useState(
    initialSession?.narrativeReport || ""
  );
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportWarning, setReportWarning] = useState(
    initialSession?.reportWarning || ""
  );
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(
    Boolean(initialSession?.feedbackSubmitted)
  );
  const [feedbackSummary, setFeedbackSummary] = useState(
    initialSession?.feedbackSummary || null
  );
  const [interestSubmitted, setInterestSubmitted] = useState(
    Boolean(initialSession?.interestSubmitted)
  );

  useEffect(() => {
    if (!consented || stage === "landing") return;

    saveSession({
      consented,
      sessionId,
      stage,
      startedAt,
      profile,
      assessmentDraft,
      completedSteps,
      result,
      narrativeReport,
      reportWarning,
      feedbackSubmitted,
      feedbackSummary,
      interestSubmitted,
    });
  }, [
    assessmentDraft,
    completedSteps,
    consented,
    feedbackSubmitted,
    feedbackSummary,
    interestSubmitted,
    narrativeReport,
    profile,
    reportWarning,
    result,
    sessionId,
    stage,
    startedAt,
  ]);

  function handleStart() {
    const newSessionId = createSessionId();
    const startTime = new Date().toISOString();

    setSessionId(newSessionId);
    setStartedAt(startTime);
    setConsented(true);
    setHasSavedSession(false);
    setStage("profile");
    setShowLanding(false);
    initializeAnalytics(newSessionId);
    trackEvent("assessment_started");
  }

  function handleResume() {
    initializeAnalytics(sessionId);
    trackEvent("session_resumed", { stage });
    setHasSavedSession(false);
    setShowLanding(false);
  }

  function handleProfileSubmit(profileData) {
    setProfile(profileData);
    setStage("assessment");
    trackEvent("profile_completed", {
      professional_level: profileData.professionalLevel,
      main_area: profileData.mainArea,
    });
  }

  function handleStepComplete(index, competencyId) {
    if (completedSteps.includes(index)) return;

    setCompletedSteps((current) => [...current, index]);
    trackEvent("assessment_step_completed", {
      step: index + 1,
      competency: competencyId,
    });
  }

  function handleAssessmentSubmit(data) {
    const scores = calculateAssessmentResults(data.answers);
    const completedResult = { ...data, profile, scores };
    const durationSeconds = startedAt
      ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
      : undefined;

    setResult(completedResult);
    setAssessmentDraft({ ...data, currentIndex: 10 });
    setNarrativeReport("");
    setReportError("");
    setReportWarning("");
    setStage("report");

    trackEvent("assessment_completed", { duration_seconds: durationSeconds });
    trackEvent("report_viewed", {
      general_score: scores.generalScore,
      maturity_level: scores.generalLevel,
      profile: scores.profile?.name,
    });
  }

  async function handleGenerateNarrativeReport() {
    if (!result) return;

    setLoadingReport(true);
    setReportError("");
    setReportWarning("");
    trackEvent("ai_report_requested");

    try {
      const report = await generateNarrativeReport({
        profile: result.profile,
        scores: result.scores,
        openAnswers: result.openAnswers,
      });

      setNarrativeReport(report.text);
      setReportWarning(
        report.truncated
          ? "A análise atingiu o limite de tamanho e pode estar incompleta. Gere novamente para obter uma nova versão."
          : ""
      );
      trackEvent("ai_report_succeeded");
    } catch (error) {
      setReportError(error.message);
      trackEvent("ai_report_failed");
    } finally {
      setLoadingReport(false);
    }
  }

  function handleFeedbackSubmitted(feedback) {
    const summary = {
      accuracy: Number(feedback.accuracy),
      recommendation: Number(feedback.recommendation),
      usefulPart: feedback.usefulPart,
    };

    setFeedbackSubmitted(true);
    setFeedbackSummary(summary);
    trackEvent("feedback_submitted", {
      accuracy: summary.accuracy,
      recommendation: summary.recommendation,
      useful_part: summary.usefulPart,
      used_ai: Boolean(narrativeReport),
    });
  }

  function handleInterestSubmitted({ interest }) {
    setInterestSubmitted(true);
    trackEvent("interest_submitted", { interest });
  }

  function handleReset() {
    if (!window.confirm("Deseja apagar o progresso salvo e iniciar uma nova avaliação?")) {
      return;
    }

    clearSession();
    setShowLanding(true);
    setHasSavedSession(false);
    setConsented(false);
    setSessionId(createSessionId());
    setStage("landing");
    setStartedAt(null);
    setProfile(null);
    setAssessmentDraft(null);
    setCompletedSteps([]);
    setResult(null);
    setNarrativeReport("");
    setReportError("");
    setReportWarning("");
    setFeedbackSubmitted(false);
    setFeedbackSummary(null);
    setInterestSubmitted(false);
  }

  if (showLanding) {
    return (
      <LandingPage
        hasSavedSession={hasSavedSession}
        onResume={handleResume}
        onStart={handleStart}
      />
    );
  }

  if (stage === "profile") {
    return (
      <ProfileForm
        initialProfile={profile}
        onProgress={setProfile}
        onSubmit={handleProfileSubmit}
      />
    );
  }

  if (stage === "assessment") {
    return (
      <AssessmentForm
        initialDraft={assessmentDraft}
        onProgress={setAssessmentDraft}
        onStepComplete={handleStepComplete}
        onSubmit={handleAssessmentSubmit}
      />
    );
  }

  if (!result) {
    clearSession();
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-end">
          <button type="button" onClick={handleReset} className="text-sm font-semibold text-slate-500 hover:text-violet-700">
            Refazer avaliação
          </button>
        </div>

        <DesignerProfileCard profile={result.profile} />
        <GeneralScoreCard score={result.scores.generalScore} level={result.scores.generalLevel} />
        <ProfileCard profile={result.scores.profile} />
        <RadarChartBlock competencies={result.scores.competencies} />
        <CrossAnalysisSection items={result.scores.crossAnalysis} />
        <CompetencyTable competencies={result.scores.competencies} />

        <div className="grid md:grid-cols-2 gap-6">
          <StrengthsSection strengths={result.scores.strengths} />
          <OpportunitiesSection opportunities={result.scores.opportunities} />
        </div>

        <RecommendationsSection opportunities={result.scores.opportunities} />
        <PDISection pdi={result.scores.pdi} />

        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">Análise Completa com IA</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-3">Gere sua devolutiva aprofundada</h3>
          <p className="text-slate-600 mt-3 max-w-2xl">
            A análise aprofunda sua leitura de maturidade e adapta o plano de desenvolvimento ao seu contexto profissional. Ao continuar, seus dados desta avaliação serão enviados ao Gemini somente para gerar a devolutiva.
          </p>
          <button type="button" onClick={handleGenerateNarrativeReport} disabled={loadingReport} className="mt-6 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingReport ? "Gerando análise..." : narrativeReport ? "Gerar análise novamente" : "Gerar análise completa com IA"}
          </button>
        </section>

        <NarrativeReport
          report={narrativeReport}
          loading={loadingReport}
          error={reportError}
          warning={reportWarning}
        />

        {!feedbackSubmitted && (
          <FeedbackSection
            sessionId={sessionId}
            usedAI={Boolean(narrativeReport)}
            onSubmitted={handleFeedbackSubmitted}
          />
        )}

        {feedbackSubmitted && (
          <InterestSection
            sessionId={sessionId}
            defaultName={result.profile?.name}
            recommendation={feedbackSummary?.recommendation}
            submitted={interestSubmitted}
            onOpened={() => trackEvent("interest_form_opened")}
            onSubmitted={handleInterestSubmitted}
          />
        )}
      </div>
    </main>
  );
}
