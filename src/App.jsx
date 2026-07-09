import { useState } from "react";
import {
  ChevronLeft, ArrowRight, BarChart2, BookOpen, Target,
  Zap, Check, RefreshCw, Sparkles, Loader2, Lock,
  Brain, Calendar, MessageCircle, ExternalLink, ChevronDown, ChevronUp, Download,
} from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const OWNER_WHATSAPP = "554991106400";
const PRODUCT_PRICE = "R$ 97";

// ─── SIMPLE MARKDOWN RENDERER ────────────────────────────────────────────────
function MarkdownText({ children }) {
  if (!children) return null;
  const lines = children.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="space-y-1.5 my-2 ml-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith("## ")) {
      flushList(`list-${i}`);
      elements.push(
        <h2 key={i} className="text-sm font-medium text-foreground mt-7 mb-2 tracking-tight">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList(`list-${i}`);
    } else {
      flushList(`list-${i}`);
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {line}
        </p>
      );
    }
  });
  flushList("list-end");

  return <div className="space-y-1">{elements}</div>;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
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
  comunicacao: ["Procuro confirmar se a outra pessoa realmente compreendeu minha mensagem.", "Adapto minha linguagem de acordo com o público com quem estou falando.", "Costumo simplificar assuntos complexos para facilitar o entendimento.", "Escuto atentamente antes de responder.", "Solicito feedback sobre a clareza da minha comunicação."],
  empatia: ["Busco compreender o contexto antes de tirar conclusões sobre alguém.", "Faço perguntas para entender melhor diferentes perspectivas.", "Consigo reconhecer emoções mesmo quando elas não são verbalizadas.", "Evito julgar rapidamente comportamentos ou decisões de outras pessoas.", "Consigo discordar mantendo respeito e abertura ao diálogo."],
  inteligencia_emocional: ["Consigo perceber minhas emoções antes de reagir impulsivamente.", "Mantenho a calma em situações de pressão ou conflito.", "Consigo separar críticas ao meu trabalho de críticas à minha pessoa.", "Faço pausas para refletir antes de responder em momentos difíceis.", "Reconheço quando minhas emoções estão influenciando minhas decisões."],
  pensamento_critico: ["Procuro evidências antes de defender uma opinião.", "Questiono premissas e soluções antes de aceitá-las.", "Consigo diferenciar fatos, opiniões e interpretações.", "Avalio diferentes perspectivas antes de tomar decisões importantes.", "Reviso minhas próprias crenças quando encontro novas informações."],
  colaboracao: ["Compartilho conhecimento e experiências com outras pessoas.", "Consigo construir soluções em conjunto sem necessidade de impor minhas ideias.", "Dou crédito às contribuições de colegas e parceiros.", "Vejo divergências como oportunidades de melhorar soluções.", "Busco alinhamento antes de acelerar decisões importantes."],
  adaptabilidade: ["Consigo me ajustar rapidamente a mudanças de cenário ou prioridades.", "Estou aberto a aprender novas ferramentas e métodos.", "Reavalio processos quando percebo que já não funcionam bem.", "Vejo mudanças como oportunidades de crescimento.", "Consigo manter produtividade mesmo diante de incertezas."],
  escuta_ativa: ["Evito interromper enquanto outra pessoa está falando.", "Demonstro interesse genuíno durante conversas.", "Faço perguntas para aprofundar minha compreensão.", "Observo sinais não verbais durante interações.", "Confirmo se compreendi corretamente o que a outra pessoa quis dizer."],
  lideranca: ["Assumo responsabilidade pelos resultados das minhas decisões.", "Procuro dar exemplo por meio das minhas atitudes.", "Incentivo a participação de outras pessoas nas decisões.", "Crio um ambiente seguro para opiniões diferentes.", "Ofereço feedbacks respeitosos e construtivos."],
  aprendizado: ["Reservo tempo regularmente para aprender algo novo.", "Busco conteúdos fora da minha área principal de atuação.", "Transformo aprendizado em prática.", "Mantenho curiosidade mesmo em assuntos que já domino.", "Estou aberto a rever conhecimentos e opiniões."],
  proposito: ["Consigo enxergar significado no trabalho que realizo.", "Meus valores influenciam minhas decisões profissionais.", "Percebo como meu trabalho impacta outras pessoas.", "Reflito regularmente sobre minha direção profissional.", "Sinto que minhas atividades estão alinhadas ao que considero importante."],
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
  comunicacao: { days30: ["Solicitar feedback sobre clareza em reuniões e apresentações.", "Praticar síntese de informações complexas em poucos minutos."], days60: ["Conduzir uma apresentação ou alinhamento de equipe.", "Treinar adaptação da linguagem para públicos diferentes."], days90: ["Mentorar alguém em comunicação profissional.", "Assumir papel de facilitador em discussões importantes."] },
  empatia: { days30: ["Antes de reagir, perguntar: 'Qual é o contexto dessa pessoa?'", "Praticar escuta sem interrupção em conversas do dia a dia."], days60: ["Conduzir uma conversa difícil com foco na perspectiva do outro.", "Solicitar feedback sobre como as pessoas se sentem em interações com você."], days90: ["Desenvolver um projeto que exija colaboração com diferentes perfis.", "Criar rituais de check-in emocional em times ou reuniões."] },
  inteligencia_emocional: { days30: ["Iniciar uma prática diária de registro emocional (journaling).", "Identificar os 3 gatilhos emocionais mais frequentes no trabalho."], days60: ["Praticar pausa consciente antes de responder em situações de pressão.", "Buscar um espaço de reflexão (mentoria, terapia ou coaching)."], days90: ["Conduzir uma conversa difícil com regulação emocional consciente.", "Desenvolver um protocolo pessoal para situações de conflito."] },
  pensamento_critico: { days30: ["Antes de aceitar uma informação, perguntar: 'Quais são as evidências?'", "Ler um artigo de área diferente e identificar premissas."], days60: ["Aplicar uma estrutura de análise (SWOT, 5 Porquês) em um problema real.", "Apresentar dois pontos de vista opostos sobre um tema do seu trabalho."], days90: ["Liderar uma sessão de questionamento de premissas com um time.", "Documentar um processo de decisão com análise crítica explícita."] },
  colaboracao: { days30: ["Dar crédito público a alguém que contribuiu com uma ideia.", "Propor uma sessão de co-criação em vez de resolver sozinho."], days60: ["Facilitar um alinhamento entre pessoas com perspectivas diferentes.", "Pedir ajuda explícita em algo que normalmente faria sozinho."], days90: ["Liderar um projeto com responsabilidade compartilhada.", "Criar uma rotina de troca de conhecimento no seu time."] },
  adaptabilidade: { days30: ["Identificar uma crença rígida e questioná-la conscientemente.", "Experimentar uma nova ferramenta ou método de trabalho."], days60: ["Aceitar voluntariamente uma tarefa fora da sua zona de conforto.", "Reavaliar um processo que usa há mais de 6 meses."], days90: ["Liderar uma mudança ou transição dentro do seu contexto.", "Documentar aprendizados de uma situação de incerteza que enfrentou."] },
  escuta_ativa: { days30: ["Em conversas, praticar não interromper e esperar o silêncio.", "Após reuniões, resumir o que ouviu para confirmar entendimento."], days60: ["Conduzir uma entrevista ou conversa de descoberta com um colega.", "Registrar sinais não verbais que percebeu em uma conversa importante."], days90: ["Facilitar uma sessão onde você escuta mais do que fala.", "Pedir feedback sobre a qualidade da sua escuta a pessoas próximas."] },
  lideranca: { days30: ["Assumir responsabilidade por uma decisão — mesmo impopular.", "Oferecer um feedback construtivo e respeitoso a alguém."], days60: ["Criar espaço para que outras pessoas expressem opiniões em reuniões.", "Identificar alguém para desenvolver e oferecer apoio estruturado."], days90: ["Liderar um projeto de ponta a ponta com autonomia e responsabilidade.", "Criar uma prática de reconhecimento de contribuições no time."] },
  aprendizado: { days30: ["Reservar 20 minutos diários para aprendizado fora da área principal.", "Ler ou assistir algo que desafie sua perspectiva atual."], days60: ["Aplicar um aprendizado recente em um projeto real.", "Compartilhar algo que aprendeu com um colega ou time."], days90: ["Desenvolver uma habilidade nova que pode ser medida.", "Criar um plano de desenvolvimento pessoal com metas concretas."] },
  proposito: { days30: ["Escrever sobre o impacto que seu trabalho gera nas pessoas ao redor.", "Identificar quais atividades te geram mais energia e significado."], days60: ["Ter uma conversa sobre valores com alguém que você admira.", "Conectar seu trabalho atual a um objetivo de médio prazo."], days90: ["Definir um projeto que esteja alinhado aos seus valores.", "Criar rituais de reflexão periódica sobre direção e propósito."] },
};

// ─── SCORING ─────────────────────────────────────────────────────────────────
function getLevel(score) {
  if (score <= 20) return "Inicial";
  if (score <= 40) return "Emergente";
  if (score <= 60) return "Consistente";
  if (score <= 80) return "Avançado";
  return "Referência";
}

