import { useState } from "react";
import { submitInterest } from "../../services/interestService";

const interestOptions = [
  {
    value: "individual_guidance",
    label: "Acompanhamento individual",
    description: "Conversas e direcionamento para aplicar o plano na sua carreira.",
  },
  {
    value: "advanced_report",
    label: "Relatório mais aprofundado",
    description: "Mais contexto, exemplos e recomendações personalizadas.",
  },
  {
    value: "teams",
    label: "Avaliação para equipes",
    description: "Uma leitura coletiva para apoiar desenvolvimento e colaboração.",
  },
  {
    value: "progress_tracking",
    label: "Evolução ao longo do tempo",
    description: "Repetir a avaliação e acompanhar mudanças nas competências.",
  },
];

export default function InterestSection({
  sessionId,
  defaultName,
  recommendation,
  submitted,
  onOpened,
  onSubmitted,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    interest: "",
    name: defaultName || "",
    email: "",
    contactConsent: false,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleOpen() {
    setIsOpen(true);
    onOpened?.();
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.interest || !form.name.trim() || !form.email.trim()) {
      setError("Escolha um interesse e preencha nome e e-mail.");
      return;
    }

    if (!form.contactConsent) {
      setError("Precisamos do seu consentimento para entrar em contato.");
      return;
    }

    setStatus("sending");
    setError("");

    try {
      await submitInterest({
        sessionId,
        interest: form.interest,
        name: form.name.trim(),
        email: form.email.trim(),
        contactConsent: form.contactConsent,
        recommendation,
        source: "post_feedback",
      });
      setStatus("sent");
      onSubmitted?.({ interest: form.interest });
    } catch (submissionError) {
      setStatus("idle");
      setError(submissionError.message);
    }
  }

  if (submitted || status === "sent") {
    return (
      <section className="rounded-3xl bg-violet-950 p-8 text-white">
        <p className="text-sm uppercase tracking-widest text-violet-300 font-semibold">Próxima versão</p>
        <h3 className="text-2xl font-bold mt-3">Interesse registrado.</h3>
        <p className="text-violet-100 mt-2">Obrigado por ajudar a definir os próximos passos do Raio-X.</p>
      </section>
    );
  }

  if (!isOpen) {
    return (
      <section className="rounded-3xl bg-violet-950 p-8 text-white">
        <p className="text-sm uppercase tracking-widest text-violet-300 font-semibold">Próxima versão</p>
        <h3 className="text-2xl font-bold mt-3">Quer continuar construindo essa experiência com a gente?</h3>
        <p className="text-violet-100 mt-3 max-w-2xl">
          Conte qual evolução seria mais útil para você e receba novidades quando ela estiver pronta para ser testada.
        </p>
        <button type="button" onClick={handleOpen} className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-violet-950 hover:bg-violet-50 transition">
          Quero participar da próxima versão
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-violet-950 p-8 text-white">
      <p className="text-sm uppercase tracking-widest text-violet-300 font-semibold">Próxima versão</p>
      <h3 className="text-2xl font-bold mt-3">Qual evolução faria mais diferença para você?</h3>

      <form onSubmit={handleSubmit} className="mt-7 space-y-6">
        <fieldset>
          <legend className="font-semibold">Escolha seu principal interesse</legend>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            {interestOptions.map((option) => (
              <label key={option.value} className={`block rounded-2xl border p-4 cursor-pointer transition ${form.interest === option.value ? "border-violet-300 bg-violet-900" : "border-violet-800 bg-violet-950 hover:border-violet-500"}`}>
                <span className="flex gap-3 items-start">
                  <input type="radio" name="interest" value={option.value} checked={form.interest === option.value} onChange={(event) => update("interest", event.target.value)} className="mt-1 accent-violet-300" />
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    <span className="block text-sm text-violet-200 mt-1">{option.description}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="interest-name" className="font-semibold">Nome</label>
            <input id="interest-name" value={form.name} onChange={(event) => update("name", event.target.value)} maxLength={120} autoComplete="name" className="mt-2 w-full rounded-xl border border-violet-700 bg-violet-900 p-3 text-white placeholder:text-violet-300" />
          </div>
          <div>
            <label htmlFor="interest-email" className="font-semibold">E-mail</label>
            <input id="interest-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} maxLength={254} autoComplete="email" className="mt-2 w-full rounded-xl border border-violet-700 bg-violet-900 p-3 text-white placeholder:text-violet-300" />
          </div>
        </div>

        <label className="flex gap-3 items-start text-sm text-violet-100 cursor-pointer">
          <input type="checkbox" checked={form.contactConsent} onChange={(event) => update("contactConsent", event.target.checked)} className="mt-1 size-4 accent-violet-300" />
          <span>Concordo em receber contato sobre testes e novidades das próximas versões. Posso cancelar esse consentimento a qualquer momento.</span>
        </label>

        {error && <p className="text-sm text-red-200" role="alert">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={status === "sending"} className="rounded-xl bg-white px-6 py-3 font-semibold text-violet-950 hover:bg-violet-50 transition disabled:opacity-50">
            {status === "sending" ? "Registrando..." : "Registrar meu interesse"}
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl px-5 py-3 font-semibold text-violet-200 hover:text-white transition">Agora não</button>
        </div>
      </form>
    </section>
  );
}
