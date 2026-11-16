import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';

export function SettingsBiblePage() {
  const { t } = useTranslation('settings');

  return (
    <PageLayout title={t('bible.title')} description="Configure Bible preferences">
      <Card title={t('bible.title')}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📖</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Bible Settings</h3>
          <p className="text-secondary mb-6">Translation selection and display options coming soon.</p>
        </div>
      </Card>
    </PageLayout>
  );
}