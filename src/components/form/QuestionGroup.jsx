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
          if (question.type === "situational") {
            return (
              <fieldset key={question.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <legend className="font-medium text-slate-800">
                  <span className="mb-3 block text-xs uppercase tracking-wider text-violet-600">Situação de trabalho</span>
                  <span className="block">{index + 1}. {question.scenario}</span>
                  <span className="mt-3 block text-sm">{question.prompt}</span>
                </legend>
                <div className="mt-4 grid gap-2" role="radiogroup">
                  {question.options.map((option) => (
                    <label key={option.id} className={`cursor-pointer rounded-xl border p-3 text-sm focus-within:ring-2 focus-within:ring-violet-500 ${answers[question.id] === option.value ? "border-violet-600 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-700"}`}>
                      <input className="sr-only" type="radio" name={question.id} checked={answers[question.id] === option.value} onChange={() => onAnswerChange(question.id, option.value)} />
                      {option.text}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          }
          return (
            <fieldset
              key={question.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <legend className="font-medium text-slate-800">
                <span className="mb-2 block text-xs uppercase tracking-wider text-slate-500">Pensando no seu comportamento profissional...</span>
                {index + 1}. {question.text}
              </legend>

              <LikertScale
                name={question.id}
                value={answers[question.id]}
                onChange={(value) => onAnswerChange(question.id, value)}
              />
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
