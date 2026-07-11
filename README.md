# Raio-X de Soft Skills

MVP de autoavaliação comportamental para profissionais de Design. A aplicação avalia 10 competências, apresenta perfil predominante, forças, oportunidades e um PDI de 90 dias. Uma devolutiva adicional pode ser gerada com apoio de IA via OpenRouter.

## Fluxo

1. Landing page e ciência sobre privacidade/termos.
2. Contexto profissional do participante.
3. 50 perguntas de escala e 3 perguntas abertas.
4. Relatório básico calculado localmente.
5. Análise aprofundada opcional com IA via OpenRouter.
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

- `OPENROUTER_API_KEY`: obrigatória para gerar a análise com IA.
- `APP_ORIGIN`: domínio autorizado a chamar as APIs. Aceita origens separadas por vírgula.
- `FEEDBACK_WEBHOOK_URL`: opcional. Encaminha feedbacks para Make, Zapier, Google Apps Script ou serviço equivalente.
- `INTEREST_WEBHOOK_URL`: opcional. Encaminha nome, e-mail, autorização de contato e interesse principal para o fluxo de relacionamento.
- `VITE_GA_MEASUREMENT_ID`: opcional. O projeto usa `G-RFRY1LERDY` como fallback e só carrega o Google Analytics 4 quando o usuário aceita Analytics no banner de cookies.

Os endpoints não registram payloads pessoais completos em logs de aplicação. Erros técnicos podem ser registrados para depuração.

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
- Dados da avaliação só são enviados ao OpenRouter após ação explícita do participante no fluxo do relatório completo.
- O produto é apresentado como autoavaliação profissional, não diagnóstico psicológico.
