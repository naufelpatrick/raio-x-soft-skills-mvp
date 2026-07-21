import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileText,
  MessageSquareText,
  Route,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const REPORT_ITEMS = [
  { title: "Score Geral", type: "score" },
  { title: "Radar das Competências", type: "radar" },
  { title: "Pontos Fortes", type: "strengths" },
  { title: "Oportunidades de Desenvolvimento", type: "opportunities" },
  { title: "Plano de Desenvolvimento Individual", type: "pdi" },
];

const PAINS = [
  "Tenho um bom portfólio, mas continuo sendo ignorado.",
  "Recebo feedbacks parecidos.",
  "Não sei quais competências preciso desenvolver.",
  "Tenho dificuldade para defender minhas ideias.",
  "Vejo profissionais menos experientes crescendo mais rápido.",
];

const BENEFITS = [
  { icon: FileText, title: "Relatório Profissional", text: "Um retrato claro do seu momento." },
  { icon: Users, title: "Competências Comportamentais", text: "O que acelera ou limita sua evolução." },
  { icon: Route, title: "Plano de Desenvolvimento", text: "Prioridades transformadas em ação." },
  { icon: Sparkles, title: "Análise Personalizada", text: "Uma leitura conectada ao seu contexto." },
  { icon: Compass, title: "Clareza para Evoluir", text: "Próximos passos mais conscientes." },
];

const FAQS = [
  { q: "O diagnóstico é gratuito?", a: "Sim. Você começa sem pagar e recebe seu primeiro resultado ao finalizar." },
  { q: "Quanto tempo leva?", a: "Aproximadamente 15 minutos." },
  { q: "É exclusivo para designers?", a: "Sim. As perguntas e a leitura foram criadas para o contexto profissional de Design." },
  { q: "Isso é um teste psicológico?", a: "Não. É uma ferramenta de autoconhecimento e desenvolvimento profissional." },
];

// Preencha estes arrays quando houver volume real. Sem dados, a seção não é renderizada.
const SOCIAL_PROOF = { testimonials: [], reviews: [], comments: [], diagnosisCount: 0 };

function RadarGraphic() {
  return (
    <svg viewBox="0 0 240 210" className="mx-auto h-full max-h-52 w-full" aria-label="Exemplo do radar de competências">
      {[38, 66, 94].map((radius) => (
        <polygon key={radius} points="120,16 213,83 178,192 62,192 27,83" fill="none" stroke="rgba(148,163,184,.22)" strokeWidth="1" transform={`translate(${120 - radius}, ${105 - radius}) scale(${radius / 100})`} />
      ))}
      <polygon points="120,31 195,88 166,171 73,180 43,86" fill="rgba(129,140,248,.22)" stroke="#818CF8" strokeWidth="2" />
      {["120,31", "195,88", "166,171", "73,180", "43,86"].map((point) => {
        const [cx, cy] = point.split(",");
        return <circle key={point} cx={cx} cy={cy} r="4" fill="#FBBF24" />;
      })}
    </svg>
  );
}

function ReportVisual({ type }) {
  if (type === "score") return (
    <div className="grid h-full place-items-center">
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-[.2em] text-slate-500">Índice geral</p>
        <strong className="mt-2 block text-7xl font-black tracking-[-.08em] text-indigo-500">77</strong>
        <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">Nível avançado</span>
      </div>
    </div>
  );
  if (type === "radar") return <RadarGraphic />;
  if (type === "strengths") return (
    <div className="space-y-3 pt-2">
      {["Pensamento crítico", "Colaboração", "Adaptabilidade"].map((item, index) => (
        <div key={item} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          <Check className="size-4 text-emerald-600" /> {item}<span className="ml-auto font-mono text-emerald-600">{91 - index * 4}</span>
        </div>
      ))}
    </div>
  );
  if (type === "opportunities") return (
    <div className="space-y-3 pt-2">
      {["Influência", "Liderança", "Comunicação"].map((item, index) => (
        <div key={item}>
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700"><span>{item}</span><span>{63 + index * 5}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-indigo-500" style={{ width: `${63 + index * 5}%` }} /></div>
        </div>
      ))}
      <p className="pt-2 text-xs leading-relaxed text-slate-500">Prioridades claras para concentrar sua energia.</p>
    </div>
  );
  return (
    <div className="grid h-full gap-3 sm:grid-cols-3">
      {["30 dias", "60 dias", "90 dias"].map((period, index) => (
        <div key={period} className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
          <span className="font-mono text-[10px] font-bold uppercase text-indigo-500">{period}</span>
          <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-700">{["Praticar", "Validar", "Consolidar"][index]} uma competência prioritária.</p>
        </div>
      ))}
    </div>
  );
}

