import { useState, type FormEvent } from 'react';
import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Chips, type ChipsChangeEvent } from 'primereact/chips';
import { useTranslation } from 'react-i18next';
import { useAppNavigate, routes } from '@/app/router';

interface NoteDraft {
  title: string;
  scriptureRef: string;
  category: string;
  tags: string[];
  content: string;
}

export function NoteEditorPage() {
  const { t } = useTranslation('notes');
  const navigate = useAppNavigate();

  const [draft, setDraft] = useState<NoteDraft>({
    title: '',
    scriptureRef: '',
    category: '',
    tags: [],
    content: '',
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Persistência real será conectada quando o serviço/repositório de notas estiver disponível
    setStatusMessage(
      t('draftPrepared', {
        defaultValue: 'Rascunho organizado localmente. Integração de salvamento pendente.',
      })
    );
  };

  return (
    <PageLayout
      title={t('edit', { defaultValue: 'Editor de Anotação' })}
      description={t('editorDescription', {
        defaultValue: 'Registre reflexões, passagens bíblicas e observações de estudo',
      })}
      actions={
        <Button
          type="button"
          label={t('back', { defaultValue: 'Voltar' })}
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate.goTo(routes.notes)}
        />
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="note-editor-form">
          <div className="note-editor-field">
            <label htmlFor="note-title" className="note-editor-label">
              {t('fields.title', { defaultValue: 'Título ou tema' })}
            </label>
            <InputText
              id="note-title"
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={t('placeholders.title', {
                defaultValue: 'Ex.: Contexto histórico de Filipenses 2',
              })}
              className="w-full"
            />
          </div>

          <div className="note-editor-grid">
            <div className="note-editor-field">
              <label htmlFor="note-scripture" className="note-editor-label">
                {t('fields.scriptureRef', { defaultValue: 'Referência bíblica' })}
              </label>
              <InputText
                id="note-scripture"
                value={draft.scriptureRef}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, scriptureRef: e.target.value }))
                }
                placeholder={t('placeholders.scriptureRef', {
                  defaultValue: 'Ex.: Fp 2.5-11',
                })}
                className="w-full"
              />
            </div>

            <div className="note-editor-field">
              <label htmlFor="note-category" className="note-editor-label">
                {t('fields.category', { defaultValue: 'Categoria' })}
              </label>
              <InputText
                id="note-category"
                value={draft.category}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                placeholder={t('placeholders.category', {
                  defaultValue: 'Ex.: Estudo Bíblico, Pregação, Doutrina',
                })}
                className="w-full"
              />
            </div>
          </div>

          <div className="note-editor-field">
            <label htmlFor="note-tags" className="note-editor-label">
              {t('fields.tags', { defaultValue: 'Etiquetas' })}
            </label>
            <Chips
              id="note-tags"
              value={draft.tags}
              onChange={(e: ChipsChangeEvent) =>
                setDraft((prev) => ({ ...prev, tags: e.value ?? [] }))
              }
              placeholder={t('placeholders.tags', {
                defaultValue: 'Digite e pressione Enter',
              })}
              className="w-full"
            />
          </div>

          <div className="note-editor-field">
            <label htmlFor="note-content" className="note-editor-label">
              {t('fields.content', { defaultValue: 'Anotações e reflexões' })}
            </label>
            <InputTextarea
              id="note-content"
              value={draft.content}
              onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
              rows={10}
              autoResize
              placeholder={t('placeholders.content', {
                defaultValue: 'Escreva suas observações, perguntas e aplicações...',
              })}
              className="w-full"
            />
          </div>

          {statusMessage && (
            <p role="status" className="note-editor-status">
              {statusMessage}
            </p>
          )}

          <div className="note-editor-actions">
            <Button
              type="button"
              label={t('cancel', { defaultValue: 'Cancelar' })}
              severity="secondary"
              outlined
              onClick={() => navigate.goTo(routes.notes)}
            />
            <Button
              type="submit"
              label={t('saveDraft', { defaultValue: 'Preparar rascunho' })}
              icon="pi pi-check"
            />
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}