import { useEffect, useState, type ReactNode } from "react";
import { type CalendarEvent, type Outline } from "@speaker-draft/core";
import { workspaceStore } from "@speaker-draft/data";

type Page =
  | "home"
  | "outlines"
  | "editor"
  | "bible"
  | "agenda"
  | "library"
  | "preaching"
  | "search"
  | "settings"
  | "login";

type IconName =
  | "home"
  | "file"
  | "book"
  | "calendar"
  | "library"
  | "search"
  | "plus"
  | "more"
  | "clock"
  | "arrow"
  | "chevron"
  | "settings"
  | "bell"
  | "star"
  | "folder"
  | "tag"
  | "check"
  | "sun"
  | "moon"
  | "menu"
  | "close"
  | "bold"
  | "italic"
  | "list"
  | "eye"
  | "upload"
  | "grid"
  | "filter"
  | "note"
  | "shield"
  | "expand";

const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
  file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
  book: <><path d="M4 3h6a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4z" /><path d="M20 3h-4a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h4z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  library: <><path d="M4 20V5h4v15M10 20V3h4v17M16 20V7h4v13M2 20h20" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrow: <path d="m9 18 6-6-6-6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  folder: <path d="M3 6h7l2 2h9v11H3z" />,
  tag: <><path d="M20 13 13 20 4 11V4h7z" /><circle cx="8.5" cy="8.5" r="1" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 15.2A9 9 0 0 1 8.8 4 9 9 0 1 0 20 15.2Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  bold: <><path d="M8 4h5a4 4 0 0 1 0 8H8zM8 12h6a4 4 0 0 1 0 8H8z" /></>,
  italic: <path d="M10 4h8M6 20h8M14 4 10 20" />,
  list: <><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  upload: <><path d="M12 16V3M7 8l5-5 5 5" /><path d="M4 14v7h16v-7" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  note: <><path d="M5 3h14v18H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  expand: <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Button({ children, icon, variant = "primary", onClick, className = "" }: { children?: ReactNode; icon?: IconName; variant?: "primary" | "secondary" | "ghost" | "icon"; onClick?: () => void; className?: string }) {
  return <button className={`button ${variant} ${className}`} onClick={onClick}>{icon && <Icon name={icon} size={18} />}{children}</button>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand"><div className="brand-mark"><span /><span /><span /></div>{!compact && <strong>SpeakerDraft</strong>}</div>;
}

const nav: { id: Page; label: string; icon: IconName }[] = [
  { id: "home", label: "Início", icon: "home" },
  { id: "outlines", label: "Esboços", icon: "file" },
  { id: "bible", label: "Bíblia", icon: "book" },
  { id: "agenda", label: "Agenda", icon: "calendar" },
  { id: "library", label: "Biblioteca", icon: "library" },
  { id: "search", label: "Pesquisa", icon: "search" },
];

function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return <aside className="sidebar">
    <Brand />
    <nav className="nav-list" aria-label="Principal">{nav.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}</nav>
    <div className="sidebar-foot">
      <button className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => setPage("settings")}><Icon name="settings" /><span>Configurações</span></button>
      <button className="profile-row" onClick={() => setPage("settings")}><span className="avatar">SD</span><span><strong>Seu perfil</strong><small>Preferências da conta</small></span><Icon name="more" /></button>
    </div>
  </aside>;
}

function Topbar({ title, setPage, onMenu }: { title?: string; setPage: (p: Page) => void; onMenu: () => void }) {
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMenu} aria-label="Abrir menu"><Icon name="menu" /></button>
    {title && <span className="topbar-title">{title}</span>}
    <button className="global-search" onClick={() => setPage("search")}><Icon name="search" size={18} /><span>Buscar em tudo...</span><kbd>⌘ K</kbd></button>
    <div className="top-actions"><Button icon="bell" variant="icon" onClick={() => window.alert("Você está em dia. Nenhuma notificação nova.")} /><button className="mobile-avatar" onClick={() => setPage("settings")}>SD</button></div>
  </header>;
}

