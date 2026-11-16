import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAuth } from './AuthProvider';
import { routes } from '@/app/router';
import { useTranslation } from 'react-i18next';

export function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // Check if we have a valid reset token in URL
    const token = searchParams.get('token') || searchParams.get('code');
    setValidToken(!!token);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch') || 'As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      setError(t('weakPassword') || 'A senha deve ter pelo menos 8 caracteres');
      return;
    }

    const result = await updatePassword(password);
    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(true);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center mx-auto mb-4">
              <span className="text-error text-2xl" aria-hidden="true">⚠️</span>
            </div>
            <h1 className="text-2xl font-semibold text-primary mb-2">Link inválido</h1>
            <p className="text-secondary mb-6">Este link de redefinição é inválido ou expirou.</p>
            <Link to={routes.forgotPassword} className="text-primary hover:underline">
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4">
              <span className="text-success text-2xl" aria-hidden="true">✓</span>
            </div>
            <h1 className="text-2xl font-semibold text-primary mb-2">{t('passwordReset') || 'Senha redefinida!'}</h1>
            <p className="text-secondary mb-6">Sua senha foi alterada com sucesso.</p>
            <Link to={routes.login} className="btn btn-primary">
              {t('login') || 'Fazer login'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground text-2xl" aria-hidden="true">🔐</span>
            </div>
            <h1 className="text-2xl font-semibold text-primary">Nova Senha</h1>
            <p className="text-secondary mt-1">Digite sua nova senha abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-error bg-error-bg border border-error rounded-lg" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="password" className="form-label">{t('newPassword') || 'Nova senha'}</label>
              <InputText
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full"
                minLength={8}
              />
              <p className="text-xs text-muted">Mínimo 8 caracteres</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="form-label">{t('confirmPassword')}</label>
              <InputText
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              label={t('resetPassword') || 'Redefinindo...'}
              loading={loading}
              className="w-full"
              size="large"
            >
              {t('resetPassword') || 'Redefinir senha'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to={routes.login} className="text-primary hover:underline">
              ← {t('login') || 'Voltar para login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}