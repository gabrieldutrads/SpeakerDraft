import { useMemo, useState } from 'react';
import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useTranslation } from 'react-i18next';
import { useAppNavigate, routes } from '@/app/router';

interface LibraryItem {
  id: string;
  name: string;
  format?: string;
  category?: string;
}

export function LibraryListPage() {
  const { t } = useTranslation('library');
  const navigate = useAppNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Lista inicia vazia até a integração com o serviço/armazenamento real da biblioteca pessoal
  const items: LibraryItem[] = [];

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.format && item.format.toLowerCase().includes(query))
    );
  }, [items, searchTerm]);

  return (
    <div className="op-library-page-bg">
      <PageLayout
        title={t('title')}
        description={t('subtitle', {
          defaultValue: 'Sua biblioteca pessoal de materiais, PDFs e estudos',
        })}
        actions={
          <Button
            label={t('upload', { defaultValue: 'Enviar arquivo' })}
            icon="pi pi-upload"
            onClick={() => navigate.goTo(routes.libraryUpload)}
          />
        }
      >
        <Card className="op-glass-card">
          <div className="library-toolbar">
            <span className="p-input-icon-left library-search">
              <i className="pi pi-search" aria-hidden="true" />
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder', {
                  defaultValue: 'Filtrar por título, categoria ou formato...',
                })}
                aria-label={t('searchPlaceholder', {
                  defaultValue: 'Filtrar por título, categoria ou formato',
                })}
              />
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="library-empty-state">
              <i className="pi pi-folder-open library-empty-icon" aria-hidden="true" />
              <h2 className="library-empty-title">
                {searchTerm.trim()
                  ? t('noMatchingFiles', {
                      defaultValue: 'Nenhum material corresponde ao filtro',
                    })
                  : t('noFiles', { defaultValue: 'Nenhum arquivo na biblioteca ainda' })}
              </h2>
              <p className="library-empty-description">
                {t('emptyDescription', {
                  defaultValue:
                    'Organize seus PDFs, apostilas e documentos de estudo em um só lugar para consultar durante o preparo.',
                })}
              </p>
              <Button
                label={t('uploadFirst', { defaultValue: 'Adicionar primeiro arquivo' })}
                icon="pi pi-upload"
                onClick={() => navigate.goTo(routes.libraryUpload)}
              />
            </div>
          ) : (
            <ul className="library-list">
              {filteredItems.map((item) => (
                <li key={item.id} className="library-list-item">
                  <button
                    type="button"
                    className="library-list-button"
                    onClick={() => navigate.goTo(routes.library)}
                  >
                    <span className="library-list-name">{item.name}</span>
                    {item.format && (
                      <span className="library-list-meta">{item.format}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PageLayout>
    </div>
  );
}