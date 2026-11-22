import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '@/app/providers';
import { bibleApi, BIBLE_BOOKS, findBibleBook, parseBibleReference, type BibleVerse } from '@speaker-draft/core';
import './bible-reader-premium.css';

const suggestions = ['Salmos 23', 'João 3:16', 'Romanos 8:28', 'Filipenses 4:13', 'Isaías 53', 'Mateus 5'];
export function BibleSearchPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useThemeContext();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const search = useCallback(async (q: string) => {
    const input = q.trim(); if (!input) return;
    setSearched(input); setError(''); setVerses([]);
    const parsed = parseBibleReference(input);
    const onlyBook = !parsed ? findBibleBook(input) : undefined;
    const bookId = parsed?.bookId ?? onlyBook?.id;
    const chapter = parsed?.chapterStart ?? (onlyBook ? 1 : undefined);
    if (!bookId || !chapter) {
      setError('Por enquanto, a pesquisa funciona por referências (ex.: João 3:16). A busca por palavras e assuntos depende de um índice bíblico que ainda não foi integrado.');
      return;
    }
    setLoading(true);
    try {
      const result = await bibleApi.getChapter(bookId, chapter, 'pt');
      const filtered = parsed?.verseStart ? result.verses.filter(v => v.verse >= parsed.verseStart! && v.verse <= (parsed.verseEnd ?? parsed.verseStart!)) : result.verses;
      setVerses(filtered);
      setCurrentBookId(bookId); setCurrentChapter(chapter);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível carregar essa referência.'); }
    finally { setLoading(false); }
  }, []);
  const openReader = () => {
    const book = BIBLE_BOOKS.find(b => b.id === currentBookId);
    if (book && currentChapter) navigate(`/bible/${book.abbrev.toLowerCase()}/${currentChapter}`);
  };
  return <div className="op-bible-v5 op-bible-search" data-reader-theme={resolvedTheme === 'dark' ? 'dark' : 'light'}>
    <header className="op-bible-hero"><div className="op-bible-eyebrow"><i className="pi pi-search"/> EXPLORAR AS ESCRITURAS</div><div className="op-bible-hero-main"><div><p className="op-bible-overline">ESTUDO E DESCOBERTA</p><h1>Buscar na <em>Palavra</em></h1><p>Encontre livros, capítulos e versículos com rapidez e clareza.</p></div><button className="op-bible-action" onClick={() => navigate('/bible')} type="button"><i className="pi pi-arrow-left"/> Voltar à leitura</button></div></header>
    <section className="op-bible-search-panel"><form onSubmit={e => {e.preventDefault(); void search(query);}} className="op-bible-search-form"><label htmlFor="op-bible-search-input">PESQUISAR REFERÊNCIA BÍBLICA</label><div className="op-bible-search-input-row"><i className="pi pi-search"/><input id="op-bible-search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: Salmos 23, João 3:16, Romanos 8:28" autoComplete="off"/><button type="submit" disabled={loading}>{loading?'Buscando...':'Pesquisar'} <i className="pi pi-arrow-right"/></button></div><small>Versão disponível: Bíblia Livre (português brasileiro). Pesquisa por palavras ainda não integrada.</small></form>
      {!searched && <div className="op-bible-suggestions"><p>COMECE POR UMA PASSAGEM</p><div>{suggestions.map(s => <button type="button" key={s} onClick={() => {setQuery(s); void search(s);}}>{s} <i className="pi pi-arrow-up-right"/></button>)}</div></div>}
      {error && <div className="op-bible-search-warning" role="alert"><i className="pi pi-info-circle"/><p>{error}</p></div>}
      {loading && <div className="op-bible-loading"><span className="op-bible-spinner"/> Carregando passagem...</div>}
      {!loading && verses.length > 0 && <div className="op-bible-search-results"><div className="op-bible-search-results-head"><div><span>PASSAGEM ENCONTRADA</span><h2>{searched}</h2><p>{verses.length} {verses.length === 1 ? 'versículo' : 'versículos'}</p></div><button type="button" onClick={openReader}>Abrir no leitor <i className="pi pi-arrow-right"/></button></div><div className="op-bible-search-verses">{verses.map((verse,index) => <motion.div key={`${verse.book_id}-${verse.chapter}-${verse.verse}`} initial={index < 12 ? {opacity:0,y:10} : false} animate={{opacity:1,y:0}} transition={{delay:Math.min(index,12)*.025}}><span>{verse.verse}</span><p>{verse.text}</p><button type="button" title="Copiar versículo" aria-label={`Copiar versículo ${verse.verse}`} onClick={() => {void navigator.clipboard.writeText(`${verse.text} — ${verse.book_name} ${verse.chapter}:${verse.verse}`).catch(()=>{});}}><i className="pi pi-copy"/></button></motion.div>)}</div></div>}
    </section>
  </div>;
}
export default BibleSearchPage;
