import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';

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
          <button className="btn btn-secondary" onClick={() => navigate.goTo(routes.notes)}>Back to Notes</button>
        </div>
      </Card>
    </PageLayout>
  );
}