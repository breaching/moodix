import { useState, memo, type FormEvent } from 'react';
import { useAuthStore } from '@/stores';
import { Icons } from '@/components/ui';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

/**
 * Login form component
 */
export const LoginForm = memo(function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);

    if (success) {
      // Trigger exit animation
      setIsExiting(true);
      // Wait for animation then notify parent
      setTimeout(() => {
        onLoginSuccess?.();
      }, 500);
    } else {
      setError('Identifiants invalides');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div
        className={`rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[var(--glass-border)] backdrop-blur-xl transition-all duration-500 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ background: 'var(--glass-bg)' }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">Moodix</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Connectez-vous pour accéder à votre journal
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold text-[var(--text-main)] mb-2"
            >
              Nom d&apos;utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-input rounded-xl text-[var(--text-main)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-transparent transition"
              placeholder="admin"
              required
              autoFocus
              autoComplete="username"
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-[var(--text-main)] mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-input rounded-xl text-[var(--text-main)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-transparent transition"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              id="login-error"
              className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm shadow-lg shadow-red-500/10"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:from-[var(--primary-dark)] hover:to-[var(--primary)] disabled:from-[var(--bg-card)] disabled:to-[var(--bg-card)] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/30"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Icons.Loading className="animate-spin h-5 w-5" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
});

export default LoginForm;
