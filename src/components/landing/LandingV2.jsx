import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Compass,
  ExternalLink,
  Eye,
  Flag,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";

const PAINS = [
  "Tenho estudado muito, mas continuo no mesmo lugar.",
  "Meu portfólio parece bom, mas não consigo oportunidades melhores.",
  "Recebo feedbacks vagos e não sei exatamente o que melhorar.",
  "Não sei qual competência desenvolver primeiro.",
  "Parece que outros designers evoluem mais rápido do que eu.",
  "Tenho capacidade técnica, mas não consigo demonstrar influência ou senioridade.",
];

const PRODUCT_CARDS = [
  { icon: Eye, title: "Clareza", text: "Entenda padrões profissionais que você sente, mas ainda não consegue nomear." },
  { icon: Target, title: "Prioridade", text: "Descubra quais competências merecem atenção primeiro, sem se perder em mais cursos aleatórios." },
  { icon: Compass, title: "Direção", text: "Receba próximos passos práticos para transformar autoconhecimento em desenvolvimento." },
];

const RESULT_ITEMS = [
  "Perfil profissional predominante",
  "Competências que aceleram o crescimento",
  "Competências que podem estar limitando a evolução",
  "Prioridades de desenvolvimento",
  "Plano de 30, 60 e 90 dias",
  "Análise completa com IA no relatório premium",
];

const FAQS = [
  { q: "O Raio-X é um teste psicológico?", a: "Não. É uma autoavaliação de desenvolvimento profissional e não substitui avaliação psicológica, orientação médica ou aconselhamento especializado." },
  { q: "O resultado garante promoção ou contratação?", a: "Não. O resultado oferece uma leitura de autoconhecimento e prioridades de desenvolvimento; decisões de promoção e contratação dependem de diversos fatores externos." },
  { q: "Quanto tempo leva?", a: "Cerca de 10 minutos, dependendo do seu ritmo de leitura e reflexão." },
  { q: "O que recebo gratuitamente?", a: "Ao concluir, você visualiza imediatamente na tela seu score geral, mapa das 10 competências, perfil predominante, pontos fortes e oportunidades de desenvolvimento. A exportação em PDF faz parte do Diagnóstico Completo." },
  { q: "O que existe no relatório completo?", a: "Uma análise narrativa personalizada com IA, cruzamentos entre competências, plano de desenvolvimento de 30, 60 e 90 dias e exportação do relatório completo em PDF. A compra é opcional." },
  { q: "Como meus dados são utilizados?", a: "Usamos os dados para executar o diagnóstico e, com sua autorização, medir a experiência. Ao solicitar a análise completa, perfil e respostas são enviados ao provedor de IA. Consulte a Política de Privacidade e a página de Uso de IA para os detalhes." },
  { q: "Serve apenas para UX/UI?", a: "Não. O diagnóstico foi desenvolvido para profissionais de diferentes áreas do Design, incluindo UX, UI, Produto, Pesquisa, Serviço, Gráfico e outras especialidades." },
  { q: "Posso refazer o diagnóstico?", a: "Sim. Depois de concluir, você pode iniciar um novo diagnóstico. Considere um intervalo para aplicar seu plano e perceber mudanças com mais clareza." },
];

function RadarGraphic() {
  return (
    <svg viewBox="0 0 240 210" className="mx-auto h-full max-h-48 w-full" aria-label="Exemplo do radar de competências">
      {[38, 66, 94].map((radius) => (
        <polygon key={radius} points="120,16 213,83 178,192 62,192 27,83" fill="none" stroke="rgba(148,163,184,.25)" strokeWidth="1" transform={`translate(${120 - radius}, ${105 - radius}) scale(${radius / 100})`} />
      ))}
      <polygon points="120,31 195,88 166,171 73,180 43,86" fill="rgba(129,140,248,.22)" stroke="#818CF8" strokeWidth="2" />
      {["120,31", "195,88", "166,171", "73,180", "43,86"].map((point) => {
        const [cx, cy] = point.split(",");
        return <circle key={point} cx={cx} cy={cy} r="4" fill="#FBBF24" />;
      })}
    </svg>
  );
}

