import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '@/app/router';
import { routes } from '@/app/router';
import { PageLayout, Card } from '@/app/layout';
import { bibleApi, type BibleChapter, type BibleVerse, type TranslationCode, TRANSLATIONS } from '@speaker-draft/core';
import { BIBLE_BOOKS, findBibleBook, parseBibleReference, formatBibleReference } from '@speaker-draft/core';
import { useThemeContext } from '@/app/providers';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ProgressBar } from 'primereact/progressbar';
import { Slider } from 'primereact/slider';
import { Checkbox } from 'primereact/checkbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Types & Constants
   ========================================================================== */

interface BibleReaderState {
  currentBook: typeof BIBLE_BOOKS[0];
  currentChapter: number;
  translation: TranslationCode;
  parallelTranslation?: TranslationCode;
  fontSize: number;
  showVerseNumbers: boolean;
  showCrossRefs: boolean;
  theme: 'light' | 'dark' | 'sepia';
  autoScroll: boolean;
  scrollSpeed: number;
  wakeLock: boolean;
}

const DEFAULT_STATE: BibleReaderState = {
  currentBook: BIBLE_BOOKS[18], // Salmos
  currentChapter: 23,
  translation: 'nvi',
  fontSize: 18,
  showVerseNumbers: true,
  showCrossRefs: false,
  theme: 'light',
  autoScroll: false,
  scrollSpeed: 1,
  wakeLock: false,
};

const VERSE_ANIMATION_DELAY = 30; // ms between verse animations

/* ==========================================================================
   BibleReaderPage Component
   ========================================================================== */

