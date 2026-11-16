import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { useAuth } from './AuthProvider';
import { PageLayout } from '@/app/layout';
import { routes } from '@/app/router';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error.message);
    } else {
      navigate(routes.dashboard);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground text-2xl" aria-hidden="true">📖</span>
            </div>
            <h1 className="text-2xl font-semibold text-primary">SpeakerDraft</h1>
            <p className="text-secondary mt-1">{t('app.tagline') || 'Seu assistente para pregação'}</p>
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
                aria-describedby={error ? 'email-error' : undefined}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="form-label">{t('password')}</label>
              <InputText
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.value as boolean)}
                  inputId="remember"
                />
                <span className="text-sm text-secondary">{t('remember') || 'Lembrar-me'}</span>
              </label>
              <Link
                to={routes.forgotPassword}
                className="text-sm text-primary hover:underline"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              label={t('signingIn') || 'Entrando...'}
              loading={loading}
              className="w-full"
              size="large"
            >
              {t('signIn')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary">
              {t('noAccount') || 'Não tem conta?'} {' '}
              <Link to={routes.register} className="text-primary hover:underline font-medium">
                {t('createAccount') || 'Criar conta'}
              </Link>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-info-bg border border-info rounded-lg text-sm text-info">
            <p className="font-medium mb-1">Modo Demo</p>
            <p>Use qualquer e-mail e senha (mín. 6 caracteres)</p>
          </div>
        </div>
      </div>
    </div>
  );
}