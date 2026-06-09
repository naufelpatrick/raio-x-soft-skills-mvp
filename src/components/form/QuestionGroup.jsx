import LikertScale from "./LikertScale";

export default function QuestionGroup({
  competency,
  questions,
  answers,
  onAnswerChange,
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-violet-600 font-semibold">
          Competência
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-2">
          {competency.name}
        </h2>

        <p className="text-slate-500 mt-2">
          Responda com sinceridade considerando seu comportamento profissional mais frequente.
        </p>
      </div>

      <div className="space-y-5">
        {questions.map((question, index) => {
          const questionKey = `${competency.id}_${index + 1}`;

          return (
            <div
              key={questionKey}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <p className="font-medium text-slate-800">
                {index + 1}. {question}
              </p>

              <LikertScale
                value={answers[questionKey]}
                onChange={(value) => onAnswerChange(questionKey, value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}