import { useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { isAdminAuthConfigured, signInAdmin } from "../services/adminAuthService";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInAdmin(email, password);
      const nextPath = new URLSearchParams(window.location.search).get("next");
      window.location.href = nextPath?.startsWith("/admin/") ? nextPath : "/admin/dashboard";
    } catch (loginError) {
      setError(loginError.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/raio-x-logo-branco.svg" alt="Raio-X do Designer" className="mx-auto h-12 w-auto" />
          <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.24em] text-primary">Área administrativa</p>
          <h1 className="mt-2 text-3xl font-semibold">Entrar no dashboard</h1>
          <p className="mt-3 text-sm text-muted-foreground">Acesso restrito a administradores autorizados.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-sm border border-border bg-card p-6 shadow-2xl">
          {!isAdminAuthConfigured() && (
            <div className="mb-5 rounded-sm border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
              Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para habilitar o login.
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">E-mail</label>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="w-full rounded-sm border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">Senha</label>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" className="w-full rounded-sm border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary" />
            </div>
          </div>
          {error && <div className="mt-5 rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
          <button disabled={loading || !email || !password || !isAdminAuthConfigured()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Entrar
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
