import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';

export function OutlinePreachingPage() {
  const { t } = useTranslation('preaching');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('title') || 'Preaching Mode'}
      description="Immersive preaching experience"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">🎤</div>
          <h3 className="text-xl font-semibold text-primary mb-2">{t('title') || 'Preaching Mode'}</h3>
          <p className="text-secondary mb-6">Immersive reader with timer and keyboard navigation coming soon.</p>
          <button className="btn btn-secondary" onClick={() => navigate.goTo(routes.outlines)}>Exit</button>
        </div>
      </Card>
    </PageLayout>
  );
}