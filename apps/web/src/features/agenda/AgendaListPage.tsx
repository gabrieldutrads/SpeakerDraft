import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';

export function AgendaListPage() {
  const { t } = useTranslation('agenda');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('list') || 'Event List'}
      description="View all events in a list"
      actions={<button onClick={() => navigate.goTo(routes.eventNew)} className="btn btn-primary">New Event</button>}
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
          <button className="btn btn-secondary" onClick={() => navigate.goBack()}>Back</button>
        </div>
      </Card>
    </PageLayout>
  );
}