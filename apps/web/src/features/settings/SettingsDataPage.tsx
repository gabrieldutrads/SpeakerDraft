import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';

export function SettingsDataPage() {
  const { t } = useTranslation('settings');

  return (
    <PageLayout title={t('data.title')} description="Manage your data and sync">
      <Card title={t('data.title')}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">☁️</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Data & Sync</h3>
          <p className="text-secondary mb-6">Backup, export, import, and Supabase sync coming soon.</p>
        </div>
      </Card>
    </PageLayout>
  );
}