export function BibleReaderPage() {
  const { t } = useTranslation('bible');
  const navigate = useAppNavigate();
  const { theme: appTheme, resolvedTheme } = useThemeContext();
  const [state, setState] = useState<BibleReaderState>(DEFAULT_STATE);
  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [parallelChapter, setParallelChapter] = useState<BibleChapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showTOC, setShowTOC] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleChapter[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [bookmarks, setBookmarks] = useState<Array<{ bookId: number; chapter: number; verse?: number; label: string }>>([]);
  const [history, setHistory] = useState<Array<{ bookId: number; chapter: number; timestamp: number }>>([]);

  const chapterRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bibleReaderState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsed }));
      } catch { /* ignore */ }
    }
    const savedBookmarks = localStorage.getItem('bibleBookmarks');
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch { /* ignore */ }
    }
    const savedHistory = localStorage.getItem('bibleHistory');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bibleReaderState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('bibleBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('bibleHistory', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Load chapter when book/chapter/translation changes
  const loadChapter = useCallback(async (book: typeof BIBLE_BOOKS[0], chapterNum: number, trans: TranslationCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const [main, parallel] = await Promise.all([
        bibleApi.getChapter(book.id, chapterNum, trans),
        state.parallelTranslation && state.parallelTranslation !== trans
          ? bibleApi.getChapter(book.id, chapterNum, state.parallelTranslation)
          : Promise.resolve(null),
      ]);
      setChapter(main);
      setParallelChapter(parallel);

      // Add to history
      setHistory(prev => {
        const exists = prev.find(h => h.bookId === book.id && h.chapter === chapterNum);
        if (exists) return prev;
        return [{ bookId: book.id, chapter: chapterNum, timestamp: Date.now() }, ...prev].slice(0, 50);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
    } finally {
      setIsLoading(false);
    }
  }, [state.parallelTranslation]);

  useEffect(() => {
    loadChapter(state.currentBook, state.currentChapter, state.translation);
  }, [state.currentBook, state.currentChapter, state.translation, loadChapter]);

  // Load parallel chapter when parallel translation changes
  useEffect(() => {
    if (state.parallelTranslation && state.parallelTranslation !== state.translation && chapter) {
      bibleApi.getChapter(state.currentBook.id, state.currentChapter, state.parallelTranslation)
        .then(setParallelChapter)
        .catch(console.error);
    } else {
      setParallelChapter(null);
    }
  }, [state.parallelTranslation, state.translation, chapter, state.currentBook, state.currentChapter]);

  // Navigation handlers
  const goToChapter = useCallback((bookId: number, chapterNum: number) => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (book) {
      setState(prev => ({ ...prev, currentBook: book, currentChapter: chapterNum }));
      setShowTOC(false);
    }
  }, []);

  const previousChapter = useCallback(() => {
    if (state.currentChapter > 1) {
      setState(prev => ({ ...prev, currentChapter: prev.currentChapter - 1 }));
    } else if (state.currentBook.id > 1) {
      const prevBook = BIBLE_BOOKS.find(b => b.id === state.currentBook.id - 1);
      if (prevBook) {
        setState(prev => ({ ...prev, currentBook: prevBook, currentChapter: prevBook.chapters }));
      }
    }
  }, [state.currentBook, state.currentChapter]);

  const nextChapter = useCallback(() => {
    if (state.currentChapter < state.currentBook.chapters) {
      setState(prev => ({ ...prev, currentChapter: prev.currentChapter + 1 }));
    } else if (state.currentBook.id < 66) {
      const nextBook = BIBLE_BOOKS.find(b => b.id === state.currentBook.id + 1);
      if (nextBook) {
        setState(prev => ({ ...prev, currentBook: nextBook, currentChapter: 1 }));
      }
    }
  }, [state.currentBook, state.currentChapter]);

  const handleReferenceInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const parsed = parseBibleReference(searchQuery.trim());
      if (parsed) {
        goToChapter(parsed.bookId, parsed.chapterStart);
        setSearchQuery('');
        setShowSearchResults(false);
      } else {
        // Search for text
        bibleApi.search(searchQuery.trim(), state.translation)
          .then(res => {
            setSearchResults(res.verses.slice(0, 20).map(v => ({
              book_id: v.book_id,
              book_name: v.book_name,
              chapter: v.chapter,
              verses: [{ book_id: v.book_id, book_name: v.book_name, chapter: v.chapter, verse: v.verse, text: v.text }],
              reference: v.reference,
              verses_count: 1,
            })));
            setShowSearchResults(true);
          })
          .catch(console.error);
      }
    }
  }, [searchQuery, state.translation, goToChapter]);

  // Theme handling
  const effectiveTheme = state.theme === 'sepia' ? 'sepia' : (state.theme === 'system' ? resolvedTheme : state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-bible-theme', effectiveTheme);
    const root = document.documentElement;
    root.style.setProperty('--bible-font-size', `${state.fontSize}px`);
    root.style.setProperty('--bible-line-height', `${state.fontSize * 1.8}px`);
  }, [effectiveTheme, state.fontSize, resolvedTheme]);

  // Wake lock for preaching
  const requestWakeLock = useCallback(async () => {
    try {
      wakeLockRef.current = await (navigator as any).wakeLock?.request('screen');
      wakeLockRef.current?.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch (err) {
      console.warn('Wake lock failed:', err);
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    if (state.wakeLock) requestWakeLock();
    else releaseWakeLock();
    return () => releaseWakeLock();
  }, [state.wakeLock, requestWakeLock, releaseWakeLock]);

  // Auto-scroll for preaching
  useEffect(() => {
    if (state.autoScroll && chapterRef.current) {
      const scroll = () => {
        if (chapterRef.current) {
          chapterRef.current.scrollTop += state.scrollSpeed;
          scrollTimeoutRef.current = setTimeout(scroll, 50);
        }
      };
      scrollTimeoutRef.current = setTimeout(scroll, 1000);
      return () => clearTimeout(scrollTimeoutRef.current);
    }
    return () => clearTimeout(scrollTimeoutRef.current);
  }, [state.autoScroll, state.scrollSpeed]);

  // Reading progress calculation
  useEffect(() => {
    if (chapterRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chapterRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    }
  }, [chapter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault(); previousChapter(); break;
        case 'ArrowRight':
          e.preventDefault(); nextChapter(); break;
        case 'ArrowUp':
          e.preventDefault(); chapterRef.current?.scrollBy({ top: -100, behavior: 'smooth' }); break;
        case 'ArrowDown':
          e.preventDefault(); chapterRef.current?.scrollBy({ top: 100, behavior: 'smooth' }); break;
        case ' ':
          if (state.autoScroll) {
            e.preventDefault();
            setState(prev => ({ ...prev, autoScroll: false }));
          }
          break;
        case 'f':
        case 'F':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            document.getElementById('reference-input')?.focus();
          }
          break;
        case 'Escape':
          setShowControls(true);
          setShowTOC(false);
          setShowSearchResults(false);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousChapter, nextChapter, state.autoScroll]);

  // Copy verse to clipboard
  const copyVerse = useCallback(async (verse: BibleVerse) => {
    const text = `${verse.text} — ${verse.book_name} ${verse.chapter}:${verse.verse} (${TRANSLATIONS[state.translation].name})`;
    await navigator.clipboard.writeText(text);
    // Show toast notification
  }, [state.translation]);

  // Toggle bookmark
  const toggleBookmark = useCallback((verse: BibleVerse) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.bookId === verse.book_id && b.chapter === verse.chapter && b.verse === verse.verse);
      if (exists) {
        return prev.filter(b => b !== exists);
      }
      return [...prev, { bookId: verse.book_id, chapter: verse.chapter, verse: verse.verse, label: `${verse.book_name} ${verse.chapter}:${verse.verse}` }];
    });
  }, []);

  const isBookmarked = useCallback((verse: BibleVerse) => {
    return bookmarks.some(b => b.bookId === verse.book_id && b.chapter === verse.chapter && b.verse === verse.verse);
  }, [bookmarks]);

  // Verse click handler - highlight and show actions
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [selectedVerseElement, setSelectedVerseElement] = useState<HTMLElement | null>(null);

  const handleVerseClick = useCallback((verse: BibleVerse, element: HTMLElement) => {
    setSelectedVerse(verse);
    setSelectedVerseElement(element);
  }, []);

  // Render verses with animations
  const renderVerses = useMemo(() => {
    if (!chapter) return null;

    return chapter.verses.map((verse, index) => (
      <motion.div
        key={`${verse.book_id}-${verse.chapter}-${verse.verse}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * VERSE_ANIMATION_DELAY / 1000, duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'verse-row',
          selectedVerse?.verse === verse.verse && 'selected',
          isBookmarked(verse) && 'bookmarked'
        )}
        onClick={() => handleVerseClick(verse, chapterRef.current!)}
        style={{ fontSize: state.fontSize, lineHeight: state.fontSize * 1.8 }}
      >
        {state.showVerseNumbers && (
          <span className="verse-number" aria-hidden="true">{verse.verse}</span>
        )}
        <span className="verse-text">{verse.text}</span>
        {isBookmarked(verse) && (
          <span className="bookmark-indicator" aria-label="Bookmarked">★</span>
        )}
      </motion.div>
    ));
  }, [chapter, state.fontSize, state.showVerseNumbers, selectedVerse, isBookmarked, handleVerseClick]);

  // Chapter selector options
  const chapterOptions = useMemo(() =>
    Array.from({ length: state.currentBook.chapters }, (_, i) => ({
      label: `${t('bible.chapter', 'Capítulo')} ${i + 1}`,
      value: i + 1,
    })), [state.currentBook.chapters, t]);

  // Translation options
  const translationOptions = useMemo(() =>
    Object.entries(TRANSLATIONS).map(([code, info]) => ({
      label: `${info.name} — ${info.fullName}`,
      value: code as TranslationCode,
    })), [t]);

  return (
    <PageLayout
      title={t('bible.title', 'Bíblia')}
      description={`${state.currentBook.name} ${state.currentChapter} • ${TRANSLATIONS[state.translation].name}`}
      breadcrumbs={[
        { label: t('bible.title', 'Bíblia'), path: routes.bible },
        { label: state.currentBook.name, path: `/bible/${state.currentBook.abbrev.toLowerCase()}` },
        { label: `${t('bible.chapter', 'Capítulo')} ${state.currentChapter}`, path: '' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Tooltip content={t('bible.copyVerse', 'Copiar versículo selecionado')}>
            <Button
              icon="pi pi-copy"
              onClick={() => selectedVerse && copyVerse(selectedVerse)}
              disabled={!selectedVerse}
              severity="secondary"
              className="p-2"
            />
          </Tooltip>
          <Tooltip content={t('bible.shareVerse', 'Compartilhar versículo')}>
            <Button
              icon="pi pi-share-alt"
              onClick={() => selectedVerse && navigator.share?.({
                title: `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}`,
                text: selectedVerse.text,
              })}
              disabled={!selectedVerse}
              severity="secondary"
              className="p-2"
            />
          </Tooltip>
        </div>
      }
    >
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-3"
          role="alert"
        >
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="font-medium">{t('bible.errorLoading', 'Erro ao carregar capítulo')}</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button label={t('common.retry', 'Tentar novamente')} onClick={() => loadChapter(state.currentBook, state.currentChapter, state.translation)} size="small" />
        </motion.div>
      )}

      {/* Main Reading Area */}
      <div className="relative">
        {/* Progress Bar at top */}
        <div className="fixed top-14 left-64 right-4 z-40 lg:left-64 hidden lg:block pointer-events-none">
          <div className="max-w-7xl mx-auto px-4">
            <ProgressBar value={readingProgress} showValue={false} className="h-1 rounded-full" style={{ height: '3px' }} />
          </div>
        </div>

        {/* Chapter Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.currentBook.id}-${state.currentChapter}-${state.translation}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Chapter Header */}
            <div className="mb-6 pb-4 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-primary">
                    {state.currentBook.name} {state.currentChapter}
                  </h1>
                  <p className="text-secondary mt-1">
                    {TRANSLATIONS[state.translation].fullName}
                    {state.parallelTranslation && (
                      <> • {TRANSLATIONS[state.parallelTranslation].fullName}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Dropdown
                    options={chapterOptions}
                    value={state.currentChapter}
                    onChange={(e) => goToChapter(state.currentBook.id, e.value)}
                    className="w-40"
                    optionLabel="label"
                    optionValue="value"
                    showClear={false}
                  />
                </div>
              </div>
            </div>

            {/* Verses */}
            <ScrollPanel className="bible-content" ref={chapterRef} style={{ minHeight: '500px' }}>
              <div className={cn('verses-container', state.showVerseNumbers ? '' : 'no-verse-numbers')}>
                <AnimatePresence mode="popLayout">
                  {renderVerses}
                </AnimatePresence>

                {/* Parallel translation */}
                {parallelChapter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="parallel-translation mt-8 pt-6 border-t border-border"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                        {TRANSLATIONS[state.parallelTranslation!].name}
                      </span>
                      <Divider />
                    </div>
                    <div className="verses-container" style={{ fontSize: state.fontSize * 0.95, lineHeight: state.fontSize * 1.7 }}>
                      {parallelChapter.verses.map(verse => (
                        <div key={`${verse.book_id}-${verse.chapter}-${verse.verse}`} className="verse-row parallel">
                          {state.showVerseNumbers && (
                            <span className="verse-number" aria-hidden="true">{verse.verse}</span>
                          )}
                          <span className="verse-text text-secondary">{verse.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollPanel>

            {/* Chapter Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4 pt-4 border-t border-border">
              <Button
                icon="pi pi-chevron-left"
                label={t('bible.previousChapter', 'Capítulo anterior')}
                onClick={previousChapter}
                disabled={state.currentChapter === 1 && state.currentBook.id === 1}
                severity="secondary"
                className="flex-1"
              />
              <div className="flex items-center gap-4">
                <Button
                  icon="pi pi-book"
                  label={t('bible.books', 'Livros')}
                  onClick={() => setShowTOC(true)}
                  severity="secondary"
                />
                <Button
                  icon="pi pi-search"
                  label={t('bible.search', 'Buscar')}
                  onClick={() => setShowSearchResults(true)}
                  severity="secondary"
                />
              </div>
              <Button
                icon="pi pi-chevron-right"
                label={t('bible.nextChapter', 'Próximo capítulo')}
                onClick={nextChapter}
                disabled={state.currentChapter === state.currentBook.chapters && state.currentBook.id === 66}
                severity="primary"
                iconPos="right"
                className="flex-1"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Controls - Mobile */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center gap-2 pointer-events-none">
        <div className="pointer-events-auto flex gap-2">
          <Button icon="pi pi-chevron-left" onClick={previousChapter} severity="secondary" rounded className="shadow-lg" aria-label={t('bible.previousChapter', 'Capítulo anterior')} />
          <Button icon="pi pi-chevron-right" onClick={nextChapter} severity="primary" rounded className="shadow-lg" aria-label={t('bible.nextChapter', 'Próximo capítulo')} />
        </div>
      </div>

      {/* Table of Contents Modal */}
      <OverlayPanel
        visible={showTOC}
        onHide={() => setShowTOC(false)}
        target={null}
        showCloseIcon
        className="bible-toc-panel"
        style={{ width: '320px', maxHeight: '70vh' }}
      >
        <div className="p-4">
          <h3 className="font-semibold text-primary mb-4">{t('bible.books', 'Livros da Bíblia')}</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {BIBLE_BOOKS.filter(b => b.testament === 'OT').map(book => (
              <div key={book.id} className="toc-book-group">
                <button
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors flex items-center justify-between"
                  onClick={() => goToChapter(book.id, 1)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{book.testament === 'OT' ? '📜' : '✝️'}</span>
                    <span className="font-medium">{book.name}</span>
                  </span>
                  <span className="text-xs text-muted">{book.chapters} caps</span>
                </button>
              </div>
            ))}
            <Divider className="my-2" />
            <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">{t('bible.newTestament', 'Novo Testamento')}</p>
            {BIBLE_BOOKS.filter(b => b.testament === 'NT').map(book => (
              <div key={book.id} className="toc-book-group">
                <button
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors flex items-center justify-between"
                  onClick={() => goToChapter(book.id, 1)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">✝️</span>
                    <span className="font-medium">{book.name}</span>
                  </span>
                  <span className="text-xs text-muted">{book.chapters} caps</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </OverlayPanel>

      {/* Search Results Modal */}
      <OverlayPanel
        visible={showSearchResults && searchResults.length > 0}
        onHide={() => setShowSearchResults(false)}
        target={null}
        showCloseIcon
        className="bible-search-panel"
        style={{ width: '400px', maxHeight: '70vh' }}
      >
        <div className="p-4">
          <div className="mb-4">
            <InputText
              id="reference-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleReferenceInput}
              placeholder={t('bible.searchPlaceholder', 'Buscar livro, capítulo, versículo ou palavra...')}
              className="w-full"
            />
          </div>
          <h4 className="font-semibold text-primary mb-3">{t('bible.search', 'Resultados da busca')}</h4>
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {searchResults.map((result, i) => (
              <button
                key={i}
                className="w-full text-left p-3 rounded-lg hover:bg-surface-hover transition-colors text-sm border border-border"
                onClick={() => {
                  goToChapter(result.book_id, result.chapter);
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
              >
                <div className="font-medium text-primary">{result.reference}</div>
                <div className="text-secondary line-clamp-1 mt-1">{result.verses[0]?.text}</div>
              </button>
            ))}
            {searchResults.length === 0 && !isLoading && searchQuery && (
              <p className="text-secondary text-center py-8">{t('bible.noResults', 'Nenhum resultado encontrado')}</p>
            )}
          </div>
        </div>
      </OverlayPanel>

      {/* Verse Actions Overlay */}
      <AnimatePresence>
        {selectedVerse && selectedVerseElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 verse-actions-popover"
            style={{
              top: selectedVerseElement.getBoundingClientRect().bottom + 10,
              left: selectedVerseElement.getBoundingClientRect().left,
            }}
          >
            <div className="bg-surface-elevated border border-border rounded-lg shadow-xl p-2 min-w-[200px]">
              <div className="font-medium text-primary mb-2 px-2">
                {selectedVerse.book_name} {selectedVerse.chapter}:{selectedVerse.verse}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-surface-hover transition-colors text-left"
                  onClick={() => { copyVerse(selectedVerse); setSelectedVerse(null); }}
                >
                  <span className="text-lg">📋</span>
                  <span>{t('bible.copyVerse', 'Copiar versículo')}</span>
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-surface-hover transition-colors text-left"
                  onClick={() => { toggleBookmark(selectedVerse); setSelectedVerse(null); }}
                >
                  <span className="text-lg">{isBookmarked(selectedVerse) ? '✅' : '★'}</span>
                  <span>{isBookmarked(selectedVerse) ? t('bible.removeBookmark', 'Remover marcador') : t('bible.highlightVerse', 'Marcar versículo')}</span>
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-surface-hover transition-colors text-left"
                  onClick={() => { navigator.share?.({ title: `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}`, text: selectedVerse.text }); setSelectedVerse(null); }}
                >
                  <span className="text-lg">📤</span>
                  <span>{t('bible.shareVerse', 'Compartilhar')}</span>
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-surface-hover transition-colors text-left"
                  onClick={() => setSelectedVerse(null)}
                >
                  <span className="text-lg">✕</span>
                  <span>{t('common.close', 'Fechar')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel - Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bible-settings-sheet">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="bg-surface-elevated border-t border-border rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">{t('settings.title', 'Configurações')}</h3>
            <Button icon="pi pi-times" onClick={() => setShowControls(true)} severity="secondary" className="p-2" />
          </div>

          <div className="space-y-6">
            {/* Translation */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">{t('bible.selectTranslation', 'Selecionar tradução')}</label>
              <Dropdown
                options={translationOptions}
                value={state.translation}
                onChange={(e) => setState(prev => ({ ...prev, translation: e.value }))}
                className="w-full"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            {/* Parallel Translation */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">{t('bible.parallelTranslations', 'Tradução paralela')}</label>
              <Dropdown
                options={[{ label: t('common.none', 'Nenhuma'), value: '' }, ...translationOptions]}
                value={state.parallelTranslation || ''}
                onChange={(e) => setState(prev => ({ ...prev, parallelTranslation: e.value || undefined }))}
                className="w-full"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-secondary">{t('settings.appearance.fontSize', 'Tamanho da fonte')}</label>
                <span className="text-sm text-muted">{state.fontSize}px</span>
              </div>
              <Slider
                value={state.fontSize}
                onChange={(e) => setState(prev => ({ ...prev, fontSize: e.value }))}
                min={14}
                max={28}
                step={1}
                className="w-full"
              />
            </div>

            {/* Toggles */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={state.showVerseNumbers}
                  onChange={(e) => setState(prev => ({ ...prev, showVerseNumbers: e.checked }))}
                />
                <span className="text-sm">{t('bible.showVerseNumbers', 'Mostrar números dos versículos')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={state.showCrossRefs}
                  onChange={(e) => setState(prev => ({ ...prev, showCrossRefs: e.checked }))}
                />
                <span className="text-sm">{t('bible.showCrossRefs', 'Mostrar referências cruzadas')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={state.wakeLock}
                  onChange={(e) => setState(prev => ({ ...prev, wakeLock: e.checked }))}
                />
                <span className="text-sm">{t('preaching.wakeLock', 'Manter tela ligada')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={state.autoScroll}
                  onChange={(e) => setState(prev => ({ ...prev, autoScroll: e.checked }))}
                />
                <span className="text-sm">{t('preaching.autoScroll', 'Rolagem automática')}</span>
              </label>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">{t('settings.appearance.theme', 'Tema de leitura')}</label>
              <div className="flex gap-3">
                {(['light', 'dark', 'sepia'] as const).map(theme => (
                  <button
                    key={theme}
                    className={cn(
                      'flex-1 py-3 rounded-lg border-2 transition-all',
                      state.theme === theme
                        ? 'border-primary bg-primary-soft'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => setState(prev => ({ ...prev, theme }))}
                  >
                    <span className="block text-center capitalize">{theme}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-scroll speed */}
            {state.autoScroll && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-secondary">{t('preaching.scrollSpeed', 'Velocidade de rolagem')}</label>
                  <span className="text-sm text-muted">{state.scrollSpeed.toFixed(1)}x</span>
                </div>
                <Slider
                  value={state.scrollSpeed}
                  onChange={(e) => setState(prev => ({ ...prev, scrollSpeed: e.value }))}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

export default BibleReaderPage;