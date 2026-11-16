import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';

export function LibraryViewerPage() {
  const { t } = useTranslation('library');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('viewing', { name: 'Document' }) || 'Document Viewer'}
      description="View and annotate documents"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📄</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Document Viewer</h3>
          <p className="text-secondary mb-6">PDF.js viewer with annotations coming soon.</p>
          <button className="btn btn-secondary" onClick={() => navigate.goBack()}>Back</button>
        </div>
      </Card>
    </PageLayout>
  );
}