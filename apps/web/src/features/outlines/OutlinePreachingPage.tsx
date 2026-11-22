import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRepositories, queryKeys } from '@/lib/repositories';
import { routes, useAppNavigate } from '@/app/router';
import { OutlineDocumentView } from './OutlineDocumentView';
import { bibleApi, BIBLE_BOOKS, TRANSLATIONS, type BibleChapter } from '@speaker-draft/core';
import './outlines-preaching-v2.css';

type DocNode = { type?: string; text?: string; attrs?: Record<string, unknown>; content?: DocNode[] };
type ReadingTheme = 'midnight' | 'paper' | 'sepia';
type DisplayMode = 'continuous' | 'slides';
const TIME_WARNINGS = ['Olhe o relógio: seu tempo está chegando ao fim.', 'Atenção ao tempo! Caminhe para a conclusão.', 'Faltam poucos minutos: destaque sua mensagem principal.', 'Seu tempo está acabando. Prepare o encerramento com calma.'];
const TIME_EXCEEDED = [
  "Faraó, Faraó, deixe meu povo ir... porque o tempo aqui já acabou!",
  "O relógio tocou e até o mar Vermelho achou que você esticou demais!",
  "Salomão disse que há tempo para tudo — e o seu tempo já virou vaidade de vaidades!",
  "Paulo pregou até a meia-noite e Êutico caiu da janela... não faça o pessoal dormir de novo, o tempo acabou!",
  "Jesus multiplicou pães e peixes, mas não multiplicou minutos no seu cronômetro!",
  "Sansão tinha muita força, mas nem ele consegue segurar esse relógio que já zerou!",
  "Noé ficou 40 dias na chuva, mas o seu tempo de fala já deu dilúvio!",
  "Jonas ficou 3 dias na baleia, mas você já passou do tempo há 3 minutos!",
  "Davi enfrentou Golias, mas o seu adversário agora é o cronômetro estourado!",
  "Elias pediu fogo do céu, e o seu tempo pegou fogo na linha de chegada!",
  "Pedro andou sobre as águas, mas o seu tempo acabou de afundar!",
  "Moisés bateu na rocha e saiu água; o cronômetro bateu e saiu o sinal de encerramento!",
  "José interpretou sonhos, mas o sonho de mais 5 minutos já acabou!",
  "Gideão reduziu o exército, e agora é hora de reduzir a mensagem porque o tempo acabou!",
  "Neemias reconstruiu os muros, mas não dá para reconstruir esse tempo perdido!",
  "Daniel na cova dos leões ficou calmo, mas o cronômetro já está rugindo!",
  "Zaqueu subiu na árvore para ver melhor, e o tempo já subiu e foi embora!",
  "Marta estava ansiosa com muitas coisas, e o relógio diz: só falta encerrar!",
  "Lázaro saiu do túmulo depois de 4 dias, mas o seu tempo morreu agora mesmo!",
  "Abraão esperou promessas, mas o seu tempo não promete mais nenhum segundo!",
  "Jacó lutou com o anjo até o amanhecer, mas aqui a luta acabou no apito final!",
  "Rute colheu espigas no campo, mas o tempo de colher palavras já fechou o portão!",
  "Ester entrou perante o rei, mas o seu tempo já chegou ao fim da audiência!",
  "Jó perdeu tudo e manteve a fé, mas o seu tempo foi embora e o sinal tocou!",
  "Isaías disse 'eis-me aqui', e o cronômetro respondeu: 'já deu, pode descer'!",
  "Jeremias era o profeta chorão, mas o relógio já está chorando pelo seu tempo!",
  "Ezequiel viu um vale de ossos secos, e o seu tempo já virou poeira!",
  "Oséias casou por ordem divina, e você está casado com o tempo estourado!",
  "Amós falou de prumo, e o seu tempo saiu totalmente do prumo!",
  "Jonas fugiu de Társis, mas do cronômetro ninguém foge!",
  "Ageu cobrou o templo, e o relógio está cobrando o encerramento!",
  "Zacarias viu candelabros, mas a luz vermelha do tempo já acendeu!",
  "Malaquias falou de dízimos, mas não dá para dar o dízimo de um tempo que já acabou!",
  "João Batista gritou no deserto, e o cronômetro está gritando no auditório!",
  "Tomé duvidou para crer, mas pode acreditar: o seu tempo realmente acabou!",
  "Paulo e Silas cantaram na prisão, mas aqui o refrão é: acabou o tempo, irmão!",
  "Barnabé era filho da consolação, mas hoje ninguém consola o seu cronômetro!",
  "Timóteo era jovem, mas o seu tempo já ficou velhinho!",
  "Filemom recebeu uma carta, e você recebeu o aviso: tempo esgotado!",
  "Apocalipse fala de trombetas, e essa trombeta anunciou o fim do seu tempo!",
  "O tempo acabou! Nem com jejum e oração ele volta agora!",
  "A graça é infinita, mas o seu tempo de tela não é!",
  "Amém? Porque o tempo já disse amém e foi embora!",
  "Se continuar falando, o próximo livro da Bíblia vai ser o Livro das Lamentações do Cronômetro!",
  "O Espírito sopra onde quer, mas o relógio já soprou o apito final!",
  "A palavra é viva e eficaz, mas o seu tempo já deu uma cochilada!",
  "Quem tem ouvidos ouça... que o tempo já acabou!",
  "Buscai primeiro o Reino... e depois encerre porque o tempo estourou!",
  "Tudo posso naquele que me fortalece, menos esticar o relógio além do limite!",
  "A alegria do Senhor é a nossa força, mas o tempo já pediu arrego!",
  "Não andeis ansiosos por coisa alguma... mas o cronômetro já está suando frio!",
  "Lâmpada para os meus pés é a tua palavra, e lanterna vermelha na cara é o tempo acabou!",
  "O Senhor é o meu pastor e nada me faltará... exceto mais tempo aqui!",
  "Bendize, ó minha alma, ao Senhor... e encerra porque o relógio já apitou!",
  "Porque dele, e por ele, e para ele são todas as coisas... menos esse tempo extra!",
  "Ame o teu próximo como a ti mesmo... e devolva o microfone que o tempo acabou!",
  "Vigiai e orai... porque o tempo já pegou você de surpresa!",
  "Ide por todo o mundo... mas antes encerre porque o tempo zerou!",
  "Vinde a mim todos os que estão cansados... inclusive o cronômetro!",
  "Eu sou o caminho, a verdade e a vida — e o relógio é o fim do tempo!",
  "Deixa vir a mim as criancinhas... e deixa o tempo ir embora em paz!",
  "Bem-aventurados os pacificadores... que encerram na hora certa!",
  "Não julgueis para não serdes julgados... mas o tempo já deu sua sentença!",
  "Pede e dar-se-á; busca e acharás... mas tempo extra não vai rolar!",
  "Portanto, não vos inquieteis pelo dia de amanhã... mas hoje o tempo já acabou!",
  "No princípio criou Deus os céus e a terra... e no final o relógio encerrou o seu tempo!",
  "E disse Deus: haja luz! E o cronômetro disse: haja fim!",
  "A paz seja convosco... e o tempo já foi com Deus!",
  "Fica conosco, Senhor, porque já é tarde... e o tempo já era!",
  "Maranata! Ora vem, Senhor Jesus... e encerra esse tempo que já deu!",
  "O tempo acabou! Até a arca de Noé já teria zarpado sem você!",
  "Se a mensagem fosse um maratonista, já tinha cruzado a linha de chegada há tempos!",
  "O relógio não tem misericórdia hoje: zerou, acabou, passou!",
  "Mais um segundinho e o cronômetro vai chamar o VAR!",
  "O tempo acabou! Se quiser continuar, só na próxima temporada!",
  "Atenção: o seu tempo acabou de fazer as malas e partir!",
  "O cronômetro pediu música no Fantástico de tanto que você esticou!",
  "Acabou o tempo! Nem o milagre da multiplicação salva esse relógio!",
  "O tempo acabou! Agradeça, dê um sorriso e encerre com chave de ouro!",
  "Faraó endureceu o coração, mas quem endureceu agora foi o cronômetro!",
  "O tempo acabou! O próximo da fila já está aquecendo!",
  "A ampulheta virou, a areia caiu e o seu tempo já foi!",
  "O tempo acabou! Até os profetas menores já teriam terminado esse assunto!",
  "Cronômetro zerado! Hora de fechar o caderno e encerrar!",
  "O tempo acabou! Se esticar mais um pouco, vira apêndice!",
  "Chegamos ao fim do tempo! Que a conclusão seja tão boa quanto o começo!",
  "O tempo acabou! O relógio piscou, suspirou e encerrou!",
  "Acabou o tempo! Nem com reza braba esse cronômetro volta atrás!",
  "O tempo acabou! Hora de passar a bola para o próximo momento!",
  "O relógio avisou, insistiu e agora encerrou oficialmente o seu tempo!",
  "Acabou o tempo! A plateia já está olhando para o relógio de pulso!",
  "O tempo acabou! Até a mula de Balaão diria: 'Ei, já deu!'",
  "O tempo acabou! Hora de amarrar a ideia e encerrar com elegância!",
  "Cronômetro estourado! O tempo foi embora sem deixar recado!",
  "O tempo acabou! Quem cala consente... em encerrar agora!",
  "Acabou o tempo! Se continuar, vai precisar de outro capítulo!",
  "O tempo acabou! O sinal tocou e não vale prorrogação!",
  "O tempo acabou! Que a última frase seja inesquecível — e curta!",
  "Acabou o tempo! Até o relógio de sol já teria escurecido!",
  "O tempo acabou! Hora de encerrar com paz, graça e pontualidade!",
] as const;

