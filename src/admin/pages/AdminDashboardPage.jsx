import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { ConversionFunnel } from "../components/ConversionFunnel";
import { ClaritySummary, DashboardAlerts, EmptyIntegrationState, Ga4Summary, NpsSummary, RevenueChart } from "../components/DashboardBlocks";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { RecentLeadsTable, RecentSalesTable } from "../components/DashboardTables";
import { MetricCard } from "../components/MetricCard";
import { fetchAdminDashboard, getStoredAdminSession, signOutAdmin } from "../services/adminAuthService";
import { getRangeLabel } from "../utils/dateRanges";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-80 animate-pulse rounded-sm bg-card" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-sm bg-card" />)}
      </div>
      <div className="h-96 animate-pulse rounded-sm bg-card" />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-sm border border-red-500/20 bg-red-500/10 p-6">
      <h2 className="text-lg font-semibold text-red-200">Não foi possível carregar o dashboard</h2>
      <p className="mt-2 text-sm text-red-100/80">{message}</p>
      <button onClick={onRetry} className="mt-5 rounded-sm border border-red-300/30 px-4 py-2 text-sm text-red-100 hover:bg-red-500/10">Tentar novamente</button>
    </div>
  );
}

export function AdminDashboardPage() {
  const [range, setRange] = useState("last_7_days");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDashboard(nextRange = range) {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminDashboard(nextRange);
      setData(result);
    } catch (loadError) {
      setError(loadError.message || "Erro inesperado.");
      if (String(loadError.message || "").includes("Sessão")) {
        window.location.href = "/admin/login";
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const session = getStoredAdminSession();
    if (!session?.accessToken) {
      window.location.href = "/admin/login";
      return;
    }
    let active = true;
    fetchAdminDashboard("last_7_days")
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Erro inesperado.");
        if (String(loadError.message || "").includes("Sessão")) {
          window.location.href = "/admin/login";
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function handleRangeChange(nextRange) {
    setRange(nextRange);
    loadDashboard(nextRange);
  }

  async function handleLogout() {
    await signOutAdmin();
    window.location.href = "/admin/login";
  }

  return (
    <AdminLayout admin={data?.admin} rangeLabel={getRangeLabel(range)} onRefresh={() => loadDashboard(range)} onLogout={handleLogout} loading={loading}>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary">Visão geral</p>
          <h2 className="mt-2 text-2xl font-semibold">Cockpit do negócio</h2>
          <p className="mt-2 text-sm text-muted-foreground">Funil e vendas no Supabase, aquisição e engajamento no Google Analytics 4.</p>
        </div>
        <DateRangeFilter value={range} onChange={handleRangeChange} />
      </div>

      {loading && !data ? <LoadingSkeleton /> : null}
      {error ? <ErrorState message={error} onRetry={() => loadDashboard(range)} /> : null}

      {data && !error && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map((metric) => <MetricCard key={metric.key} metric={metric} />)}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ConversionFunnel steps={data.funnel} />
            <div className="space-y-6">
              <DashboardAlerts alerts={data.alerts} />
              <NpsSummary nps={data.nps} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RevenueChart data={data.revenueByDay} />
            <EmptyIntegrationState title="Panorama das competências" message={data.competencies.message} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RecentLeadsTable leads={data.recentLeads} />
            <RecentSalesTable sales={data.recentSales} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Ga4Summary ga4={data.integrations.ga4} />
            <ClaritySummary clarity={data.integrations.clarity} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
