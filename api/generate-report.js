function buildPrompt({ profileData, scores, answers, generalScore, generalLevel, profileName, profileDesc, strengths, opportunities }) {
  const scoreList = scores.map(s => `- ${s.name}: ${s.score}/100 (${s.level})`).join('\n');
  const strengthsList = strengths.map(s => `- ${s.name} (${s.score})`).join('\n');
  const opportunitiesList = opportunities.map(s => `- ${s.name} (${s.score})`).join('\n');
  const openAnswers = [
    answers.open_1 ? `Maior desafio comportamental: "${answers.open_1}"` : null,
    answers.open_2 ? `Competência a desenvolver: "${answers.open_2}"` : null,
    answers.open_3 ? `Situação recorrente de dificuldade: "${answers.open_3}"` : null,
  ].filter(Boolean).join('\n');

  return `Você é o Analista Oficial do Raio-X de Soft Skills. Produza um diagnóstico profissional, preciso e humano com base nos dados abaixo.

## PERFIL DO PROFISSIONAL
- Nome: ${profileData.name}
- Idade: ${profileData.age}
- Cargo: ${profileData.currentRole}
- Nível: ${profileData.professionalLevel}
- Área: ${profileData.mainArea}
- Experiência: ${profileData.experience}
- Objetivo de carreira (12 meses): ${profileData.careerGoal}
- Principal desafio atual: ${profileData.currentChallenge}

## ÍNDICE GERAL
${generalScore}/100 — Nível ${generalLevel}

## PERFIL PREDOMINANTE
${profileName}: ${profileDesc}

## SCORES POR COMPETÊNCIA
${scoreList}

## TOP 3 FORÇAS
${strengthsList}

## TOP 3 OPORTUNIDADES
${opportunitiesList}

## RESPOSTAS ABERTAS
${openAnswers || 'Não fornecidas.'}

---

Produza um diagnóstico com 700 a 900 palavras, em português brasileiro, com as seguintes seções (use ## para títulos):

## Resumo Executivo
## Leitura de Maturidade Profissional
## Principais Forças
## Pontos de Atenção
## Recomendações Prioritárias
## Conclusão

Regras:
- Não invente fatos ou diagnósticos clínicos
- Evite clichês motivacionais
- Tom: direto, analítico, humano, prático
- Adapte tudo ao cargo, nível e área do profissional
- Finalize todas as seções solicitadas
- Nunca termine o texto no meio de uma frase, tópico ou palavra`.trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY não configurada no Vercel.' });
    return;
  }

  const body = req.body;
  if (!body?.profileData || !body?.scores) {
    res.status(400).json({ error: 'Dados insuficientes para gerar o diagnóstico.' });
    return;
  }

  const prompt = buildPrompt(body);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://raio-x-soft-skills-mvp.vercel.app',
        'X-Title': 'Raio-X de Soft Skills',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        messages: [
          {
            role: 'system',
            content: 'Você é o Analista Oficial do Raio-X de Soft Skills. Produza diagnósticos precisos, humanos e acionáveis em português brasileiro. Nunca invente dados.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 3000,
        temperature: 0.65,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error('OpenRouter error:', response.status);
      res.status(502).json({ error: 'Erro ao chamar o OpenRouter. Tente novamente.' });
      return;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    res.status(200).json({ text });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      res.status(504).json({ error: 'Tempo limite atingido. Tente novamente.' });
      return;
    }
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Erro interno ao gerar o diagnóstico.' });
  }
}
