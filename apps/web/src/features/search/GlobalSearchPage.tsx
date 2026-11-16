import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';

export function GlobalSearchPage() {
  const { t } = useTranslation('search');

  return (
    <PageLayout title={t('title')} description="Search across all your content">
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
          <h3 className="text-xl font-semibold text-primary mb-2">{t('title')}</h3>
          <p className="text-secondary mb-6">Global search with Cmd+K shortcut coming soon.</p>
          <div className="bg-surface-subtle rounded-lg px-4 py-3 text-sm text-secondary font-mono inline-block">
            {t('shortcut') || 'Cmd+K'}
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}