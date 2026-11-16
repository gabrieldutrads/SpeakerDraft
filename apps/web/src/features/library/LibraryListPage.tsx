import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';

export function LibraryListPage() {
  const { t } = useTranslation('library');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('title')}
      description="Your resource library"
      actions={<Button label={t('upload') || 'Upload File'} icon="pi pi-upload" onClick={() => navigate.goTo(routes.libraryUpload)} />}
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">📚</div>
          <h3 className="text-xl font-semibold text-primary mb-2">{t('title')}</h3>
          <p className="text-secondary mb-6">{t('noFiles') || 'No files in library yet'}</p>
          <Button label={t('upload') || 'Upload Your First File'} icon="pi pi-upload" onClick={() => navigate.goTo(routes.libraryUpload)} size="large" />
        </div>
      </Card>
    </PageLayout>
  );
}

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
          <Button label={t('back') || 'Back'} icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate.goBack()} />
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
          <Button label={t('back') || 'Back'} icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate.goBack()} />
        </div>
      </Card>
    </PageLayout>
  );
}