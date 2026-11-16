import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAuth } from './AuthProvider';
import { routes } from '@/app/router';
import { useTranslation } from 'react-i18next';

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await resetPassword(email);
    if (result.error) {
      setError(result.error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4">
              <span className="text-success text-2xl" aria-hidden="true">✓</span>
            </div>
            <h1 className="text-2xl font-semibold text-primary mb-2">{t('resetEmailSent') || 'Verifique seu e-mail'}</h1>
            <p className="text-secondary mb-6">Enviamos um link para redefinir sua senha para <strong>{email}</strong></p>
            <Link to={routes.login} className="text-primary hover:underline">
              ← Voltar para login
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
            <h1 className="text-2xl font-semibold text-primary">{t('forgotPassword')}</h1>
            <p className="text-secondary mt-1">Digite seu e-mail para receber um link de redefinição</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-error bg-error-bg border border-error rounded-lg" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="form-label">{t('email')}</label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              label={t('sendResetLink') || 'Enviando...'}
              loading={loading}
              className="w-full"
              size="large"
            >
              {t('sendResetLink') || 'Enviar link'}
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