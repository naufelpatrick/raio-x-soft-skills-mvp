import { BarChart2, LogOut, Settings, Users, LineChart, Target, Wallet, Megaphone } from "lucide-react";

const navItems = [
  { label: "Visão geral", Icon: BarChart2, href: "/admin/dashboard" },
  { label: "Funil", Icon: Target },
  { label: "Diagnósticos", Icon: LineChart },
  { label: "Leads", Icon: Users },
  { label: "Vendas", Icon: Wallet },
  { label: "Marketing", Icon: Megaphone },
  { label: "Configurações", Icon: Settings },
];

export function AdminLayout({ children, admin, rangeLabel, onRefresh, onLogout, loading, title = "Dashboard" }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/70 backdrop-blur-xl p-6 lg:block">
        <div className="mb-10">
          <img src="/raio-x-logo-branco.svg" alt="Raio-X do Designer" className="h-9 w-auto mb-5" />
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary">Admin cockpit</p>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ label, Icon, href }) => {
            const active = href && window.location.pathname === href;
            return href ? <a
              key={label}
              href={href}
              className={`w-full flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-left transition-colors ${
                active
                  ? "bg-primary/10 text-foreground border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </a> : <button key={label} disabled className="w-full flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-left text-muted-foreground/50 cursor-not-allowed"><Icon className="w-4 h-4" />{label}<span className="ml-auto text-[9px] font-mono uppercase">Em breve</span></button>
          })}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl px-6 py-4 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Raio-X do Designer</p>
              <h1 className="text-2xl font-semibold mt-1">{title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground">
                Período: <span className="text-foreground">{rangeLabel}</span>
              </div>
              <button onClick={onRefresh} disabled={loading} className="rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-50">
                {loading ? "Atualizando..." : "Atualizar dados"}
              </button>
              <div className="rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground max-w-[240px] truncate">
                {admin?.email || "Admin"}
              </div>
              <button onClick={onLogout} className="flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>
        </header>
        <div className="px-6 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