const LEVEL_COLORS = { Inicial: "#f87171", Emergente: "#fb923c", Consistente: "#facc15", Avançado: "#818cf8", Referência: "#34d399" };

function calculateScores(answers) {
  return COMPETENCIES.map((c) => {
    const raw = [1, 2, 3, 4, 5].reduce((sum, i) => sum + ((answers[`${c.id}_${i}`]) || 0), 0);
    const score = Math.round(((raw - 5) / 20) * 100);
    return { id: c.id, name: c.name, score, level: getLevel(score) };
  });
}

function getProfileResult(scores) {
  const map = Object.fromEntries(scores.map((s) => [s.id, s.score]));
  let best = PROFILES[0]; let bestAvg = -1;
  for (const p of PROFILES) {
    const avg = p.competencies.reduce((sum, id) => sum + (map[id] || 0), 0) / p.competencies.length;
    if (avg > bestAvg) { bestAvg = avg; best = p; }
  }
  return best;
}

function getCrossResults(scores) {
  const map = Object.fromEntries(scores.map((s) => [s.id, s.score]));
  return CROSS_ANALYSIS.filter((r) => r.high.every((id) => (map[id] || 0) >= 60) && r.low.every((id) => (map[id] || 0) <= 50)).slice(0, 4);
}

// ─── EXPORT PDF ───────────────────────────────────────────────────────────────
function exportPDF({ profileData, scores, generalScore, generalLevel, profileName, profileDesc, strengths, opportunities, aiText = "" }) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const year = new Date().getFullYear();
  const colorMap = { Inicial: "#ef4444", Emergente: "#f97316", Consistente: "#eab308", Avançado: "#6366f1", Referência: "#10b981" };
  const barRows = sorted.map((s) => {
    const color = colorMap[s.level] || "#888";
    return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;"><span style="width:180px;font-size:12px;color:#374151;flex-shrink:0;">${s.name}</span><div style="flex:1;background:#e5e7eb;border-radius:4px;height:8px;"><div style="width:${s.score}%;height:8px;border-radius:4px;background:${color};"></div></div><span style="font-family:monospace;font-size:12px;color:#374151;width:28px;text-align:right;">${s.score}</span><span style="font-size:11px;color:${color};width:80px;">${s.level}</span></div>`;
  }).join("");
  const makeList = (items) => items.map((s) => {
    const color = colorMap[s.level] || "#888";
    return `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;"><span style="font-size:12px;color:#374151;font-weight:500;">${s.name}</span><span style="font-family:monospace;font-size:11px;color:${color};">${s.score} · ${s.level}</span></div>`;
  }).join("");
  const aiSection = aiText ? `<div style="margin-top:32px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;"><p style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin:0 0 12px;">Análise com IA · Claude</p><div style="font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap;">${aiText}</div></div>` : "";
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Raio-X de Soft Skills — ${profileData.name}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;background:#fff;margin:0;padding:40px;}@media print{body{padding:20px;}@page{margin:20mm;}}h1{font-size:28px;font-weight:600;margin:0 0 4px;}h2{font-size:16px;font-weight:600;margin:28px 0 12px;color:#111827;}.label{font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin:0 0 6px;}</style></head><body><div style="border-bottom:2px solid #e5e7eb;padding-bottom:20px;margin-bottom:28px;"><p class="label">Raio-X de Soft Skills · Diagnóstico Completo</p><h1>${profileData.name}</h1><p style="color:#6b7280;font-size:14px;margin:4px 0 0;">${profileData.currentRole || ""} · ${profileData.professionalLevel || ""} · ${profileData.mainArea || ""}</p></div><div style="display:flex;gap:40px;margin-bottom:28px;flex-wrap:wrap;"><div><p class="label">Índice Geral</p><p style="font-size:48px;font-family:monospace;font-weight:700;color:#6366f1;margin:0;">${generalScore}</p><p style="font-size:13px;color:#6b7280;margin:4px 0 0;">Nível ${generalLevel}</p></div><div><p class="label">Perfil Predominante</p><p style="font-size:18px;font-weight:600;margin:0;">${profileName}</p><p style="font-size:13px;color:#6b7280;margin:4px 0 0;max-width:360px;">${profileDesc}</p></div></div><h2>Pontuação por Competência</h2>${barRows}<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:28px;"><div><h2 style="margin-top:0;">Forças</h2>${makeList(strengths)}</div><div><h2 style="margin-top:0;">Oportunidades</h2>${makeList(opportunities)}</div></div>${aiSection}<div style="margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;"><p style="font-size:11px;color:#9ca3af;">Gerado por Raio-X de Soft Skills · ${year} · raio-x-soft-skills-mvp.vercel.app</p></div></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ─── VALIDATE CODE ────────────────────────────────────────────────────────────
function normalizeAccessCode(value) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function validateCode(entered, whatsapp) {
  const digits = whatsapp.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const expected = `RAIO${last4}`.toUpperCase();
  const clean = normalizeAccessCode(entered);
  if (clean !== expected) return "invalid";
  if (localStorage.getItem(`rxused_${clean}`)) return "used";
  return "valid";
}

