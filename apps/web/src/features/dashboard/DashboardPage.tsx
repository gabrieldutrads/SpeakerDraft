import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { routes } from '@/app/router';
import { useAppNavigate } from '@/app/router';
import { getRepositories, queryKeys } from '@/lib/repositories';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const navigate = useAppNavigate();
  const repos = getRepositories();

  // Fetch data using TanStack Query
  const { data: outlines = [], isLoading: outlinesLoading } = useQuery({
    queryKey: queryKeys.outlines,
    queryFn: () => repos.outlines.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: queryKeys.notes,
    queryFn: () => repos.notes.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: queryKeys.events,
    queryFn: () => repos.events.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  // Filter upcoming events
  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(`${e.date}T${e.time}`) >= now)
    .slice(0, 3);

  const stats = [
    { label: t('stats.totalOutlines', 'Total Outlines'), value: outlines.length.toString(), icon: '📝', color: 'primary' },
    { label: t('stats.totalNotes', 'Total Notes'), value: notes.length.toString(), icon: '📓', color: 'success' },
    { label: t('stats.upcomingEvents', 'Upcoming Events'), value: upcomingEvents.length.toString(), icon: '📅', color: 'accent' },
    { label: t('stats.totalLibrary', 'Library Items'), value: '0', icon: '📚', color: 'info' },
  ];

  const quickActions = [
    { label: t('newOutline', 'New Outline'), icon: 'pi pi-plus', action: () => navigate.goTo(routes.outlineNew), color: 'primary' },
    { label: t('newEvent', 'New Event'), icon: 'pi pi-calendar-plus', action: () => navigate.goTo(routes.eventNew), color: 'success' },
    { label: t('newNote', 'New Note'), icon: 'pi pi-file-o', action: () => navigate.goTo(routes.noteNew), color: 'accent' },
    { label: t('uploadFile', 'Upload File'), icon: 'pi pi-upload', action: () => navigate.goTo(routes.libraryUpload), color: 'info' },
  ];

  const isLoading = outlinesLoading || notesLoading || eventsLoading;

  return (
    <PageLayout title={t('welcome', 'Welcome!', { name: 'User' })} description="Your preaching dashboard">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="text-center">
            <div className="text-4xl mb-2" aria-hidden="true">{stat.icon}</div>
            <div className="text-3xl font-bold text-primary mb-1">{isLoading ? '...' : stat.value}</div>
            <div className="text-sm text-secondary">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, i) => (
            <Button
              key={i}
              label={action.label}
              icon={action.icon}
              onClick={action.action}
              className="w-full justify-start gap-2"
              severity={action.color as any}
            />
          ))}
        </div>
      </Card>

      {/* Recent Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={t('recentOutlines', 'Recent Outlines')}>
          {isLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          ) : outlines.length === 0 ? (
            <p className="text-secondary text-center py-8">{t('noOutlines', 'No outlines yet')}</p>
          ) : (
            <>
              <ul className="space-y-3">
                {outlines.slice(0, 3).map((outline) => (
                  <li key={outline.id} className="p-3 hover:bg-secondary-bg rounded-lg transition-colors cursor-pointer" onClick={() => navigate.goToOutlineEdit(outline.id)}>
                    <h4 className="font-medium text-primary truncate">{outline.title}</h4>
                    <p className="text-sm text-secondary truncate">{outline.reference}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${outline.status === 'ready' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
                        {outline.status === 'ready' ? t('status.ready', 'Ready') : t('status.draft', 'Draft')}
                      </span>
                      <span className="text-xs text-secondary">{new Date(outline.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Button label={t('viewAll', 'View All')} severity="secondary" className="p-2" onClick={() => navigate.goTo(routes.outlines)} />
            </>
          )}
        </Card>

        <Card title={t('upcomingEvents', 'Upcoming Events')}>
          {isLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-secondary text-center py-8">{t('noEvents', 'No events scheduled')}</p>
          ) : (
            <>
              <ul className="space-y-3">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="p-3 hover:bg-secondary-bg rounded-lg transition-colors cursor-pointer" onClick={() => navigate.goTo(routes.agenda)}>
                    <h4 className="font-medium text-primary truncate">{event.title}</h4>
                    <p className="text-sm text-secondary truncate">{event.reference}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-info-bg text-info">{event.kind}</span>
                      <span className="text-xs text-secondary">{new Date(`${event.date}T${event.time}`).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Button label={t('viewAll', 'View All')} severity="secondary" className="p-2" onClick={() => navigate.goTo(routes.agenda)} />
            </>
          )}
        </Card>

        <Card title={t('recentNotes', 'Recent Notes')}>
          {isLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-secondary text-center py-8">{t('noNotes', 'No notes yet')}</p>
          ) : (
            <>
              <ul className="space-y-3">
                {notes.slice(0, 3).map((note) => (
                  <li key={note.id} className="p-3 hover:bg-secondary-bg rounded-lg transition-colors cursor-pointer" onClick={() => navigate.goTo(routes.notes)}>
                    <h4 className="font-medium text-primary truncate">{note.title}</h4>
                    <p className="text-sm text-secondary truncate">{note.body.slice(0, 100)}...</p>
                    <span className="text-xs text-secondary">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
              <Button label={t('viewAll', 'View All')} severity="secondary" className="p-2" onClick={() => navigate.goTo(routes.notes)} />
            </>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}