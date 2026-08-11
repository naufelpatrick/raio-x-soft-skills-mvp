const SITE_URL = "https://www.raioxdodesigner.com";

const subjects = [
  "Seu Raio X está pronto. E agora?",
  "Sua pontuação é só o começo",
  "Todo ponto forte pode esconder um ponto cego",
  "O que fazer com o que seu Raio X revelou?",
];

const preheaders = [
  "Seu diagnóstico terminou, mas o resultado é só o começo.",
  "O que realmente importa está na relação entre suas competências.",
  "Às vezes, aquilo que mais ajuda você também pode limitar seu desenvolvimento.",
  "Diagnóstico só gera valor quando se transforma em ação.",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function greeting(name) {
  const firstName = String(name || "").trim().split(/\s+/)[0];
  return firstName ? `Olá, ${escapeHtml(firstName)}.` : "Olá.";
}

function layout({ preheader, greetingText, paragraphs, ctaLabel, ctaUrl, unsubscribeUrl }) {
  const body = paragraphs.map((paragraph) => `<p style="margin:0 0 20px;color:#273244;font-size:16px;line-height:1.7">${paragraph}</p>`).join("");
  const unsubscribe = unsubscribeUrl
    ? `<p style="margin:28px 0 0;text-align:center"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#667085;font-size:12px;text-decoration:underline">Não quero mais receber estes e-mails</a></p>`
    : "";
  const brandHeader = `<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="padding-right:13px;vertical-align:middle"><img src="${SITE_URL}/raio-x-favicon-512.png" width="48" height="48" alt="" style="display:block;width:48px;height:48px;border:0"></td><td style="vertical-align:middle"><div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-.3px">Raio X do Designer</div><div style="margin-top:6px;color:#a9b4c7;font-size:11px;letter-spacing:1.8px;text-transform:uppercase">Enxergue além das ferramentas.</div></td></tr></table>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f2ed;font-family:Arial,Helvetica,sans-serif;color:#101828"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f2ed"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e6e2da"><tr><td style="padding:24px 36px 20px;background:#0b1120">${brandHeader}</td></tr><tr><td style="padding:36px"><p style="margin:0 0 24px;color:#101828;font-size:17px;line-height:1.6">${greetingText}</p>${body}<table role="presentation" cellspacing="0" cellpadding="0" style="margin:30px 0"><tr><td bgcolor="#fbbf24" style="border-radius:3px"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 22px;color:#0b1120;font-size:15px;font-weight:700;text-decoration:none">${escapeHtml(ctaLabel)}</a></td></tr></table>${unsubscribe}</td></tr><tr><td style="padding:22px 36px;border-top:1px solid #ece8e0;color:#667085;font-size:12px;line-height:1.6">Raio X do Designer — Enxergue além das ferramentas.<br><a href="mailto:info@raioxdodesigner.com" style="color:#667085">info@raioxdodesigner.com</a></td></tr></table></td></tr></table></body></html>`;
}

export function buildPostDiagnosticEmail({ step, name, resultToken, unsubscribeToken }) {
  if (!Number.isInteger(step) || step < 0 || step > 3) throw new Error("Step de e-mail inválido.");
  const resultUrl = `${SITE_URL}/resultado?token=${encodeURIComponent(resultToken)}`;
  const upgradeUrl = `${resultUrl}#diagnostico-completo`;
  const unsubscribeUrl = step === 0 ? "" : `${SITE_URL}/descadastrar?token=${encodeURIComponent(unsubscribeToken)}`;
  const content = [
    {
      ctaLabel: "Ver meu Raio X", ctaUrl: resultUrl,
      paragraphs: [
        "Você concluiu seu Raio X do Designer.",
        "Seu resultado mostra como 10 competências comportamentais aparecem hoje na sua forma de trabalhar — da comunicação e colaboração ao pensamento crítico, adaptabilidade e liderança.",
        "Mas uma pontuação, sozinha, diz pouco.",
        "O mais interessante começa quando você entende como essas competências se relacionam e o que elas podem revelar sobre sua forma de tomar decisões, trabalhar com pessoas e enfrentar desafios profissionais.",
        "Seu resultado continua disponível.",
      ],
    },
    {
      ctaLabel: "Conhecer minha Análise Profunda", ctaUrl: upgradeUrl,
      paragraphs: [
        "Ontem você respondeu a situações e comportamentos do seu dia a dia profissional.",
        "O radar que recebeu mostra onde suas competências estão hoje.",
        "Mas existe uma segunda pergunta, mais importante:<br><strong>O que esses resultados significam quando aparecem juntos?</strong>",
        "Uma comunicação forte combinada com baixa escuta pode produzir um comportamento muito diferente de comunicação forte acompanhada de alta empatia.",
        "O mesmo acontece com liderança, pensamento crítico, adaptabilidade e as demais competências.",
        "É justamente nessa relação que começam a aparecer padrões, forças e pontos cegos.",
        "A Análise Profunda do Raio X vai além das notas individuais para interpretar essas relações e transformar o diagnóstico em recomendações de desenvolvimento.",
      ],
    },
    {
      ctaLabel: "Descobrir meus padrões", ctaUrl: upgradeUrl,
      paragraphs: [
        "Uma competência nunca funciona isoladamente.",
        "Uma pessoa altamente adaptável pode responder muito bem a mudanças — mas também pode aceitar mudanças rápido demais sem questioná-las.",
        "Um pensamento crítico muito desenvolvido pode melhorar decisões — mas, combinado com determinadas características, também pode tornar discussões mais difíceis.",
        "Uma liderança forte pode mobilizar pessoas — ou ocupar espaço demais.",
        "Por isso o Raio X não foi criado apenas para dizer no que você é bom ou ruim.",
        "A proposta é revelar <strong>como suas competências interagem</strong>.",
        "Na Análise Profunda, seus resultados são cruzados para identificar padrões, possíveis pontos cegos e caminhos de desenvolvimento mais coerentes com o seu perfil.",
      ],
    },
    {
      ctaLabel: "Quero minha Análise Profunda", ctaUrl: upgradeUrl,
      paragraphs: [
        "Há alguns dias você concluiu seu Raio X do Designer.",
        "Talvez alguma pontuação tenha confirmado algo que você já sabia. Talvez outra tenha surpreendido.",
        "Mas existe uma diferença importante entre:<br><strong>saber onde você está</strong><br>e<br><strong>saber o que desenvolver a partir disso.</strong>",
        "A Análise Profunda foi criada para fazer essa ponte.",
        "Ela transforma os resultados do seu Raio X em leitura integrada das competências, pontos fortes, possíveis pontos cegos e recomendações práticas de desenvolvimento.",
        "Se quiser avançar, sua análise continua disponível.",
      ],
    },
  ][step];

  return {
    subject: subjects[step],
    preheader: preheaders[step],
    html: layout({
      preheader: preheaders[step],
      greetingText: greeting(name),
      paragraphs: content.paragraphs,
      ctaLabel: content.ctaLabel,
      ctaUrl: content.ctaUrl,
      unsubscribeUrl,
    }),
    ctaUrl: content.ctaUrl,
  };
}

export const POST_DIAGNOSTIC_SUBJECTS = subjects;