function PageHead({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="page-head"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function Dashboard({ setPage, outlines, events, noteCount, onNewOutline, onNewNote, onNewEvent }: { setPage: (p: Page) => void; outlines: Outline[]; events: CalendarEvent[]; noteCount: number; onNewOutline: () => void; onNewNote: () => void; onNewEvent: () => void }) {
  const first = outlines[0];
  const nextEvent = events.find((event) => new Date(`${event.date}T${event.time}`).getTime() >= Date.now());
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Bom dia" : greetingHour < 18 ? "Boa tarde" : "Boa noite";
  return <main className="page dashboard">
    <section className="mobile-home-intro">
      <span className="eyebrow">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date())}</span>
      <div><h1>{greeting}, que bom ter você.</h1><span className="mobile-weather"><Icon name="sun" size={16} /></span></div>
      <p>O que vamos preparar hoje?</p>
      <button className="mobile-search-card" onClick={() => setPage("search")}><Icon name="search" /><span>Buscar em seus estudos</span></button>
      <div className="mobile-quick-actions">
        <button onClick={onNewOutline}><span><Icon name="plus" /></span>Novo esboço</button>
        <button onClick={() => setPage("bible")}><span><Icon name="book" /></span>Ler Bíblia</button>
        <button onClick={onNewEvent}><span><Icon name="calendar" /></span>Compromisso</button>
        <button onClick={() => setPage("library")}><span><Icon name="library" /></span>Biblioteca</button>
      </div>
    </section>
    <PageHead eyebrow={new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date())} title={`${greeting}, que bom ter você.`} copy="Continue de onde parou ou comece algo novo." action={<Button icon="plus" onClick={onNewOutline}>Novo esboço</Button>} />
    {first && <section className="continue-card" onClick={() => setPage("editor")}>
      <div className="continue-icon"><Icon name="file" /></div>
      <div className="continue-copy"><span className="eyebrow">CONTINUAR ESCREVENDO</span><h2>{first.title}</h2><p>{first.reference || "Sem referência"} · {first.category}</p><div className="progress"><span /></div></div>
      <Button variant="secondary">Abrir esboço <Icon name="arrow" size={16} /></Button>
    </section>}
    <div className="activity-summary"><span><strong>{outlines.filter((item) => !item.id.startsWith("demo-")).length}</strong><small>Esboços criados</small></span><span><strong>{noteCount}</strong><small>Anotações</small></span><span><strong>{events.length}</strong><small>Compromissos</small></span></div>
    <div className="content-grid">
      <section className="recent-section"><div className="section-title"><h2>Esboços recentes</h2><button onClick={() => setPage("outlines")}>Ver todos <Icon name="arrow" size={15} /></button></div>
        <div className="outline-list">{outlines.length ? outlines.slice(0, 4).map((item, i) => <button className="outline-row" key={item.id} onClick={() => setPage("editor")}><span className={`file-tile ${i === 0 ? "gold" : "green"}`}><Icon name="file" /></span><span className="outline-main"><strong>{item.title}</strong><small>{item.reference || "Sem referência"} · {item.category}</small></span><span className="tag">{item.status === "ready" ? "Pronto" : "Rascunho"}</span><Icon name="more" size={19} /></button>) : <div className="empty-state"><strong>Seu espaço começa com uma ideia.</strong><p>Crie um esboço para organizar sua próxima mensagem.</p><Button icon="plus" onClick={onNewOutline}>Criar esboço</Button></div>}</div>
      </section>
      <aside className="right-rail">
        <div className="section-title"><h2>Próximos</h2><button onClick={() => setPage("agenda")}>Agenda <Icon name="arrow" size={15} /></button></div>
        {nextEvent ? <button className="event" onClick={() => setPage("agenda")}><span className="date-box"><b>{new Date(`${nextEvent.date}T00:00:00`).getDate()}</b><small>{new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(`${nextEvent.date}T00:00:00`))}</small></span><span><strong>{nextEvent.title}</strong><small><Icon name="clock" size={14} /> {nextEvent.date} · {nextEvent.time}</small><em>{nextEvent.reference || nextEvent.kind}</em></span></button> : <div className="empty-state"><strong>Nenhum compromisso próximo</strong><p>Adicione um evento para planejar sua semana.</p><Button variant="secondary" icon="plus" onClick={onNewEvent}>Adicionar evento</Button></div>}
        <div className="quick-links">
          <button onClick={() => setPage("bible")}><span className="quick-icon green"><Icon name="book" /></span><span><strong>Abrir Bíblia</strong><small>Continue em Salmos 27</small></span><Icon name="arrow" /></button>
          <button onClick={onNewNote}><span className="quick-icon gold"><Icon name="plus" /></span><span><strong>Nova anotação</strong><small>Registre uma ideia de estudo</small></span><Icon name="arrow" /></button>
        </div>
      </aside>
    </div>
    <blockquote><span>“</span><p>Ideias bem cuidadas encontram o tempo certo para serem compartilhadas.</p></blockquote>
  </main>;
}

