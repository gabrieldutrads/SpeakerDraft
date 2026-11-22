import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppNavigate, routes } from '@/app/router';
import { getRepositories, queryKeys } from '@/lib/repositories';
import type { Outline } from '@speaker-draft/core';
import './outlines-premium.css';

const dateLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sem data' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export function OutlinesListPage() {
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();
  const repos = getRepositories();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'draft'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'recent' | 'title'>('recent');
  const [deleteTarget, setDeleteTarget] = useState<Outline | null>(null);
  const { data: outlines = [], isLoading, error } = useQuery({
    queryKey: queryKeys.outlines,
    queryFn: () => repos.outlines.getAll(),
    staleTime: 1000 * 60 * 5,
  });
  const deletion = useMutation({
    mutationFn: (id: string) => repos.outlines.delete(id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.outlines }); setDeleteTarget(null); },
  });
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return outlines.filter(item => (filter === 'all' || item.status === filter) &&
      (!term || [item.title, item.reference, item.category].some(value => (value ?? '').toLocaleLowerCase('pt-BR').includes(term))))
      .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title, 'pt-BR') : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [outlines, filter, search, sort]);
  const ready = outlines.filter(item => item.status === 'ready').length;
  const openEditor = (item: Outline) => navigate.goToOutlineEdit(item.id);

  return <main className="op-hub">
    <header className="op-hub-hero">
      <div><div className="op-eyebrow"><i className="pi pi-sparkles" aria-hidden="true" /> SUA CENTRAL DE MENSAGENS</div>
        <h1>Meus esboços<span className="op-title-dot">.</span></h1>
        <p>Ideias, estudos e mensagens organizados para cada momento do seu ministério.</p>
      </div>
      <button className="op-primary-action" onClick={() => navigate.goTo(routes.outlineNew)}><i className="pi pi-plus" /> Novo esboço</button>
    </header>
    <section className="op-hub-metrics" aria-label="Resumo dos esboços">
      <div className="op-metric"><span className="op-metric-icon"><i className="pi pi-file-edit" /></span><div><small>Total de esboços</small><strong>{outlines.length}</strong></div></div>
      <div className="op-metric"><span className="op-metric-icon"><i className="pi pi-check-circle" /></span><div><small>Mensagens prontas</small><strong>{ready}</strong></div></div>
      <div className="op-metric"><span className="op-metric-icon"><i className="pi pi-pencil" /></span><div><small>Em preparação</small><strong>{outlines.length - ready}</strong></div></div>
    </section>
    <section className="op-hub-panel">
      <div className="op-hub-panel-heading"><div><h2>Biblioteca de esboços</h2><p>Encontre e continue suas mensagens.</p></div><span className="op-results-count">{visible.length} {visible.length === 1 ? 'resultado' : 'resultados'}</span></div>
      <div className="op-hub-filters">
        <label className="op-search"><i className="pi pi-search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por título, passagem ou categoria..." aria-label="Pesquisar esboços" /></label>
        <div className="op-filter-chips" aria-label="Filtrar por situação">
          {([['all', 'Todos'], ['ready', 'Prontos'], ['draft', 'Rascunhos']] as const).map(([value, label]) => <button key={value} className={filter === value ? 'op-chip selected' : 'op-chip'} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>)}
        </div>
        <label className="op-sort"><span className="sr-only">Ordenação</span><select value={sort} onChange={e => setSort(e.target.value as 'recent' | 'title')}><option value="recent">Mais recentes</option><option value="title">Título A–Z</option></select></label>
        <div className="op-view-switch" role="group" aria-label="Formato de exibição"><button aria-label="Visualizar em cartões" aria-pressed={view === 'grid'} className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><i className="pi pi-th-large" /></button><button aria-label="Visualizar em lista" aria-pressed={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><i className="pi pi-list" /></button></div>
      </div>
      {isLoading ? <div className="op-empty"><i className="pi pi-spin pi-spinner" /><h3>Carregando seus esboços...</h3></div>
      : error ? <div className="op-empty"><i className="pi pi-exclamation-triangle" /><h3>Não foi possível carregar seus esboços</h3><p>Tente atualizar esta página.</p></div>
      : visible.length === 0 ? <div className="op-empty"><span className="op-empty-symbol"><i className="pi pi-book" /></span><h3>{outlines.length ? 'Nenhum esboço encontrado' : 'Sua próxima mensagem começa aqui'}</h3><p>{outlines.length ? 'Experimente outra busca ou mude os filtros.' : 'Crie seu primeiro esboço e construa sua biblioteca de mensagens.'}</p><button onClick={() => outlines.length ? (setSearch(''), setFilter('all')) : navigate.goTo(routes.outlineNew)} className="op-primary-action">{outlines.length ? 'Limpar filtros' : 'Criar primeiro esboço'}</button></div>
      : <div className={view === 'grid' ? 'op-outline-grid' : 'op-outline-list'}>{visible.map(item => <article className="op-outline-card" key={item.id}>
        <div className="op-outline-card-top"><span className="op-outline-monogram"><i className="pi pi-bookmark" /></span><span className={`op-status-pill ${item.status === 'ready' ? 'ready' : 'draft'}`}><span />{item.status === 'ready' ? 'Pronto' : 'Rascunho'}</span></div>
        <div className="op-outline-card-body"><span className="op-outline-category">{item.category || 'Sem categoria'}</span><h3><button onClick={() => openEditor(item)}>{item.title || 'Sem título'}</button></h3><p><i className="pi pi-book" /> {item.reference || 'Referência não informada'}</p></div>
        <footer className="op-outline-card-footer"><span><i className="pi pi-clock" /> {dateLabel(item.updatedAt)}</span><div className="op-card-actions">
          <button title="Editar esboço" aria-label={`Editar ${item.title}`} onClick={() => openEditor(item)}><i className="pi pi-pencil" /></button>
          <button title="Visualizar esboço" aria-label={`Visualizar ${item.title}`} onClick={() => navigate.goToOutlinePreview(item.id)}><i className="pi pi-eye" /></button>
          <button title="Modo pregação" aria-label={`Apresentar ${item.title}`} onClick={() => navigate.goToOutlinePreach(item.id)}><i className="pi pi-desktop" /></button>
          <button className="danger" title="Excluir esboço" aria-label={`Excluir ${item.title}`} onClick={() => setDeleteTarget(item)}><i className="pi pi-trash" /></button>
        </div></footer>
      </article>)}</div>}
    </section>
    {deleteTarget && <div className="op-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}><section className="op-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="op-delete-title" aria-describedby="op-delete-text"><span className="op-confirm-icon"><i className="pi pi-trash" /></span><h2 id="op-delete-title">Excluir este esboço?</h2><p id="op-delete-text">“{deleteTarget.title}” será removido do armazenamento atual. Esta ação não pode ser desfeita.</p>{deletion.isError && <p className="op-delete-error">Não foi possível excluir. Tente novamente.</p>}<div className="op-modal-actions"><button onClick={() => setDeleteTarget(null)}>Cancelar</button><button className="op-delete-confirm" disabled={deletion.isPending} onClick={() => deletion.mutate(deleteTarget.id)}>{deletion.isPending ? 'Excluindo...' : 'Sim, excluir'}</button></div></section></div>}
  </main>;
}
