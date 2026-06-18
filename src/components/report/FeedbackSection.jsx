import { useState } from "react";
import { submitFeedback } from "../../services/feedbackService";

const usefulOptions = [
  "Perfil predominante",
  "Forças e oportunidades",
  "Plano de desenvolvimento",
  "Análise completa com IA",
  "Ainda não encontrei valor",
];

export default function FeedbackSection({ sessionId, usedAI, onSubmitted }) {
  const [form, setForm] = useState({
    accuracy: "",
    recommendation: "",
    usefulPart: "",
    comments: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.accuracy || !form.recommendation || !form.usefulPart) {
      setError("Responda às três perguntas principais antes de enviar.");
      return;
    }

    setStatus("sending");
    setError("");

    try {
      await submitFeedback({
        sessionId,
        accuracy: Number(form.accuracy),
        recommendation: Number(form.recommendation),
        usefulPart: form.usefulPart,
        comments: form.comments.trim(),
        usedAI,
      });
      setStatus("sent");
      onSubmitted?.(form);
    } catch (submissionError) {
      setStatus("idle");
      setError(submissionError.message);
    }
  }

  if (status === "sent") {
    return (
      <section className="bg-emerald-50 rounded-3xl border border-emerald-200 p-8">
        <h3 className="text-xl font-bold text-emerald-900">Obrigado pelo feedback.</h3>
        <p className="text-emerald-700 mt-2">Sua resposta vai orientar as próximas decisões deste MVP.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">Validação do MVP</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-3">Este resultado foi útil para você?</h3>
      <p className="text-slate-600 mt-2">Leva menos de um minuto e ajuda a melhorar esta experiência.</p>

      <form onSubmit={handleSubmit} className="space-y-6 mt-7">
        <div>
          <label htmlFor="accuracy" className="font-semibold text-slate-800">Quanto o resultado fez sentido para você?</label>
          <select id="accuracy" value={form.accuracy} onChange={(event) => update("accuracy", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3">
            <option value="">Selecione uma nota</option>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} — {value === 1 ? "Não fez sentido" : value === 5 ? "Fez muito sentido" : ""}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="recommendation" className="font-semibold text-slate-800">De 0 a 10, quanto você recomendaria esta experiência?</label>
          <select id="recommendation" value={form.recommendation} onChange={(event) => update("recommendation", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3">
            <option value="">Selecione uma nota</option>
            {Array.from({ length: 11 }, (_, value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="usefulPart" className="font-semibold text-slate-800">Qual parte foi mais útil?</label>
          <select id="usefulPart" value={form.usefulPart} onChange={(event) => update("usefulPart", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3">
            <option value="">Selecione uma opção</option>
            {usefulOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="comments" className="font-semibold text-slate-800">O que ficou genérico, incorreto ou poderia melhorar? <span className="font-normal text-slate-500">(opcional)</span></label>
          <textarea id="comments" value={form.comments} onChange={(event) => update("comments", event.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3" />
          <p className="text-xs text-slate-500 mt-1">Evite incluir dados pessoais ou confidenciais.</p>
        </div>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

        <button type="submit" disabled={status === "sending"} className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-50">
          {status === "sending" ? "Enviando..." : "Enviar feedback"}
        </button>
      </form>
    </section>
  );
}
