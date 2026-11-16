import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';

export function NotesListPage() {
  const { t } = useTranslation('notes');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('title')}
      description="Your study notes and reflections"
      actions={<Button label={t('new') || 'New Note'} icon="pi pi-plus" onClick={() => navigate.goTo(routes.noteNew)} />}
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📓</div>
          <h3 className="text-xl font-semibold text-primary mb-2">{t('title')}</h3>
          <p className="text-secondary mb-6">{t('noNotes') || 'No notes yet'}</p>
          <Button label={t('new') || 'Create Your First Note'} icon="pi pi-plus" onClick={() => navigate.goTo(routes.noteNew)} size="large" />
        </div>
      </Card>
    </PageLayout>
  );
}

export function NoteEditorPage() {
  const { t } = useTranslation('notes');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('edit') || 'Edit Note'}
      description="Write your study notes"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">✏️</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Note Editor</h3>
          <p className="text-secondary mb-6">Rich text editor with linking coming soon.</p>
          <Button label={t('back') || 'Back to Notes'} icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate.goTo(routes.notes)} />
        </div>
      </Card>
    </PageLayout>
  );
}