function ReportFrame({ title, type, featured = false }) {
  return (
    <article className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] transition duration-300 hover:-translate-y-1 hover:border-primary/35 ${featured ? "lg:col-span-2" : ""}`}>
      <div className="border-b border-white/10 px-5 py-4">
        <div className="mb-3 flex gap-1.5"><i className="size-2 rounded-full bg-red-400/70" /><i className="size-2 rounded-full bg-amber-300/70" /><i className="size-2 rounded-full bg-emerald-400/70" /></div>
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <div className="m-3 min-h-52 rounded-xl bg-white p-5 text-slate-900 shadow-2xl shadow-black/25"><ReportVisual type={type} /></div>
    </article>
  );
}

export function HeroReportPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[570px] lg:ml-auto">
      <div className="absolute -inset-8 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="relative rotate-[1.5deg] rounded-[1.5rem] border border-white/15 bg-white/[.07] p-3 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="rounded-[1.1rem] bg-slate-50 p-5 text-slate-900 sm:p-7">
          <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">Seu Raio-X</p><h2 className="mt-2 text-xl font-bold">Relatório profissional</h2></div>
            <div className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-white"><strong className="block text-3xl leading-none">77</strong><span className="text-[9px] uppercase tracking-wider">Avançado</span></div>
          </div>
          <div className="mt-5 grid items-center gap-5 sm:grid-cols-[1fr_.85fr]">
            <RadarGraphic />
            <div className="space-y-3">
              {[91, 85, 78, 66].map((score, index) => <div key={score}><div className="mb-1 flex justify-between text-[10px] font-semibold"><span>{["Pensamento crítico", "Colaboração", "Comunicação", "Liderança"][index]}</span><span>{score}</span></div><div className="h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${score}%` }} /></div></div>)}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">{["Forças", "Oportunidades", "PDI 90 dias"].map((item) => <span key={item} className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[9px] font-bold text-slate-600">{item}</span>)}</div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-xs font-semibold shadow-xl sm:flex"><Sparkles className="size-4 text-amber-300" /> Análise personalizada</div>
    </div>
  );
}

export function ResultsShowcase() {
  return (
    <section id="resultado" className="border-b border-border bg-card px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-mono uppercase tracking-[.22em] text-primary">Seu resultado</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Veja o que você recebe.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REPORT_ITEMS.map((item, index) => <ReportFrame key={item.title} {...item} featured={index === 4} />)}
        </div>
      </div>
    </section>
  );
}

export function PainSection() {
  return (
    <section className="relative overflow-hidden border-b border-border px-6 py-24 lg:px-16 lg:py-32">
      <div className="pointer-events-none absolute -left-48 top-0 size-[36rem] rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Talvez o problema da sua carreira não seja o seu portfólio.</h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
          {PAINS.map((pain, index) => <div key={pain} className={`bg-background p-6 sm:p-8 ${index === PAINS.length - 1 ? "md:col-span-2" : ""}`}><span className="font-mono text-xs text-primary">0{index + 1}</span><p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/80 sm:text-lg">{pain}</p></div>)}
        </div>
        <p className="mt-14 text-2xl font-semibold text-amber-300 sm:text-4xl">Talvez o problema não seja técnico.</p>
      </div>
    </section>
  );
}

export function StepsSection() {
  const steps = [
    { icon: ClipboardCheck, title: "Responda", text: "Em aproximadamente quinze minutos." },
    { icon: BarChart3, title: "Receba", text: "Seu diagnóstico personalizado." },
    { icon: TrendingUp, title: "Evolua", text: "Com clareza sobre seus próximos passos." },
  ];
  return (
    <section className="border-b border-border bg-card px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-mono uppercase tracking-[.22em] text-primary">Como funciona</p>
        <div className="mt-12 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {steps.map(({ icon: Icon, title, text }, index) => <div key={title} className="contents"><article className="rounded-2xl border border-white/10 bg-background p-8 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6" /></div><h3 className="mt-6 text-2xl font-bold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground/65">{text}</p></article>{index < 2 && <ArrowDown className="mx-auto size-5 text-amber-300 md:-rotate-90" />}</div>)}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section className="border-b border-border px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-6xl"><p className="text-[10px] font-mono uppercase tracking-[.22em] text-primary">Feito para gerar clareza</p><h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Você entende onde está. E para onde ir.</h2><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{BENEFITS.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><Icon className="size-6 text-amber-300" /><h3 className="mt-8 font-bold leading-snug">{title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground/60">{text}</p></article>)}</div></div>
    </section>
  );
}

