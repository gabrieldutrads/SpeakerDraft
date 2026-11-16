import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';

export function AgendaCalendarPage() {
  const { t } = useTranslation('agenda');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('title')}
      description="Manage your preaching schedule"
      actions={<Button label={t('newEvent') || 'New Event'} icon="pi pi-plus" onClick={() => navigate.goTo(routes.eventNew)} />}
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📅</div>
          <h3 className="text-xl font-semibold text-primary mb-2">{t('calendar') || 'Calendar'}</h3>
          <p className="text-secondary mb-6">Month/week/day views with drag-reschedule coming soon.</p>
        </div>
      </Card>
    </PageLayout>
  );
}

export function AgendaListPage() {
  const { t } = useTranslation('agenda');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('list') || 'Event List'}
      description="View all events in a list"
      actions={<Button label={t('newEvent') || 'New Event'} icon="pi pi-plus" onClick={() => navigate.goTo(routes.eventNew)} />}
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📋</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Event List</h3>
          <p className="text-secondary mb-6">List view of all events coming soon.</p>
        </div>
      </Card>
    </PageLayout>
  );
}

export function EventEditorPage() {
  const { t } = useTranslation('agenda');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('editEvent') || 'Edit Event'}
      description="Create or edit a calendar event"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📝</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Event Editor</h3>
          <p className="text-secondary mb-6">Event form with recurrence and reminders coming soon.</p>
          <Button label={t('back') || 'Back'} icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate.goBack()} />
        </div>
      </Card>
    </PageLayout>
  );
}