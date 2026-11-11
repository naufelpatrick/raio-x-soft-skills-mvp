import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { fetchAdminAssessments, getStoredAdminSession, signOutAdmin } from "../services/adminAuthService";
import { formatDate } from "../utils/formatters";

const control = "rounded-sm border border-border bg-card px-3 py-2 text-sm focus-visible:outline-primary disabled:opacity-50";

function AssessmentCard({ result }) {
  return (
    <article className="rounded-sm border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold">{result.name || "Diagnóstico sem cadastro vinculado"}</h2>
          {result.email && <p className="break-all text-sm text-muted-foreground">{result.email}</p>}
        </div>
        {result.purchased && <span className="rounded-sm bg-primary/10 px-2 py-1 text-xs text-primary">Compra registrada · Mentoria incluída</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        {result.completedAt && <span>Concluído em {formatDate(result.completedAt)}</span>}
        {result.purchasedAt && <span>Compra em {formatDate(result.purchasedAt)}</span>}
        {result.generalScore != null && <strong className="text-foreground">Índice geral {result.generalScore}/100</strong>}
      </div>
      {!result.completedAt && <p className="mt-3 text-sm text-amber-300">Diagnóstico sem resultado vinculado à compra.</p>}
      {result.competencies.length > 0 && (
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer text-sm font-medium">Ver pontuações por competência</summary>
          <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
            {[...result.competencies].sort((a, b) => b.score - a.score).map((item) => (
              <div key={item.id} className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
                <dt>{item.name}</dt>
                <dd className="text-right tabular-nums">{item.score}/100 <span className="text-xs text-muted-foreground">{item.level}</span></dd>
              </div>
            ))}
          </dl>
          {result.instrumentVersion && <p className="mt-3 text-xs text-muted-foreground">Versão do instrumento {result.instrumentVersion}</p>}
        </details>
      )}
    </article>
  );
}

export function AdminAssessmentsPage() {
  const [filter, setFilter] = useState("paid");
  const [page, setPage] = useState(0);
  const [draftEmail, setDraftEmail] = useState("");
  const [email, setEmail] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [request, setRequest] = useState(null);
  const requestKey = JSON.stringify([filter, page, email, refresh]);
  const loading = request?.key !== requestKey;

  useEffect(() => {
    if (!getStoredAdminSession()?.accessToken) {
      window.location.replace("/admin/login?next=/admin/diagnosticos");
      return;
    }
    const controller = new AbortController();
    fetchAdminAssessments({ filter, page, email }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setRequest({ key: requestKey });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (!getStoredAdminSession()?.accessToken) {
          window.location.replace("/admin/login?next=/admin/diagnosticos");
          return;
        }
        setRequest({ key: requestKey, error: error.message });
      });
    return () => controller.abort();
  }, [filter, page, email, requestKey]);

  return (
    <AdminLayout title="Diagnósticos" admin={data?.admin} loading={loading} onRefresh={() => setRefresh(refresh + 1)} onLogout={async () => {
      await signOutAdmin();
      window.location.href = "/admin/login";
    }}>
      <a href="/admin/dashboard" className="mb-4 inline-block text-sm text-primary lg:hidden">Voltar à visão geral</a>
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <label className="grid gap-1 text-sm">
          Mostrar
          <select className={control} value={filter} onChange={(event) => {
            setFilter(event.target.value);
            setPage(0);
          }}>
            <option value="paid">Compras com mentoria</option>
            <option value="all">Diagnósticos concluídos</option>
          </select>
        </label>
        <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
          event.preventDefault();
          setEmail(draftEmail.trim());
          setPage(0);
        }}>
          <label className="grid gap-1 text-sm">
            E-mail do participante
            <input type="email" maxLength={254} className={control} value={draftEmail} onChange={(event) => setDraftEmail(event.target.value)} />
          </label>
          <button className={control}>Buscar</button>
          {email && <button type="button" className={control} onClick={() => {
            setDraftEmail("");
            setEmail("");
            setPage(0);
          }}>Limpar busca</button>}
        </form>
      </div>
      {loading ? <p role="status">Carregando diagnósticos…</p> : request.error ? (
        <p role="alert" className="text-red-300">{request.error}</p>
      ) : (
        <div className="space-y-3">
          {data.results.length ? data.results.map((result) => <AssessmentCard key={result.id} result={result} />) : <p>Nenhum registro encontrado.</p>}
          {(page > 0 || data.hasNext) && (
            <nav aria-label="Páginas de diagnósticos" className="flex items-center gap-3">
              <button className={control} disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
              <span className="text-sm">Página {page + 1}</span>
              <button className={control} disabled={!data.hasNext} onClick={() => setPage(page + 1)}>Próxima</button>
            </nav>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