function Outlines({ setPage, outlines, onOpen, onNew }: { setPage: (p: Page) => void; outlines: Outline[]; onOpen: (outline: Outline) => void; onNew: () => void }) {
  return <main className="page">
    <PageHead title="Esboços" copy="Organize suas ideias, estudos e mensagens." action={<Button icon="plus" onClick={onNew}>Novo esboço</Button>} />
    <div className="toolbar-row"><label className="input search-input"><Icon name="search" /><input placeholder="Buscar esboços..." /></label><Button variant="secondary" icon="filter">Filtrar</Button></div>
    <div className="tabs"><button className="active">Todos <span>8</span></button><button>Favoritos</button><button>Rascunhos</button><button>Concluídos</button></div>
    <div className="folder-strip"><button><Icon name="folder" /><span><strong>Série: Graça</strong><small>4 esboços</small></span></button><button><Icon name="folder" /><span><strong>Estudos em Salmos</strong><small>3 esboços</small></span></button><button className="new-folder"><Icon name="plus" /> Nova pasta</button></div>
    <div className="table-head"><span>ESBOÇO</span><span>ESTADO</span><span>MODIFICADO</span><span /></div>
    <div className="outline-table">{outlines.length ? outlines.map((item, i) => <button className="table-row" key={item.id} onClick={() => onOpen(item)}><span className={`file-tile ${i % 2 ? "green" : "gold"}`}><Icon name="file" /></span><span className="table-title"><strong>{item.title}</strong><small>{item.reference || "Sem referência principal"} · {item.category}</small></span><span className="tag">{item.status === "ready" ? "Pronto" : "Rascunho"}</span><span className="date-cell">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</span><Icon name="more" /></button>) : <div className="empty-state"><strong>Nenhum esboço salvo</strong><p>Crie seu primeiro esboço para começar.</p><Button icon="plus" onClick={onNew}>Novo esboço</Button></div>}</div>
  </main>;
}

function Editor({ setPage, outline, onSave }: { setPage: (p: Page) => void; outline: Outline | null; onSave: (outline: Outline) => void }) {
  const [title, setTitle] = useState(outline?.title ?? "");
  const [reference, setReference] = useState(outline?.reference ?? "");
  const [content, setContent] = useState(outline?.content ?? "");
  const [saved, setSaved] = useState(false);
  useEffect(() => { setTitle(outline?.title ?? ""); setReference(outline?.reference ?? ""); setContent(outline?.content ?? ""); setSaved(false); }, [outline?.id]);
  const save = () => {
    if (!title.trim()) return;
    onSave({ id: outline?.id ?? crypto.randomUUID(), title: title.trim(), reference: reference.trim(), category: "Mensagem", updatedAt: new Date().toISOString(), status: "draft", content });
    setSaved(true);
  };
  return <main className="editor-page">
    <div className="editor-top">
      <Button variant="ghost" icon="arrow" className="back-button" onClick={() => setPage("outlines")}>Esboços</Button>
      <span className="saved"><Icon name="check" size={15} /> {saved ? "Salvo" : "Salvamento manual"}</span>
      <div><Button variant="ghost" icon="eye" onClick={save}>Salvar</Button><Button variant="secondary" onClick={() => setPage("preaching")}>Modo Pregação</Button></div>
    </div>
    <div className="editor-layout">
      <article className="writing-sheet">
        <div className="editor-meta"><span className="tag"><Icon name="tag" size={14} /> Domingo</span><button>+ Etiqueta</button></div>
        <textarea className="title-input" value={title} onChange={(event) => { setTitle(event.target.value); setSaved(false); }} placeholder="Título do esboço" aria-label="Título do esboço" />
        <div className="reference-line"><Icon name="book" size={17} /><input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Referência bíblica (opcional)" aria-label="Referência bíblica" /></div>
        <div className="format-bar"><button><Icon name="bold" /></button><button><Icon name="italic" /></button><i /><button><Icon name="list" /></button><button>H1</button><button>H2</button><i /><button>“</button></div>
        <textarea className="document-content" value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); }} placeholder="Desenvolva suas ideias, tópicos e aplicações..." aria-label="Conteúdo do esboço" />
      </article>
      <aside className="editor-aside"><div className="aside-head"><strong>Referências</strong></div><div className="ref-card"><span>{reference || "Nenhuma referência"}</span><p>Referência principal do esboço</p><button onClick={() => setPage("bible")}>Abrir na Bíblia <Icon name="arrow" size={14} /></button></div><hr /><div className="aside-head"><strong>Organização</strong></div><p>Este esboço será salvo neste dispositivo.</p><Button onClick={save}>{saved ? "Salvo" : "Salvar esboço"}</Button></aside>
    </div>
  </main>;
}

