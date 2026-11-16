import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { ScrollPanel } from 'primereact/scrollpanel';
import { bibleApi, type BibleSearchResult, type TranslationCode, TRANSLATIONS } from '@speaker-draft/core';
import { BIBLE_BOOKS } from '@speaker-draft/core';
import { cn } from '@/lib/utils';

export function BibleSearchPage() {
  const { t } = useTranslation('bible');
  const [query, setQuery] = useState('');
  const [translation, setTranslation] = useState<TranslationCode>('nvi');
  const [results, setResults] = useState<BibleSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<BibleSearchResult | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [contextVerses, setContextVerses] = useState<BibleSearchResult[]>([]);

  const translationOptions = useMemo(() =>
    Object.entries(TRANSLATIONS).map(([code, info]) => ({
      label: `${info.name} — ${info.fullName}`,
      value: code as TranslationCode,
    })), []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await bibleApi.search(searchQuery.trim(), translation, 50);
      setResults(response.verses);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('bible.searchError', 'Erro na busca'));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [translation, t]);

  const loadContext = useCallback(async (result: BibleSearchResult) => {
    setSelectedResult(result);
    setShowContext(true);
    try {
      // Load surrounding verses for context
      const book = BIBLE_BOOKS.find(b => b.abbrev.toLowerCase() === result.book_id.toLowerCase());
      if (book) {
        const chapter = await bibleApi.getChapter(book.id, result.chapter, translation);
        const start = Math.max(1, result.verse - 2);
        const end = Math.min(chapter.verses_count, result.verse + 2);
        const context = chapter.verses.filter(v => v.verse >= start && v.verse <= end);
        setContextVerses(context.map(v => ({
          ...result,
          verse: v.verse,
          text: v.text,
          reference: `${v.book_name} ${v.chapter}:${v.verse}`,
        })));
      }
    } catch (err) {
      console.error('Failed to load context:', err);
      setContextVerses([result]);
    }
  }, [translation]);

  const copyResult = useCallback(async (result: BibleSearchResult) => {
    const text = `${result.text} — ${result.reference} (${TRANSLATIONS[translation].name})`;
    await navigator.clipboard.writeText(text);
  }, [translation]);

  return (
    <PageLayout
      title={t('bible.search', 'Buscar na Bíblia')}
      description={t('bible.searchDescription', 'Encontre passagens, palavras ou temas nas Escrituras')}
    >
      {/* Search Input */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <InputText
              id="bible-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
              placeholder={t('bible.searchPlaceholder', 'Buscar livro, capítulo, versículo ou palavra...')}
              className="w-full pr-12 text-lg"
            />
            {isLoading && (
              <ProgressSpinner className="absolute right-4 top-1/2 -translate-y-1/2" strokeWidth="2" />
            )}
          </div>
          <Dropdown
            options={translationOptions}
            value={translation}
            onChange={(e) => {
              setTranslation(e.value);
              if (query.trim()) handleSearch(query.trim());
            }}
            className="w-full sm:w-64"
            optionLabel="label"
            optionValue="value"
            showClear={false}
          />
          <Button
            label={t('bible.search', 'Buscar')}
            icon="pi pi-search"
            onClick={() => handleSearch(query)}
            loading={isLoading}
            className="w-full sm:w-auto"
          />
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-3"
          role="alert"
        >
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="font-medium">{t('bible.searchError', 'Erro na busca')}</p>
            <p className="text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={results.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          {results.length === 0 && query.trim() && !isLoading && (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t('bible.noResults', 'Nenhum resultado encontrado')}</h3>
              <p className="text-secondary mb-4">
                {t('bible.noResultsDesc', 'Tente termos diferentes ou verifique a ortografia.')}
              </p>
            </Card>
          )}

          {results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-secondary">
                  {results.length} {results.length === 1 ? t('bible.result', 'resultado') : t('bible.results', 'resultados')}
                  {query && <span className="text-primary ml-2">para "{query}"</span>}
                </p>
                <span className="text-sm text-muted">
                  {TRANSLATIONS[translation].name}
                </span>
              </div>

              <ScrollPanel className="search-results" style={{ maxHeight: '70vh' }}>
                {results.map((result, index) => (
                  <motion.div
                    key={`${result.book_id}-${result.chapter}-${result.verse}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.3 }}
                    className={cn(
                      'search-result-item p-4 rounded-lg border border-border hover:bg-surface-hover transition-colors cursor-pointer',
                      selectedResult?.verse === result.verse && selectedResult?.chapter === result.chapter && 'ring-2 ring-primary'
                    )}
                    onClick={() => loadContext(result)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-primary">{result.reference}</span>
                          <span className="text-xs px-2 py-0.5 bg-primary-soft text-primary rounded-full">
                            {TRANSLATIONS[translation].name}
                          </span>
                        </div>
                        <p className="text-secondary leading-relaxed">{result.text}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          icon="pi pi-copy"
                          severity="secondary"
                          size="small"
                          className="p-2"
                          onClick={(e) => { e.stopPropagation(); copyResult(result); }}
                          aria-label={t('bible.copyVerse', 'Copiar versículo')}
                        />
                        <Button
                          icon="pi pi-book"
                          severity="secondary"
                          size="small"
                          className="p-2"
                          onClick={(e) => { e.stopPropagation(); loadContext(result); }}
                          aria-label={t('bible.openInReader', 'Abrir no leitor')}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </ScrollPanel>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Context Modal */}
      <AnimatePresence>
        {showContext && selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowContext(false); setSelectedResult(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-elevated border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-primary">{selectedResult.reference}</h3>
                <Button
                  icon="pi pi-times"
                  severity="secondary"
                  className="p-2"
                  onClick={() => { setShowContext(false); setSelectedResult(null); }}
                />
              </div>
              <ScrollPanel style={{ maxHeight: '60vh' }}>
                <div className="p-4 space-y-3">
                  {contextVerses.map(verse => (
                    <div
                      key={verse.verse}
                      className={cn(
                        'p-4 rounded-lg border border-border verse-context',
                        verse.verse === selectedResult!.verse && 'bg-primary-soft border-primary ring-1 ring-primary'
                      )}
                    >
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-lg font-bold text-primary">{verse.verse}</span>
                        <span className="text-sm text-muted">{verse.book_name} {verse.chapter}</span>
                        {verse.verse === selectedResult!.verse && (
                          <Badge value={t('bible.searchedVerse', 'Versículo buscado')} severity="info" />
                        )}
                      </div>
                      <p className="leading-relaxed text-secondary">{verse.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollPanel>
              <Divider />
              <div className="p-4 flex gap-2 justify-end">
                <Button
                  label={t('bible.copyVerse', 'Copiar')}
                  icon="pi pi-copy"
                  severity="secondary"
                  onClick={() => copyResult(selectedResult!)}
                />
                <Button
                  label={t('bible.openInReader', 'Abrir no leitor')}
                  icon="pi pi-book"
                  onClick={() => {
                    // Navigate to BibleReaderPage with this passage
                    setShowContext(false);
                    setSelectedResult(null);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Suggestions */}
      {!query && results.length === 0 && (
        <Card>
          <h3 className="font-semibold text-primary mb-4">{t('bible.searchSuggestions', 'Sugestões de busca')}</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'João 3:16',
              'Salmo 23',
              'Romanos 8:28',
              'Filipenses 4:13',
              'Isaías 53:5',
              'Mateus 5:1-12',
              'amor',
              'fé',
              'esperança',
              'graça',
              'perdão',
              'oração',
            ].map(suggestion => (
              <Button
                key={suggestion}
                label={suggestion}
                severity="secondary"
                outlined
                size="small"
                className="text-sm"
                onClick={() => { setQuery(suggestion); handleSearch(suggestion); }}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Popular Searches */}
      {!query && results.length === 0 && (
        <Card className="mt-6">
          <h3 className="font-semibold text-primary mb-4">{t('bible.popularSearches', 'Buscas populares')}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: t('bible.topicLove', 'Amor'), query: 'amor' },
              { title: t('bible.topicFaith', 'Fé'), query: 'fé' },
              { title: t('bible.topicHope', 'Esperança'), query: 'esperança' },
              { title: t('bible.topicGrace', 'Graça'), query: 'graça' },
              { title: t('bible.topicPrayer', 'Oração'), query: 'oração' },
              { title: t('bible.topicForgiveness', 'Perdão'), query: 'perdão' },
              { title: t('bible.topicPeace', 'Paz'), query: 'paz' },
              { title: t('bible.topicJoy', 'Alegria'), query: 'alegria' },
              { title: t('bible.topicWisdom', 'Sabedoria'), query: 'sabedoria' },
            ].map(item => (
              <Button
                key={item.query}
                label={item.title}
                icon="pi pi-book"
                severity="secondary"
                outlined
                className="w-full justify-start h-14"
                onClick={() => { setQuery(item.query); handleSearch(item.query); }}
              />
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}

export default BibleSearchPage;