// ─── SHARED NAV ───────────────────────────────────────────────────────────────
function TopNav({ onAbout, onStart, rightSlot }) {
  return (
    <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
          <BarChart2 className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-medium tracking-tight">Raio-X do Designer</span>
      </div>
      <div className="flex items-center gap-4">
        {onAbout && (
          <button onClick={onAbout} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Sobre nós
          </button>
        )}
        {rightSlot || (onStart && (
          <button onClick={onStart}
            className="flex items-center gap-2 px-5 py-2 rounded-sm text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#FBBF24", color: "#0B1120" }}>
            Quero meu Raio-X <ArrowRight className="w-4 h-4" />
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── SHARED FOOTER ────────────────────────────────────────────────────────────
function PageFooter({ onAbout }) {
  return (
    <footer className="border-t border-border px-6 lg:px-12 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
              <BarChart2 className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium">Raio-X do Designer</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} · Ferramenta de autoconhecimento profissional</p>
        </div>
        <div className="flex items-center gap-6">
          {onAbout && (
            <button onClick={onAbout} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sobre nós
            </button>
          )}
          <a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── LANDING ─────────────────────────────────────────────────────────────────
const DEMO_SCORES = [85, 72, 68, 91, 77, 63, 88, 74, 80, 59];

const TESTIMONIALS = [
  { name: "Ana Carolina M.", role: "UX Designer Sênior · Fintech", text: "Fiz o diagnóstico sem expectativas. Saí com um mapa claro do que precisava desenvolver — e palavras para nomear coisas que sentia mas não conseguia articular.", score: 74, profile: "Pensador Analítico" },
  { name: "Rafael S.", role: "Product Designer · Agência", text: "A análise com IA foi o que mais me surpreendeu. Precisa de um jeito que me deu vontade de começar o plano de ação no mesmo dia. Valeu muito mais do que esperava.", score: 81, profile: "Líder Inspirador" },
  { name: "Mariana T.", role: "Designer de Produto · SaaS", text: "Nunca tinha pensado em soft skills com esse nível de seriedade. A sessão de mentoria valeu muito mais do que o investimento — saí com clareza de onde focar.", score: 68, profile: "Facilitador Humano" },
];

const RESEARCH_STATS = [
  { value: "89%", label: "dos profissionais que falham em novas posições falham por razões comportamentais, não técnicas.", source: "LinkedIn Global Talent Trends, 2024" },
  { value: "Top 5", label: "das habilidades mais demandadas até 2030 incluem IE, pensamento crítico e adaptabilidade.", source: "WEF Future of Jobs Report, 2025" },
  { value: "90%", label: "do desempenho em posições de liderança é explicado pela inteligência emocional.", source: "Daniel Goleman — Harvard Business Review" },
  { value: "26×", label: "mais rápido: o crescimento da demanda por habilidades emocionais vs. técnicas até 2030.", source: "McKinsey Global Institute, 2019" },
];

const PAIN_SITUATIONS = [
  "Recebo feedbacks vagos e não sei exatamente o que melhorar.",
  "Tenho dificuldade para demonstrar meu valor além das telas que entrego.",
  "Não sei quais competências devo desenvolver para crescer.",
  "Minha carreira parece estagnada, mesmo com experiência acumulada.",
  "Quero evoluir, mas não sei por onde começar.",
  "Tenho dificuldade para me posicionar profissionalmente com confiança.",
];

const VALUE_BENEFITS = [
  "Perfil predominante",
  "Radar de competências",
  "Análise estratégica",
  "Interpretação personalizada",
  "Cruzamentos comportamentais",
  "Recomendações práticas",
  "Plano de Desenvolvimento Individual",
  "Relatório completo",
];

const FAQS = [
  { q: "O diagnóstico gratuito já entrega algum valor?", a: "Sim. Você recebe seu índice geral, mapa de competências, perfil predominante, forças, oportunidades e padrões comportamentais logo após responder." },
  { q: "O que muda no plano completo?", a: "O plano completo transforma os dados em interpretação estratégica: análise narrativa com IA, PDI 30/60/90 dias, relatório completo e uma sessão de mentoria ao vivo." },
  { q: "Isso é um teste psicológico?", a: "Não. É uma ferramenta de autoconhecimento profissional para apoiar clareza, desenvolvimento e tomada de decisão na carreira." },
  { q: "Preciso pagar antes de ver qualquer resultado?", a: "Não. O diagnóstico inicial é gratuito. Você só decide pelo plano completo depois de ver seu primeiro resultado." },
];

function Landing({ onStart, onAbout }) {
  const scrollToReportExample = () => document.getElementById("exemplo-relatorio")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ANNOUNCEMENT BAR — ativar quando atingir 500 diagnósticos
      <div className="flex items-center justify-center gap-3 py-2.5 px-4 text-[11px] font-medium" style={{ backgroundColor: "rgba(251,191,36,0.07)", borderBottom: "1px solid rgba(251,191,36,0.18)", color: "#FBBF24" }}>
        <span>✦</span><span>Mais de 500 profissionais diagnosticados</span>
      </div>
      */}
      <TopNav onAbout={onAbout} onStart={onStart} />
      <section className="relative grid grid-cols-1 lg:grid-cols-[1fr_420px] min-h-[92vh] border-b border-border overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "55%", height: "70%", background: "radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "0", right: "30%", width: "40%", height: "50%", background: "radial-gradient(ellipse at center, rgba(129,140,248,0.1) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-6 lg:px-16 py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-12 w-fit" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}>
            <Zap className="w-3 h-3" /> Avaliação gratuita · 15 minutos
          </div>
          <h1 className="leading-[1.02] mb-8 tracking-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.2rem, 6.5vw, 6rem)" }}>
            Descubra o que<br />
            <span style={{ color: "#FBBF24", textShadow: "0 0 60px rgba(251,191,36,0.35)" }}>move</span>
            {" — ou trava —"}<br />
            sua carreira.
          </h1>
          <p className="text-foreground/75 text-lg leading-relaxed mb-4 max-w-lg">50 perguntas calibradas. 10 competências mapeadas. Um diagnóstico preciso sobre quem você é — e quem pode se tornar.</p>
          <p className="text-sm mb-10 max-w-md">
            <span className="text-foreground/70">Diagnóstico gratuito. Plano completo por </span>
            <span className="font-bold" style={{ color: "#FBBF24" }}>R$ 97</span>
            <span className="text-foreground/60"> — pagamento único.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <button onClick={onStart} className="flex items-center gap-2.5 px-8 py-4 rounded-sm font-bold hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm" style={{ backgroundColor: "#FBBF24", color: "#0B1120", boxShadow: "0 0 32px rgba(251,191,36,0.35)" }}>
              Quero meu Raio-X <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/70">
              {["Sem cadastro", "Resultado imediato", "Satisfação garantida"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: "#FBBF24" }} /> {t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-10 hidden lg:flex flex-col justify-center border-l border-border px-8 py-12" style={{ background: "linear-gradient(160deg, rgba(129,140,248,0.06) 0%, rgba(11,17,32,0.95) 60%)" }}>
          <p className="text-[10px] text-foreground/60 font-mono uppercase tracking-widest mb-6">Prévia · diagnóstico</p>
          <div className="space-y-2.5 mb-8">
            {COMPETENCIES.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-[11px] text-foreground/60 w-32 truncate text-right leading-tight">{c.name}</span>
                <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${DEMO_SCORES[i]}%`, backgroundColor: LEVEL_COLORS[getLevel(DEMO_SCORES[i])], opacity: 0.85 }} />
                </div>
                <span className="text-[11px] font-mono w-6 text-right" style={{ color: LEVEL_COLORS[getLevel(DEMO_SCORES[i])] }}>{DEMO_SCORES[i]}</span>
              </div>
            ))}
          </div>
          <div className="rounded-sm p-5 border" style={{ backgroundColor: "rgba(129,140,248,0.06)", borderColor: "rgba(129,140,248,0.18)" }}>
            <div className="text-[10px] text-foreground/60 font-mono uppercase tracking-widest mb-1">Índice geral</div>
            <div className="font-mono font-bold leading-none mb-1" style={{ fontSize: "3.5rem", color: "#818CF8", textShadow: "0 0 40px rgba(129,140,248,0.4)" }}>77</div>
            <div className="text-sm text-foreground/70">Nível <span className="font-semibold" style={{ color: "#818CF8" }}>Avançado</span></div>
            <div className="mt-3 pt-3 border-t border-border text-[11px] text-foreground/60">Perfil · <span className="text-foreground/80">Líder Inspirador</span></div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-5">Dor real de carreira</p>
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.08 }}>Você se identifica com alguma destas situações?</h2>
            <p className="text-foreground/75 text-base leading-relaxed">A maioria dos designers sabe quando está pronta para crescer. O difícil é enxergar com precisão o que precisa mudar para esse crescimento acontecer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAIN_SITUATIONS.map((pain, i) => (
              <div key={pain} className="group rounded-sm border border-border bg-background/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-background" style={{ boxShadow: i === 0 ? "0 0 40px rgba(129,140,248,0.05)" : undefined }}>
                <span className="font-mono text-xs text-primary/80">0{i + 1}</span>
                <p className="mt-5 text-sm text-foreground/82 leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-sm border border-primary/20 p-6 lg:p-8" style={{ background: "linear-gradient(135deg, rgba(129,140,248,0.10), rgba(251,191,36,0.04))" }}>
            <p className="text-lg leading-relaxed max-w-3xl" style={{ fontFamily: "var(--font-display)" }}>O Raio-X do Designer foi criado para transformar essas dúvidas em clareza: onde você está, quais competências sustentam sua evolução e quais próximos passos fazem mais sentido agora.</p>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
          <div>
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-5">Proposta de valor</p>
            <h2 className="mb-5" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.08 }}>Você recebe muito mais do que um gráfico.</h2>
            <p className="text-foreground/75 leading-relaxed mb-8">O diagnóstico organiza suas respostas em uma leitura estratégica sobre comportamento, crescimento e carreira — para você tomar decisões com mais segurança.</p>
            <button onClick={scrollToReportExample} className="inline-flex items-center gap-2 border border-primary/40 text-primary px-5 py-3 rounded-sm text-sm font-medium hover:bg-primary/10 hover:-translate-y-0.5 transition-all">
              Visualizar exemplo do relatório <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            {VALUE_BENEFITS.map((item, i) => (
              <div key={item} className="bg-card p-6 min-h-28 transition-colors hover:bg-secondary/60">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-4 h-4 shrink-0" style={{ color: "#FBBF24" }} />
                  <span className="font-mono text-[10px] text-foreground/50">0{i + 1}</span>
                </div>
                <p className="text-sm font-medium text-foreground/90">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-20 border-b border-border" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(129,140,248,0.05) 48%, transparent 100%)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-center">
          <div>
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-5">Oferta de validação</p>
            <h2 className="mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.1rem, 4vw, 3.4rem)", lineHeight: 1.08 }}>Comece grátis. Evolua com um plano completo.</h2>
            <p className="text-foreground/75 leading-relaxed max-w-2xl">Você faz o diagnóstico inicial sem pagar. Se fizer sentido, desbloqueia uma leitura completa para transformar o resultado em plano de evolução profissional.</p>
          </div>
          <div className="rounded-sm border border-primary/25 bg-card p-7 lg:p-8 transition-transform duration-300 hover:-translate-y-1" style={{ boxShadow: "0 0 60px rgba(251,191,36,0.08)" }}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-2">Plano completo</p>
                <h3 className="text-xl font-medium">Raio-X + PDI + Mentoria</h3>
              </div>
              <div className="text-right"><div className="text-3xl font-mono font-medium">{PRODUCT_PRICE}</div><div className="text-xs text-muted-foreground">pagamento único</div></div>
            </div>
            <div className="space-y-3 mb-7">
              {["Diagnóstico gratuito incluído", "Relatório completo com IA", "PDI 30 / 60 / 90 dias", "1 sessão de mentoria ao vivo"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-foreground/78"><Check className="w-4 h-4" style={{ color: "#FBBF24" }} /> {item}</p>
              ))}
            </div>
            <button onClick={onStart} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm font-bold hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm" style={{ backgroundColor: "#FBBF24", color: "#0B1120" }}>
              Receber meu diagnóstico <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="border-b border-border" style={{ background: "linear-gradient(180deg, rgba(251,191,36,0.04) 0%, transparent 100%)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {RESEARCH_STATS.map((s, i) => (
            <div key={i} className={`px-8 py-12 ${i < RESEARCH_STATS.length - 1 ? "border-b sm:border-b-0 sm:border-r border-border" : ""}`}>
              <div className="font-mono font-black mb-3" style={{ fontSize: "3rem", lineHeight: 1, color: "#FBBF24", textShadow: "0 0 30px rgba(251,191,36,0.3)" }}>{s.value}</div>
              <p className="text-sm text-foreground/70 leading-relaxed mb-3">{s.label}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "rgba(251,191,36,0.68)" }}>{s.source}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
          <div>
            <p className="text-[10px] text-foreground/60 font-mono uppercase tracking-widest mb-6">Por que isso importa</p>
            <h2 className="leading-[1.1] mb-0" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 2.8rem)" }}>
              Em um mundo de habilidades técnicas descartáveis, o que sobrevive é{" "}
              <em className="not-italic" style={{ color: "#818CF8" }}>genuinamente humano.</em>
            </h2>
          </div>
          <div className="space-y-5 text-[15px] text-foreground/80 leading-relaxed">
            <p>Ferramentas mudam. Frameworks ficam obsoletos. Linguagens de programação vêm e vão. Mas a capacidade de se comunicar com clareza, de ouvir de verdade, de se adaptar sem perder o fio — essas habilidades nunca saem de moda.</p>
            <p>O problema é que tratamos competências humanas como algo que "se tem ou não se tem". Raramente as mapeamos com a mesma seriedade com que avaliamos portfólios ou certificações. O resultado: profissionais talentosos travados por pontos cegos que nunca foram nomeados.</p>
            <p>Para designers, isso é ainda mais crítico. Empatia, comunicação, escuta ativa e pensamento crítico não são soft skills adjacentes ao nosso trabalho — <strong className="text-foreground font-medium">elas são o trabalho.</strong></p>
            <p>O Raio-X do Designer nasceu dessa lacuna. Uma avaliação séria, baseada em pesquisa, construída por designers para designers — com resultado imediato e plano de ação concreto.</p>
            <div className="pt-5 border-t border-border space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/60 mb-3">Fontes consultadas</p>
              {["LinkedIn Global Talent Trends Report, 2024", "World Economic Forum — Future of Jobs Report, 2025", "Goleman, D. (1998). What Makes a Leader? Harvard Business Review.", "McKinsey Global Institute — The Future of Work in America, 2019"].map((ref) => (
                <p key={ref} className="text-xs text-foreground/70 flex items-start gap-2 leading-relaxed"><ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-primary/80" /> {ref}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-4">O que o usuário recebe</p>
          <h2 className="text-3xl mb-3" style={{ fontFamily: "var(--font-display)" }}>Um plano de evolução profissional, não só um resultado.</h2>
          <p className="text-sm text-muted-foreground mb-12 max-w-xl leading-relaxed">O plano completo combina diagnóstico, interpretação e acompanhamento para você sair da dúvida e avançar com clareza.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border">
            <div className="bg-background px-8 py-10 flex flex-col">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(251,191,36,0.1)" }}><Brain className="w-4 h-4" style={{ color: "#FBBF24" }} /></div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#FBBF24" }}>Entregável 01</p>
              <h3 className="text-base font-medium mb-3">Análise Narrativa com IA</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">Seu diagnóstico é interpretado pelo Claude — o modelo de IA da Anthropic — que gera um texto aprofundado e personalizado sobre seu perfil: padrões comportamentais, pontos cegos, combinações de competências e orientações específicas para o seu momento de carreira.</p>
              <ul className="mt-6 space-y-2">{["Análise de padrões comportamentais", "Identificação de pontos cegos", "Orientações personalizadas por perfil"].map((item) => (<li key={item} className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#FBBF24" }} /> {item}</li>))}</ul>
            </div>
            <div className="bg-background px-8 py-10 flex flex-col">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(251,191,36,0.1)" }}><Target className="w-4 h-4" style={{ color: "#FBBF24" }} /></div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#FBBF24" }}>Entregável 02</p>
              <h3 className="text-base font-medium mb-3">PDI · Plano de Desenvolvimento</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">Um plano de ação concreto com atividades para 30, 60 e 90 dias — focado nas suas maiores oportunidades de crescimento. Cada ação é calibrada para o seu perfil e nível profissional, não para um genérico.</p>
              <ul className="mt-6 space-y-2">{["Ações para 30, 60 e 90 dias", "Foco nas suas maiores oportunidades", "Calibrado ao seu nível profissional"].map((item) => (<li key={item} className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#FBBF24" }} /> {item}</li>))}</ul>
            </div>
            <div className="bg-background px-8 py-10 flex flex-col">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(251,191,36,0.1)" }}><Calendar className="w-4 h-4" style={{ color: "#FBBF24" }} /></div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#FBBF24" }}>Entregável 03</p>
              <h3 className="text-base font-medium mb-3">1 Sessão de Mentoria ao Vivo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">60 minutos com Patrick ou Carlos — designers e mentores com mais de 20 anos de experiência combinada. Você traz o diagnóstico, eles ajudam a transformar em decisões reais sobre sua carreira.</p>
              <ul className="mt-6 space-y-2">{["60 minutos ao vivo via Google Meet", "Com Patrick Naufel ou Carlos Alencar", "Agendamento flexível via WhatsApp"].map((item) => (<li key={item} className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#FBBF24" }} /> {item}</li>))}</ul>
            </div>
          </div>
          <div className="mt-px bg-card grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 px-8 py-6 border border-t-0" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div><span className="text-2xl font-mono font-medium">R$ 97</span><span className="text-xs text-muted-foreground ml-2">pagamento único · sem assinatura</span></div>
              {["Diagnóstico gratuito incluído", "Resultado imediato", "Satisfação garantida ou reembolso"].map((g) => (<span key={g} className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="w-3 h-3" style={{ color: "#FBBF24" }} /> {g}</span>))}
            </div>
            <button onClick={onStart} className="flex items-center gap-2 px-6 py-3 rounded-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all text-sm self-center shrink-0" style={{ backgroundColor: "#FBBF24", color: "#0B1120" }}>Descobrir meu perfil profissional <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      <section id="exemplo-relatorio" className="px-6 lg:px-16 py-24 border-b border-border bg-card scroll-mt-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-14 items-center">
          <div>
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-5">Exemplo do relatório</p>
            <h2 className="mb-5" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.08 }}>Uma devolutiva com aparência de consultoria.</h2>
            <p className="text-foreground/75 leading-relaxed mb-8">O relatório organiza seu perfil em uma narrativa executiva: clara, acionável e fácil de compartilhar com mentores, líderes ou com você mesmo em momentos de decisão.</p>
            <button onClick={onStart} className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-bold hover:opacity-90 hover:-translate-y-0.5 transition-all text-sm" style={{ backgroundColor: "#FBBF24", color: "#0B1120" }}>
              Receber meu diagnóstico <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative rounded-sm border border-primary/20 bg-background p-4 lg:p-6 overflow-hidden" style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.22)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(129,140,248,0.18), transparent 55%)" }} />
            <div className="relative bg-card border border-border rounded-sm p-6 lg:p-8">
              <div className="flex items-start justify-between gap-5 border-b border-border pb-6 mb-6">
                <div>
                  <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-2">Raio-X do Designer · Relatório</p>
                  <h3 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>Perfil Profissional</h3>
                  <p className="text-xs text-muted-foreground mt-1">Designer de Produto · Nível Pleno</p>
                </div>
                <div className="text-right"><div className="text-4xl font-mono font-bold text-primary">77</div><p className="text-[10px] text-muted-foreground font-mono uppercase">Índice geral</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {["Comunicação 85", "Pensamento Crítico 91", "Escuta Ativa 88", "Adaptabilidade 63"].map((item) => (
                  <div key={item} className="bg-background/80 border border-border rounded-sm p-4">
                    <p className="text-xs text-foreground/75 mb-3">{item}</p>
                    <div className="h-1.5 rounded-full bg-secondary"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${item.includes("63") ? 63 : item.includes("91") ? 91 : item.includes("88") ? 88 : 85}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] text-primary font-mono uppercase tracking-widest">Interpretação estratégica</p>
                <p className="text-sm text-foreground/78 leading-relaxed">Seu perfil combina leitura crítica forte com alta capacidade de comunicação. O próximo salto está em transformar essa clareza em influência, posicionamento e decisões de carreira mais consistentes.</p>
                <div className="grid grid-cols-3 gap-2 pt-3">
                  {["Forças", "Oportunidades", "PDI"].map((tag) => <span key={tag} className="text-[10px] font-mono text-center px-2 py-2 rounded-sm bg-primary/10 text-primary border border-primary/20">{tag}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 items-center">
          <div className="rounded-sm border border-primary/20 bg-card p-8 lg:p-10">
            <Brain className="w-7 h-7 text-primary mb-8" />
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-4">Inteligência aplicada</p>
            <h2 className="mb-5" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.08 }}>Uma análise que vai além dos números.</h2>
            <p className="text-foreground/75 leading-relaxed">A IA interpreta seus resultados, cruza padrões comportamentais e produz uma devolutiva personalizada baseada nas suas respostas. O objetivo não é vender tecnologia — é entregar clareza profissional para você decidir melhor.</p>
          </div>
          <div className="space-y-4">
            {["Transforma pontuações em leitura de carreira.", "Explica o que seus padrões indicam na prática.", "Conecta oportunidades a ações concretas.", "Ajuda você a enxergar próximos passos com confiança."].map((item) => (
              <div key={item} className="flex items-start gap-4 rounded-sm border border-border bg-card p-5">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/78 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border" style={{ background: "linear-gradient(180deg, rgba(129,140,248,0.04) 0%, transparent 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-foreground/60 font-mono uppercase tracking-widest mb-4">Como funciona</p>
          <h2 className="mb-16" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>Três etapas. Quinze minutos.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: "01", Icon: BookOpen, title: "Responda com honestidade", badge: "Grátis", badgeColor: "#818CF8", desc: "50 afirmações sobre situações reais de trabalho. Sem julgamento, sem resposta certa — apenas um retrato mais claro do seu momento." },
              { step: "02", Icon: BarChart2, title: "Entenda seu perfil", badge: "Grátis", badgeColor: "#818CF8", desc: "Veja seu radar de competências, forças, oportunidades e padrões que influenciam sua evolução como designer." },
              { step: "03", Icon: Target, title: "Transforme em plano", badge: "R$ 97", badgeColor: "#FBBF24", desc: "Desbloqueie análise com IA, PDI 30/60/90 dias e mentoria para transformar clareza em movimento." },
            ].map(({ step, Icon, title, badge, badgeColor, desc }, idx) => (
              <div key={step} className="relative p-8 rounded-sm flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-1" style={{ background: idx === 2 ? "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.02) 100%)" : "rgba(255,255,255,0.02)", border: idx === 2 ? "1px solid rgba(251,191,36,0.25)" : "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-4xl font-black" style={{ color: idx === 2 ? "rgba(251,191,36,0.25)" : "rgba(129,140,248,0.2)", lineHeight: 1 }}>{step}</span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${badgeColor}18`, border: `1px solid ${badgeColor}40`, color: badgeColor }}>{badge}</span>
                </div>
                <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: idx === 2 ? "rgba(251,191,36,0.12)" : "rgba(129,140,248,0.12)" }}>
                  <Icon className="w-4 h-4" style={{ color: idx === 2 ? "#FBBF24" : "#818CF8" }} />
                </div>
                <h3 className="font-semibold text-base text-foreground/90">{title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-20 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(251,191,36,0.2))" }} />
            <p className="text-[10px] text-foreground/60 font-mono uppercase tracking-widest whitespace-nowrap">O que dizem quem já fez</p>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(251,191,36,0.2))" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="relative flex flex-col gap-5 p-6 rounded-sm overflow-hidden transition-transform duration-300 hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "2px solid rgba(251,191,36,0.4)" }}>
                <div style={{ color: "#FBBF24", fontSize: "14px", letterSpacing: "2px" }}>★★★★★</div>
                <p className="text-sm text-foreground/80 leading-relaxed flex-1 italic">"{t.text}"</p>
                <div className="pt-4 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-xs font-semibold text-foreground/90">{t.name}</p>
                  <p className="text-[11px] text-foreground/60">{t.role}</p>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-medium inline-block mt-2" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#FBBF24" }}>Índice {t.score} · {t.profile}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-12">
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-5">Quem criou o Raio-X do Designer?</p>
            <h2 className="mb-6" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.08 }}>Criado por designers que vivem ensino, produto e mentoria na prática.</h2>
            <p className="text-foreground/75 leading-relaxed">O Raio-X do Designer nasce da combinação entre experiência em UX, produto digital, design systems, prototipagem, ensino e mentoria de profissionais em evolução.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">
            {MENTORS.map((m) => (
              <div key={m.name} className="bg-background p-8 lg:p-10">
                <div className="flex items-end gap-5 mb-7">
                  <div className="rounded-sm shrink-0 flex items-center justify-center font-mono font-bold text-lg" style={{ width: 88, height: 104, background: "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(251,191,36,0.1))", border: "1px solid rgba(129,140,248,0.25)", color: "#818CF8" }}>{m.initials}</div>
                  <div>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">{m.role}</p>
                    <h3 className="text-2xl font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>{m.name}</h3>
                    <a href={m.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:opacity-70 transition-opacity font-mono">LinkedIn <ExternalLink className="w-2.5 h-2.5" /></a>
                  </div>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed mb-6">{m.bio}</p>
                <div className="flex flex-wrap gap-2">{m.highlights.map((h) => (<span key={h} className="text-[11px] bg-secondary text-muted-foreground px-3 py-1 rounded-full">{h}</span>))}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-sm border border-primary/20 bg-card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["20+ anos combinados em Design", "Experiência com UX, UI e Produto", "Atuação em mentoria e desenvolvimento profissional"].map((item) => (
                <span key={item} className="flex items-center gap-2 text-sm text-foreground/78"><Check className="w-4 h-4 text-primary shrink-0" /> {item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-24 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-5">FAQ</p>
          <h2 className="mb-10" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.08 }}>Dúvidas comuns antes de começar.</h2>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <div key={item.q} className="rounded-sm border border-border bg-background p-6">
                <h3 className="text-sm font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-foreground/72 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-border overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(11,17,32,1) 60%)" }}>
        <div className="pointer-events-none absolute inset-0"><div style={{ position: "absolute", top: "-20%", left: "-5%", width: "50%", height: "80%", background: "radial-gradient(ellipse, rgba(251,191,36,0.07) 0%, transparent 70%)" }} /></div>
        <div className="relative max-w-6xl mx-auto px-6 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-mono mb-8" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}>
              <Zap className="w-2.5 h-2.5" /> Vagas para mentoria limitadas este mês
            </div>
            <h2 className="mb-5" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", lineHeight: 1.08 }}>
              Você sabe criar.<br /><span style={{ color: "#FBBF24" }}>Agora conheça quem cria.</span>
            </h2>
            <p className="text-foreground/75 mb-4 text-lg leading-relaxed max-w-lg">Designers excepcionais dominam ferramentas — mas também dominam a si mesmos. Comece pelo diagnóstico.</p>
            <p className="text-sm text-foreground/70 mb-10">Diagnóstico <span className="text-foreground/90 font-semibold">gratuito</span>.{" "}Plano completo com IA + mentoria por <span className="font-bold" style={{ color: "#FBBF24" }}>R$ 97</span> — pagamento único.</p>
            <div className="flex flex-col gap-4">
              <button onClick={onStart} className="inline-flex items-center gap-2.5 rounded-sm font-bold hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all whitespace-nowrap w-fit" style={{ backgroundColor: "#FBBF24", color: "#0B1120", boxShadow: "0 0 40px rgba(251,191,36,0.3)", padding: "16px 36px", fontSize: "15px" }}>
                Quero meu Raio-X <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-foreground/65">{["Sem cadastro", "Resultado imediato", "Satisfação garantida"].map((t) => (<span key={t}>✓ {t}</span>))}</div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center justify-center rounded-sm p-6" style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.12)" }}>
            <p className="text-[10px] text-foreground/60 font-mono uppercase tracking-widest mb-1 self-start">Prévia · mapa de competências</p>
            <p className="text-[11px] text-foreground/70 mb-4 self-start">Índice geral <span className="font-mono font-bold" style={{ color: "#818CF8" }}>77</span><span className="text-foreground/60"> · Nível </span><span className="font-medium" style={{ color: "#818CF8" }}>Avançado</span></p>
            <svg viewBox="0 0 280 280" width="100%" style={{ maxHeight: 280 }}>
              {(() => {
                const cx = 140, cy = 140, maxR = 100, n = COMPETENCIES.length;
                const toXY = (i, r) => { const angle = (Math.PI * 2 * i) / n - Math.PI / 2; return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }; };
                const rings = [25, 50, 75, 100];
                const scorePoints = DEMO_SCORES.map((s, i) => toXY(i, (s / 100) * maxR));
                const scorePath = scorePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
                return (
                  <g>
                    {rings.map(r => { const pts = Array.from({ length: n }, (_, i) => toXY(i, (r / 100) * maxR)); const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z"; return <path key={`ring-${r}`} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />; })}
                    {COMPETENCIES.map((_, i) => { const outer = toXY(i, maxR); return <line key={`spoke-${i}`} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />; })}
                    <path d={scorePath} fill="rgba(129,140,248,0.18)" stroke="#818CF8" strokeWidth={1.5} />
                    {COMPETENCIES.map((c, i) => { const p = scorePoints[i]; const label = toXY(i, maxR + 16); const anchor = label.x < cx - 4 ? "end" : label.x > cx + 4 ? "start" : "middle"; return (<g key={`node-${c.id}`}><circle cx={p.x} cy={p.y} r={3} fill="#818CF8" /><text x={label.x} y={label.y + 3} textAnchor={anchor} fill="rgba(255,255,255,0.62)" fontSize={9}>{c.name.split(" ")[0]}</text></g>); })}
                  </g>
                );
              })()}
            </svg>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {COMPETENCIES.slice(0, 5).map((c, i) => (<span key={c.id} className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[getLevel(DEMO_SCORES[i])]}18`, color: LEVEL_COLORS[getLevel(DEMO_SCORES[i])] }}>{c.name.split(" ")[0]} · {DEMO_SCORES[i]}</span>))}
            </div>
          </div>
        </div>
      </section>
      <PageFooter onAbout={onAbout} />
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
const MENTORS = [
  { initials: "PN", name: "Patrick A. G. Naufel", role: "Designer · Professor · Mentor", linkedin: "https://www.linkedin.com/in/naufelpatrick", bio: "Designer há 20 anos e especialista em UX e Produtos Digitais, Patrick une duas décadas de prática com o rigor de quem também ensina — é professor universitário há mais de 5 anos e mentor ativo na Fóton/Caixa. Sua convicção: o autoconhecimento é o primeiro movimento de qualquer evolução profissional real.", highlights: ["20 anos em design", "UX & Produtos Digitais", "Professor universitário", "Mentor na Fóton/Caixa"] },
  { initials: "CA", name: "Carlos Guilherme Alencar", role: "Designer · Líder de Mentores", linkedin: "https://www.linkedin.com/in/ocarlosguilherme/", bio: "Designer de UI/UX há 8 anos com domínio profundo em interfaces, prototipagem e design systems, Carlos é Líder de Mentores na Fóton/Caixa. Para ele, design centrado no usuário começa pelo autoconhecimento de quem cria — e equipes excelentes são feitas de pessoas que sabem onde precisam crescer.", highlights: ["8 anos em UI/UX", "Design systems", "Prototipagem", "Líder de mentores na Fóton/Caixa"] },
];

function AboutPage({ onBack, onStart }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav onAbout={undefined} rightSlot={<button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"><ChevronLeft className="w-4 h-4" /> Voltar</button>} />
      <section className="px-6 lg:px-16 py-24 border-b border-border">
        <div className="max-w-3xl">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-6">Sobre nós</p>
          <h1 className="leading-[1.1] mb-6" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Dois designers que acreditam no poder do autoconhecimento.</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">O Raio-X do Designer nasceu da observação de um padrão recorrente: profissionais talentosos travando não por falta de técnica, mas por falta de consciência sobre suas próprias competências comportamentais. Construímos a ferramenta que gostaríamos de ter tido.</p>
        </div>
      </section>
      <section className="px-6 lg:px-16 py-20 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">
          {MENTORS.map((m) => (
            <div key={m.name} className="bg-background p-10">
              <div className="flex items-end gap-5 mb-7">
                <div className="rounded-sm shrink-0 flex items-center justify-center font-mono font-bold text-lg" style={{ width: 80, height: 96, background: "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(251,191,36,0.1))", border: "1px solid rgba(129,140,248,0.25)", color: "#818CF8" }}>{m.initials}</div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{m.role}</p>
                  <h3 className="text-xl font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>{m.name}</h3>
                  <a href={m.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:opacity-70 transition-opacity font-mono">LinkedIn <ExternalLink className="w-2.5 h-2.5" /></a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{m.bio}</p>
              <div className="flex flex-wrap gap-2">{m.highlights.map((h) => (<span key={h} className="text-[11px] bg-secondary text-muted-foreground px-3 py-1 rounded-full">{h}</span>))}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 lg:px-16 py-20 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-4">Nossa missão</p>
            <h2 className="text-2xl leading-snug" style={{ fontFamily: "var(--font-display)" }}>Tornar o autoconhecimento profissional acessível, preciso e acionável.</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>Existem inúmeras ferramentas para avaliar habilidades técnicas. Poucas — com seriedade e profundidade — avaliam o que realmente diferencia profissionais ao longo do tempo: como pensam, como se relacionam, como reagem sob pressão.</p>
            <p>O Raio-X do Designer é nossa resposta a essa lacuna. Uma ferramenta construída com rigor metodológico, linguagem humana e resultado acionável. Não um quiz de entretenimento — um diagnóstico profissional que pode ser o ponto de inflexão em uma carreira.</p>
            <p>Nasceu de anos de experiência em design, mentoria e ensino. E foi feito especialmente para quem vive de criar — porque criar bem começa por se conhecer bem.</p>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-16 py-20 bg-card">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div><h3 className="text-2xl mb-2" style={{ fontFamily: "var(--font-display)" }}>Pronto para começar?</h3><p className="text-sm text-muted-foreground">O diagnóstico é gratuito e leva 15 minutos.</p></div>
          <button onClick={onStart} className="flex items-center gap-2 px-8 py-4 rounded-sm font-semibold hover:opacity-90 transition-opacity text-sm shrink-0" style={{ backgroundColor: "#FBBF24", color: "#0B1120" }}>Quero meu Raio-X <ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
      <PageFooter />
    </div>
  );
}

// ─── PROFILE FORM ─────────────────────────────────────────────────────────────
function ProfileForm({ onSubmit, onBack }) {
  const [form, setForm] = useState({ name: "", age: "", experience: "", currentRole: "", professionalLevel: "", mainArea: "", careerGoal: "", currentChallenge: "" });
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const canSubmit = Object.values(form).every((v) => v.trim().length > 0);
  const inputCls = "w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";
  const labelCls = "block text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border sticky top-0 bg-background z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"><ChevronLeft className="w-4 h-4" /> Voltar</button>
        <span className="text-xs text-muted-foreground font-mono">Etapa 1/3 — Perfil</span>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl lg:text-4xl mb-2" style={{ fontFamily: "var(--font-display)" }}>Seu perfil profissional</h1>
        <p className="text-muted-foreground mb-10">Essas informações personalizam a análise e o plano de desenvolvimento.</p>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Nome</label><input type="text" placeholder="Seu nome completo" value={form.name} onChange={update("name")} className={inputCls} /></div>
            <div><label className={labelCls}>Idade</label><input type="number" placeholder="Ex: 32" value={form.age} onChange={update("age")} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Cargo atual</label><input type="text" placeholder="Ex: Product Designer" value={form.currentRole} onChange={update("currentRole")} className={inputCls} /></div>
            <div><label className={labelCls}>Tempo de experiência</label><input type="text" placeholder="Ex: 5 anos" value={form.experience} onChange={update("experience")} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Nível profissional</label><select value={form.professionalLevel} onChange={update("professionalLevel")} className={inputCls}><option value="">Selecione</option>{["Júnior", "Pleno", "Sênior", "Especialista", "Líder", "Gestor"].map((v) => <option key={v}>{v}</option>)}</select></div>
            <div><label className={labelCls}>Área principal</label><select value={form.mainArea} onChange={update("mainArea")} className={inputCls}><option value="">Selecione</option>{["Pesquisa", "UX", "UI", "Product Design", "Design System", "Liderança", "Generalista", "Outro"].map((v) => <option key={v}>{v}</option>)}</select></div>
          </div>
          <div><label className={labelCls}>Objetivo de carreira (próximos 12 meses)</label><textarea placeholder="O que você quer alcançar profissionalmente no próximo ano?" value={form.careerGoal} onChange={update("careerGoal")} rows={3} className={inputCls + " resize-none"} /></div>
          <div><label className={labelCls}>Principal desafio atual</label><textarea placeholder="Qual é o maior obstáculo que você enfrenta hoje?" value={form.currentChallenge} onChange={update("currentChallenge")} rows={3} className={inputCls + " resize-none"} /></div>
          <button onClick={() => canSubmit && onSubmit(form)} disabled={!canSubmit} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">Iniciar avaliação <ArrowRight className="w-5 h-5" /></button>
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
    if (!isOpen) return [1, 2, 3, 4, 5].every((i) => answers[`${competency.id}_${i}`]);
    return OPEN_QUESTIONS.every((_, i) => ((answers[`open_${i + 1}`]) || "").trim().length > 0);
  };
  const progress = Math.round((step / TOTAL) * 100);
  const advance = () => { if (!stepAnswered()) return; if (step < 10) { setStep((s) => s + 1); window.scrollTo(0, 0); } else onComplete(); };
  const retreat = () => { if (step === 0) onBack(); else { setStep((s) => s - 1); window.scrollTo(0, 0); } };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 bg-background border-b border-border px-6 lg:px-12 py-5 flex items-center gap-6">
        <button onClick={retreat} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors shrink-0"><ChevronLeft className="w-4 h-4" /> {step === 0 ? "Voltar" : "Anterior"}</button>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 bg-secondary rounded-full h-px"><div className="bg-primary h-px rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          <span className="text-xs text-muted-foreground font-mono shrink-0">{step + 1}/{TOTAL}</span>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {!isOpen ? (
          <>
            <div className="flex items-start gap-4 mb-10">
              <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-lg shrink-0">{competency.icon}</div>
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Competência {step + 1} de 10</p>
                <h2 className="text-2xl font-medium">{competency.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{competency.desc}</p>
              </div>
            </div>
            <div className="space-y-10">
              {QUESTIONS[competency.id].map((q, qi) => {
                const key = `${competency.id}_${qi + 1}`;
                const val = answers[key];
                return (
                  <div key={qi}>
                    <p className="text-sm leading-relaxed mb-5 text-foreground/90">{q}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button key={v} onClick={() => onAnswer(key, v)} className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-sm border text-sm transition-all ${val === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                          <span className="font-mono font-medium text-base">{v}</span>
                          <span className="text-[9px] leading-tight text-center hidden sm:block px-1 opacity-70">{LIKERT_LABELS[v - 1]}</span>
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
            <div className="mb-10">
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Etapa 11 de 11</p>
              <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>Reflexão final</h2>
              <p className="text-sm text-muted-foreground mt-2">Três perguntas abertas para aprofundar o diagnóstico.</p>
            </div>
            <div className="space-y-8">
              {OPEN_QUESTIONS.map((q, i) => (
                <div key={i}>
                  <p className="text-sm leading-relaxed mb-3 text-foreground/90">{q}</p>
                  <textarea value={(answers[`open_${i + 1}`]) || ""} onChange={(e) => onAnswer(`open_${i + 1}`, e.target.value)} placeholder="Sua resposta..." rows={4} className="w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>
              ))}
            </div>
          </>
        )}
        <div className="mt-14">
          <button onClick={advance} disabled={!stepAnswered()} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed text-sm">
            {step < 10 ? "Próxima competência" : "Ver meu diagnóstico"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PDI CARD ─────────────────────────────────────────────────────────────────
function PdiCard({ competencyId }) {
  const [open, setOpen] = useState(false);
  const comp = COMPETENCIES.find((c) => c.id === competencyId);
  const pdi = PDI_ACTIONS[competencyId];
  if (!comp || !pdi) return null;
  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-card transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-base">{comp.icon}</span>
          <div><span className="text-sm font-medium">{comp.name}</span><p className="text-[11px] text-muted-foreground mt-0.5">Plano de 90 dias</p></div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border">
          {[["30 dias", pdi.days30], ["60 dias", pdi.days60], ["90 dias", pdi.days90]].map(([label, items]) => (
            <div key={label} className="px-5 py-4 border-b border-border last:border-0">
              <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-3">{label}</p>
              <ul className="space-y-2">{items.map((item) => (<li key={item} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {item}</li>))}</ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── UPGRADE SECTION ──────────────────────────────────────────────────────────
function UpgradeSection({ profileData, scores, answers, generalScore, generalLevel, profileName, profileDesc, strengths, opportunities }) {
  const [phase, setPhase] = useState("preview");
  const [lead, setLead] = useState({ name: profileData?.name || "", email: "", whatsapp: "" });
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState(null);
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState(null);
  const inputCls = "w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";
  const labelCls = "block text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2";
  const whatsappDigits = lead.whatsapp.replace(/\D/g, "");
  const canSubmit = lead.name.trim() && lead.email.includes("@") && whatsappDigits.length >= 10;
  const whatsappMessage = ["🎯 *Nova lead — Diagnóstico Completo*", "", `*Nome:* ${lead.name}`, `*Email:* ${lead.email}`, `*WhatsApp:* ${lead.whatsapp}`, "", `*Cargo:* ${profileData?.currentRole || "-"} (${profileData?.professionalLevel || "-"})`, `*Área:* ${profileData?.mainArea || "-"}`, `*Índice geral:* ${generalScore}/100 — ${generalLevel}`, `*Perfil:* ${profileName}`, "", "_Aguardando confirmação de pagamento._"].join("\n");
  const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;
  async function handleSubmit() {
    if (!canSubmit) return;
    window.open(whatsappUrl, "_blank");
    setPhase("code");
  }
  async function handleCodeSubmit() {
    setCodeError(null);
    const result = validateCode(accessCode, lead.whatsapp);
    if (result === "invalid") { setCodeError("Chave inválida. Confira a chave recebida no WhatsApp e tente novamente."); return; }
    if (result === "used") { setCodeError("Esta chave já foi utilizada neste navegador."); return; }
    localStorage.setItem(`rxused_${normalizeAccessCode(accessCode)}`, "1");
    setPhase("loading");
    setAiError(null);
    try {
      const res = await fetch("/api/generate-report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileData, scores, answers, generalScore, generalLevel, profileName, profileDesc, strengths, opportunities }) });
      const data = await res.json();
      if (data.text) { setAiText(data.text); setPhase("report"); }
      else { setAiError(data.error || "Erro ao gerar análise. Tente novamente."); setPhase("code"); }
    } catch { setAiError("Erro de conexão. Verifique sua internet e tente novamente."); setPhase("code"); }
  }
  const benefits = [
    { Icon: Brain, label: "Análise narrativa com IA", desc: "Diagnóstico aprofundado gerado pelo Claude com base no seu perfil completo." },
    { Icon: Target, label: "PDI 30 / 60 / 90 dias", desc: "Plano de Desenvolvimento Individual com ações concretas por competência." },
    { Icon: Calendar, label: "1 sessão de mentoria", desc: "60 minutos ao vivo para transformar o diagnóstico em evolução real." },
  ];
  if (phase === "loading") {
    return (
      <div className="rounded-sm border border-primary/20 bg-card p-12 flex flex-col items-center justify-center gap-5 text-center">
        <div className="relative"><Loader2 className="w-8 h-8 text-primary animate-spin" /><div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" /></div>
        <div><p className="text-sm font-medium mb-1">Gerando sua análise personalizada</p><p className="text-xs text-muted-foreground">O Claude está analisando seu perfil. Isso leva alguns segundos...</p></div>
        <div className="flex gap-1.5 mt-2">{[0, 0.3, 0.6].map((d) => (<div key={d} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${d}s` }} />))}</div>
      </div>
    );
  }
  if (phase === "report") {
    return (
      <div className="space-y-10">
        <div className="rounded-sm border border-primary/20 bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-primary/5"><Brain className="w-4 h-4 text-primary" /><p className="text-xs font-mono text-primary uppercase tracking-widest">Análise com IA · Claude</p></div>
          <div className="px-6 py-8"><MarkdownText>{aiText}</MarkdownText></div>
        </div>
        {opportunities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5"><Target className="w-4 h-4 text-primary" /><p className="text-xs font-mono text-primary uppercase tracking-widest">Plano de Desenvolvimento Individual</p></div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Ações concretas para as suas maiores oportunidades de crescimento, organizadas em 30, 60 e 90 dias.</p>
            <div className="space-y-3">{opportunities.map((s) => <PdiCard key={s.id} competencyId={s.id} />)}</div>
          </div>
        )}
        <div className="rounded-sm border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 bg-primary/10 rounded-sm flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-primary" /></div>
            <div><p className="text-sm font-medium mb-1">1 sessão de mentoria ao vivo</p><p className="text-xs text-muted-foreground leading-relaxed max-w-sm">60 minutos com Patrick ou Carlos para aprofundar seu diagnóstico e definir os próximos passos com clareza.</p></div>
          </div>
          <a href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent("Olá! Fiz o diagnóstico e gostaria de agendar minha sessão de mentoria.")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity shrink-0"><MessageCircle className="w-4 h-4" /> Agendar mentoria</a>
        </div>
        <button onClick={() => exportPDF({ profileData, scores, generalScore, generalLevel, profileName, profileDesc, strengths, opportunities, aiText })} className="flex items-center gap-2 border border-border text-muted-foreground px-5 py-2.5 rounded-sm text-sm hover:border-primary hover:text-foreground transition-colors"><Download className="w-4 h-4" /> Exportar relatório completo</button>
      </div>
    );
  }
  return (
    <div className="rounded-sm overflow-hidden border border-primary/20">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 lg:p-10 border-b border-border">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full font-mono uppercase tracking-widest mb-4"><Lock className="w-2.5 h-2.5" /> Conteúdo exclusivo</div>
            <h2 className="text-2xl lg:text-3xl mb-2" style={{ fontFamily: "var(--font-display)" }}>Diagnóstico Completo</h2>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">Análise narrativa personalizada com IA, plano de ação concreto e uma sessão de mentoria para transformar o diagnóstico em evolução real.</p>
          </div>
          <div className="text-right shrink-0"><div className="text-3xl font-mono font-medium">{PRODUCT_PRICE}</div><div className="text-xs text-muted-foreground mt-1 font-mono">pagamento único</div></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map(({ Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 bg-primary/10 rounded-sm flex items-center justify-center shrink-0 mt-0.5"><Icon className="w-3.5 h-3.5 text-primary" /></div>
              <div><p className="text-sm font-medium mb-0.5">{label}</p><p className="text-xs text-muted-foreground leading-relaxed">{desc}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative px-8 py-6 border-b border-border overflow-hidden select-none">
        <div className="blur-sm pointer-events-none">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-3">Prévia · Análise com IA</p>
          <p className="text-sm leading-relaxed text-muted-foreground mb-2">Seu diagnóstico revela um profissional com sólida capacidade analítica e forte orientação para resultados...</p>
          <p className="text-sm leading-relaxed text-muted-foreground">O padrão mais relevante identificado está na tensão entre sua habilidade de análise e a necessidade de traduzir insights...</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2"><Lock className="w-3.5 h-3.5 text-primary" /><span className="text-xs font-medium">Desbloqueado após confirmação</span></div>
        </div>
      </div>
      <div className="p-8 lg:p-10">
        {phase === "preview" && (<button onClick={() => setPhase("form")} className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"><Sparkles className="w-4 h-4" /> Quero o diagnóstico completo</button>)}
        {phase === "form" && (
          <div className="max-w-md space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">Preencha seus dados para reservar seu acesso. Em seguida, abriremos o WhatsApp com uma mensagem pronta para confirmar o pagamento de {PRODUCT_PRICE} e liberar sua chave pessoal.</p>
            {aiError && (<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400">{aiError}</div>)}
            <div className="space-y-4">
              <div><label className={labelCls}>Nome completo</label><input type="text" value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))} placeholder="Seu nome" className={inputCls} /></div>
              <div><label className={labelCls}>E-mail</label><input type="email" value={lead.email} onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))} placeholder="seu@email.com" className={inputCls} /></div>
              <div><label className={labelCls}>WhatsApp (com DDD)</label><input type="tel" value={lead.whatsapp} onChange={(e) => setLead((l) => ({ ...l, whatsapp: e.target.value }))} placeholder="(49) 99999-9999" className={inputCls} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={!canSubmit} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"><MessageCircle className="w-4 h-4" /> Confirmar pelo WhatsApp</button>
                <button onClick={() => setPhase("preview")} className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              </div>
              <p className="text-[10px] text-muted-foreground">Use um e-mail válido e um WhatsApp com DDD. Suas informações são usadas apenas para contato e liberação do acesso.</p>
            </div>
          </div>
        )}
        {phase === "code" && (
          <div className="max-w-md space-y-6">
            <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5 text-green-400" /><div><p className="text-sm font-medium">Solicitação iniciada</p><p className="text-xs text-muted-foreground">Finalize a confirmação no WhatsApp. Depois volte para esta tela e insira sua chave de acesso.</p></div></div>
            <div className="bg-card border border-border rounded-sm p-5 text-xs text-muted-foreground leading-relaxed space-y-1">
              <p className="font-mono text-primary uppercase tracking-widest text-[10px] mb-2">Liberação do acesso</p>
              <p>1. Confirme o pagamento de {PRODUCT_PRICE} na conversa já aberta</p>
              <p>2. Você receberá uma chave pessoal de liberação</p>
              <p>3. Cole a chave abaixo para gerar sua análise completa</p>
            </div>
            {(codeError || aiError) && (<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400">{codeError || aiError}</div>)}
            <div>
              <label className={labelCls}>Chave de acesso</label>
              <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())} placeholder="Cole aqui a chave recebida" className={inputCls + " font-mono tracking-widest"} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCodeSubmit} disabled={!accessCode.trim()} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"><Sparkles className="w-4 h-4" /> Gerar análise completa</button>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Abrir WhatsApp</a>
              <button onClick={() => setPhase("form")} className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Voltar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────
function Results({ profileData, scores, answers, onReset, onAbout }) {
  const generalScore = Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length);
  const generalLevel = getLevel(generalScore);
  const profile = getProfileResult(scores);
  const crossResults = getCrossResults(scores);
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 3);
  const opportunities = sorted.slice(-3).reverse();
  const radarData = COMPETENCIES.map((c) => { const s = scores.find((x) => x.id === c.id); return { score: s ? s.score : 0 }; });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border">
        <div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center"><BarChart2 className="w-3.5 h-3.5 text-primary-foreground" /></div><span className="text-sm font-medium">Raio-X do Designer</span></div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportPDF({ profileData, scores, generalScore, generalLevel, profileName: profile.name, profileDesc: profile.desc, strengths, opportunities })} className="flex items-center gap-2 border border-border text-muted-foreground px-4 py-2 rounded-sm text-sm hover:border-primary hover:text-foreground transition-colors"><Download className="w-3.5 h-3.5" /> Exportar PDF</button>
          <button onClick={onReset} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"><RefreshCw className="w-4 h-4" /> Nova avaliação</button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
        <div className="flex items-start justify-between gap-8 flex-wrap pb-10 border-b border-border">
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-3">Diagnóstico de</p>
            <h1 className="text-4xl lg:text-5xl mb-2" style={{ fontFamily: "var(--font-display)" }}>{profileData.name}</h1>
            <p className="text-sm text-muted-foreground">{profileData.currentRole} · {profileData.professionalLevel} · {profileData.mainArea}</p>
          </div>
          <div className="text-right">
            <div className="font-mono font-medium leading-none" style={{ fontSize: "5rem", color: LEVEL_COLORS[generalLevel] }}>{generalScore}</div>
            <div className="text-sm text-muted-foreground mt-2">Índice Geral · <span style={{ color: LEVEL_COLORS[generalLevel] }}>{generalLevel}</span></div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-[11px] text-muted-foreground font-mono"><Check className="w-3 h-3 text-primary" /> Diagnóstico gratuito</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-sm p-6">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-4">Mapa de competências</p>
            <svg viewBox="0 0 280 280" width="100%" style={{ maxHeight: 280 }}>
              {(() => {
                const cx = 140, cy = 140, maxR = 105, n = COMPETENCIES.length;
                const toXY = (i, r) => { const angle = (Math.PI * 2 * i) / n - Math.PI / 2; return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }; };
                const rings = [25, 50, 75, 100];
                const scorePoints = radarData.map((d, i) => toXY(i, (d.score / 100) * maxR));
                const scorePath = scorePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
                return (
                  <g>
                    {rings.map(r => { const pts = Array.from({ length: n }, (_, i) => toXY(i, (r / 100) * maxR)); const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z"; return <path key={`rr-${r}`} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />; })}
                    {COMPETENCIES.map((_, i) => { const outer = toXY(i, maxR); return <line key={`rs-${i}`} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />; })}
                    <path d={scorePath} fill="rgba(129,140,248,0.18)" stroke="#818CF8" strokeWidth={2} />
                    {COMPETENCIES.map((c, i) => { const p = scorePoints[i]; const label = toXY(i, maxR + 14); const anchor = label.x < cx - 4 ? "end" : label.x > cx + 4 ? "start" : "middle"; return (<g key={`rn-${c.id}`}><circle cx={p.x} cy={p.y} r={3} fill="#818CF8" /><text x={label.x} y={label.y + 3} textAnchor={anchor} fill="#64748B" fontSize={9}>{c.name.split(" ")[0]}</text></g>); })}
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="bg-card border border-border rounded-sm p-6 flex flex-col">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-4">Perfil predominante</p>
            <h3 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>{profile.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{profile.desc}</p>
            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-border">{profile.competencies.map((id) => { const c = COMPETENCIES.find((x) => x.id === id); return c ? <span key={id} className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full">{c.name}</span> : null; })}</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-sm p-6">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-6">Pontuação por competência</p>
          <div className="space-y-4">{sorted.map((s) => (<div key={s.id} className="flex items-center gap-4"><span className="text-sm text-foreground/80 w-44 shrink-0 truncate">{s.name}</span><div className="flex-1 bg-secondary rounded-full h-1"><div className="h-1 rounded-full transition-all duration-700" style={{ width: `${s.score}%`, backgroundColor: LEVEL_COLORS[s.level] }} /></div><span className="font-mono text-sm w-8 text-right">{s.score}</span><span className="text-xs text-muted-foreground w-24 text-right">{s.level}</span></div>))}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[{ label: "Forças", items: strengths }, { label: "Oportunidades", items: opportunities }].map(({ label, items }) => (
            <div key={label} className="bg-card border border-border rounded-sm p-6">
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-5">{label}</p>
              <div className="space-y-5">{items.map((s, i) => (<div key={s.id} className="flex items-start gap-3"><span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0">0{i + 1}</span><div><div className="flex items-baseline gap-2 mb-0.5"><span className="text-sm font-medium">{s.name}</span><span className="font-mono text-xs" style={{ color: LEVEL_COLORS[s.level] }}>{s.score}</span></div><span className="text-xs" style={{ color: LEVEL_COLORS[s.level] }}>{s.level}</span></div></div>))}</div>
            </div>
          ))}
        </div>
        {crossResults.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Padrões comportamentais</p>
            <h2 className="text-2xl mb-6" style={{ fontFamily: "var(--font-display)" }}>Como suas competências se combinam</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{crossResults.map((r) => (<div key={r.id} className="bg-card border border-border rounded-sm p-5"><h4 className="text-sm font-medium mb-2">{r.title}</h4><p className="text-xs text-muted-foreground leading-relaxed">{r.interpretation}</p></div>))}</div>
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 mb-8"><div className="flex-1 border-t border-border" /><span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest px-3">Próximo nível</span><div className="flex-1 border-t border-border" /></div>
          <UpgradeSection profileData={profileData} scores={scores} answers={answers} generalScore={generalScore} generalLevel={generalLevel} profileName={profile.name} profileDesc={profile.desc} strengths={strengths} opportunities={opportunities} />
        </div>
        <div className="border-t border-border pt-8 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Raio-X do Designer · {new Date().getFullYear()}</p>
          <div className="flex items-center gap-5">
            <button onClick={onAbout} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sobre nós</button>
            <button onClick={onReset} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Nova avaliação</button>
          </div>
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
  const navigateTo = (nextView) => {
    setView(nextView);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  const handleAnswer = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));
  const handleComplete = () => { setScores(calculateScores(answers)); navigateTo("results"); };
  const handleReset = () => { navigateTo("landing"); setProfileData(null); setAnswers({}); setScores([]); };
  return (
    <>
      {view === "landing" && <Landing onStart={() => navigateTo("profile")} onAbout={() => navigateTo("about")} />}
      {view === "about" && <AboutPage onBack={() => navigateTo("landing")} onStart={() => navigateTo("profile")} />}
      {view === "profile" && <ProfileForm onSubmit={(d) => { setProfileData(d); navigateTo("assessment"); }} onBack={() => navigateTo("landing")} />}
      {view === "assessment" && <AssessmentForm answers={answers} onAnswer={handleAnswer} onComplete={handleComplete} onBack={() => navigateTo("profile")} />}
      {view === "results" && profileData && <Results profileData={profileData} scores={scores} answers={answers} onReset={handleReset} onAbout={() => navigateTo("about")} />}
    </>
  );
}
