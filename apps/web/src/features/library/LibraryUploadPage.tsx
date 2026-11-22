import { useState, type ChangeEvent, type FormEvent } from 'react';
import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';

interface UploadDraft {
  file: File | null;
  title: string;
  category: string;
  notes: string;
}

export function LibraryUploadPage() {
  const { t } = useTranslation('library');
  const navigate = useAppNavigate();

  const [draft, setDraft] = useState<UploadDraft>({
    file: null,
    title: '',
    category: '',
    notes: '',
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setDraft((prev) => ({
      ...prev,
      file: selectedFile,
      title: selectedFile && !prev.title ? selectedFile.name : prev.title,
    }));
    setStatusMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.file) {
      setStatusMessage(
        t('selectFileFirst', {
          defaultValue: 'Selecione um arquivo antes de preparar o envio.',
        })
      );
      return;
    }

    // Upload real e armazenamento serão integrados quando o serviço/storage estiver disponível
    setStatusMessage(
      t('uploadPrepared', {
        defaultValue:
          'Arquivo selecionado e metadados organizados localmente. Integração de envio pendente.',
      })
    );
  };

  return (
    <div className="op-library-page-bg">
      <PageLayout
        title={t('upload', { defaultValue: 'Enviar arquivo' })}
        description={t('uploadDescription', {
          defaultValue: 'Adicione materiais de estudo à sua biblioteca pessoal',
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
          <form onSubmit={handleSubmit} className="library-upload-form">
            <div className="library-upload-field">
              <label htmlFor="library-file-input" className="library-upload-label">
                {t('fields.file', { defaultValue: 'Arquivo do material' })}
              </label>
              <input
                id="library-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
                className="library-file-input"
              />
              {draft.file && (
                <p className="library-file-summary">
                  {t('selectedFile', {
                    defaultValue: 'Selecionado: {{name}} ({{size}} KB)',
                    name: draft.file.name,
                    size: Math.max(1, Math.round(draft.file.size / 1024)),
                  })}
                </p>
              )}
            </div>

            <div className="library-upload-grid">
              <div className="library-upload-field">
                <label htmlFor="library-item-title" className="library-upload-label">
                  {t('fields.title', { defaultValue: 'Título de referência' })}
                </label>
                <InputText
                  id="library-item-title"
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={t('placeholders.title', {
                    defaultValue: 'Ex.: Estudo sobre Atos dos Apóstolos',
                  })}
                />
              </div>

              <div className="library-upload-field">
                <label htmlFor="library-item-category" className="library-upload-label">
                  {t('fields.category', { defaultValue: 'Categoria ou tema' })}
                </label>
                <InputText
                  id="library-item-category"
                  value={draft.category}
                  onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder={t('placeholders.category', {
                    defaultValue: 'Ex.: Comentário, Teologia, Sermões',
                  })}
                />
              </div>
            </div>

            <div className="library-upload-field">
              <label htmlFor="library-item-notes" className="library-upload-label">
                {t('fields.notes', { defaultValue: 'Resumo ou observação inicial' })}
              </label>
              <InputTextarea
                id="library-item-notes"
                value={draft.notes}
                onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                autoResize
                placeholder={t('placeholders.notes', {
                  defaultValue: 'Registre onde este material será útil...',
                })}
              />
            </div>

            {statusMessage && (
              <p role="status" className="library-upload-status">
                {statusMessage}
              </p>
            )}

            <div className="library-upload-actions">
              <Button
                type="button"
                label={t('cancel', { defaultValue: 'Cancelar' })}
                severity="secondary"
                outlined
                onClick={() => navigate.goBack()}
              />
              <Button
                type="submit"
                label={t('prepareUpload', { defaultValue: 'Preparar envio' })}
                icon="pi pi-check"
              />
            </div>
          </form>
        </Card>
      </PageLayout>
    </div>
  );
}