import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { useAuth } from './AuthProvider';
import { routes } from '@/app/router';
import { useTranslation } from 'react-i18next';

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (!terms) {
      setError('Você deve aceitar os termos de uso');
      return;
    }

    const result = await signUp(email, password, name);
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
            <p className="text-secondary mt-1">Crie sua conta gratuita</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-error bg-error-bg border border-error rounded-lg" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="form-label">{t('name')}</label>
              <InputText
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                autoComplete="name"
                className="w-full"
              />
            </div>

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

            <div className="space-y-1.5">
              <label htmlFor="password" className="form-label">{t('password')}</label>
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

            <div className="flex items-start gap-2">
              <Checkbox
                checked={terms}
                onChange={(e) => setTerms(e.value as boolean)}
                inputId="terms"
              />
              <label htmlFor="terms" className="text-sm text-secondary mt-1">
                Aceito os <Link to="/terms" className="text-primary hover:underline">Termos de Uso</Link> e a{' '}
                <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
              </label>
            </div>

            <Button
              type="submit"
              label={t('registering') || 'Cadastrando...'}
              loading={loading}
              className="w-full"
              size="large"
            >
              {t('register') || 'Cadastrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary">
              {t('hasAccount') || 'Já tem conta?'} {' '}
              <Link to={routes.login} className="text-primary hover:underline font-medium">
                {t('login') || 'Entrar'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}