import { useMemo, useState } from "react";
import { competencies } from "../../data/competencies";
import { questions, openQuestions } from "../../data/questions";
import ProgressBar from "./ProgressBar";
import QuestionGroup from "./QuestionGroup";

export default function AssessmentForm({ initialDraft, onProgress, onStepComplete, onSubmit }) {
  const [currentIndex, setCurrentIndex] = useState(initialDraft?.currentIndex || 0);
  const [answers, setAnswers] = useState(initialDraft?.answers || {});
  const [openAnswers, setOpenAnswers] = useState(initialDraft?.openAnswers || {});

  const totalSteps = competencies.length + 1;
  const isOpenQuestionsStep = currentIndex === competencies.length;

  const currentCompetency = competencies[currentIndex];

  const currentQuestions = useMemo(() => {
    if (isOpenQuestionsStep) return null;

    return questions.find(
      (group) => group.competencyId === currentCompetency.id
    );
  }, [currentCompetency, isOpenQuestionsStep]);

  function handleAnswerChange(questionKey, value) {
    const next = { ...answers, [questionKey]: value };
    setAnswers(next);
    onProgress?.({ currentIndex, answers: next, openAnswers });
  }

  function handleOpenAnswerChange(index, value) {
    const next = { ...openAnswers, [`open_${index + 1}`]: value };
    setOpenAnswers(next);
    onProgress?.({ currentIndex, answers, openAnswers: next });
  }

  function isCurrentStepComplete() {
    if (isOpenQuestionsStep) {
      return openQuestions.every((_, index) => {
        const value = openAnswers[`open_${index + 1}`];
        return value && value.trim().length > 0;
      });
    }

    return currentQuestions.items.every((_, index) => {
      const questionKey = `${currentCompetency.id}_${index + 1}`;
      return answers[questionKey];
    });
  }

  function handleNext() {
    if (!isCurrentStepComplete()) {
      alert("Responda todas as perguntas desta etapa antes de continuar.");
      return;
    }

    if (currentIndex < totalSteps - 1) {
      const nextIndex = currentIndex + 1;
      onStepComplete?.(currentIndex, currentCompetency?.id || "open_questions");
      setCurrentIndex(nextIndex);
      onProgress?.({ currentIndex: nextIndex, answers, openAnswers });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    onStepComplete?.(currentIndex, "open_questions");
    onSubmit({
      answers,
      openAnswers,
    });
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      setCurrentIndex(previousIndex);
      onProgress?.({ currentIndex: previousIndex, answers, openAnswers });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <ProgressBar
          currentStep={currentIndex + 1}
          totalSteps={totalSteps}
        />

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {!isOpenQuestionsStep ? (
            <QuestionGroup
              competency={currentCompetency}
              questions={currentQuestions.items}
              answers={answers}
              onAnswerChange={handleAnswerChange}
            />
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-violet-600 font-semibold">
                  Perguntas abertas
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Para personalizar sua análise
                </h2>

                <p className="text-slate-500 mt-2">
                  Essas respostas ajudam a gerar um relatório mais humano e conectado ao seu contexto profissional.
                </p>
              </div>

              <div className="space-y-5">
                {openQuestions.map((question, index) => (
                  <div
                    key={question}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                  >
                    <label className="font-medium text-slate-800">
                      {index + 1}. {question}
                    </label>

                    <textarea
                      value={openAnswers[`open_${index + 1}`] || ""}
                      onChange={(event) =>
                        handleOpenAnswerChange(index, event.target.value)
                      }
                      rows={4}
                      className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      placeholder="Escreva sua resposta..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Voltar
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              {currentIndex === totalSteps - 1
                ? "Gerar meu relatório"
                : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
