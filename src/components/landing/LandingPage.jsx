import { useState } from "react";

const benefits = [
  "Leitura de 10 competências comportamentais",
  "Perfil predominante, forças e oportunidades",
  "Plano prático de desenvolvimento para 90 dias",
];

export default function LandingPage({ onStart, hasSavedSession, onResume }) {
  const [consent, setConsent] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-14 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-violet-300 font-semibold">
              Raio-X de Soft Skills
            </p>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mt-5 max-w-4xl">
              Entenda como suas habilidades humanas impulsionam sua carreira em Design.
            </h1>

            <p className="text-lg text-slate-300 mt-6 max-w-2xl leading-relaxed">
              Uma autoavaliação guiada para reconhecer padrões, priorizar seu desenvolvimento e transformar reflexão em ações concretas.
            </p>

            <div className="flex flex-wrap gap-3 mt-8 text-sm text-slate-300">
              <span className="rounded-full border border-slate-700 px-4 py-2">10 competências</span>
              <span className="rounded-full border border-slate-700 px-4 py-2">53 perguntas</span>
              <span className="rounded-full border border-slate-700 px-4 py-2">Aproximadamente 10 minutos</span>
            </div>
          </div>

          <div className="bg-white text-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-violet-950/30">
            <h2 className="text-2xl font-bold">O que você recebe</h2>

            <ul className="space-y-4 mt-6">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3 text-slate-600">
                  <span aria-hidden="true" className="text-violet-600 font-bold">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {hasSavedSession ? (
              <button
                type="button"
                onClick={onResume}
                className="w-full mt-8 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
              >
                Continuar avaliação salva
              </button>
            ) : (
              <>
                <label className="flex gap-3 items-start mt-8 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 size-4 accent-violet-600"
                  />
                  <span>
                    Concordo com o armazenamento local do meu progresso e com a coleta de eventos anônimos de uso para melhoria desta experiência.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={onStart}
                  disabled={!consent}
                  className="w-full mt-5 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Começar meu Raio-X
                </button>
              </>
            )}

            <details className="mt-5 text-xs text-slate-500 leading-relaxed">
              <summary className="cursor-pointer font-semibold text-slate-700">Privacidade e limites da avaliação</summary>
              <p className="mt-3">
                Esta é uma autoavaliação de desenvolvimento profissional, não um teste psicológico ou diagnóstico clínico. Seus dados ficam neste navegador. Somente ao solicitar a análise com IA, perfil e respostas são enviados ao Gemini para gerar a devolutiva.
              </p>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}
