import { useEffect, useState } from "react";
import { Check, Loader2, Lock } from "lucide-react";
import {
  getPasswordRecoveryToken,
  isAdminAuthConfigured,
  updateAdminPassword,
} from "../services/adminAuthService";

const MIN_PASSWORD_LENGTH = 12;

export function AdminResetPasswordPage() {
  const [accessToken] = useState(() => getPasswordRecoveryToken());
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use uma senha com pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await updateAdminPassword(accessToken, password);
      setPassword("");
      setConfirmation("");
      setComplete(true);
    } catch (updateError) {
      setError(updateError.message || "Não foi possível atualizar a senha.");
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
          <h1 className="mt-2 text-3xl font-semibold">Redefinir senha</h1>
          <p className="mt-3 text-sm text-muted-foreground">Crie uma nova senha para acessar o dashboard.</p>
        </div>

        <div className="rounded-sm border border-border bg-card p-6 shadow-2xl">
          {complete ? (
            <div className="text-center">
              <Check className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">Senha atualizada</h2>
              <p className="mt-2 text-sm text-muted-foreground">Agora você já pode entrar com a nova senha.</p>
              <a href="/admin/login" className="mt-6 block rounded-sm bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Ir para o login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {!isAdminAuthConfigured() && (
                <div className="mb-5 rounded-sm border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
                  A autenticação administrativa não está configurada.
                </div>
              )}
              {!accessToken && (
                <div className="mb-5 rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                  Link inválido ou expirado. Solicite um novo e-mail de recuperação.
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">Nova senha</label>
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} className="w-full rounded-sm border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary" />
                  <p className="mt-2 text-[11px] text-muted-foreground">Use pelo menos {MIN_PASSWORD_LENGTH} caracteres e evite senhas reutilizadas.</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">Confirmar nova senha</label>
                  <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} className="w-full rounded-sm border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary" />
                </div>
              </div>
              {error && <div className="mt-5 rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
              <button disabled={loading || !accessToken || !password || !confirmation || !isAdminAuthConfigured()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Salvar nova senha
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
