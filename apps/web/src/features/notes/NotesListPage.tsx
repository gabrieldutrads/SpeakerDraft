import { useMemo, useState } from 'react';
import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useTranslation } from 'react-i18next';
import { useAppNavigate, routes } from '@/app/router';

export function NotesListPage() {
  const { t } = useTranslation('notes');
  const navigate = useAppNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Lista inicia vazia até a integração com o banco/serviço real de anotações
  const notes: Array<{ id: string; title: string; scriptureRef?: string }> = [];

  const filteredNotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        (note.scriptureRef && note.scriptureRef.toLowerCase().includes(query))
    );
  }, [notes, searchTerm]);

  return (
    <PageLayout
      title={t('title')}
      description={t('subtitle', {
        defaultValue: 'Suas anotações, estudos e reflexões ministeriais',
      })}
      actions={
        <Button
          label={t('new', { defaultValue: 'Nova anotação' })}
          icon="pi pi-plus"
          onClick={() => navigate.goTo(routes.noteNew)}
        />
      }
    >
      <Card>
        <div className="notes-toolbar">
          <span className="p-input-icon-left notes-search">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder', {
                defaultValue: 'Filtrar por título ou referência...',
              })}
              aria-label={t('searchPlaceholder', {
                defaultValue: 'Filtrar por título ou referência',
              })}
            />
          </span>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="notes-empty-state">
            <i className="pi pi-book notes-empty-icon" aria-hidden="true" />
            <h2 className="notes-empty-title">
              {searchTerm.trim()
                ? t('noMatchingNotes', {
                    defaultValue: 'Nenhuma anotação corresponde ao filtro',
                  })
                : t('noNotes', { defaultValue: 'Nenhuma anotação ainda' })}
            </h2>
            <p className="notes-empty-description">
              {t('emptyDescription', {
                defaultValue:
                  'Reúna ideias, contextos e referências bíblicas para usar em seus estudos e esboços.',
              })}
            </p>
            <Button
              label={t('createFirst', { defaultValue: 'Criar primeira anotação' })}
              icon="pi pi-plus"
              onClick={() => navigate.goTo(routes.noteNew)}
            />
          </div>
        ) : (
          <ul className="notes-list">
            {filteredNotes.map((note) => (
              <li key={note.id} className="notes-list-item">
                <button
                  type="button"
                  className="notes-list-button"
                  onClick={() => navigate.goTo(routes.noteNew)}
                >
                  <span className="notes-list-title">{note.title}</span>
                  {note.scriptureRef && (
                    <span className="notes-list-ref">{note.scriptureRef}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageLayout>
  );
}