export function TeamSection({ mentors }) {
  const order = ["Patrick A. G. Naufel", "Marcos França", "Carlos Guilherme Alencar"];
  const orderedMentors = [...mentors].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  return (
    <section className="border-b border-border bg-card px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl"><p className="text-[10px] font-mono uppercase tracking-[.22em] text-primary">Equipe</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Quem está por trás do Raio-X do Designer</h2><p className="mt-6 text-lg leading-relaxed text-foreground/72">O Raio-X do Designer foi desenvolvido por uma equipe formada por designers e pesquisadores apaixonados pelo desenvolvimento profissional.</p><p className="mt-3 leading-relaxed text-foreground/62">O projeto reúne experiência em UX, Produto, Pesquisa, Educação e Competências Comportamentais para criar um diagnóstico prático, confiável e útil para designers.</p></div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">{orderedMentors.map((m, index) => <article key={m.name} className="group overflow-hidden rounded-[1.25rem] border border-primary/20 bg-background transition duration-300 hover:-translate-y-1 hover:border-primary/35"><div className="relative aspect-[4/5] overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(129,140,248,.08), rgba(11,17,32,.96))" }}><img src={m.image} alt={m.name} className="relative z-10 h-full w-full object-contain object-bottom transition duration-500 group-hover:scale-[1.015]" loading="lazy" /><div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-transparent to-background/95" /><div className="absolute bottom-5 left-5 right-5 z-30 rounded-xl border border-border bg-background/90 px-4 py-3 backdrop-blur"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-semibold"><span className="size-1.5 rounded-full bg-amber-300" />{m.highlights[0]}</span><span className="text-[10px] font-bold uppercase tracking-wider text-primary">{m.initials}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-amber-300" style={{ width: `${92 - index * 4}%` }} /></div></div></div><div className="p-7 lg:p-8"><p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-300">{m.role}</p><h3 className="text-2xl font-bold leading-tight tracking-tight lg:text-3xl">{m.name}</h3><p className="mt-4 text-sm leading-relaxed text-foreground/72">{m.bio}</p><div className="mt-6 flex flex-wrap gap-2">{m.highlights.map((highlight) => <span key={highlight} className="rounded-md bg-secondary px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">{highlight}</span>)}</div><a href={m.linkedin} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-md border border-foreground/30 px-4 py-2.5 text-xs font-semibold transition hover:border-primary hover:text-primary">Conectar no LinkedIn <ExternalLink className="size-3.5" /></a></div></article>)}</div>
      </div>
    </section>
  );
}

export function SocialProofSection() {
  const hasContent = SOCIAL_PROOF.diagnosisCount > 0 || SOCIAL_PROOF.testimonials.length > 0 || SOCIAL_PROOF.reviews.length > 0 || SOCIAL_PROOF.comments.length > 0;
  if (!hasContent) return null;
  return <section aria-label="Prova social" className="border-b border-border px-6 py-24 lg:px-16"><div className="mx-auto max-w-6xl"><MessageSquareText className="size-7 text-primary" /></div></section>;
}

export function FAQSection() {
  return (
    <section className="border-b border-border bg-card px-6 py-24 lg:px-16"><div className="mx-auto max-w-4xl"><p className="text-[10px] font-mono uppercase tracking-[.22em] text-primary">FAQ</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Dúvidas antes de começar.</h2><div className="mt-10 divide-y divide-white/10 border-y border-white/10">{FAQS.map((item) => <details key={item.q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold"><span>{item.q}</span><span className="text-xl text-primary transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-relaxed text-foreground/65">{item.a}</p></details>)}</div></div></section>
  );
}

export function FinalCTA({ onStart }) {
  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-16 lg:py-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(251,191,36,.13),transparent_45%),radial-gradient(circle_at_15%_10%,rgba(129,140,248,.12),transparent_35%)]" /><div className="relative mx-auto max-w-5xl text-center"><p className="text-[10px] font-mono uppercase tracking-[.22em] text-primary">Seu próximo passo</p><h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Descubra hoje o que pode estar limitando sua evolução profissional.</h2><button onClick={onStart} className="mt-10 inline-flex items-center gap-2.5 rounded-sm bg-amber-300 px-8 py-4 text-sm font-bold text-slate-950 shadow-[0_0_35px_rgba(251,191,36,.25)] transition hover:-translate-y-0.5 hover:bg-amber-200">Começar diagnóstico gratuito <ArrowRight className="size-4" /></button></div></section>
  );
}

export function LandingV2Content({ onStart, mentors }) {
  return <><ResultsShowcase /><PainSection /><StepsSection /><BenefitsSection /><TeamSection mentors={mentors} /><SocialProofSection /><FAQSection /><FinalCTA onStart={onStart} /></>;
}