function Bible({ setPage }: { setPage: (p: Page) => void }) {
  return <main className="page bible-page">
    <PageHead title="Bíblia" copy="Leitor demonstrativo. O conteúdo exibido não substitui uma tradução bíblica licenciada." />
    <div className="bible-controls"><button>Salmos <Icon name="chevron" /></button><button>Capítulo 27 <Icon name="chevron" /></button><label className="input"><Icon name="search" /><input placeholder="Buscar referência" /></label></div>
    <div className="reading-layout"><article className="reading-sheet"><div className="reading-head"><span>CONTEÚDO DE EXEMPLO · NÃO É UMA TRADUÇÃO BÍBLICA</span><h1>Salmos <b>27</b></h1></div><div className="scripture"><p><sup>1</sup> Texto de demonstração para visualização do leitor e da tipografia.</p><p><sup>4</sup> Um lugar de leitura poderá ser integrado quando uma tradução licenciada estiver disponível.</p><p><sup>8</sup> Use as ferramentas de estudo para registrar suas próprias observações.</p><p className="selected-verse"><sup>14</sup> Referência de exemplo: Salmos 27:14.</p></div><div className="chapter-nav"><Button variant="ghost" onClick={() => window.alert("Navegação de capítulos estará disponível com uma tradução licenciada.")}>← Salmos 26</Button><Button variant="ghost" onClick={() => window.alert("Navegação de capítulos estará disponível com uma tradução licenciada.")}>Salmos 28 →</Button></div></article><aside className="bible-note"><span className="eyebrow">ESTUDO BÍBLICO</span><strong>Salmos 27:14</strong><p>Associe esta referência a um novo esboço ou crie uma anotação.</p><Button onClick={() => setPage("editor")}>Criar esboço</Button><Button variant="secondary" icon="note" onClick={() => setPage("home")}>Nova anotação no início</Button></aside></div>
  </main>;
}

function Agenda({ setPage, events, onNewEvent }: { setPage: (p: Page) => void; events: CalendarEvent[]; onNewEvent: () => void }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return <main className="page"><PageHead title="Agenda" copy="Planeje seus compromissos e conecte cada mensagem." action={<Button icon="plus" onClick={onNewEvent}>Novo compromisso</Button>} /><div className="agenda-toolbar"><div><Button variant="secondary">Próximos compromissos</Button></div></div>{events.length ? <section className="event-list">{events.map((event) => <article className="event" key={event.id}><span className="date-box"><b>{new Date(`${event.date}T00:00:00`).getDate()}</b><small>{new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(`${event.date}T00:00:00`))}</small></span><span><strong>{event.title}</strong><small><Icon name="clock" size={14} /> {event.date} · {event.time} · {event.kind}</small>{event.reference && <em>{event.reference}</em>}</span></article>)}</section> : <div className="empty-state"><strong>Sua agenda está livre.</strong><p>Adicione compromissos para acompanhar mensagens, estudos e lembretes.</p><Button icon="plus" onClick={onNewEvent}>Adicionar compromisso</Button></div>}</main>;
}

function Library() {
  const files = [{name:"Notas sobre os Salmos",type:"PDF",date:"18 mai 2025",color:"gold"},{name:"Estudo — Comunidade e serviço",type:"DOCX",date:"09 mai 2025",color:"green"},{name:"Referências para série Graça",type:"PDF",date:"28 abr 2025",color:"navy"}];
  return <main className="page"><PageHead title="Biblioteca" copy="Seus materiais de estudo, reunidos em um só lugar." action={<Button icon="upload">Importar material</Button>} /><div className="toolbar-row"><label className="input search-input"><Icon name="search" /><input placeholder="Buscar na biblioteca..." /></label><Button variant="secondary" icon="filter">Filtrar</Button><Button variant="icon" icon="grid" /></div><div className="folder-strip"><button><Icon name="folder" /><span><strong>Referências</strong><small>6 materiais</small></span></button><button><Icon name="folder" /><span><strong>Série: Graça</strong><small>3 materiais</small></span></button></div><div className="library-grid">{files.map(file => <button className="material-card" key={file.name}><span className={`material-cover ${file.color}`}><Icon name="file" /><small>{file.type}</small></span><span><strong>{file.name}</strong><small>Adicionado em {file.date}</small></span><Icon name="more" /></button>)}<button className="import-card"><Icon name="upload" /><strong>Adicione um material</strong><small>PDF, DOCX ou TXT</small></button></div></main>;
}

