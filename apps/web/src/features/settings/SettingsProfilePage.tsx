import { PageLayout, Card, Section } from '@/app/layout';
import { useTranslation } from 'react-i18next';

export function SettingsProfilePage() {
  const { t } = useTranslation('settings');

  return (
    <PageLayout title={t('profile.title')} description="Manage your profile">
      <Card title={t('profile.title')}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">👤</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Profile Settings</h3>
          <p className="text-secondary mb-6">Profile management coming soon.</p>
        </div>
      </Card>
    </PageLayout>
  );
}

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