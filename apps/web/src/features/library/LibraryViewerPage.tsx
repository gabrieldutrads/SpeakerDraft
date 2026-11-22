import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';

export function LibraryViewerPage() {
  const { t } = useTranslation('library');
  const navigate = useAppNavigate();

  return (
    <div className="op-library-page-bg">
      <PageLayout
        title={t('viewing', {
          defaultValue: 'Visualizador de Material',
        })}
        description={t('viewerDescription', {
          defaultValue: 'Consulta e leitura de documentos da sua biblioteca pessoal',
        })}
        actions={
          <Button
            type="button"
            label={t('back', { defaultValue: 'Voltar' })}
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            onClick={() => navigate.goBack()}
          />
        }
      >
        <Card className="op-glass-card">
          <div className="library-viewer-placeholder">
            <i className="pi pi-file-pdf library-viewer-icon" aria-hidden="true" />
            <h2 className="library-viewer-title">
              {t('viewerTitle', { defaultValue: 'Leitura de documento' })}
            </h2>
            <p className="library-viewer-description">
              {t('viewerPending', {
                defaultValue:
                  'A renderização de documentos e anotações vinculadas será ativada assim que o serviço de arquivos estiver conectado.',
              })}
            </p>
            <Button
              type="button"
              label={t('back', { defaultValue: 'Voltar' })}
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              onClick={() => navigate.goBack()}
            />
          </div>
        </Card>
      </PageLayout>
    </div>
  );
}