function Preaching({ setPage }: { setPage: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const content = [
    { eyebrow: "INTRODUÇÃO", title: "Esperar também é um ato de fé.", text: "A espera não é um intervalo sem propósito. É um lugar onde nossa confiança aprende a criar raízes." },
    { eyebrow: "TÓPICO 1 DE 3", title: "A espera revela onde está nossa confiança.", text: "Quando os caminhos parecem silenciosos, somos convidados a voltar o coração para aquilo que permanece." },
    { eyebrow: "TÓPICO 2 DE 3", title: "Coragem também é permanecer.", text: "Nem toda coragem é movimento. Às vezes, ela aparece na decisão diária de continuar fiel." },
  ][step - 1];
  return <main className="preaching"><header><button onClick={() => setPage("editor")}><Icon name="close" /> Sair</button><span><i /> Modo Pregação</span><Button variant="icon" icon="expand" /></header><div className="preach-progress"><span style={{ width: `${step * 33.33}%` }} /></div><article><span>{content.eyebrow}</span><h1>{content.title}</h1><p>{content.text}</p>{step === 1 && <blockquote><small>SALMO 27:14 · CONTEÚDO DE EXEMPLO</small>“Espere no Senhor. Seja forte! Coragem! Espere no Senhor.”</blockquote>}</article><footer><button disabled={step === 1} onClick={() => setStep(Math.max(1, step - 1))}>← <span>Anterior</span></button><span>{step} / 3</span><button onClick={() => setStep(Math.min(3, step + 1))}><span>Próximo</span> →</button></footer></main>;
}

function GlobalSearch({ setPage, outlines, onOpenOutline }: { setPage: (p: Page) => void; outlines: Outline[]; onOpenOutline: (outline: Outline) => void }) {
  const [query, setQuery] = useState("");
  const results = outlines.filter((item) => `${item.title} ${item.reference} ${item.category} ${item.content}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));
  return <main className="page search-page"><PageHead title="Busca global" copy="Encontre seus esboços e estudos salvos neste dispositivo." /><label className="search-hero"><Icon name="search" /><input autoFocus placeholder="Busque por título, referência ou conteúdo..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>ESC</kbd></label><div className="search-summary"><strong>{query ? `${results.length} resultados` : "Escreva para buscar nos seus esboços"}</strong><span>Dados deste dispositivo</span></div>{query && (results.length ? <SearchGroup title="ESBOÇOS" icon="file" items={results.map((item) => `${item.title} — ${item.reference || item.category}`)} onClick={() => { const result = results[0]; if (result) onOpenOutline(result); }} /> : <div className="empty-state"><strong>Nenhum resultado para “{query}”</strong><p>Experimente buscar por título, trecho do conteúdo ou referência bíblica.</p></div>)}{!query && outlines.length === 0 && <div className="empty-state">Ainda não há conteúdo para pesquisar.</div>}{query && results.length > 0 && <div className="outline-list">{results.map((item) => <button className="outline-row" key={item.id} onClick={() => onOpenOutline(item)}><span className="file-tile navy"><Icon name="file" /></span><span className="outline-main"><strong>{item.title}</strong><small>{item.reference || item.category}</small></span><Icon name="arrow" /></button>)}</div>}{!query && <Button variant="secondary" onClick={() => setPage("outlines")}>Ver esboços</Button>}</main>;
}

function SearchGroup({ title, icon, items, onClick }: { title: string; icon: IconName; items: string[]; onClick: () => void }) {
  return <section className="search-group"><span className="eyebrow">{title}</span>{items.map((item, i) => <button key={item} onClick={onClick}><span className="search-result-icon"><Icon name={icon} /></span><span><strong>{item}</strong><small>{i ? "Encontrado no conteúdo" : "Atualizado recentemente"} · <mark>esperança</mark></small></span><Icon name="arrow" /></button>)}</section>;
}

function Settings({ setPage, dark, setDark }: { setPage: (p: Page) => void; dark: boolean; setDark: (v: boolean) => void }) {
  return <main className="page settings-page"><PageHead title="Perfil e configurações" copy="Gerencie sua conta e suas preferências." /><div className="settings-layout"><aside><button className="active">Perfil</button><button>Aparência</button><button>Leitura</button><button>Conta</button></aside><div className="settings-content"><section><h2>Seu perfil</h2><p>Informações exibidas no seu espaço de trabalho.</p><div className="profile-edit"><span className="avatar large">MS</span><Button variant="secondary">Alterar foto</Button></div><div className="field-grid"><label>Nome completo<input defaultValue="Marina Silva" /></label><label>E-mail<input defaultValue="marina@email.com" /></label></div><Button>Salvar alterações</Button></section><section><h2>Aparência</h2><p>Escolha como o SpeakerDraft aparece para você.</p><div className="theme-options"><button className={!dark ? "selected" : ""} onClick={() => setDark(false)}><span className="theme-preview light"><i /><i /></span><Icon name="sun" /> Claro {!dark && <Icon name="check" />}</button><button className={dark ? "selected" : ""} onClick={() => setDark(true)}><span className="theme-preview dark"><i /><i /></span><Icon name="moon" /> Escuro {dark && <Icon name="check" />}</button></div></section><section className="danger-zone"><div><h2>Sair da conta</h2><p>Você poderá entrar novamente quando quiser.</p></div><Button variant="secondary" onClick={() => setPage("login")}>Sair</Button></section></div></div></main>;
}

function Login({ setPage }: { setPage: (p: Page) => void }) {
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState(false);
  return <main className="login-page"><section className="login-intro"><Brand /><div><span className="eyebrow">ESCREVA COM CLAREZA. COMPARTILHE COM PROPÓSITO.</span><h1>Um espaço sereno para ideias que importam.</h1><p>Estude, organize e prepare suas mensagens com foco — do primeiro rascunho ao momento de compartilhar.</p></div><small>SpeakerDraft · Seu estudo, no seu ritmo.</small></section><section className="login-form"><div className="form-wrap"><div className="mobile-brand"><Brand /></div><span className="eyebrow">{signup ? "COMECE AGORA" : "BEM-VINDA DE VOLTA"}</span><h2>{signup ? "Crie sua conta" : "Entre no SpeakerDraft"}</h2><p>{signup ? "Organize seus estudos em um só lugar." : "Acesse seu espaço de estudo e preparação."}</p>{signup && <label>Nome completo<input placeholder="Como podemos chamar você?" /></label>}<label>E-mail<input type="email" placeholder="seu@email.com" className={error ? "invalid" : ""} /></label><label><span>Senha {!signup && <button>Esqueceu a senha?</button>}</span><input type="password" placeholder="Sua senha" className={error ? "invalid" : ""} /></label>{error && <div className="form-error"><span>!</span><p><strong>Não foi possível entrar.</strong> Verifique seu e-mail e senha e tente novamente.</p></div>}<Button className="full" onClick={() => error ? setPage("home") : setError(true)}>{signup ? "Criar conta" : "Entrar"}</Button><div className="form-switch">{signup ? "Já tem uma conta?" : "Ainda não tem uma conta?"} <button onClick={() => { setSignup(!signup); setError(false); }}>{signup ? "Entrar" : "Criar conta"}</button></div></div></section></main>;
}

function MobileNav({ page, setPage, onCreate }: { page: Page; setPage: (p: Page) => void; onCreate: () => void }) {
  return <nav className="mobile-nav">
    <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}><Icon name="home" /><span>Início</span></button>
    <button className={page === "outlines" ? "active" : ""} onClick={() => setPage("outlines")}><Icon name="file" /><span>Esboços</span></button>
    <button className="mobile-create" onClick={onCreate}><span><Icon name="plus" /></span><small>Criar</small></button>
    <button className={page === "bible" ? "active" : ""} onClick={() => setPage("bible")}><Icon name="book" /><span>Bíblia</span></button>
    <button className={page === "agenda" ? "active" : ""} onClick={() => setPage("agenda")}><Icon name="calendar" /><span>Agenda</span></button>
  </nav>;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [dark, setDark] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [workspace, setWorkspace] = useState(() => workspaceStore.load());
  const [activeOutlineId, setActiveOutlineId] = useState<string | null>(null);
  const activeOutline = workspace.outlines.find((item) => item.id === activeOutlineId) ?? null;
  const openOutline = (outline: Outline) => { setActiveOutlineId(outline.id); setPage("editor"); };
  const newOutline = () => { setActiveOutlineId(null); setPage("editor"); };
  const saveOutline = (outline: Outline) => { workspaceStore.saveOutline(outline); setWorkspace(workspaceStore.load()); setActiveOutlineId(outline.id); };
  const addNote = () => {
    const title = window.prompt("Título da anotação");
    if (!title?.trim()) return;
    const body = window.prompt("Escreva sua anotação");
    if (body === null || !body.trim()) { window.alert("A anotação precisa ter conteúdo."); return; }
    try { workspaceStore.addNote({ id: crypto.randomUUID(), title: title.trim(), body: body.trim(), updatedAt: new Date().toISOString() }); setWorkspace(workspaceStore.load()); window.alert("Anotação salva neste dispositivo."); }
    catch { window.alert("Não foi possível salvar a anotação neste dispositivo."); }
  };
  const addEvent = () => {
    const title = window.prompt("Nome do compromisso");
    if (!title?.trim()) return;
    const date = window.prompt("Data (AAAA-MM-DD)", new Date().toISOString().slice(0, 10));
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) { window.alert("Informe uma data válida no formato AAAA-MM-DD."); return; }
    const time = window.prompt("Horário (HH:MM)", "19:00") ?? "";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) { window.alert("Informe um horário válido no formato HH:MM."); return; }
    const kind = window.prompt("Tipo de atividade", "Mensagem")?.trim() ?? "";
    const reference = window.prompt("Referência ou descrição (opcional)")?.trim() ?? "";
    try { workspaceStore.addEvent({ id: crypto.randomUUID(), title: title.trim(), date, time, kind: kind || "Compromisso", reference }); setWorkspace(workspaceStore.load()); setPage("agenda"); window.alert("Compromisso adicionado à agenda."); }
    catch { window.alert("Não foi possível salvar o compromisso neste dispositivo."); }
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPage("search"); }
      if (event.key === "Escape" && page === "search") setPage("home");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [page]);
  if (page === "login") return <div className={dark ? "app dark" : "app"}><Login setPage={setPage} /></div>;
  if (page === "preaching") return <div className={dark ? "app dark" : "app"}><Preaching setPage={setPage} /></div>;
  const titles: Partial<Record<Page, string>> = { home: "Início", outlines: "Esboços", bible: "Bíblia", agenda: "Agenda", library: "Biblioteca", settings: "Configurações", search: "Busca" };
  return <div className={dark ? "app dark" : "app"}>
    <Sidebar page={page} setPage={setPage} />
    {mobileMenu && <div className="mobile-drawer"><div><Brand /><Button icon="close" variant="icon" onClick={() => setMobileMenu(false)} /></div>{nav.map(item => <button key={item.id} onClick={() => { setPage(item.id); setMobileMenu(false); }}><Icon name={item.icon} />{item.label}</button>)}<button onClick={() => { setPage("settings"); setMobileMenu(false); }}><Icon name="settings" />Configurações</button></div>}
    <div className="app-shell"><Topbar title={titles[page]} setPage={setPage} onMenu={() => setMobileMenu(true)} />{page === "home" && <Dashboard setPage={setPage} outlines={workspace.outlines} events={workspace.events} noteCount={workspace.notes.length} onNewOutline={newOutline} onNewNote={addNote} onNewEvent={addEvent} />}{page === "outlines" && <Outlines setPage={setPage} outlines={workspace.outlines} onOpen={openOutline} onNew={newOutline} />}{page === "editor" && <Editor setPage={setPage} outline={activeOutline} onSave={saveOutline} />}{page === "bible" && <Bible setPage={setPage} />}{page === "agenda" && <Agenda setPage={setPage} events={workspace.events} onNewEvent={addEvent} />}{page === "library" && <Library />}{page === "search" && <GlobalSearch setPage={setPage} outlines={workspace.outlines} onOpenOutline={openOutline} />}{page === "settings" && <Settings setPage={setPage} dark={dark} setDark={setDark} />}</div>
    {page !== "editor" && <MobileNav page={page} setPage={setPage} onCreate={newOutline} />}
  </div>;
}
