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
- `VITE_CLARITY_PROJECT_ID`: opcional. O projeto usa `xkxrzsnluj` como fallback e só carrega o Microsoft Clarity quando o usuário aceita Analytics no banner de cookies.

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

## Dashboard administrativo

O projeto possui um dashboard privado em:

- `/admin/login`
- `/admin/dashboard`

O login usa Supabase Auth com e-mail e senha. A autorização administrativa não depende apenas do frontend: o endpoint `/api/admin-dashboard` valida o token do usuário, consulta a tabela `admin_users` e só retorna dados para usuários ativos com role `owner`, `admin` ou `viewer`.

O dashboard MVP mostra dados reais disponíveis no Supabase:

- visitantes/sessões rastreadas pelo funil;
- leads;
- diagnósticos iniciados e concluídos;
- relatório gratuito visualizado;
- pagamentos iniciados;
- compras aprovadas;
- receita estimada;
- ticket médio;
- funil de conversão;
- leads recentes;
- vendas recentes;
- resumo de NPS;
- estados pendentes para GA4, Clarity e competências agregadas.

### Variáveis de ambiente do admin

No frontend, use apenas variáveis públicas:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLARITY_PROJECT_URL=
```

No backend/Vercel, configure variáveis privadas:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca use `SUPABASE_SERVICE_ROLE_KEY` com prefixo `VITE_`.

### Migrations

A base administrativa está em:

```text
supabase/migrations/202607141-admin-dashboard-foundation.sql
```

Essa migration cria:

- `admin_users`
- `product_events`
- `payment_webhook_events`
- `admin_audit_logs`
- índices úteis;
- RLS;
- política pública apenas para insert em `product_events`.

As tabelas administrativas não possuem política pública de leitura. As consultas do dashboard passam pelo backend.

### Como criar o primeiro administrador

1. No Supabase, acesse Authentication > Users.
2. Crie um usuário com e-mail e senha.
3. Copie o UUID do usuário criado.
4. Rode no SQL Editor:

```sql
insert into public.admin_users (user_id, email, role, active)
values (
  'UUID_DO_USUARIO_AQUI',
  'email-do-admin@exemplo.com',
  'owner',
  true
);
```

5. Acesse `/admin/login`.
6. Faça login com o usuário criado no Supabase Auth.
7. Se o usuário estiver ativo em `admin_users`, ele será redirecionado para `/admin/dashboard`.

Não existe senha padrão e nenhuma credencial real deve ser salva no repositório.

### Integrações pendentes

GA4 e Clarity aparecem no dashboard como integrações pendentes ou links externos. Para integrar GA4 de verdade no cockpit, será necessário configurar uma conta de serviço no Google Cloud, habilitar a Google Analytics Data API e criar um endpoint backend específico. Credenciais privadas do Google nunca devem ser expostas no frontend.

### Observações de dados

O bloco “Panorama das competências” aparece como indisponível porque as pontuações por competência ainda não são persistidas em uma tabela própria de diagnósticos. Para ativá-lo, será necessário salvar resultados agregáveis do diagnóstico sem expor respostas abertas completas na tela principal.
