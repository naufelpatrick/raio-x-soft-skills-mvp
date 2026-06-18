import { useState } from "react";
import AssessmentForm from "./components/form/AssessmentForm";
import ProfileForm from "./components/form/ProfileForm";

import { calculateAssessmentResults } from "./services/scoringService";
import { generateNarrativeReport } from "./services/geminiService";

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

export default function App() {
  const [profile, setProfile] = useState(null);

  const [result, setResult] = useState(null);
  const [narrativeReport, setNarrativeReport] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  function handleSubmit(data) {
    const scores = calculateAssessmentResults(data.answers);

    setResult({
      ...data,
      profile,
      scores,
    });

    setNarrativeReport("");
    setReportError("");
  }

  async function handleGenerateNarrativeReport() {
    if (!result) return;

    setLoadingReport(true);
    setReportError("");

    try {
      const report = await generateNarrativeReport({
        profile: result.profile,
        scores: result.scores,
        openAnswers: result.openAnswers,
      });

      setNarrativeReport(report);
    } catch (error) {
      setReportError(error.message);
    } finally {
      setLoadingReport(false);
    }
  }

  // PRIMEIRA ETAPA
  if (!profile) {
    return <ProfileForm onSubmit={setProfile} />;
  }

  // SEGUNDA ETAPA
  if (result) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <DesignerProfileCard profile={result.profile} />
          
          <GeneralScoreCard
            score={result.scores.generalScore}
            level={result.scores.generalLevel}
          />

          <ProfileCard profile={result.scores.profile} />

          <RadarChartBlock competencies={result.scores.competencies} />

          <CrossAnalysisSection items={result.scores.crossAnalysis} />

          <CompetencyTable competencies={result.scores.competencies} />

          <div className="grid md:grid-cols-2 gap-6">
            <StrengthsSection strengths={result.scores.strengths} />

            <OpportunitiesSection
              opportunities={result.scores.opportunities}
            />
          </div>

          <RecommendationsSection
            opportunities={result.scores.opportunities}
          />

          <PDISection pdi={result.scores.pdi} />

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
              Análise Completa com IA
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mt-3">
              Gere sua devolutiva aprofundada
            </h3>

            <p className="text-slate-600 mt-3 max-w-2xl">
              O relatório básico acima já apresenta seus principais resultados.
              A análise completa aprofunda sua leitura de maturidade,
              interpreta seus padrões comportamentais e sugere um plano
              de desenvolvimento individual para os próximos 90 dias.
            </p>

            <button
              type="button"
              onClick={handleGenerateNarrativeReport}
              disabled={loadingReport}
              className="mt-6 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingReport
                ? "Gerando análise..."
                : "Gerar análise completa com IA"}
            </button>
          </div>

          <NarrativeReport
            report={narrativeReport}
            loading={loadingReport}
            error={reportError}
          />
        </div>
      </main>
    );
  }

  // TERCEIRA ETAPA
  return <AssessmentForm onSubmit={handleSubmit} />;
}
