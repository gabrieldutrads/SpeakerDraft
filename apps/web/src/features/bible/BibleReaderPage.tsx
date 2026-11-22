import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import type { Outline } from '@speaker-draft/core';
import { getRepositories, queryKeys } from '@/lib/repositories';
import { useQueryClient } from '@tanstack/react-query';
import { bibleApi, BIBLE_BOOKS, findBibleBook, parseBibleReference, TRANSLATIONS, type BibleChapter, type BibleVerse, type TranslationCode } from '@speaker-draft/core';
import { useThemeContext } from '@/app/providers';
import './bible-reader-premium.css';

/** Leitor isolado: mantém a API, os identificadores dos livros e a persistência local existentes. */
type ReaderTheme = 'system' | 'light' | 'dark' | 'sepia';
type Bookmark = { bookId: string; chapter: number; verse: number; label: string };
type Highlight = { key: string; color: string };
type ReaderPreferences = { bookId: number; chapter: number; translation: TranslationCode; fontSize: number; lineHeight: number; theme: ReaderTheme; showNumbers: boolean; font: 'serif' | 'sans'; width: 'normal' | 'wide' };
const DEFAULTS: ReaderPreferences = { bookId: 19, chapter: 23, translation: 'pt', fontSize: 20, lineHeight: 1.9, theme: 'system', showNumbers: true, font: 'serif', width: 'normal' };
const HIGHLIGHTS = ['#f6d978', '#a8dfc0', '#c6b7f3', '#f5b6b7', '#a9cef7'];
const keyFor = (v: BibleVerse) => `${v.book_id}:${v.chapter}:${v.verse}`;
function readSaved<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function readerIcon(name: string) { return `pi pi-${name}`; }

