import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';

export function SettingsAppearancePage() {
  const { t } = useTranslation('settings');

  return (
    <PageLayout title={t('appearance.title')} description="Customize the app appearance">
      <Card title={t('appearance.title')}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">🎨</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Appearance Settings</h3>
          <p className="text-secondary mb-6">Theme, font size, and display options coming soon.</p>
        </div>
      </Card>
    </PageLayout>
  );
}