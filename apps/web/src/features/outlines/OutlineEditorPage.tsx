import { PageLayout, Card } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';

export function OutlineEditorPage() {
  const { t } = useTranslation('outlines');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('edit') || 'Edit Outline'}
      description="Write and structure your sermon"
      actions={<button className="btn btn-secondary p-2" onClick={() => navigate.goTo(routes.outlinePreview)}>Preview</button>}
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">✏️</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Outline Editor</h3>
          <p className="text-secondary mb-6">TipTap block editor coming soon.</p>
          <button className="btn btn-secondary" onClick={() => navigate.goTo(routes.outlines)}>Back to Outlines</button>
        </div>
      </Card>
    </PageLayout>
  );
}

export function OutlinePreachingPage() {
  const { t } = useTranslation('preaching');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('title') || 'Preaching Mode'}
      description="Immersive preaching experience"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">🎤</div>
          <h3 className="text-xl font-semibold text-primary mb-2">{t('title') || 'Preaching Mode'}</h3>
          <p className="text-secondary mb-6">Immersive reader with timer and keyboard navigation coming soon.</p>
          <button className="btn btn-secondary" onClick={() => navigate.goTo(routes.outlines)}>Exit</button>
        </div>
      </Card>
    </PageLayout>
  );
}

export function OutlinePreviewPage() {
  const { t } = useTranslation('outlines');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('preview') || 'Preview Outline'}
      description="See how your outline will look when preaching"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">👁️</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Preview</h3>
          <p className="text-secondary mb-6">Print preview and export options coming soon.</p>
          <button className="btn btn-secondary" onClick={() => navigate.goBack()}>Back to Editor</button>
        </div>
      </Card>
    </PageLayout>
  );
}