export function BibleReaderPage() {
  const routeParams = useParams<{ book?: string; chapter?: string; verse?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resolvedTheme } = useThemeContext();
  const [prefs, setPrefs] = useState<ReaderPreferences>(() => {
    const saved = readSaved<Partial<ReaderPreferences>>('opregador-reader-v5', {});
    return { ...DEFAULTS, ...saved, translation: saved.translation === 'kjv' ? 'kjv' : 'pt' };
  });
  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => readSaved('bibleBookmarks', []));
  const [highlights, setHighlights] = useState<Highlight[]>(() => readSaved('opregador-bible-highlights-v1', []));
  const [selected, setSelected] = useState<BibleVerse | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [outlinePickerOpen, setOutlinePickerOpen] = useState(false);
  const [outlineChoices, setOutlineChoices] = useState<Outline[]>([]);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [outlineSaving, setOutlineSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [toast, setToast] = useState('');
  const [progress, setProgress] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [dockPosition, setDockPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerX: number; pointerY: number; originX: number; originY: number } | null>(null);
  const requestRef = useRef(0);
  const currentBook = useMemo(() => BIBLE_BOOKS.find(b => b.id === prefs.bookId) ?? BIBLE_BOOKS[18], [prefs.bookId]);
  useEffect(() => {
    if (!routeParams.book || !routeParams.chapter) return;
    const book = findBibleBook(routeParams.book);
    const chapterNumber = Number(routeParams.chapter);
    if (book && Number.isInteger(chapterNumber) && chapterNumber >= 1 && chapterNumber <= book.chapters) {
      setPrefs(prev => prev.bookId === book.id && prev.chapter === chapterNumber ? prev : { ...prev, bookId: book.id, chapter: chapterNumber });
    }
  }, [routeParams.book, routeParams.chapter]);
  const theme = prefs.theme === 'system' ? (resolvedTheme === 'dark' ? 'dark' : 'light') : prefs.theme;
  const activeReference = `${currentBook.name} ${prefs.chapter}`;

  useEffect(() => { localStorage.setItem('opregador-reader-v5', JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { localStorage.setItem('bibleBookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('opregador-bible-highlights-v1', JSON.stringify(highlights)); }, [highlights]);
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(''), 2600); return () => window.clearTimeout(id); }, [toast]);

  useEffect(() => {
    let active = true;
    const id = ++requestRef.current;
    setLoading(true); setError(''); setSelected(null);
    bibleApi.getChapter(prefs.bookId, prefs.chapter, prefs.translation)
      .then(data => { if (active && requestRef.current === id) { setChapter(data); scrollRef.current?.scrollTo({ top: 0 }); setProgress(0); } })
      .catch(err => { if (active && requestRef.current === id) { setChapter(null); setError(err instanceof Error ? err.message : 'Não foi possível carregar o capítulo.'); } })
      .finally(() => { if (active && requestRef.current === id) setLoading(false); });
    return () => { active = false; };
  }, [prefs.bookId, prefs.chapter, prefs.translation, reloadCount]);

  const updatePrefs = (patch: Partial<ReaderPreferences>) => setPrefs(prev => ({ ...prev, ...patch }));
  const changeChapter = useCallback((direction: number) => {
    setPrefs(prev => {
      const b = BIBLE_BOOKS.find(item => item.id === prev.bookId) ?? BIBLE_BOOKS[18];
      const n = prev.chapter + direction;
      if (n >= 1 && n <= b.chapters) return { ...prev, chapter: n };
      const next = BIBLE_BOOKS.find(item => item.id === b.id + (direction > 0 ? 1 : -1));
      return next ? { ...prev, bookId: next.id, chapter: direction > 0 ? 1 : next.chapters } : prev;
    });
  }, []);
  const goTo = (bookId: number, chapterNumber: number) => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return;
    updatePrefs({ bookId, chapter: Math.min(book.chapters, Math.max(1, chapterNumber)) });
    setSelectorOpen(false);
  };
  const goToReference = () => {
    const parsed = parseBibleReference(reference.trim());
    if (parsed) { goTo(parsed.bookId, parsed.chapterStart); setReference(''); return; }
    const book = findBibleBook(reference.trim());
    if (book) { goTo(book.id, 1); setReference(''); return; }
    setToast('Use uma referência como João 3:16 ou Salmos 23.');
  };
  const copyVerse = async (verse: BibleVerse) => {
    try { await navigator.clipboard.writeText(`${verse.text} — ${verse.book_name} ${verse.chapter}:${verse.verse} (${TRANSLATIONS[prefs.translation].name})`); setToast('Versículo copiado!'); }
    catch { setToast('Não foi possível copiar neste navegador.'); }
  };
  const shareVerse = async (verse: BibleVerse) => {
    const text = `${verse.text} — ${verse.book_name} ${verse.chapter}:${verse.verse}`;
    try { if (navigator.share) await navigator.share({ title: `${verse.book_name} ${verse.chapter}:${verse.verse}`, text }); else await copyVerse(verse); }
    catch { /* cancelamento de compartilhamento */ }
  };
  const isBookmarked = (verse: BibleVerse) => bookmarks.some(item => item.bookId === verse.book_id && item.chapter === verse.chapter && item.verse === verse.verse);
  const toggleBookmark = (verse: BibleVerse) => {
    setBookmarks(prev => isBookmarked(verse) ? prev.filter(item => !(item.bookId === verse.book_id && item.chapter === verse.chapter && item.verse === verse.verse)) : [...prev, { bookId: verse.book_id, chapter: verse.chapter, verse: verse.verse, label: `${verse.book_name} ${verse.chapter}:${verse.verse}` }]);
    setToast(isBookmarked(verse) ? 'Favorito removido.' : 'Versículo salvo nos favoritos.');
  };
  const setHighlight = (verse: BibleVerse, color: string) => {
    const key = keyFor(verse);
    setHighlights(prev => [...prev.filter(item => item.key !== key), ...(color ? [{ key, color }] : [])]);
    setToast(color ? 'Destaque aplicado.' : 'Destaque removido.');
  };
  // Inclui o versículo no documento TipTap, preservando o conteúdo do esboço.
  // Usa exclusivamente o repositório do projeto; não modifica diretamente o workspace.
  const scriptureNode = (verse: BibleVerse) => ({
    type: 'blockquote',
    content: [{ type: 'paragraph', content: [
      { type: 'text', text: verse.text },
      { type: 'hardBreak' },
      { type: 'text', text: `— ${verse.book_name} ${verse.chapter}:${verse.verse} (${TRANSLATIONS[prefs.translation]?.name ?? prefs.translation})` },
    ] }],
  });
  const toDocument = (value: unknown): { type: 'doc'; content: unknown[] } => {
    let parsed: unknown = value;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); }
      catch { parsed = { type: 'doc', content: parsed.split(/\n+/).filter(Boolean).map(text => ({ type: 'paragraph', content: [{ type: 'text', text }] })) }; }
    }
    if (parsed && typeof parsed === 'object' && 'type' in parsed && 'content' in parsed &&
        (parsed as { type?: unknown }).type === 'doc' && Array.isArray((parsed as { content?: unknown }).content)) {
      return { type: 'doc', content: [...(parsed as { content: unknown[] }).content] };
    }
    return { type: 'doc', content: [] };
  };
  const openOutlinePicker = async () => {
    if (!selected) return;
    setOutlinePickerOpen(true);
    setOutlineLoading(true);
    try { setOutlineChoices(await getRepositories().outlines.getAll()); }
    catch { setToast('Não foi possível carregar seus esboços.'); }
    finally { setOutlineLoading(false); }
  };
  const addToOutline = async (outlineId?: string) => {
    if (!selected || outlineSaving) return;
    setOutlineSaving(true);
    try {
      const repo = getRepositories().outlines;
      const node = scriptureNode(selected);
      let saved: Outline | null;
      if (outlineId) {
        const existing = await repo.getById(outlineId);
        if (!existing) throw new Error('Esboço não encontrado.');
        const doc = toDocument(existing.content);
        doc.content.push(node);
        saved = await repo.update(outlineId, { content: doc as unknown as Outline['content'] });
      } else {
        const doc = { type: 'doc', content: [node] };
        saved = await repo.create({
          title: `Estudo de ${selected.book_name} ${selected.chapter}:${selected.verse}`,
          reference: `${selected.book_name} ${selected.chapter}:${selected.verse}`,
          category: 'Estudo',
          status: 'draft',
          content: doc as unknown as Outline['content'],
        });
      }
      if (!saved) throw new Error('Não foi possível salvar o esboço.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.outlines });
      await queryClient.invalidateQueries({ queryKey: queryKeys.outline(saved.id) });
      setOutlinePickerOpen(false);
      setSelected(null);
      setToast('Versículo incluído no esboço!');
      navigate(`/outlines/${encodeURIComponent(saved.id)}/edit`);
    } catch (err) { setToast(err instanceof Error ? err.message : 'Erro ao incluir versículo no esboço.'); }
    finally { setOutlineSaving(false); }
  };
  const onScroll = () => { const el = scrollRef.current; if (!el) return; const max = el.scrollHeight - el.clientHeight; setProgress(max > 0 ? Math.min(100, Math.round(el.scrollTop / max * 100)) : 100); };
  useEffect(() => {
    if (!autoScroll) return;
    const interval = window.setInterval(() => { const el = scrollRef.current; if (!el) return; el.scrollTop += 1; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) setAutoScroll(false); }, 48);
    return () => window.clearInterval(interval);
  }, [autoScroll]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (selectorOpen || settingsOpen) { if (event.key === 'Escape') { setSelectorOpen(false); setSettingsOpen(false); setSelected(null); } return; }
      if (event.key === 'ArrowLeft' && event.altKey) { event.preventDefault(); changeChapter(-1); }
      if (event.key === 'ArrowRight' && event.altKey) { event.preventDefault(); changeChapter(1); }
      if (event.key === 'Escape') { setSelected(null); setFocusMode(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [changeChapter, selectorOpen, settingsOpen]);

  // Glass dock: o usuário pode arrastá-lo; reflexo responde à posição real do ponteiro.
  const updateGlassLight = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--glass-x', `${((event.clientX - box.left) / box.width) * 100}%`);
    event.currentTarget.style.setProperty('--glass-y', `${((event.clientY - box.top) / box.height) * 100}%`);
  };
  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, originX: rect.left, originY: rect.top };
    setDockPosition({ x: rect.left, y: rect.top }); setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const { pointerX, pointerY, originX, originY } = dragRef.current;
    const width = dockRef.current?.offsetWidth ?? 320; const height = dockRef.current?.offsetHeight ?? 68;
    setDockPosition({ x: Math.min(Math.max(8, originX + event.clientX - pointerX), window.innerWidth - width - 8), y: Math.min(Math.max(80, originY + event.clientY - pointerY), window.innerHeight - height - 8) });
  };
  const stopDrag = () => { dragRef.current = null; setIsDragging(false); };
  const dockStyle: CSSProperties = dockPosition ? { position: 'fixed', left: dockPosition.x, top: dockPosition.y, bottom: 'auto', transform: 'none' } : {};
  const documentStyle = { '--reader-font-size': `${prefs.fontSize}px`, '--reader-leading': prefs.lineHeight, '--reader-font': prefs.font === 'serif' ? 'Georgia, Cambria, "Times New Roman", serif' : 'Inter, system-ui, sans-serif' } as CSSProperties;
  const visibleBooks = BIBLE_BOOKS.filter(b => b.name.toLocaleLowerCase('pt-BR').includes(bookFilter.toLocaleLowerCase('pt-BR')) || b.abbrev.toLocaleLowerCase('pt-BR').includes(bookFilter.toLocaleLowerCase('pt-BR')));

  return <div className={`op-bible-v5${focusMode ? ' op-bible-focus' : ''}`} data-reader-theme={theme} style={documentStyle}>
    <div className="op-bible-ambient op-bible-ambient-a" aria-hidden="true"/><div className="op-bible-ambient op-bible-ambient-b" aria-hidden="true"/>
    <header className="op-bible-hero">
      <div className="op-bible-eyebrow"><i className={readerIcon('book')}/> BIBLIOTECA DAS ESCRITURAS <span/> LEITURA E ESTUDO</div>
      <div className="op-bible-hero-main"><div><p className="op-bible-overline">SUA JORNADA NA PALAVRA</p><h1>Bíblia <em>Studio</em></h1><p>Um espaço para ler, refletir e guardar o que Deus fala ao seu coração.</p></div>
        <div className="op-bible-hero-actions"><button type="button" className="op-bible-action op-bible-accent" onClick={() => setSettingsOpen(true)}><i className={readerIcon('sliders-h')}/> Personalizar</button></div>
      </div>
      <div className="op-bible-topline"><button type="button" className="op-bible-topline-search" onClick={() => navigate("/bible/search")}><i className={readerIcon('search')}/> Buscar referência</button><span><i className={readerIcon('bookmark')}/> {bookmarks.length} favoritos</span><span><i className={readerIcon('palette')}/> {highlights.length} destaques</span><span><i className={readerIcon('check-circle')}/> Bíblia Livre · português</span></div>
    </header>

    <section className="op-bible-library">
      <div className="op-bible-toolbar" onPointerMove={updateGlassLight}>
        <div className="op-bible-reference"><span>LEITURA ATUAL</span><strong>{activeReference}</strong><small>{TRANSLATIONS[prefs.translation]?.name ?? 'Bíblia Livre'}</small></div>
        <div className="op-bible-toolbar-controls">
          <button type="button" onClick={() => changeChapter(-1)} title="Capítulo anterior" aria-label="Capítulo anterior"><i className={readerIcon('chevron-left')}/></button>
          <button type="button" className="op-bible-chapter-picker" onClick={() => setSelectorOpen(true)}><i className={readerIcon('book-open')}/> Navegar <i className={readerIcon('angle-down')}/></button>
          <button type="button" onClick={() => changeChapter(1)} title="Próximo capítulo" aria-label="Próximo capítulo"><i className={readerIcon('chevron-right')}/></button>
        </div>
      </div>
      <div className={`op-bible-paper op-bible-paper-${prefs.width}`}>
        <div className="op-bible-paper-heading"><span className="op-bible-paper-symbol">✦</span><p>LEITURA DAS ESCRITURAS</p><h2>{activeReference}</h2><span className="op-bible-paper-rule"/><div className="op-bible-edition">{TRANSLATIONS[prefs.translation]?.fullName ?? 'Bíblia Livre'} <span>•</span> <a href="https://ebible.org/Bible/details.php?id=porbr2018" rel="noopener noreferrer" target="_blank">Licença e créditos <i className={readerIcon('external-link')}/></a></div></div>
        <div className="op-bible-reading" ref={scrollRef} onScroll={onScroll}>
          {loading && <div className="op-bible-loading"><span className="op-bible-spinner"/><strong>Preparando sua leitura...</strong><small>Carregando {activeReference}</small></div>}
          {!loading && error && <div className="op-bible-error" role="alert"><i className={readerIcon('exclamation-circle')}/><h3>Não foi possível abrir este capítulo</h3><p>{error}</p><button type="button" onClick={() => setReloadCount(p => p + 1)}>Tentar novamente</button></div>}
          {!loading && !error && chapter && <div className="op-bible-verses">{chapter.verses.map((verse, index) => {
            const color = highlights.find(item => item.key === keyFor(verse))?.color;
            return <motion.button key={keyFor(verse)} type="button" className={`op-bible-verse${selected && keyFor(selected) === keyFor(verse) ? ' is-selected' : ''}${color ? ' is-highlighted' : ''}`} style={color ? { '--verse-highlight': color } as CSSProperties : undefined} initial={index < 12 ? { opacity: 0, y: 7 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24, delay: Math.min(index, 12) * .022 }} onClick={() => setSelected(verse)} aria-label={`Versículo ${verse.verse}. ${verse.text}`}>
              {prefs.showNumbers && <span className="op-bible-verse-index">{verse.verse}</span>}<span className="op-bible-verse-copy">{verse.text}</span>{isBookmarked(verse) && <i className={`${readerIcon('bookmark-fill')} op-bible-bookmark-glyph`}/>}</motion.button>;
          })}</div>}
          {!loading && !error && (!chapter || chapter.verses.length === 0) && <div className="op-bible-empty">Nenhum versículo retornado pelo provedor.</div>}
        </div>
        <footer className="op-bible-paper-footer"><div className="op-bible-reading-progress"><span style={{ width: `${progress}%` }}/></div><span>{progress}% lido neste capítulo</span><span>{chapter?.verses.length ?? 0} versículos</span></footer>
      </div>
      <div className="op-bible-bottom-nav"><button type="button" onClick={() => changeChapter(-1)}><i className={readerIcon('arrow-left')}/> Anterior</button><span>{activeReference}</span><button type="button" onClick={() => changeChapter(1)}>Próximo <i className={readerIcon('arrow-right')}/></button></div>
    </section>

    <div className={`op-bible-dock${isDragging ? ' is-dragging' : ''}`} ref={dockRef} onPointerMove={updateGlassLight} style={dockStyle}>
      <button className="op-bible-dock-handle" type="button" aria-label="Arrastar barra de ferramentas" title="Arraste para mover a barra de vidro" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}><i className={readerIcon('ellipsis-v')}/></button>
      <button type="button" onClick={() => updatePrefs({ fontSize: Math.max(14, prefs.fontSize - 2) })} title="Diminuir letra" aria-label="Diminuir letra">A−</button>
      <span className="op-bible-dock-value">{prefs.fontSize}</span>
      <button type="button" onClick={() => updatePrefs({ fontSize: Math.min(34, prefs.fontSize + 2) })} title="Aumentar letra" aria-label="Aumentar letra">A+</button>
      <span className="op-bible-dock-sep"/>
      <button type="button" className={focusMode ? 'is-active' : ''} title="Modo foco" aria-label="Modo foco" onClick={() => setFocusMode(p => !p)}><i className={readerIcon(focusMode ? 'window-maximize' : 'expand')}/></button>
      <button type="button" className={autoScroll ? 'is-active' : ''} title="Rolagem automática" aria-label="Rolagem automática" onClick={() => setAutoScroll(p => !p)}><i className={readerIcon(autoScroll ? 'pause' : 'play')}/></button>
      <button type="button" title="Configurações de leitura" aria-label="Configurações de leitura" onClick={() => setSettingsOpen(true)}><i className={readerIcon('sliders-h')}/></button>
      {dockPosition && <button type="button" title="Centralizar barra" aria-label="Centralizar barra" onClick={() => setDockPosition(null)}><i className={readerIcon('refresh')}/></button>}
    </div>

    <AnimatePresence>{selected && <motion.div className="op-bible-verse-backdrop" key="verse-action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}><motion.div className="op-bible-verse-sheet" role="dialog" aria-modal="true" aria-label="Ações do versículo" initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .98 }} onClick={e => e.stopPropagation()}>
      <div className="op-bible-sheet-head"><span>VERSÍCULO SELECIONADO</span><button type="button" aria-label="Fechar" onClick={() => setSelected(null)}><i className={readerIcon('times')}/></button></div>
      <h3>{selected.book_name} {selected.chapter}:{selected.verse}</h3><blockquote>{selected.text}</blockquote>
      <div className="op-bible-verse-actions"><button type="button" onClick={() => { void copyVerse(selected); setSelected(null); }}><i className={readerIcon('copy')}/> Copiar</button><button type="button" onClick={() => toggleBookmark(selected)}><i className={readerIcon('bookmark')}/>{isBookmarked(selected) ? 'Remover favorito' : 'Favoritar'}</button><button type="button" onClick={() => { void shareVerse(selected); }}><i className={readerIcon('share-alt')}/> Compartilhar</button><button type="button" className="op-bible-add-outline" onClick={() => { void openOutlinePicker(); }}><i className={readerIcon('file-edit')}/> Incluir no esboço</button></div>
      <p className="op-bible-color-label">DESTACAR VERSÍCULO</p><div className="op-bible-highlighter">{HIGHLIGHTS.map(color => <button type="button" key={color} style={{ background: color }} title={`Destacar com ${color}`} aria-label={`Destacar com ${color}`} onClick={() => setHighlight(selected, color)}/>)}<button type="button" className="op-bible-clear-highlight" onClick={() => setHighlight(selected, '')} title="Remover destaque"><i className={readerIcon('eraser')}/></button></div>
    </motion.div></motion.div>}</AnimatePresence>

    <AnimatePresence>{outlinePickerOpen && selected && <motion.div className="op-bible-modal-backdrop" key="outline-picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !outlineSaving && setOutlinePickerOpen(false)}>
      <motion.div className="op-bible-modal op-bible-outline-modal" role="dialog" aria-modal="true" aria-label="Incluir versículo em um esboço" initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} onClick={event => event.stopPropagation()}>
        <div className="op-bible-modal-head"><div><span>CONSTRUINDO SUA MENSAGEM</span><h2>Incluir no esboço</h2></div><button type="button" disabled={outlineSaving} aria-label="Fechar" onClick={() => setOutlinePickerOpen(false)}><i className={readerIcon('times')}/></button></div>
        <div className="op-bible-outline-selected"><i className={readerIcon('book')}/><div><strong>{selected.book_name} {selected.chapter}:{selected.verse}</strong><p>{selected.text}</p></div></div>
        <p className="op-bible-outline-intro">Escolha onde guardar este versículo. Ele será adicionado como uma citação ao final do conteúdo, sem apagar o que você escreveu.</p>
        {outlineLoading ? <div className="op-bible-outline-loading">Carregando seus esboços...</div> : <div className="op-bible-outline-list">
          {outlineChoices.map(outline => <button type="button" disabled={outlineSaving} key={outline.id} onClick={() => { void addToOutline(outline.id); }}><i className={readerIcon('file-edit')}/><span><strong>{outline.title}</strong><small>{outline.reference || 'Sem referência'} · {outline.status === 'ready' ? 'Pronto' : 'Rascunho'}</small></span><i className={readerIcon('chevron-right')}/></button>)}
          {outlineChoices.length === 0 && <p className="op-bible-outline-empty">Você ainda não tem esboços. Crie um agora com este versículo.</p>}
        </div>}
        <button type="button" className="op-bible-outline-create" disabled={outlineSaving} onClick={() => { void addToOutline(); }}><i className={readerIcon('plus')}/>{outlineSaving ? 'Salvando...' : 'Criar novo esboço com este versículo'}</button>
      </motion.div>
    </motion.div>}</AnimatePresence>

    <AnimatePresence>{selectorOpen && <motion.div className="op-bible-modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelectorOpen(false)}><motion.div className="op-bible-modal op-bible-book-modal" initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:24,scale:.98}} onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Escolher livro e capítulo"><div className="op-bible-modal-head"><div><span>NAVEGUE PELA PALAVRA</span><h2>Livros e capítulos</h2></div><button type="button" aria-label="Fechar" onClick={() => setSelectorOpen(false)}><i className={readerIcon('times')}/></button></div>
      <div className="op-bible-jump"><input aria-label="Ir para uma referência" value={reference} onChange={e=>setReference(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')goToReference();}} placeholder="Ex.: João 3:16 ou Salmos 23"/><button type="button" onClick={goToReference}>Ir <i className={readerIcon('arrow-right')}/></button></div>
      <div className="op-bible-book-search"><i className={readerIcon('search')}/><input aria-label="Filtrar livros" value={bookFilter} onChange={e=>setBookFilter(e.target.value)} placeholder="Encontrar um livro..."/></div>
      <div className="op-bible-books-list">{(['OT','NT'] as const).map(testament=><section key={testament}><h3>{testament==='OT'?'ANTIGO TESTAMENTO':'NOVO TESTAMENTO'}</h3><div className="op-bible-books-grid">{visibleBooks.filter(b=>b.testament===testament).map(book=><button type="button" key={book.id} className={prefs.bookId===book.id?'is-current':''} onClick={()=>goTo(book.id,1)}>{book.name}<small>{book.chapters} cap.</small></button>)}</div></section>)}</div>
      <div className="op-bible-chapter-grid"><h3>CAPÍTULOS DE {currentBook.name.toUpperCase()}</h3><div>{Array.from({length:currentBook.chapters},(_,i)=><button type="button" className={prefs.chapter===i+1?'is-current':''} key={i} onClick={()=>goTo(currentBook.id,i+1)}>{i+1}</button>)}</div></div>
    </motion.div></motion.div>}</AnimatePresence>

    <AnimatePresence>{settingsOpen && <motion.div className="op-bible-modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSettingsOpen(false)}><motion.div className="op-bible-modal op-bible-settings-modal" role="dialog" aria-modal="true" aria-label="Personalizar leitura" initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:24,scale:.98}} onClick={e=>e.stopPropagation()}><div className="op-bible-modal-head"><div><span>LEITURA DO SEU JEITO</span><h2>Personalizar</h2></div><button type="button" aria-label="Fechar" onClick={()=>setSettingsOpen(false)}><i className={readerIcon('times')}/></button></div>
      <div className="op-bible-setting"><label htmlFor="op-bible-edition">Tradução disponível</label><select id="op-bible-edition" value={prefs.translation} onChange={e=>updatePrefs({translation:e.target.value as TranslationCode})}><option value="pt">Bíblia Livre (português)</option><option value="kjv">King James Version (inglês)</option></select><small>Somente versões configuradas no serviço do projeto.</small></div>
      <div className="op-bible-setting"><label htmlFor="op-bible-size">Tamanho do texto <strong>{prefs.fontSize}px</strong></label><input type="range" id="op-bible-size" min="14" max="34" value={prefs.fontSize} onChange={e=>updatePrefs({fontSize:Number(e.target.value)})}/></div>
      <div className="op-bible-setting"><label htmlFor="op-bible-line">Espaçamento entre linhas <strong>{prefs.lineHeight.toFixed(1)}</strong></label><input type="range" id="op-bible-line" min="1.4" max="2.4" step="0.1" value={prefs.lineHeight} onChange={e=>updatePrefs({lineHeight:Number(e.target.value)})}/></div>
      <div className="op-bible-setting"><label>Tema de leitura</label><div className="op-bible-theme-options">{([{value:'system',label:'Sistema',icon:'desktop'},{value:'light',label:'Claro',icon:'sun'},{value:'sepia',label:'Sépia',icon:'book'},{value:'dark',label:'Escuro',icon:'moon'}] as const).map(t=><button type="button" key={t.value} className={prefs.theme===t.value?'is-current':''} onClick={()=>updatePrefs({theme:t.value})}><i className={readerIcon(t.icon)}/>{t.label}</button>)}</div></div>
      <div className="op-bible-setting"><label>Estilo da escrita</label><div className="op-bible-choice"><button type="button" className={prefs.font==='serif'?'is-current':''} onClick={()=>updatePrefs({font:'serif'})}>Clássica</button><button type="button" className={prefs.font==='sans'?'is-current':''} onClick={()=>updatePrefs({font:'sans'})}>Moderna</button></div></div>
      <div className="op-bible-setting"><label>Largura da leitura</label><div className="op-bible-choice"><button type="button" className={prefs.width==='normal'?'is-current':''} onClick={()=>updatePrefs({width:'normal'})}>Confortável</button><button type="button" className={prefs.width==='wide'?'is-current':''} onClick={()=>updatePrefs({width:'wide'})}>Ampla</button></div></div>
      <label className="op-bible-toggle"><span>Mostrar números dos versículos</span><input type="checkbox" checked={prefs.showNumbers} onChange={e=>updatePrefs({showNumbers:e.target.checked})}/></label>
      <button type="button" className="op-bible-settings-done" onClick={()=>setSettingsOpen(false)}>Aplicar preferências <i className={readerIcon('check')}/></button>
    </motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="op-bible-toast" role="status" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}><i className={readerIcon('check-circle')}/> {toast}</motion.div>}</AnimatePresence>
  </div>;
}
export default BibleReaderPage;
