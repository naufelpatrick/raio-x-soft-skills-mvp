# Raio-X de Soft Skills

MVP de autoavaliação comportamental para profissionais de Design. A aplicação avalia 10 competências, apresenta perfil predominante, forças, oportunidades e um PDI de 90 dias. Uma devolutiva adicional pode ser gerada pelo Gemini.

## Fluxo

1. Landing page e consentimento.
2. Contexto profissional do participante.
3. 50 perguntas de escala e 3 perguntas abertas.
4. Relatório básico calculado localmente.
5. Análise aprofundada opcional com IA.
6. Pesquisa curta de validação do MVP.
7. Inscrição opcional para participar da próxima versão.

O progresso é salvo no `localStorage`, permitindo retomar a avaliação no mesmo navegador.

## Desenvolvimento

```bash
npm install
npm run dev
```

Validações disponíveis:

```bash
npm run lint
npm run build
```

As rotas em `api/` são funções serverless da Vercel. Para testá-las localmente, use a CLI da Vercel ou publique um ambiente de preview.

## Configuração

Copie `.env.example` para `.env.local` e preencha as variáveis necessárias.

- `GEMINI_API_KEY`: obrigatória para gerar a análise com IA.
- `GEMINI_MODEL`: modelo usado na geração; possui valor padrão.
- `APP_ORIGIN`: domínio autorizado a chamar as APIs. Aceita origens separadas por vírgula.
- `FEEDBACK_WEBHOOK_URL`: opcional. Encaminha feedbacks para Make, Zapier, Google Apps Script ou serviço equivalente.
- `INTEREST_WEBHOOK_URL`: opcional. Encaminha nome, e-mail, consentimento e interesse principal para o fluxo de relacionamento.
- `VITE_GA_MEASUREMENT_ID`: opcional. Ativa eventos no Google Analytics 4 após consentimento.

Sem webhook, os feedbacks continuam registrados nos logs das funções da Vercel com o prefixo `VALIDATION_FEEDBACK`.
As inscrições para a próxima versão usam o prefixo `VALIDATION_INTEREST` quando não há webhook configurado.

## Eventos de validação

Quando o GA4 está configurado, o app envia apenas identificadores anônimos e dados agregados:

- `assessment_started`
- `session_resumed`
- `profile_completed`
- `assessment_step_completed`
- `assessment_completed`
- `report_viewed`
- `ai_report_requested`
- `ai_report_succeeded`
- `ai_report_failed`
- `feedback_submitted`
- `interest_form_opened`
- `interest_submitted`

Nome, e-mail, respostas abertas, objetivo e desafio profissional não são enviados ao analytics.

## Segurança e privacidade

- O navegador não envia um prompt arbitrário à API; o prompt é montado no servidor.
- Payloads, origem e frequência de chamadas são validados.
- O limitador em memória reduz abuso básico por instância serverless. Para escala maior, use um rate limiter persistente.
- Dados da avaliação só são enviados ao Gemini após ação explícita do participante.
- O produto é apresentado como autoavaliação profissional, não diagnóstico psicológico.
