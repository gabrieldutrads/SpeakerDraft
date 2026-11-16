import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';

export function LibraryUploadPage() {
  const { t } = useTranslation('library');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('upload') || 'Upload File'}
      description="Add documents to your library"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📤</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Upload File</h3>
          <p className="text-secondary mb-6">Drag & drop PDF, DOCX, TXT, MD files coming soon.</p>
          <button className="btn btn-secondary" onClick={() => navigate.goBack()}>Back</button>
        </div>
      </Card>
    </PageLayout>
  );
}

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