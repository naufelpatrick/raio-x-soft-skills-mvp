import { useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from "recharts";
import {
  ChevronLeft, ArrowRight, BarChart2, BookOpen, Target,
  Zap, Check, RefreshCw, Sparkles, Loader2,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const COMPETENCIES = [
  { id: "comunicacao", name: "Comunicação", icon: "💬", desc: "Transmitir ideias com clareza, reduzir ruídos e adaptar a linguagem ao contexto." },
  { id: "empatia", name: "Empatia", icon: "❤️", desc: "Compreender contextos e perspectivas diversas antes de tirar conclusões." },
  { id: "inteligencia_emocional", name: "Inteligência Emocional", icon: "🧠", desc: "Reconhecer e regular emoções, especialmente sob pressão." },
  { id: "pensamento_critico", name: "Pensamento Crítico", icon: "🔍", desc: "Analisar informações, questionar premissas e tomar decisões fundamentadas." },
  { id: "colaboracao", name: "Colaboração", icon: "🤝", desc: "Construir soluções em conjunto e compartilhar responsabilidades." },
  { id: "adaptabilidade", name: "Adaptabilidade", icon: "🔄", desc: "Lidar com mudanças e evoluir em cenários de incerteza." },
  { id: "escuta_ativa", name: "Escuta Ativa", icon: "👂", desc: "Ouvir com presença e interpretar sinais verbais e não verbais." },
  { id: "lideranca", name: "Liderança", icon: "⭐", desc: "Influenciar positivamente e construir ambientes de confiança." },
  { id: "aprendizado", name: "Aprendizado Contínuo", icon: "📚", desc: "Manter curiosidade e transformar conhecimento em prática." },
  { id: "proposito", name: "Propósito", icon: "🎯", desc: "Encontrar significado e impacto no trabalho realizado." },
];

const QUESTIONS = {
  comunicacao: [
    "Procuro confirmar se a outra pessoa realmente compreendeu minha mensagem.",
    "Adapto minha linguagem de acordo com o público com quem estou falando.",
    "Costumo simplificar assuntos complexos para facilitar o entendimento.",
    "Escuto atentamente antes de responder.",
    "Solicito feedback sobre a clareza da minha comunicação.",
  ],
  empatia: [
    "Busco compreender o contexto antes de tirar conclusões sobre alguém.",
    "Faço perguntas para entender melhor diferentes perspectivas.",
    "Consigo reconhecer emoções mesmo quando elas não são verbalizadas.",
    "Evito julgar rapidamente comportamentos ou decisões de outras pessoas.",
    "Consigo discordar mantendo respeito e abertura ao diálogo.",
  ],
  inteligencia_emocional: [
    "Consigo perceber minhas emoções antes de reagir impulsivamente.",
    "Mantenho a calma em situações de pressão ou conflito.",
    "Consigo separar críticas ao meu trabalho de críticas à minha pessoa.",
    "Faço pausas para refletir antes de responder em momentos difíceis.",
    "Reconheço quando minhas emoções estão influenciando minhas decisões.",
  ],
  pensamento_critico: [
    "Procuro evidências antes de defender uma opinião.",
    "Questiono premissas e soluções antes de aceitá-las.",
    "Consigo diferenciar fatos, opiniões e interpretações.",
    "Avalio diferentes perspectivas antes de tomar decisões importantes.",
    "Reviso minhas próprias crenças quando encontro novas informações.",
  ],
  colaboracao: [
    "Compartilho conhecimento e experiências com outras pessoas.",
    "Consigo construir soluções em conjunto sem necessidade de impor minhas ideias.",
    "Dou crédito às contribuições de colegas e parceiros.",
    "Vejo divergências como oportunidades de melhorar soluções.",
    "Busco alinhamento antes de acelerar decisões importantes.",
  ],
  adaptabilidade: [
    "Consigo me ajustar rapidamente a mudanças de cenário ou prioridades.",
    "Estou aberto a aprender novas ferramentas e métodos.",
    "Reavalio processos quando percebo que já não funcionam bem.",
    "Vejo mudanças como oportunidades de crescimento.",
    "Consigo manter produtividade mesmo diante de incertezas.",
  ],
  escuta_ativa: [
    "Evito interromper enquanto outra pessoa está falando.",
    "Demonstro interesse genuíno durante conversas.",
    "Faço perguntas para aprofundar minha compreensão.",
    "Observo sinais não verbais durante interações.",
    "Confirmo se compreendi corretamente o que a outra pessoa quis dizer.",
  ],
  lideranca: [
    "Assumo responsabilidade pelos resultados das minhas decisões.",
    "Procuro dar exemplo por meio das minhas atitudes.",
    "Incentivo a participação de outras pessoas nas decisões.",
    "Crio um ambiente seguro para opiniões diferentes.",
    "Ofereço feedbacks respeitosos e construtivos.",
  ],
  aprendizado: [
    "Reservo tempo regularmente para aprender algo novo.",
    "Busco conteúdos fora da minha área principal de atuação.",
    "Transformo aprendizado em prática.",
    "Mantenho curiosidade mesmo em assuntos que já domino.",
    "Estou aberto a rever conhecimentos e opiniões.",
  ],
  proposito: [
    "Consigo enxergar significado no trabalho que realizo.",
    "Meus valores influenciam minhas decisões profissionais.",
    "Percebo como meu trabalho impacta outras pessoas.",
    "Reflito regularmente sobre minha direção profissional.",
    "Sinto que minhas atividades estão alinhadas ao que considero importante.",
  ],
};

const OPEN_QUESTIONS = [
  "Qual é hoje o maior desafio comportamental da sua vida profissional?",
  "Qual competência você acredita precisar desenvolver com mais urgência?",
  "Existe alguma situação recorrente no trabalho que gera desconforto, insegurança ou dificuldade para você?",
];

const LIKERT_LABELS = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];

const PROFILES = [
  { id: "comunicador", name: "Comunicador Estratégico", competencies: ["comunicacao", "escuta_ativa", "empatia"], desc: "Você cria entendimento entre pessoas, traduz ideias complexas e alinha expectativas com clareza." },
  { id: "facilitador", name: "Facilitador Humano", competencies: ["empatia", "colaboracao", "lideranca"], desc: "Você fortalece relações, reduz conflitos e constrói ambientes de confiança." },
  { id: "pensador", name: "Pensador Analítico", competencies: ["pensamento_critico", "aprendizado", "comunicacao"], desc: "Você busca evidências, questiona premissas e compreende problemas em profundidade." },
  { id: "transformador", name: "Agente de Transformação", competencies: ["adaptabilidade", "lideranca", "proposito"], desc: "Você prospera na mudança e tem forte potencial para conduzir transformações." },
  { id: "aprendiz", name: "Aprendiz Permanente", competencies: ["aprendizado", "adaptabilidade", "pensamento_critico"], desc: "Você vê o desenvolvimento como contínuo e expande constantemente seu repertório." },
  { id: "conector", name: "Construtor de Conexões", competencies: ["comunicacao", "colaboracao", "empatia"], desc: "Você conecta pessoas, perspectivas e ideias — favorecendo alinhamento e colaboração." },
  { id: "lider", name: "Líder Inspirador", competencies: ["lideranca", "comunicacao", "proposito"], desc: "Você influencia por clareza, exemplo e pelo significado que atribui às ações." },
  { id: "consciente", name: "Profissional Consciente", competencies: ["inteligencia_emocional", "empatia", "escuta_ativa"], desc: "Você demonstra alta consciência emocional e compreensão de contextos humanos." },
];

const CROSS_ANALYSIS = [
  { id: "comunicador_consciente", title: "Comunicador Consciente", high: ["comunicacao", "escuta_ativa"], low: [], interpretation: "Você combina clareza na transmissão com presença genuína na escuta — uma combinação rara e valiosa em líderes." },
  { id: "lider_influente", title: "Líder Influente", high: ["comunicacao", "lideranca"], low: [], interpretation: "Você conduz pessoas por meio da clareza — suas palavras têm peso e suas posições geram movimento." },
  { id: "estrategista", title: "Estrategista", high: ["pensamento_critico", "comunicacao"], low: [], interpretation: "Você combina análise rigorosa com habilidade de transmitir ideias — perfil de quem resolve e articula soluções." },
  { id: "analista_racional", title: "Analista Racional", high: ["pensamento_critico"], low: ["empatia"], interpretation: "Sua análise é precisa, mas pode subestimar o impacto emocional das decisões — desenvolver empatia amplia sua influência." },
  { id: "colaborador_empatico", title: "Colaborador Empático", high: ["colaboracao", "empatia"], low: [], interpretation: "Você cria ambientes de co-criação seguros e inclusivos — as pessoas se sentem vistas e ouvidas em sua presença." },
  { id: "adaptador_consciente", title: "Adaptador Consciente", high: ["adaptabilidade", "inteligencia_emocional"], low: [], interpretation: "Você navega mudanças sem perder equilíbrio interno — essencial em cenários de alta volatilidade." },
  { id: "lider_proposital", title: "Líder com Propósito", high: ["lideranca", "proposito"], low: [], interpretation: "Você lidera conectado ao significado — inspira porque acredita genuinamente no impacto do trabalho." },
  { id: "aprendiz_ativo", title: "Aprendiz Ativo", high: ["aprendizado", "adaptabilidade"], low: [], interpretation: "Você não só absorve conhecimento — você o aplica e evolui com ele. Perfil de quem cresce em qualquer contexto." },
];

const PDI_ACTIONS = {
  comunicacao: {
    days30: ["Solicitar feedback sobre clareza em reuniões e apresentações.", "Praticar síntese de informações complexas em poucos minutos."],
    days60: ["Conduzir uma apresentação ou alinhamento de equipe.", "Treinar adaptação da linguagem para públicos diferentes."],
    days90: ["Mentorar alguém em comunicação profissional.", "Assumir papel de facilitador em discussões importantes."],
  },
  empatia: {
    days30: ["Antes de reagir, perguntar: 'Qual é o contexto dessa pessoa?'", "Praticar escuta sem interrupção em conversas do dia a dia."],
    days60: ["Conduzir uma conversa difícil com foco na perspectiva do outro.", "Solicitar feedback sobre como as pessoas se sentem em interações com você."],
    days90: ["Desenvolver um projeto que exija colaboração com diferentes perfis.", "Criar rituais de check-in emocional em times ou reuniões."],
  },
  inteligencia_emocional: {
    days30: ["Iniciar uma prática diária de registro emocional (journaling).", "Identificar os 3 gatilhos emocionais mais frequentes no trabalho."],
    days60: ["Praticar pausa consciente antes de responder em situações de pressão.", "Buscar um espaço de reflexão (mentoria, terapia ou coaching)."],
    days90: ["Conduzir uma conversa difícil com regulação emocional consciente.", "Desenvolver um protocolo pessoal para situações de conflito."],
  },
  pensamento_critico: {
    days30: ["Antes de aceitar uma informação, perguntar: 'Quais são as evidências?'", "Ler um artigo de área diferente e identificar premissas."],
    days60: ["Aplicar uma estrutura de análise (SWOT, 5 Porquês) em um problema real.", "Apresentar dois pontos de vista opostos sobre um tema do seu trabalho."],
    days90: ["Liderar uma sessão de questionamento de premissas com um time.", "Documentar um processo de decisão com análise crítica explícita."],
  },
  colaboracao: {
    days30: ["Dar crédito público a alguém que contribuiu com uma ideia.", "Propor uma sessão de co-criação em vez de resolver sozinho."],
    days60: ["Facilitar um alinhamento entre pessoas com perspectivas diferentes.", "Pedir ajuda explícita em algo que normalmente faria sozinho."],
    days90: ["Liderar um projeto com responsabilidade compartilhada.", "Criar uma rotina de troca de conhecimento no seu time."],
  },
  adaptabilidade: {
    days30: ["Identificar uma crença rígida e questioná-la conscientemente.", "Experimentar uma nova ferramenta ou método de trabalho."],
    days60: ["Aceitar voluntariamente uma tarefa fora da sua zona de conforto.", "Reavaliar um processo que usa há mais de 6 meses."],
    days90: ["Liderar uma mudança ou transição dentro do seu contexto.", "Documentar aprendizados de uma situação de incerteza que enfrentou."],
  },
  escuta_ativa: {
    days30: ["Em conversas, praticar não interromper e esperar o silêncio.", "Após reuniões, resumir o que ouviu para confirmar entendimento."],
    days60: ["Conduzir uma entrevista ou conversa de descoberta com um colega.", "Registrar sinais não verbais que percebeu em uma conversa importante."],
    days90: ["Facilitar uma sessão onde você escuta mais do que fala.", "Pedir feedback sobre a qualidade da sua escuta a pessoas próximas."],
  },
  lideranca: {
    days30: ["Assumir responsabilidade por uma decisão — mesmo impopular.", "Oferecer um feedback construtivo e respeitoso a alguém."],
    days60: ["Criar espaço para que outras pessoas expressem opiniões em reuniões.", "Identificar alguém para desenvolver e oferecer apoio estruturado."],
    days90: ["Liderar um projeto de ponta a ponta com autonomia e responsabilidade.", "Criar uma prática de reconhecimento de contribuições no time."],
  },
  aprendizado: {
    days30: ["Reservar 20 minutos diários para aprendizado fora da área principal.", "Ler ou assistir algo que desafie sua perspectiva atual."],
    days60: ["Aplicar um aprendizado recente em um projeto real.", "Compartilhar algo que aprendeu com um colega ou time."],
    days90: ["Desenvolver uma habilidade nova que pode ser medida.", "Criar um plano de desenvolvimento pessoal com metas concretas."],
  },
  proposito: {
    days30: ["Escrever sobre o impacto que seu trabalho gera nas pessoas ao redor.", "Identificar quais atividades te geram mais energia e significado."],
    days60: ["Ter uma conversa sobre valores com alguém que você admira.", "Conectar seu trabalho atual a um objetivo de médio prazo."],
    days90: ["Definir um projeto que esteja alinhado aos seus valores.", "Criar rituais de reflexão periódica sobre direção e propósito."],
  },
};

// ─── SCORING ─────────────────────────────────────────────────────────────────

function getLevel(score) {
  if (score <= 20) return "Inicial";
  if (score <= 40) return "Emergente";
  if (score <= 60) return "Consistente";
  if (score <= 80) return "Avançado";
  return "Referência";
}

const LEVEL_COLORS = {
  Inicial: "#f87171",
  Emergente: "#fb923c",
  Consistente: "#facc15",
  Avançado: "#818cf8",
  Referência: "#34d399",
};

function calculateScores(answers) {
  return COMPETENCIES.map((c) => {
    const raw = [1, 2, 3, 4, 5].reduce(
      (sum, i) => sum + (answers[`${c.id}_${i}`] || 0),
      0
    );
    const score = Math.round(((raw - 5) / 20) * 100);
    return { id: c.id, name: c.name, score, level: getLevel(score) };
  });
}

function getProfileResult(scores) {
  const map = Object.fromEntries(scores.map((s) => [s.id, s.score]));
  let best = PROFILES[0];
  let bestAvg = -1;
  for (const p of PROFILES) {
    const avg = p.competencies.reduce((sum, id) => sum + (map[id] || 0), 0) / p.competencies.length;
    if (avg > bestAvg) { bestAvg = avg; best = p; }
  }
  return best;
}

function getCrossResults(scores) {
  const map = Object.fromEntries(scores.map((s) => [s.id, s.score]));
  return CROSS_ANALYSIS.filter(
    (r) =>
      r.high.every((id) => (map[id] || 0) >= 60) &&
      r.low.every((id) => (map[id] || 0) <= 50)
  ).slice(0, 4);
}

// ─── LANDING ─────────────────────────────────────────────────────────────────

const DEMO_SCORES = [85, 72, 68, 91, 77, 63, 88, 74, 80, 59];

function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium tracking-tight text-foreground">Raio-X de Soft Skills</span>
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Começar <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_420px] min-h-[88vh]">
        <div className="flex flex-col justify-center px-6 lg:px-16 py-20">
          <div className="inline-flex items-center gap-2 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-medium mb-10 w-fit">
            <Zap className="w-3 h-3" />
            Avaliação gratuita · 15 minutos
          </div>
          <h1
            className="text-5xl lg:text-[64px] leading-[1.1] mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
          >
            Descubra o mapa<br />
            das suas{" "}
            <em className="text-primary not-italic">competências humanas</em>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg">
            50 perguntas, 10 competências, 1 diagnóstico preciso. Identifique seus pontos fortes,
            oportunidades e receba um plano de ação personalizado.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <button
              onClick={onStart}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-sm font-medium hover:opacity-90 transition-opacity"
            >
              Iniciar diagnóstico <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {["Gratuito", "Sem cadastro", "Resultado imediato"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center bg-card border-l border-border px-10 py-16">
          <div className="w-full space-y-3">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-6">
              Prévia do diagnóstico
            </p>
            {COMPETENCIES.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-36 truncate text-right">{c.name}</span>
                <div className="flex-1 bg-secondary rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${DEMO_SCORES[i]}%`,
                      backgroundColor: LEVEL_COLORS[getLevel(DEMO_SCORES[i])],
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                  {DEMO_SCORES[i]}
                </span>
              </div>
            ))}
            <div className="pt-5 mt-2 border-t border-border">
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">
                Índice geral
              </div>
              <div className="text-4xl font-mono font-medium text-primary">77</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                Nível <span className="text-primary">Avançado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
            Como funciona
          </p>
          <h2
            className="text-3xl lg:text-4xl mb-14"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
          >
            Três etapas para um diagnóstico preciso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "01", Icon: BookOpen, title: "Avaliação", desc: "Responda 50 afirmações sobre comportamentos reais no trabalho, em escala de 1 a 5." },
              { step: "02", Icon: BarChart2, title: "Diagnóstico", desc: "Receba seu score em 10 competências, seu perfil predominante e padrões comportamentais." },
              { step: "03", Icon: Target, title: "Plano de Ação", desc: "Um PDI personalizado com ações concretas para 30, 60 e 90 dias." },
            ].map(({ step, Icon, title, desc }) => (
              <div key={step}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-xs text-muted-foreground">{step}</span>
                  <div className="w-9 h-9 bg-primary/10 rounded-sm flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <h3 className="font-medium mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-20 bg-card border-t border-border">
        <div className="max-w-2xl">
          <h2
            className="text-3xl mb-4"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
          >
            Pronto para se conhecer melhor?
          </h2>
          <p className="text-muted-foreground mb-8">
            A avaliação leva cerca de 15 minutos e o resultado é imediato.
          </p>
          <button
            onClick={onStart}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-sm font-medium hover:opacity-90 transition-opacity"
          >
            Iniciar agora <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

// ─── PROFILE FORM ─────────────────────────────────────────────────────────────

function ProfileForm({ onSubmit, onBack }) {
  const [form, setForm] = useState({
    name: "", age: "", experience: "", currentRole: "",
    professionalLevel: "", mainArea: "", careerGoal: "", currentChallenge: "",
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const canSubmit = Object.values(form).every((v) => v.trim().length > 0);

  const inputCls =
    "w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";
  const labelCls = "block text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border sticky top-0 bg-background z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <span className="text-xs text-muted-foreground font-mono">Etapa 1/3 — Perfil</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1
          className="text-3xl lg:text-4xl mb-2"
          style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
        >
          Seu perfil profissional
        </h1>
        <p className="text-muted-foreground mb-10">
          Essas informações personalizam a análise e o plano de desenvolvimento.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nome</label>
              <input type="text" placeholder="Seu nome completo" value={form.name} onChange={update("name")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Idade</label>
              <input type="number" placeholder="Ex: 32" value={form.age} onChange={update("age")} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Cargo atual</label>
              <input type="text" placeholder="Ex: Product Designer" value={form.currentRole} onChange={update("currentRole")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tempo de experiência</label>
              <input type="text" placeholder="Ex: 5 anos" value={form.experience} onChange={update("experience")} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nível profissional</label>
              <select value={form.professionalLevel} onChange={update("professionalLevel")} className={inputCls}>
                <option value="">Selecione</option>
                {["Júnior", "Pleno", "Sênior", "Especialista", "Líder", "Gestor"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Área principal</label>
              <select value={form.mainArea} onChange={update("mainArea")} className={inputCls}>
                <option value="">Selecione</option>
                {["Pesquisa", "UX", "UI", "Product Design", "Design System", "Liderança", "Generalista", "Outro"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Objetivo de carreira (próximos 12 meses)</label>
            <textarea
              placeholder="O que você quer alcançar profissionalmente no próximo ano?"
              value={form.careerGoal}
              onChange={update("careerGoal")}
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          <div>
            <label className={labelCls}>Principal desafio atual</label>
            <textarea
              placeholder="Qual é o maior obstáculo que você enfrenta hoje?"
              value={form.currentChallenge}
              onChange={update("currentChallenge")}
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          <button
            onClick={() => canSubmit && onSubmit(form)}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Iniciar avaliação <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ASSESSMENT ───────────────────────────────────────────────────────────────

function AssessmentForm({ answers, onAnswer, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const TOTAL = 11;
  const competency = COMPETENCIES[step];
  const isOpen = step === 10;

  const stepAnswered = () => {
    if (!isOpen) {
      return [1, 2, 3, 4, 5].every((i) => answers[`${competency.id}_${i}`]);
    }
    return OPEN_QUESTIONS.every((_, i) => (answers[`open_${i + 1}`] || "").trim().length > 0);
  };

  const progress = Math.round((step / TOTAL) * 100);

  const advance = () => {
    if (!stepAnswered()) return;
    if (step < 10) { setStep((s) => s + 1); window.scrollTo(0, 0); }
    else onComplete();
  };

  const retreat = () => {
    if (step === 0) onBack();
    else { setStep((s) => s - 1); window.scrollTo(0, 0); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 bg-background border-b border-border px-6 lg:px-12 py-5 flex items-center gap-6">
        <button
          onClick={retreat}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" /> {step === 0 ? "Voltar" : "Anterior"}
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 bg-secondary rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {step + 1}/{TOTAL}
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {!isOpen ? (
          <>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-11 h-11 bg-primary/10 rounded-sm flex items-center justify-center text-xl shrink-0">
                {competency.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">
                  Competência {step + 1}/10
                </p>
                <h2 className="text-2xl font-medium">{competency.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{competency.desc}</p>
              </div>
            </div>

            <div className="space-y-8">
              {QUESTIONS[competency.id].map((q, qi) => {
                const key = `${competency.id}_${qi + 1}`;
                const val = answers[key];
                return (
                  <div key={qi}>
                    <p className="text-sm leading-relaxed mb-4 text-foreground/90">{q}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => onAnswer(key, v)}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-sm border text-sm transition-all ${
                            val === v
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <span className="font-mono font-medium">{v}</span>
                          <span className="text-[10px] leading-tight text-center hidden sm:block px-1">
                            {LIKERT_LABELS[v - 1]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-2">
                Etapa 11/11
              </p>
              <h2
                className="text-3xl"
                style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
              >
                Reflexão final
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Três perguntas abertas para aprofundar o diagnóstico.
              </p>
            </div>
            <div className="space-y-8">
              {OPEN_QUESTIONS.map((q, i) => (
                <div key={i}>
                  <p className="text-sm leading-relaxed mb-3 text-foreground/90">{q}</p>
                  <textarea
                    value={answers[`open_${i + 1}`] || ""}
                    onChange={(e) => onAnswer(`open_${i + 1}`, e.target.value)}
                    placeholder="Sua resposta..."
                    rows={4}
                    className="w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-12">
          <button
            onClick={advance}
            disabled={!stepAnswered()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {step < 10 ? "Próxima competência" : "Ver meu diagnóstico"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────

function NarrativeReport({ text }) {
  const lines = text.split("\n");
  const elements = [];
  lines.forEach((line, i) => {
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-lg font-medium mt-6 mb-2 text-foreground">
          {line.replace("## ", "")}
        </h3>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      const rendered = line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={j} className="text-foreground font-medium">{part.slice(2, -2)}</strong>
          : part
      );
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">{rendered}</p>
      );
    }
  });
  return <div>{elements}</div>;
}

function Results({ profileData, scores, answers, onReset }) {
  const [aiText, setAiText] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const generalScore = Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length);
  const generalLevel = getLevel(generalScore);
  const profile = getProfileResult(scores);
  const crossResults = getCrossResults(scores);
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 3);
  const opportunities = sorted.slice(-3).reverse();

  const radarData = COMPETENCIES.map((c) => {
    const s = scores.find((x) => x.id === c.id);
    return { subject: c.name.split(" ")[0], score: s ? s.score : 0, fullMark: 100 };
  });

  async function generateAiReport() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData,
          scores,
          answers,
          generalScore,
          generalLevel,
          profileName: profile.name,
          profileDesc: profile.desc,
          strengths,
          opportunities,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setAiError(data.error || "Erro desconhecido. Tente novamente.");
      } else {
        setAiText(data.text);
      }
    } catch {
      setAiError("Não foi possível conectar ao servidor.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">Raio-X de Soft Skills</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Nova avaliação
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
        <div className="flex items-start justify-between gap-8 flex-wrap pb-10 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
              Diagnóstico de
            </p>
            <h1
              className="text-4xl lg:text-5xl mb-2"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
            >
              {profileData.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profileData.currentRole} · {profileData.professionalLevel} · {profileData.mainArea}
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-7xl font-mono font-medium leading-none"
              style={{ color: LEVEL_COLORS[generalLevel] }}
            >
              {generalScore}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Índice Geral ·{" "}
              <span style={{ color: LEVEL_COLORS[generalLevel] }}>{generalLevel}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-sm p-6">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
              Mapa de competências
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke="#818CF8"
                  fill="#818CF8"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  dot={{ fill: "#818CF8", r: 3, strokeWidth: 0 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-sm p-6 flex flex-col">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
              Perfil predominante
            </p>
            <h3
              className="text-2xl mb-3"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
            >
              {profile.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{profile.desc}</p>
            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-border">
              {profile.competencies.map((id) => {
                const c = COMPETENCIES.find((x) => x.id === id);
                return c ? (
                  <span key={id} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {c.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-6">
            Pontuação por competência
          </p>
          <div className="space-y-4">
            {sorted.map((s) => (
              <div key={s.id} className="flex items-center gap-4">
                <span className="text-sm text-foreground/80 w-44 shrink-0 truncate">{s.name}</span>
                <div className="flex-1 bg-secondary rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${s.score}%`, backgroundColor: LEVEL_COLORS[s.level] }}
                  />
                </div>
                <span className="font-mono text-sm w-8 text-right">{s.score}</span>
                <span className="text-xs text-muted-foreground w-24 text-right">{s.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-sm p-6">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-5">Forças</p>
            <div className="space-y-5">
              {strengths.map((s, i) => (
                <div key={s.id} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0">0{i + 1}</span>
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="font-mono text-xs" style={{ color: LEVEL_COLORS[s.level] }}>{s.score}</span>
                    </div>
                    <span className="text-xs" style={{ color: LEVEL_COLORS[s.level] }}>{s.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-6">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-5">Oportunidades</p>
            <div className="space-y-5">
              {opportunities.map((s, i) => (
                <div key={s.id} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0">0{i + 1}</span>
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="font-mono text-xs" style={{ color: LEVEL_COLORS[s.level] }}>{s.score}</span>
                    </div>
                    <span className="text-xs" style={{ color: LEVEL_COLORS[s.level] }}>{s.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {crossResults.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-2">
              Padrões comportamentais identificados
            </p>
            <h2
              className="text-2xl mb-6"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
            >
              Como suas competências se combinam
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crossResults.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-sm p-5">
                  <h4 className="text-sm font-medium mb-2">{r.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-2">
            Plano de Desenvolvimento Individual
          </p>
          <h2
            className="text-2xl mb-8"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
          >
            Ações para os próximos 90 dias
          </h2>
          <div className="space-y-5">
            {opportunities.map((s, oi) => {
              const pdi = PDI_ACTIONS[s.id];
              if (!pdi) return null;
              return (
                <div key={s.id} className="bg-card border border-border rounded-sm p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <span className="font-mono text-xs text-muted-foreground">0{oi + 1}</span>
                    <h3 className="font-medium">{s.name}</h3>
                    <span className="ml-auto font-mono text-sm" style={{ color: LEVEL_COLORS[s.level] }}>
                      {s.score}/100 · {s.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[["30 dias", pdi.days30], ["60 dias", pdi.days60], ["90 dias", pdi.days90]].map(([label, actions]) => (
                      <div key={label}>
                        <p className="text-xs text-primary font-mono uppercase tracking-widest mb-3">{label}</p>
                        <ul className="space-y-2.5">
                          {actions.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                              <span className="text-primary mt-0.5 shrink-0">→</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">
                Diagnóstico avançado
              </p>
              <h2 className="text-2xl" style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
                Análise narrativa com IA
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Interpretação aprofundada do seu perfil gerada pelo Claude.
              </p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>

          {!aiText && !aiLoading && (
            <button
              onClick={generateAiReport}
              className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Gerar diagnóstico com IA
            </button>
          )}

          {aiLoading && (
            <div className="mt-6 flex items-center gap-3 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Analisando seu perfil... isso leva alguns segundos.
            </div>
          )}

          {aiError && (
            <div className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-sm px-4 py-3">
              {aiError}
              <button
                onClick={generateAiReport}
                className="ml-3 underline hover:opacity-70 transition-opacity"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {aiText && (
            <div className="mt-4 pt-4 border-t border-border">
              <NarrativeReport text={aiText} />
            </div>
          )}
        </div>

        {answers.open_1 && (
          <div className="bg-card border border-border rounded-sm p-6">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-5">
              Reflexões pessoais
            </p>
            <div className="space-y-5">
              {OPEN_QUESTIONS.map(
                (q, i) =>
                  answers[`open_${i + 1}`] && (
                    <div key={i} className={i > 0 ? "pt-5 border-t border-border" : ""}>
                      <p className="text-xs text-muted-foreground mb-2">{q}</p>
                      <p className="text-sm leading-relaxed">{answers[`open_${i + 1}`]}</p>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Raio-X de Soft Skills · {new Date().getFullYear()}
          </p>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Nova avaliação
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("landing");
  const [profileData, setProfileData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState([]);

  const handleAnswer = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));

  const handleComplete = () => {
    setScores(calculateScores(answers));
    setView("results");
  };

  const handleReset = () => {
    setView("landing");
    setProfileData(null);
    setAnswers({});
    setScores([]);
  };

  return (
    <>
      {view === "landing" && <Landing onStart={() => setView("profile")} />}
      {view === "profile" && (
        <ProfileForm
          onSubmit={(d) => { setProfileData(d); setView("assessment"); }}
          onBack={() => setView("landing")}
        />
      )}
      {view === "assessment" && (
        <AssessmentForm
          answers={answers}
          onAnswer={handleAnswer}
          onComplete={handleComplete}
          onBack={() => setView("profile")}
        />
      )}
      {view === "results" && profileData && (
        <Results
          profileData={profileData}
          scores={scores}
          answers={answers}
          onReset={handleReset}
        />
      )}
    </>
  );
}