function normalizeDocument(input: unknown): DocNode {
  try {
    const parsed: unknown = typeof input === 'string' ? JSON.parse(input) : input;
    if (parsed && typeof parsed === 'object' && 'type' in parsed && (parsed as DocNode).type === 'doc') {
      return parsed as DocNode;
    }
    if (typeof parsed === 'string') return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: parsed }] }] };
  } catch { /* Conteúdo legado */ }
  return { type: 'doc', content: typeof input === 'string' ? [{ type: 'paragraph', content: [{ type: 'text', text: input }] }] : [] };
}

function toSlides(content: unknown): DocNode[] {
  const nodes = normalizeDocument(content).content || [];
  if (!nodes.length) return [{ type: 'doc', content: [] }];
  const slides: DocNode[] = [];
  let group: DocNode[] = [];
  for (const node of nodes) {
    const isHeading = node.type === 'heading';
    // Keep headings with their following content; avoid unbounded slide length.
    if ((isHeading && group.length) || group.length >= 4) {
      slides.push({ type: 'doc', content: group });
      group = [];
    }
    group.push(node);
  }
  if (group.length) slides.push({ type: 'doc', content: group });
  return slides.length ? slides : [{ type: 'doc', content: [] }];
}

function formatTime(s: number) {
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function IconButton({ icon, label, onClick, active = false, disabled = false, className = '' }: {
  icon: string; label: string; onClick: () => void; active?: boolean; disabled?: boolean; className?: string;
}) {
  return <button type="button" className={`op-pres-icon-btn ${active ? 'is-active' : ''} ${className}`} aria-label={label} title={label} onClick={onClick} disabled={disabled}><i className={`pi ${icon}`} aria-hidden="true" /></button>;
}

export function OutlinePreachingPage() {
  const { id } = useParams();
  const navigate = useAppNavigate();
  const repos = getRepositories();
  const { data: outline, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.outline(id || ''), queryFn: () => repos.outlines.getById(id!), enabled: !!id,
  });
  const [mode, setMode] = useState<DisplayMode>('continuous');
  const [theme, setTheme] = useState<ReadingTheme>('midnight');
  const [fontSize, setFontSize] = useState(26);
  const [lineHeight, setLineHeight] = useState(1.75);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [focus, setFocus] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDock, setShowDock] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [dockOffset, setDockOffset] = useState({ x: 0, y: 0 });
  const dockDrag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(30);
  const [clockNow, setClockNow] = useState(() => new Date());
  const [bibleOpen, setBibleOpen] = useState(false);
  const [bibleBookId, setBibleBookId] = useState(19);
  const [bibleChapterNum, setBibleChapterNum] = useState(23);
  const [bibleData, setBibleData] = useState<BibleChapter | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleError, setBibleError] = useState<string | null>(null);
  const [selectedBibleVerse, setSelectedBibleVerse] = useState<number | null>(null);
  const [bibleToast, setBibleToast] = useState('');
  const [warningDismissedAt, setWarningDismissedAt] = useState<number | null>(null);
  const [flashesEnabled, setFlashesEnabled] = useState(true);
  const [phraseOffset, setPhraseOffset] = useState(0);
  const bibleRequestRef = useRef(0);
  const clockLabel = useMemo(() => clockNow.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), [clockNow]);
  const totalTarget = Math.max(1, targetMinutes) * 60;
  const timeRatio = seconds / totalTarget;
  const timePhase = timeRatio >= 1 ? 'over' : timeRatio >= .85 ? 'danger' : timeRatio >= .65 ? 'warning' : 'safe';
  const remainingSeconds = Math.max(0, totalTarget - seconds);
  const showWarning = running && timeRatio >= .65 && (warningDismissedAt === null || seconds - warningDismissedAt >= 45);
  const warningList = timeRatio >= 1 ? TIME_EXCEEDED : TIME_WARNINGS;
  // 100 frases fornecidas pelo usuário: percorre cada uma sem sorteio nem repetições prematuras.
  const exceededPhraseIndex = (Math.floor(Math.max(0, seconds - totalTarget) / 12) + phraseOffset) % TIME_EXCEEDED.length;
  const warningMessage = timeRatio >= 1
    ? TIME_EXCEEDED[exceededPhraseIndex]
    : warningList[Math.floor(Math.max(0, seconds - Math.floor(totalTarget * .65)) / 22) % warningList.length];
  const currentBibleBook = BIBLE_BOOKS.find(book => book.id === bibleBookId) || BIBLE_BOOKS[18];


  const slides = useMemo(() => toSlides(outline?.content), [outline?.content]);
  const goBack = useCallback(() => {
    if (id) navigate.goToOutlinePreview(id);
    else navigate.goTo(routes.outlines);
  }, [id, navigate]);
  const nextSlide = useCallback(() => setSlideIndex(i => Math.min(slides.length - 1, i + 1)), [slides.length]);
  const previousSlide = useCallback(() => setSlideIndex(i => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [running]);
  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!bibleOpen) return;
    const requestId = ++bibleRequestRef.current;
    setBibleLoading(true);
    setBibleError(null);
    setBibleData(null);
    setSelectedBibleVerse(null);
    bibleApi.getChapter(bibleBookId, bibleChapterNum, 'pt')
      .then(data => { if (requestId === bibleRequestRef.current) setBibleData(data); })
      .catch(err => { if (requestId === bibleRequestRef.current) setBibleError(err instanceof Error ? err.message : 'Não foi possível carregar a Bíblia.'); })
      .finally(() => { if (requestId === bibleRequestRef.current) setBibleLoading(false); });
    return () => { bibleRequestRef.current += 1; };
  }, [bibleOpen, bibleBookId, bibleChapterNum]);
  useEffect(() => {
    if (!bibleOpen && !showSettings) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation();
        if (bibleOpen) setBibleOpen(false);
        else setShowSettings(false);
      }
    };
    window.addEventListener('keydown', onEsc, true);
    return () => window.removeEventListener('keydown', onEsc, true);
  }, [bibleOpen, showSettings]);
  const copyBibleVerse = async (verseNumber: number, text: string) => {
    try {
      await navigator.clipboard.writeText(`${text} — ${currentBibleBook.name} ${bibleChapterNum}:${verseNumber} (${TRANSLATIONS.pt.name})`);
      setBibleToast('Versículo copiado!');
      window.setTimeout(() => setBibleToast(''), 2400);
    } catch { setBibleToast('Não foi possível copiar.'); }
  };
  const changeBibleChapter = (delta: number) => {
    setBibleChapterNum(previous => Math.min(currentBibleBook.chapters, Math.max(1, previous + delta)));
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'b' && !event.ctrlKey && !event.metaKey && !event.altKey && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLSelectElement) && !(event.target instanceof HTMLElement && event.target.isContentEditable)) {
        if (!showSettings) { event.preventDefault(); setBibleOpen(open => !open); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSettings]);
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if (bibleOpen) return;
      if (e.key === 'Escape') { if (showSettings) setShowSettings(false); else if (focus) setFocus(false); else if (!document.fullscreenElement) goBack(); return; }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setFontSize(v => Math.min(52, v + 2)); }
      if (e.key === '-') { e.preventDefault(); setFontSize(v => Math.max(16, v - 2)); }
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) setFocus(v => !v);
      if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) setRunning(v => !v);
      if (e.key === ' ' && mode === 'slides') { e.preventDefault(); nextSlide(); }
      if (mode === 'slides' && (e.key === 'ArrowRight' || e.key === 'PageDown')) { e.preventDefault(); nextSlide(); }
      if (mode === 'slides' && (e.key === 'ArrowLeft' || e.key === 'PageUp')) { e.preventDefault(); previousSlide(); }
      if (mode === 'continuous' && e.key === 'ArrowDown') scrollRef.current?.scrollBy({ top: 180, behavior: 'smooth' });
      if (mode === 'continuous' && e.key === 'ArrowUp') scrollRef.current?.scrollBy({ top: -180, behavior: 'smooth' });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, focus, showSettings, bibleOpen, goBack, nextSlide, previousSlide]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* Fullscreen pode não estar disponível neste navegador. */ }
  };
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maximum = el.scrollHeight - el.clientHeight;
    setProgress(maximum > 0 ? Math.round((el.scrollTop / maximum) * 100) : 100);
  };
  const changeMode = (value: DisplayMode) => { setMode(value); setSlideIndex(0); setProgress(0); scrollRef.current?.scrollTo({ top: 0 }); };
  const onDockPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    dockDrag.current = { x: e.clientX, y: e.clientY, startX: dockOffset.x, startY: dockOffset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDockPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dockDrag.current) return;
    const d = dockDrag.current;
    setDockOffset({
      x: Math.max(-window.innerWidth / 2 + 90, Math.min(window.innerWidth / 2 - 90, d.startX + e.clientX - d.x)),
      y: Math.max(-window.innerHeight + 145, Math.min(15, d.startY + e.clientY - d.y)),
    });
  };
  const onDockPointerUp = () => { dockDrag.current = null; };

  const view = <div className={`op-presentation op-pres-${theme} ${focus ? 'op-pres-focus' : ''} ${running && timePhase === 'over' ? 'op-pres-overdue' : ''}`}>
    {running && timePhase === 'over' && flashesEnabled && <div key={`flash-${exceededPhraseIndex}`} className="op-pres-overdue-flash" aria-hidden="true" />}
    <div className="op-pres-aura op-pres-aura-one" aria-hidden="true" />
    <div className="op-pres-aura op-pres-aura-two" aria-hidden="true" />
    <div className={`op-pres-time-edge is-${timePhase}`} aria-hidden="true" style={{ width: `${Math.min(100, timeRatio * 100)}%` }} />
    <div className="op-pres-progress" aria-hidden="true"><span style={{ width: `${mode === 'slides' ? ((slideIndex + 1) / slides.length) * 100 : progress}%` }} /></div>
    {isLoading ? <div className="op-pres-screen-message"><i className="pi pi-spin pi-spinner"/><h2>Preparando sua apresentação</h2><p>Carregando o esboço...</p></div> :
      !outline || isError ? <div className="op-pres-screen-message"><i className="pi pi-exclamation-circle"/><h2>Não foi possível abrir o esboço</h2><p>Verifique se ele ainda está disponível.</p><div className="op-pres-message-actions"><button onClick={() => void refetch()}>Tentar novamente</button><button onClick={goBack}>Voltar</button></div></div> : <>
      <header className="op-pres-header">
        <div className="op-pres-brand"><span className="op-pres-logo"><i className="pi pi-book"/></span><span><strong>oPregador</strong><small>APRESENTAÇÃO</small></span></div>
        <div className="op-pres-header-center"><span className="op-pres-kicker">MODO PREGAÇÃO</span><h1 title={outline.title}>{outline.title}</h1><p>{outline.reference || 'Mensagem em apresentação'}</p></div>
        <div className="op-pres-header-actions">
          <span className="op-pres-wall-clock" title="Horário atual"><i className="pi pi-clock"/>{clockLabel}</span><span className={`op-pres-clock is-${timePhase}`} aria-label={`Tempo de apresentação ${formatTime(seconds)} de ${targetMinutes} minutos`}><i className="pi pi-stopwatch"/>{formatTime(seconds)}<small> / {targetMinutes} min</small></span>
          <IconButton icon={running ? 'pi-pause' : 'pi-play'} label={running ? 'Pausar cronômetro' : 'Iniciar cronômetro'} onClick={() => setRunning(v => !v)} active={running}/>
          <button type="button" className="op-pres-bible-action" onClick={() => setBibleOpen(true)}><i className="pi pi-book"/> Bíblia</button>
          <IconButton icon="pi-ellipsis-h" label="Configurações" onClick={() => setShowSettings(v => !v)} active={showSettings}/>
          <IconButton icon="pi-external-link" label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'} onClick={() => void toggleFullscreen()} active={fullscreen}/>
          <IconButton icon="pi-times" label="Encerrar apresentação" onClick={goBack}/>
        </div>
      </header>
      <div className={`op-pres-timer-strip is-${timePhase}`} role="group" aria-label="Controle de duração da pregação">
        <span className="op-pres-timer-dot" aria-hidden="true" />
        <strong>{timeRatio >= 1 ? 'Tempo excedido' : timeRatio >= .85 ? 'Hora de concluir' : timeRatio >= .65 ? 'Atenção ao tempo' : 'No ritmo planejado'}</strong>
        <span className="op-pres-timer-detail">{timeRatio >= 1 ? `+${formatTime(seconds - totalTarget)} além da meta` : `${formatTime(remainingSeconds)} restantes`}</span>
        <div className="op-pres-timer-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(timeRatio * 100))}><span style={{ width: `${Math.min(100, timeRatio * 100)}%` }}/></div>
        <button type="button" className="op-pres-timer-edit" onClick={() => setShowSettings(true)} title="Editar meta de duração"><i className="pi pi-pencil"/> Meta: {targetMinutes} min</button>
        {timePhase === 'over' && <button type="button" className="op-pres-flash-toggle" onClick={() => setFlashesEnabled(v => !v)} aria-pressed={flashesEnabled} title={flashesEnabled ? 'Desativar flashes vermelhos' : 'Ativar flashes vermelhos'}><i className={flashesEnabled ? 'pi pi-eye-slash' : 'pi pi-eye'}/> {flashesEnabled ? 'Parar flashes' : 'Ativar flashes'}</button>}
      </div>
      {showWarning && <aside key={timeRatio >= 1 ? `phrase-${exceededPhraseIndex}` : 'before-limit'} className={`op-pres-time-warning is-${timePhase} ${timeRatio >= 1 ? 'op-pres-funny-warning' : ''}`} role="status" aria-live="polite"><span className="op-pres-time-warning-icon"><i className={timeRatio >= 1 ? 'pi pi-bolt' : 'pi pi-bell'}/></span><div className="op-pres-warning-copy"><strong>{timeRatio >= 1 ? '🚨 TEMPO ESGOTADO · OLHA O RELÓGIO!' : 'Atenção, pregador!'}</strong><p>{warningMessage}</p>{timeRatio >= 1 && <span className="op-pres-warning-count">Frase {exceededPhraseIndex + 1} de {TIME_EXCEEDED.length} · muda a cada 12 s</span>}</div>{timeRatio >= 1 && <button type="button" className="op-pres-next-phrase" onClick={() => setPhraseOffset(v => v + 1)} title="Mostrar próxima frase" aria-label="Próxima frase"><i className="pi pi-refresh"/></button>}<button type="button" onClick={() => setWarningDismissedAt(seconds)} title="Dispensar aviso por 45 segundos" aria-label="Dispensar aviso"><i className="pi pi-times"/></button></aside>}
      {!focus && <div className="op-pres-modebar"><div className="op-pres-mode-switch" role="group" aria-label="Modo de apresentação"><button className={mode === 'continuous' ? 'active' : ''} onClick={() => changeMode('continuous')}><i className="pi pi-align-left"/> Leitura contínua</button><button className={mode === 'slides' ? 'active' : ''} onClick={() => changeMode('slides')}><i className="pi pi-images"/> Slides</button></div><div className="op-pres-mode-hint"><i className="pi pi-sparkles"/> Concentre-se na mensagem, não nos controles.</div></div>}
      <div ref={scrollRef} onScroll={onScroll} className={`op-pres-reading ${mode === 'slides' ? 'is-slides' : ''}`} onTouchStart={e => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }} onTouchEnd={e => { if (mode !== 'slides' || !touchStart.current) return; const dx = e.changedTouches[0].clientX - touchStart.current.x; const dy = e.changedTouches[0].clientY - touchStart.current.y; if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? nextSlide : previousSlide)(); touchStart.current = null; }}>
        {mode === 'continuous' ? <article className="op-pres-document" style={{ fontSize: `${fontSize}px`, lineHeight }}><div className="op-pres-doc-meta"><span className="op-pres-rule"/><span>ESBOÇO DE PREGAÇÃO</span><span className="op-pres-rule"/></div><h2 className="op-pres-document-title">{outline.title}</h2>{outline.reference && <p className="op-pres-document-reference"><i className="pi pi-bookmark"/> {outline.reference}</p>}<div className="op-pres-document-body"><OutlineDocumentView content={outline.content}/></div><div className="op-pres-end-mark"><i className="pi pi-heart"/> Fim da mensagem</div></article> :
          <article className="op-pres-slide" key={slideIndex} style={{ fontSize: `${fontSize}px`, lineHeight }}><div className="op-pres-slide-caption"><span>oPregador <b>•</b> {outline.reference || 'Mensagem'}</span><span>{String(slideIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span></div><div className="op-pres-slide-content"><OutlineDocumentView content={slides[slideIndex]}/></div><div className="op-pres-slide-watermark">{outline.title}</div></article>}
      </div>
      {mode === 'slides' && <div className="op-pres-slide-controls"><IconButton icon="pi-arrow-left" label="Slide anterior" onClick={previousSlide} disabled={slideIndex === 0}/><span><strong>{slideIndex + 1}</strong> de {slides.length}</span><IconButton icon="pi-arrow-right" label="Próximo slide" onClick={nextSlide} disabled={slideIndex >= slides.length - 1}/></div>}
      <div className="op-pres-bottom-info"><span><i className="pi pi-shield"/> Apresentação privada</span><span>{mode === 'continuous' ? `${progress}% de leitura` : `Slide ${slideIndex + 1} de ${slides.length}`}</span></div>
      {!showDock ? <button className="op-pres-dock-restore" onClick={() => setShowDock(true)} aria-label="Mostrar controles"><i className="pi pi-sliders-h"/></button> : <div className="op-pres-glass-dock" style={{ transform: `translate(calc(-50% + ${dockOffset.x}px), ${dockOffset.y}px)` }}>
        <button className="op-pres-dock-handle" aria-label="Arrastar painel" title="Arraste para mover" onPointerDown={onDockPointerDown} onPointerMove={onDockPointerMove} onPointerUp={onDockPointerUp} onPointerCancel={onDockPointerUp}><i className="pi pi-ellipsis-v"/></button>
        <span className="op-pres-dock-sep"/>
        <IconButton icon="pi-minus" label="Diminuir fonte" onClick={() => setFontSize(v => Math.max(16, v - 2))}/>
        <span className="op-pres-font-indicator">{fontSize}<small>px</small></span>
        <IconButton icon="pi-plus" label="Aumentar fonte" onClick={() => setFontSize(v => Math.min(52, v + 2))}/>
        <span className="op-pres-dock-sep"/>
        <IconButton icon="pi-eye" label={focus ? 'Mostrar controles da apresentação' : 'Modo foco'} onClick={() => setFocus(v => !v)} active={focus}/>
        <IconButton icon="pi-book" label="Abrir Bíblia" onClick={() => setBibleOpen(true)} active={bibleOpen}/>
        <IconButton icon="pi-palette" label="Aparência" onClick={() => setShowSettings(v => !v)} active={showSettings}/>
        <IconButton icon="pi-window-minimize" label="Ocultar barra" onClick={() => setShowDock(false)}/>
      </div>}
      {bibleOpen && <div className="op-pres-bible-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setBibleOpen(false); }}>
        <section className="op-pres-bible-panel" role="dialog" aria-modal="true" aria-label="Consultar Bíblia durante a pregação">
          <div className="op-pres-bible-heading"><div className="op-pres-bible-icon"><i className="pi pi-book"/></div><div><span>CONSULTA RÁPIDA · BÍBLIA LIVRE</span><h2>Bíblia na pregação</h2><p>Leia e consulte passagens sem sair do esboço.</p></div><IconButton icon="pi-times" label="Fechar Bíblia" onClick={() => setBibleOpen(false)}/></div>
          <div className="op-pres-bible-choosers"><label>Livro<select value={bibleBookId} onChange={e => { const next = Number(e.target.value); setBibleBookId(next); setBibleChapterNum(1); }}>{BIBLE_BOOKS.map(book => <option key={book.id} value={book.id}>{book.name}</option>)}</select></label><label>Capítulo<select value={bibleChapterNum} onChange={e => setBibleChapterNum(Number(e.target.value))}>{Array.from({length: currentBibleBook.chapters}, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></div>
          <div className="op-pres-bible-chapter-nav"><button onClick={() => changeBibleChapter(-1)} disabled={bibleChapterNum === 1} aria-label="Capítulo anterior"><i className="pi pi-chevron-left"/></button><strong>{currentBibleBook.name} {bibleChapterNum}</strong><button onClick={() => changeBibleChapter(1)} disabled={bibleChapterNum === currentBibleBook.chapters} aria-label="Próximo capítulo"><i className="pi pi-chevron-right"/></button></div>
          <div className="op-pres-bible-verses" aria-live="polite">
            {bibleLoading ? <div className="op-pres-bible-message"><i className="pi pi-spin pi-spinner"/> Carregando passagem...</div> : bibleError ? <div className="op-pres-bible-message is-error"><i className="pi pi-exclamation-triangle"/><p>{bibleError}</p><button onClick={() => { setBibleOpen(false); window.setTimeout(() => setBibleOpen(true), 0); }}>Tentar novamente</button></div> : bibleData?.verses.length ? bibleData.verses.map(verse => <div key={`${verse.chapter}-${verse.verse}`} className={`op-pres-bible-verse ${selectedBibleVerse === verse.verse ? 'is-selected' : ''}`}><button type="button" onClick={() => setSelectedBibleVerse(verse.verse)} aria-label={`Selecionar ${currentBibleBook.name} ${bibleChapterNum}:${verse.verse}`}><span>{verse.verse}</span><span>{verse.text || 'Versículo sem texto retornado pelo provedor.'}</span></button>{selectedBibleVerse === verse.verse && <button type="button" className="op-pres-bible-copy" onClick={() => void copyBibleVerse(verse.verse, verse.text)}><i className="pi pi-copy"/> Copiar</button>}</div>) : <div className="op-pres-bible-message">Selecione um livro e capítulo para consultar.</div>}
          </div><div className="op-pres-bible-footer"><span>Texto bíblico: {TRANSLATIONS.pt.name} · <a href="https://ebible.org/Bible/details.php?id=porbr2018" target="_blank" rel="noopener noreferrer">Créditos e licença</a></span><span role="status">{bibleToast || 'Atalho: B para abrir ou fechar'}</span></div>
        </section>
      </div>}
      {showSettings && <div className="op-pres-settings-backdrop" onClick={() => setShowSettings(false)}><section className="op-pres-settings" role="dialog" aria-modal="true" aria-label="Preferências da apresentação" onClick={e => e.stopPropagation()}><div className="op-pres-settings-title"><div><span>PERSONALIZAÇÃO</span><h2>Seu espaço de pregação</h2></div><IconButton icon="pi-times" label="Fechar configurações" onClick={() => setShowSettings(false)}/></div><p className="op-pres-settings-desc">Adapte a leitura ao ambiente e ao seu ritmo.</p><div className="op-pres-goal-control"><label htmlFor="op-pres-target">META DE DURAÇÃO (MINUTOS)</label><div><input id="op-pres-target" type="number" min="1" max="240" value={targetMinutes} onChange={e => { const n = Number(e.target.value); if (Number.isFinite(n) && n >= 1) setTargetMinutes(Math.max(1, Math.min(240, Math.round(n)))); }} /><span>min</span></div><p>Os alertas aparecem aos 65%, 85% e 100% da meta. Ao ultrapassar a meta, as 100 frases se alternam a cada 12 segundos.</p><label className="op-pres-flash-preference"><input type="checkbox" checked={flashesEnabled} onChange={e => setFlashesEnabled(e.target.checked)} /> Ativar flashes vermelhos suaves após o tempo esgotar</label></div><label>APARÊNCIA</label><div className="op-pres-theme-options"><button className={theme === 'midnight' ? 'chosen' : ''} onClick={() => setTheme('midnight')}><span className="sample midnight"/> Escuro</button><button className={theme === 'paper' ? 'chosen' : ''} onClick={() => setTheme('paper')}><span className="sample paper"/> Claro</button><button className={theme === 'sepia' ? 'chosen' : ''} onClick={() => setTheme('sepia')}><span className="sample sepia"/> Sépia</button></div><label htmlFor="op-pres-size">TAMANHO DO TEXTO <span>{fontSize}px</span></label><input id="op-pres-size" type="range" min="16" max="52" step="1" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}/><label htmlFor="op-pres-spacing">ESPAÇAMENTO <span>{lineHeight.toFixed(2)}×</span></label><input id="op-pres-spacing" type="range" min="1.3" max="2.2" step="0.05" value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))}/><div className="op-pres-settings-divider"/><button className="op-pres-wide-action" onClick={() => { setRunning(false); setSeconds(0); }}><i className="pi pi-refresh"/> Zerar cronômetro</button><button className="op-pres-wide-action" onClick={() => { setFontSize(26); setLineHeight(1.75); setTheme('midnight'); setDockOffset({ x: 0, y: 0 }); }}><i className="pi pi-replay"/> Restaurar preferências</button><div className="op-pres-shortcuts">Atalhos: <b>← →</b> slides · <b>+ −</b> texto · <b>F</b> foco · <b>T</b> cronômetro</div></section></div>}
      </>}
  </div>;

  // A página da rota é montada dentro do layout comum; portal isola a apresentação da sidebar.
  return createPortal(view, document.body);
}
