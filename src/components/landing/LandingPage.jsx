import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  Clock3,
  Compass,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const deliverables = [
  {
    icon: Compass,
    title: "Clareza sobre seu momento",
    description:
      "Entenda seu nível de maturidade em 10 competências essenciais para crescer em Design.",
  },
  {
    icon: BarChart3,
    title: "Forças e pontos de atenção",
    description:
      "Visualize padrões que já ampliam seu impacto e os que podem estar limitando sua evolução.",
  },
  {
    icon: Target,
    title: "Um plano para sair do lugar",
    description:
      "Receba ações práticas para desenvolver suas prioridades nos próximos 30, 60 e 90 dias.",
  },
];

const steps = [
  {
    number: "01",
    title: "Conte seu contexto",
    description: "Objetivo, momento de carreira e desafios atuais.",
  },
  {
    number: "02",
    title: "Responda com sinceridade",
    description: "Uma reflexão guiada sobre comportamentos do dia a dia.",
  },
  {
    number: "03",
    title: "Receba seu Raio-X",
    description: "Scores, perfil, prioridades e um plano de evolução.",
  },
];

function ResultPreview() {
  const bars = [
    { name: "Adaptabilidade", value: 92 },
    { name: "Comunicação", value: 78 },
    { name: "Liderança", value: 61 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto">
      <div className="absolute -inset-8 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="rounded-[1.55rem] bg-white p-5 text-slate-900 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Exemplo de resultado
              </p>
              <h2 className="mt-2 text-xl font-bold">Seu mapa profissional</h2>
            </div>
            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-center">
              <p className="text-2xl font-black text-violet-700">73</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                Avançado
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
            <div className="relative mx-auto aspect-square w-40">
              <svg viewBox="0 0 200 200" className="size-full" aria-label="Prévia de gráfico radar">
                {[80, 60, 40].map((size) => (
                  <polygon
                    key={size}
                    points="100,14 182,74 151,170 49,170 18,74"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    transform={`translate(${100 - size}, ${100 - size}) scale(${size / 100})`}
                  />
                ))}
                <polygon
                  points="100,28 166,79 143,154 61,151 37,78"
                  fill="#8b5cf6"
                  fillOpacity="0.22"
                  stroke="#7c3aed"
                  strokeWidth="3"
                />
                {["100,28", "166,79", "143,154", "61,151", "37,78"].map(
                  (point) => {
                    const [cx, cy] = point.split(",");
                    return <circle key={point} cx={cx} cy={cy} r="4" fill="#7c3aed" />;
                  }
                )}
              </svg>
            </div>

            <div className="space-y-4">
              {bars.map((bar) => (
                <div key={bar.name}>
                  <div className="mb-1.5 flex justify-between text-xs font-semibold">
                    <span>{bar.name}</span>
                    <span className="text-violet-700">{bar.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">PDI para 90 dias</p>
              <p className="text-xs text-emerald-700">Prioridades transformadas em ações concretas.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur sm:flex">
        <Sparkles className="size-4 text-amber-300" />
        Análise personalizada com IA
      </div>
    </div>
  );
}

export default function LandingPage({ onStart, hasSavedSession, onResume }) {
  const [consent, setConsent] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.24),transparent_42%),radial-gradient(circle_at_80%_25%,rgba(217,70,239,0.14),transparent_38%)]" />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <a href="#topo" className="flex items-center gap-3 font-bold tracking-tight text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-950">
              <BrainCircuit className="size-5" />
            </span>
            <span>Raio-X <span className="font-normal text-slate-400">Soft Skills</span></span>
          </a>

          <a href="#comecar" className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:flex">
            Fazer meu Raio-X
            <ArrowRight className="size-4" />
          </a>
        </header>

        <section id="topo" className="relative mx-auto grid max-w-7xl gap-16 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-200">
              <Sparkles className="size-4" />
              Desenvolvimento profissional para designers
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.06] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Descubra o que acelera — e o que trava — sua evolução em{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                Design.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Transforme percepções soltas em um diagnóstico claro das suas habilidades comportamentais — com prioridades e um plano prático para o próximo passo da sua carreira.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {hasSavedSession ? (
                <button type="button" onClick={onResume} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-violet-50">
                  Continuar avaliação salva
                  <ArrowRight className="size-5" />
                </button>
              ) : (
                <a href="#comecar" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-violet-50">
                  Quero meu diagnóstico
                  <ArrowRight className="size-5" />
                </a>
              )}
              <a href="#como-funciona" className="inline-flex items-center justify-center px-5 py-4 font-semibold text-slate-300 transition hover:text-white">
                Ver como funciona
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2"><Clock3 className="size-4 text-violet-300" /> Cerca de 10 minutos</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-emerald-300" /> Resultado imediato</span>
              <span className="flex items-center gap-2"><LockKeyhole className="size-4 text-sky-300" /> Progresso salvo</span>
            </div>
          </div>

          <ResultPreview />
        </section>
      </div>

      <section className="border-y border-white/[0.07] bg-white/[0.025] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-300">Muito além de uma nota</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Você sai com clareza para agir.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">O Raio-X conecta seu contexto profissional aos comportamentos que sustentam impacto, influência e crescimento.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {deliverables.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.06]">
                <div className="grid size-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-relaxed text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-300">Como funciona</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Uma pausa estratégica na sua carreira.</h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-400">Sem respostas certas ou erradas. O valor está em olhar com honestidade para a forma como você trabalha, decide e se relaciona.</p>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <article key={step.number} className="grid grid-cols-[auto_1fr] gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 sm:p-8">
                  <span className="text-2xl font-black text-violet-400">{step.number}</span>
                  <div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-slate-400">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="comecar" className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-violet-700 to-violet-950 p-7 shadow-2xl shadow-violet-950/40 sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-200">Seu próximo passo começa aqui</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Pare de desenvolver tudo ao mesmo tempo.</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-violet-100">Descubra quais competências merecem sua energia agora e leve um plano concreto para os próximos 90 dias.</p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-violet-100">
                <span className="flex items-center gap-2"><Check className="size-4" /> 10 competências</span>
                <span className="flex items-center gap-2"><Check className="size-4" /> Perfil predominante</span>
                <span className="flex items-center gap-2"><Check className="size-4" /> PDI personalizado</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl sm:p-7">
              {hasSavedSession ? (
                <>
                  <p className="font-bold">Seu progresso está salvo.</p>
                  <p className="mt-2 text-sm text-slate-600">Continue exatamente de onde parou.</p>
                  <button type="button" onClick={onResume} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-bold text-white transition hover:bg-violet-700">
                    Continuar avaliação
                    <ArrowRight className="size-5" />
                  </button>
                </>
              ) : (
                <>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-600">
                    <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 size-4 shrink-0 accent-violet-600" />
                    <span>Concordo com o armazenamento local do progresso e com eventos anônimos para melhoria da experiência.</span>
                  </label>

                  <button type="button" onClick={onStart} disabled={!consent} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
                    Começar meu Raio-X
                    <ArrowRight className="size-5" />
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    Seus dados permanecem neste navegador.
                  </div>
                </>
              )}

              <details className="mt-5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
                <summary className="cursor-pointer font-semibold text-slate-700">Privacidade e limites da avaliação</summary>
                <p className="mt-3">Esta é uma autoavaliação de desenvolvimento profissional, não um teste psicológico. Somente ao solicitar a análise com IA, perfil e respostas são enviados ao Gemini para gerar a devolutiva.</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.07] px-5 py-8 text-center text-sm text-slate-500 sm:px-8">
        Raio-X de Soft Skills · Um MVP em validação para profissionais de Design
      </footer>
    </main>
  );
}
