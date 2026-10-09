import { useEffect, useState, type ReactNode } from "react";

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
];

function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return <aside className="sidebar">
    <Brand />
    <nav className="nav-list" aria-label="Principal">{nav.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}</nav>
    <div className="sidebar-foot">
      <button className="nav-item" onClick={() => setPage("settings")}><Icon name="settings" /><span>Configurações</span></button>
      <button className="profile-row" onClick={() => setPage("settings")}><span className="avatar">MS</span><span><strong>Marina Silva</strong><small>marina@email.com</small></span><Icon name="more" /></button>
    </div>
  </aside>;
}

function Topbar({ title, setPage, onMenu }: { title?: string; setPage: (p: Page) => void; onMenu: () => void }) {
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMenu} aria-label="Abrir menu"><Icon name="menu" /></button>
    {title && <span className="topbar-title">{title}</span>}
    <button className="global-search" onClick={() => setPage("search")}><Icon name="search" size={18} /><span>Buscar em tudo...</span><kbd>⌘ K</kbd></button>
    <div className="top-actions"><Button icon="bell" variant="icon" /><button className="mobile-avatar" onClick={() => setPage("settings")}>MS</button></div>
  </header>;
}

function PageHead({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="page-head"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{copy && <p>{copy}</p>}</div>{action}</div>;
}

const outlines = [
  { title: "Esperança em tempos de espera", meta: "Editado hoje, 10:42", tag: "Domingo", accent: "gold" },
  { title: "A graça que nos encontra", meta: "Editado ontem, 19:15", tag: "Série: Graça", accent: "green" },
  { title: "Chamados para servir", meta: "12 de maio de 2025", tag: "Estudo", accent: "navy" },
];

function Dashboard({ setPage }: { setPage: (p: Page) => void }) {
  return <main className="page dashboard">
    <section className="mobile-home-intro">
      <span className="eyebrow">QUARTA, 21 DE MAIO</span>
      <div><h1>Boa tarde, Marina.</h1><span className="mobile-weather"><Icon name="sun" size={16} /> 24°</span></div>
      <p>O que vamos preparar hoje?</p>
      <button className="mobile-search-card" onClick={() => setPage("search")}><Icon name="search" /><span>Buscar em seus estudos</span></button>
      <div className="mobile-quick-actions">
        <button onClick={() => setPage("editor")}><span><Icon name="plus" /></span>Novo esboço</button>
        <button onClick={() => setPage("bible")}><span><Icon name="book" /></span>Ler Bíblia</button>
        <button onClick={() => setPage("agenda")}><span><Icon name="calendar" /></span>Compromisso</button>
        <button onClick={() => setPage("library")}><span><Icon name="library" /></span>Biblioteca</button>
      </div>
    </section>
    <PageHead eyebrow="QUARTA-FEIRA, 21 DE MAIO" title="Boa tarde, Marina." copy="Continue de onde parou ou comece algo novo." action={<Button icon="plus" onClick={() => setPage("editor")}>Novo esboço</Button>} />
    <section className="continue-card" onClick={() => setPage("editor")}>
      <div className="continue-icon"><Icon name="file" /></div>
      <div className="continue-copy"><span className="eyebrow">CONTINUAR ESCREVENDO</span><h2>Esperança em tempos de espera</h2><p>Salmo 27:14 · 3 tópicos · Editado há 18 minutos</p><div className="progress"><span /></div></div>
      <Button variant="secondary">Abrir esboço <Icon name="arrow" size={16} /></Button>
    </section>
    <div className="content-grid">
      <section className="recent-section"><div className="section-title"><h2>Estudos recentes</h2><button onClick={() => setPage("outlines")}>Ver todos <Icon name="arrow" size={15} /></button></div>
        <div className="outline-list">{outlines.map((item, i) => <button className="outline-row" key={item.title} onClick={() => setPage("editor")}><span className={`file-tile ${item.accent}`}><Icon name="file" /></span><span className="outline-main"><strong>{item.title}</strong><small>{item.meta}</small></span><span className="tag">{item.tag}</span>{i === 0 && <Icon name="star" size={17} />}<Icon name="more" size={19} /></button>)}</div>
      </section>
      <aside className="right-rail">
        <div className="section-title"><h2>Próximos</h2><button onClick={() => setPage("agenda")}>Agenda <Icon name="arrow" size={15} /></button></div>
        <button className="event" onClick={() => setPage("agenda")}><span className="date-box"><b>25</b><small>MAI</small></span><span><strong>Culto da comunidade</strong><small><Icon name="clock" size={14} /> Domingo, 19:00</small><em>Esperança em tempos de espera</em></span></button>
        <div className="quick-links">
          <button onClick={() => setPage("bible")}><span className="quick-icon green"><Icon name="book" /></span><span><strong>Abrir Bíblia</strong><small>Continue em Salmos 27</small></span><Icon name="arrow" /></button>
          <button onClick={() => setPage("library")}><span className="quick-icon gold"><Icon name="library" /></span><span><strong>Sua biblioteca</strong><small>12 materiais organizados</small></span><Icon name="arrow" /></button>
        </div>
      </aside>
    </div>
    <blockquote><span>“</span><p>Ideias bem cuidadas encontram o tempo certo para serem compartilhadas.</p></blockquote>
  </main>;
}

function Outlines({ setPage }: { setPage: (p: Page) => void }) {
  return <main className="page">
    <PageHead title="Esboços" copy="Organize suas ideias, estudos e mensagens." action={<Button icon="plus" onClick={() => setPage("editor")}>Novo esboço</Button>} />
    <div className="toolbar-row"><label className="input search-input"><Icon name="search" /><input placeholder="Buscar esboços..." /></label><Button variant="secondary" icon="filter">Filtrar</Button></div>
    <div className="tabs"><button className="active">Todos <span>8</span></button><button>Favoritos</button><button>Rascunhos</button><button>Concluídos</button></div>
    <div className="folder-strip"><button><Icon name="folder" /><span><strong>Série: Graça</strong><small>4 esboços</small></span></button><button><Icon name="folder" /><span><strong>Estudos em Salmos</strong><small>3 esboços</small></span></button><button className="new-folder"><Icon name="plus" /> Nova pasta</button></div>
    <div className="table-head"><span>ESBOÇO</span><span>ETIQUETA</span><span>MODIFICADO</span><span /></div>
    <div className="outline-table">{[...outlines, { title: "Uma fé que amadurece", meta: "8 de maio de 2025", tag: "Rascunho", accent: "green" }].map((item, i) => <button className="table-row" key={item.title} onClick={() => setPage("editor")}><span className={`file-tile ${item.accent}`}><Icon name="file" /></span><span className="table-title"><strong>{item.title}</strong><small>{i === 0 ? "Salmo 27:14" : i === 1 ? "Efésios 2:8–9" : "Sem referência principal"}</small></span><span className="tag">{item.tag}</span><span className="date-cell">{item.meta.replace("Editado ", "")}</span><Icon name="more" /></button>)}</div>
  </main>;
}

function Editor({ setPage }: { setPage: (p: Page) => void }) {
  return <main className="editor-page">
    <div className="editor-top">
      <Button variant="ghost" icon="arrow" className="back-button" onClick={() => setPage("outlines")}>Esboços</Button>
      <span className="saved"><Icon name="check" size={15} /> Salvo agora</span>
      <div><Button variant="ghost" icon="eye">Visualizar</Button><Button variant="secondary" onClick={() => setPage("preaching")}>Modo Pregação</Button></div>
    </div>
    <div className="editor-layout">
      <article className="writing-sheet">
        <div className="editor-meta"><span className="tag"><Icon name="tag" size={14} /> Domingo</span><button>+ Etiqueta</button></div>
        <textarea className="title-input" defaultValue="Esperança em tempos de espera" aria-label="Título do esboço" />
        <div className="reference-line"><Icon name="book" size={17} /><span>Salmo 27:14</span><button>Alterar referência</button></div>
        <div className="format-bar"><button><Icon name="bold" /></button><button><Icon name="italic" /></button><i /><button><Icon name="list" /></button><button>H1</button><button>H2</button><i /><button>“</button></div>
        <div className="document" contentEditable suppressContentEditableWarning>
          <p className="lead">Esperar não é permanecer imóvel. Na Bíblia, a espera é um lugar de formação — onde a confiança amadurece antes que a resposta chegue.</p>
          <h2>1. A espera revela onde está nossa confiança</h2>
          <p>Quando os caminhos parecem silenciosos, somos convidados a voltar o coração para aquilo que permanece. O salmista não ignora a dificuldade; ele escolhe uma direção para a esperança.</p>
          <div className="verse"><span>SALMO 27:14 · CONTEÚDO DE EXEMPLO</span><p>“Espere no Senhor. Seja forte! Coragem! Espere no Senhor.”</p></div>
          <h2>2. Coragem também é permanecer</h2>
          <p>Nem toda coragem é movimento. Às vezes, ela aparece na decisão diária de permanecer fiel, mesmo sem enxergar todo o caminho.</p>
          <h3>Aplicação</h3>
          <p>Que área da vida você tem tentado acelerar por medo do silêncio?</p>
        </div>
      </article>
      <aside className="editor-aside"><div className="aside-head"><strong>Referências</strong><Button variant="icon" icon="plus" /></div><div className="ref-card"><span>Salmo 27:14</span><p>Referência principal do esboço</p><button>Abrir na Bíblia <Icon name="arrow" size={14} /></button></div><button className="add-ref"><Icon name="plus" /> Adicionar referência</button><hr /><div className="aside-head"><strong>Organização</strong></div><label>PASTA<button><Icon name="folder" /> Estudos em Salmos <Icon name="chevron" /></button></label><label>COMPROMISSO<button><Icon name="calendar" /> 25 mai · 19:00</button></label></aside>
    </div>
  </main>;
}

function Bible({ setPage }: { setPage: (p: Page) => void }) {
  return <main className="page bible-page">
    <PageHead title="Bíblia" copy="Leia, pesquise e conecte referências aos seus estudos." />
    <div className="bible-controls"><button>Salmos <Icon name="chevron" /></button><button>Capítulo 27 <Icon name="chevron" /></button><label className="input"><Icon name="search" /><input placeholder="Buscar referência" /></label></div>
    <div className="reading-layout"><article className="reading-sheet"><div className="reading-head"><span>CONTEÚDO DEMONSTRATIVO · NÃO CORRESPONDE A UMA TRADUÇÃO LICENCIADA</span><h1>Salmos <b>27</b></h1></div><div className="scripture"><p><sup>1</sup> Exemplo para visualização: o Senhor é minha luz e minha segurança; por isso, sigo sem temor.</p><p><sup>4</sup> Uma coisa busco: habitar em sua presença e contemplar sua bondade todos os dias.</p><p><sup>8</sup> Meu coração ouviu o convite para buscar tua presença, e é isso que farei.</p><p className="selected-verse"><sup>14</sup> Espere no Senhor. Seja forte! Coragem! Espere no Senhor.</p></div><div className="chapter-nav"><Button variant="ghost">← Salmos 26</Button><Button variant="ghost">Salmos 28 →</Button></div></article><aside className="bible-note"><span className="eyebrow">VERSÍCULO SELECIONADO</span><strong>Salmos 27:14</strong><p>Use esta referência em um esboço ou faça uma marcação para consultar depois.</p><Button onClick={() => setPage("editor")}>Associar ao esboço</Button><Button variant="secondary" icon="star">Favoritar</Button></aside></div>
  </main>;
}

function Agenda({ setPage }: { setPage: (p: Page) => void }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return <main className="page"><PageHead title="Agenda" copy="Planeje seus compromissos e conecte cada mensagem." action={<Button icon="plus">Novo compromisso</Button>} /><div className="agenda-toolbar"><div><Button variant="secondary">Hoje</Button><Button variant="ghost">‹</Button><Button variant="ghost">›</Button><strong>Maio de 2025</strong></div><div className="segmented"><button className="active">Calendário</button><button>Lista</button></div></div><div className="calendar"><div className="weekdays">{["DOM","SEG","TER","QUA","QUI","SEX","SÁB"].map(d => <span key={d}>{d}</span>)}</div><div className="days">{days.map((d, i) => <div className={`${d < 1 || d > 31 ? "muted-day" : ""} ${d === 21 ? "today" : ""}`} key={i}><span>{d < 1 ? 30 + d : d > 31 ? d - 31 : d}</span>{d === 11 && <button className="cal-event green">09:00 · Estudo</button>}{d === 25 && <button className="cal-event gold" onClick={() => setPage("editor")}>19:00 · Culto</button>}</div>)}</div></div></main>;
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

function GlobalSearch({ setPage }: { setPage: (p: Page) => void }) {
  return <main className="page search-page"><PageHead title="Busca global" copy="Encontre qualquer conteúdo do seu espaço de trabalho." /><label className="search-hero"><Icon name="search" /><input autoFocus placeholder="Busque por título, referência ou conteúdo..." defaultValue="esperança" /><kbd>ESC</kbd></label><div className="search-summary"><strong>6 resultados para “esperança”</strong><span>Todos</span></div><SearchGroup title="ESBOÇOS" icon="file" items={["Esperança em tempos de espera","Uma esperança que não decepciona"]} onClick={() => setPage("editor")} /><SearchGroup title="REFERÊNCIAS BÍBLICAS" icon="book" items={["Salmos 27:14","Romanos 5:3–5"]} onClick={() => setPage("bible")} /><SearchGroup title="MATERIAIS" icon="library" items={["Notas sobre esperança e perseverança"]} onClick={() => setPage("library")} /></main>;
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

function MobileNav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return <nav className="mobile-nav">
    <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}><Icon name="home" /><span>Início</span></button>
    <button className={page === "outlines" ? "active" : ""} onClick={() => setPage("outlines")}><Icon name="file" /><span>Esboços</span></button>
    <button className="mobile-create" onClick={() => setPage("editor")}><span><Icon name="plus" /></span><small>Criar</small></button>
    <button className={page === "bible" ? "active" : ""} onClick={() => setPage("bible")}><Icon name="book" /><span>Bíblia</span></button>
    <button className={page === "agenda" ? "active" : ""} onClick={() => setPage("agenda")}><Icon name="calendar" /><span>Agenda</span></button>
  </nav>;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [dark, setDark] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
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
    <div className="app-shell"><Topbar title={titles[page]} setPage={setPage} onMenu={() => setMobileMenu(true)} />{page === "home" && <Dashboard setPage={setPage} />}{page === "outlines" && <Outlines setPage={setPage} />}{page === "editor" && <Editor setPage={setPage} />}{page === "bible" && <Bible setPage={setPage} />}{page === "agenda" && <Agenda setPage={setPage} />}{page === "library" && <Library />}{page === "search" && <GlobalSearch setPage={setPage} />}{page === "settings" && <Settings setPage={setPage} dark={dark} setDark={setDark} />}</div>
    {page !== "editor" && <MobileNav page={page} setPage={setPage} />}
  </div>;
}
