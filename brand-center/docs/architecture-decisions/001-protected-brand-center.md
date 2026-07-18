# ADR 001 — Brand Center protegido e isolado

O Brand Center é uma aplicação Next.js independente servida sob `/admin/brand/`.

## Decisões

- Todo conteúdo editorial vive em MDX.
- Nenhuma página é enviada antes da validação administrativa no servidor.
- A sessão usa cookie HttpOnly e a autorização consulta `admin_users`.
- Todas as respostas privadas recebem `no-store` e `noindex`.
- O aplicativo comercial Vite permanece isolado para reduzir risco de regressão.
- A exportação futura para PDF é suportada por CSS de impressão e pelo modelo de documento linear.