export function HeroReportPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
      <div className="absolute -inset-8 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="relative rotate-[1deg] rounded-[1.5rem] border border-white/15 bg-white/[.07] p-3 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="rounded-[1.1rem] bg-slate-50 p-5 text-slate-900 sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">Prévia do seu Raio-X</p><h2 className="mt-2 text-lg font-bold sm:text-xl">Relatório profissional</h2></div>
            <div className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-white"><strong className="block text-3xl leading-none">77</strong><span className="text-[9px] uppercase tracking-wider">Avançado</span></div>
          </div>
          <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1fr_.9fr]">
            <RadarGraphic />
            <div className="space-y-3">
              {[91, 85, 78, 66].map((score, index) => <div key={score}><div className="mb-1 flex justify-between text-[10px] font-semibold"><span>{["Pensamento crítico", "Colaboração", "Comunicação", "Liderança"][index]}</span><span>{score}</span></div><div className="h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${score}%` }} /></div></div>)}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">{["Forças", "Prioridades", "PDI 90 dias"].map((item) => <span key={item} className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[9px] font-bold text-slate-600">{item}</span>)}</div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-xs font-semibold shadow-xl sm:flex"><Sparkles className="size-4 text-amber-300" /> Resultado gratuito imediato</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[.22em] text-primary">{children}</p>;
}

function CTAButton({ children, onClick, className = "" }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2.5 rounded-sm bg-amber-300 px-7 py-4 text-sm font-bold text-slate-950 shadow-[0_0_35px_rgba(251,191,36,.2)] transition hover:-translate-y-0.5 hover:bg-amber-200 active:scale-[.98] ${className}`}>{children}<ArrowRight className="size-4" /></button>;
}

export function LandingV3Content({ onStart, mentors, onTrack }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-track-section]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sectionName = entry.target.dataset.trackSection;
        const eventName = entry.target.dataset.trackEvent;
        onTrack(eventName, { section_name: sectionName }, `section_${sectionName}`);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    sections.forEach((section) => observer.observe(section));

    const depths = [25, 50, 75, 100];
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const current = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      depths.filter((depth) => current >= depth).forEach((depth) => onTrack("scroll_depth_reached", { scroll_depth: depth, landing_version: "v3" }, `scroll_${depth}`));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onTrack]);

  useEffect(() => {
    const updateVisibility = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      setShowWhatsApp(progress >= 0.3);
    };
    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const start = (location, text, eventName) => {
    onTrack(eventName, { cta_location: location, cta_text: text, landing_version: "v3" }, `${eventName}_${location}`);
    onStart();
  };

  const orderedMentors = [...mentors].sort((a, b) => ["Patrick A. G. Naufel", "Marcos França", "Carlos Guilherme Alencar"].indexOf(a.name) - ["Patrick A. G. Naufel", "Marcos França", "Carlos Guilherme Alencar"].indexOf(b.name));

  return (
    <>
      <section data-track-section="pain" data-track-event="pain_section_viewed" className="relative overflow-hidden border-b border-border px-6 py-20 lg:px-16 lg:py-28">
        <div className="relative mx-auto max-w-6xl">
          <SectionLabel>O que pode estar acontecendo</SectionLabel>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Você se identifica com alguma destas situações?</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
            {PAINS.map((pain, index) => <div key={pain} className="bg-background p-6 sm:p-8"><span className="font-mono text-xs text-primary">0{index + 1}</span><p className="mt-4 max-w-lg leading-relaxed text-foreground/80 sm:text-lg">{pain}</p></div>)}
          </div>
          <p className="mt-12 max-w-4xl text-2xl font-semibold leading-snug text-amber-300 sm:text-3xl">Talvez o problema não seja falta de esforço — mas falta de clareza sobre o que realmente está limitando sua evolução.</p>
        </div>
      </section>

      <section className="border-b border-border bg-card px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Como o Raio-X ajuda</SectionLabel>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">O Raio-X transforma percepções vagas em prioridades claras.</h2>
          <div className="mt-6 max-w-4xl space-y-4 text-lg leading-relaxed text-foreground/68">
            <p>A ferramenta analisa 10 competências comportamentais que influenciam a forma como você se comunica, colabora, toma decisões, aprende, lidera e constrói relações profissionais.</p>
            <p>Ao final, você recebe uma leitura dos seus principais pontos fortes, oportunidades de desenvolvimento e dos fatores que podem estar interferindo no seu crescimento como designer.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PRODUCT_CARDS.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/10 bg-background p-7"><div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-6" /></div><h3 className="mt-6 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground/62">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="resultado" data-track-section="report_preview" data-track-event="report_preview_viewed" className="border-b border-border px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>Prévia do resultado</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Não é apenas uma nota. É uma leitura sobre a sua evolução profissional.</h2>
            <ul className="mt-8 grid gap-3">
              {RESULT_ITEMS.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/75"><Check className="mt-0.5 size-4 shrink-0 text-amber-300" />{item}</li>)}
            </ul>
            <CTAButton className="mt-9" onClick={() => start("report_preview", "Quero entender minha evolução profissional", "midpage_cta_clicked")}>Quero entender minha evolução profissional</CTAButton>
          </div>
          <HeroReportPreview />
        </div>
      </section>

      <section className="border-b border-border bg-card px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Como funciona</SectionLabel>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">Em poucos passos, você transforma dúvida em direção.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              "Conte um pouco sobre seu momento profissional.",
              "Responda às afirmações sobre 10 competências comportamentais.",
              "Receba gratuitamente seu score geral, forças e oportunidades.",
              "Desbloqueie opcionalmente a análise completa e o plano de desenvolvimento.",
            ].map((item, index) => <article key={item} className="flex gap-5 rounded-2xl border border-white/10 bg-background p-6"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">{index + 1}</span><p className="pt-2 leading-relaxed text-foreground/75">{item}</p></article>)}
          </div>
        </div>
      </section>

      <section className="border-b border-border px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-6xl rounded-[1.5rem] border border-primary/20 bg-primary/[.06] p-8 sm:p-12">
          <Lightbulb className="size-8 text-amber-300" />
          <h2 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">Seu próximo salto de carreira pode não depender de aprender outra ferramenta.</h2>
          <div className="mt-6 max-w-4xl space-y-4 text-lg leading-relaxed text-foreground/68">
            <p>Ferramentas mudam. Métodos evoluem. Mas a forma como você comunica ideias, escuta, colabora, se adapta e influencia decisões acompanha toda a sua trajetória profissional.</p>
            <p>O Raio-X ajuda a enxergar essa dimensão que quase nunca aparece no portfólio — mas influencia como o seu trabalho é percebido.</p>
          </div>
        </div>
      </section>

      <section data-track-section="pricing" data-track-event="pricing_section_viewed" className="border-b border-border bg-card px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-[1.5rem] border border-amber-300/20 bg-background p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><SectionLabel>Relatório completo</SectionLabel><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Quer ir além do resultado gratuito?</h2><p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground/68">Desbloqueie uma análise narrativa personalizada, os cruzamentos entre competências e um plano de desenvolvimento de 30, 60 e 90 dias.</p><p className="mt-4 flex items-center gap-2 text-sm text-foreground/55"><LockKeyhole className="size-4" /> O preço e o pagamento são apresentados no fluxo após o resultado gratuito.</p></div>
          <CTAButton onClick={() => start("pricing", "Desbloquear minha análise completa", "checkout_cta_clicked")}>Desbloquear minha análise completa</CTAButton>
        </div>
      </section>

      <section className="border-b border-border px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Equipe</SectionLabel><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Desenvolvido por especialistas em Design, UX e desenvolvimento profissional.</h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">{orderedMentors.map((mentor) => <article key={mentor.name} className="overflow-hidden rounded-2xl border border-white/10 bg-card"><div className="aspect-[4/3] overflow-hidden bg-background"><img src={mentor.image} alt={mentor.name} loading="lazy" className="h-full w-full object-contain object-bottom" /></div><div className="p-6"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{mentor.role}</p><h3 className="mt-2 text-xl font-bold">{mentor.name}</h3><p className="mt-3 text-sm leading-relaxed text-foreground/62">{mentor.bio}</p><a href={mentor.linkedin} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-amber-300">LinkedIn <ExternalLink className="size-3.5" /></a></div></article>)}</div>
        </div>
      </section>

      <section className="border-b border-border bg-card px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-4xl"><SectionLabel>FAQ</SectionLabel><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Dúvidas antes de começar.</h2><div className="mt-10 divide-y divide-white/10 border-y border-white/10">{FAQS.map((item) => <details key={item.q} onToggle={(event) => event.currentTarget.open && onTrack("faq_opened", { section_name: "faq", faq_question: item.q, landing_version: "v3" }, `faq_${item.q}`)} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold"><span>{item.q}</span><span className="text-xl text-primary transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-relaxed text-foreground/65">{item.a}</p></details>)}</div></div>
      </section>

      <section className="relative overflow-hidden px-6 py-20 text-center lg:px-16 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(251,191,36,.13),transparent_45%),radial-gradient(circle_at_15%_10%,rgba(129,140,248,.12),transparent_35%)]" />
        <div className="relative mx-auto max-w-5xl"><Flag className="mx-auto size-8 text-amber-300" /><h2 className="mx-auto mt-6 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Você não precisa continuar tentando evoluir sem saber onde concentrar seus esforços.</h2><CTAButton className="mt-9" onClick={() => start("final", "Descobrir o que está travando minha carreira", "midpage_cta_clicked")}>Descobrir o que está travando minha carreira</CTAButton><p className="mt-4 text-sm text-foreground/55">Comece gratuitamente. O relatório completo é opcional.</p></div>
      </section>

      <a
        href="https://wa.me/5549991106400?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20Raio-X%20do%20Designer."
        target="_blank"
        rel="noreferrer"
        aria-label="Tirar uma dúvida sobre o Raio-X do Designer pelo WhatsApp"
        onClick={() => onTrack("whatsapp_clicked", { location: "floating", landing_version: "v3" })}
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-amber-300/35 bg-[#0B1120]/95 p-2.5 text-white shadow-[0_18px_60px_rgba(0,0,0,.48),0_0_32px_rgba(251,191,36,.12)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:bg-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:bottom-7 sm:right-7 sm:rounded-2xl sm:px-4 sm:py-3 ${showWhatsApp ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-300 text-[#0B1120] shadow-[0_0_22px_rgba(251,191,36,.25)]">
          <MessageCircle className="size-5" />
        </span>
        <span className="hidden pr-1 text-left sm:block">
          <strong className="block text-xs font-bold">Ficou com alguma dúvida?</strong>
          <span className="mt-0.5 block text-[10px] text-white/55">Fale com a equipe do Raio-X</span>
        </span>
      </a>
    </>
  );
}

export function LandingV2Content(props) {
  return <LandingV3Content {...props} />;
}
