import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';

export function SettingsAccountPage() {
  const { t } = useTranslation('settings');

  return (
    <PageLayout title={t('account.title')} description="Account security and deletion">
      <Card title={t('account.title')}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">🔐</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Account Settings</h3>
          <p className="text-secondary mb-6">Password change and account deletion coming soon.</p>
        </div>
      </Card>
    </PageLayout>
  );
}