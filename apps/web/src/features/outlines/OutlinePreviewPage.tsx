import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRepositories, queryKeys } from '@/lib/repositories';
import { useAppNavigate, routes } from '@/app/router';
import { OutlineDocumentView } from './OutlineDocumentView';
import './outlines-premium.css';

export function OutlinePreviewPage() {
  const { id } = useParams();
  const navigate = useAppNavigate();
  const repos = getRepositories();
  const { data: outline, isLoading } = useQuery({ queryKey: queryKeys.outline(id || ''), queryFn: () => repos.outlines.getById(id!), enabled: !!id });
  if (isLoading) return <main className="op-document-page"><p>Preparando visualização...</p></main>;
  if (!outline) return <main className="op-document-page op-empty"><h2>Esboço não encontrado</h2><button className="op-primary-action" onClick={() => navigate.goTo(routes.outlines)}>Voltar aos esboços</button></main>;
  return <main className="op-document-page">
    <header className="op-document-topbar op-print-hide"><div><span className="op-eyebrow">VISUALIZAÇÃO DE MENSAGEM</span><h1>{outline.title}</h1><p>Confira seu esboço antes de compartilhar ou pregar.</p></div><div className="op-document-actions"><button onClick={() => navigate.goToOutlineEdit(outline.id)}><i className="pi pi-pencil" /> Editar</button><button onClick={() => window.print()}><i className="pi pi-print" /> Imprimir / PDF</button><button className="op-primary-action" onClick={() => navigate.goToOutlinePreach(outline.id)}><i className="pi pi-desktop" /> Modo pregação</button></div></header>
    <article className="op-document-sheet"><div className="op-document-kicker">oPregador <span>•</span> Estudo de mensagens</div><h1>{outline.title}</h1><div className="op-document-meta"><span><i className="pi pi-book" /> {outline.reference || 'Sem referência bíblica'}</span><span><i className="pi pi-tag" /> {outline.category || 'Sem categoria'}</span><span className={outline.status === 'ready' ? 'op-ready-dot' : ''}>{outline.status === 'ready' ? 'Pronto' : 'Rascunho'}</span></div><div className="op-document-divider" /><OutlineDocumentView content={outline.content} /><footer className="op-document-sheet-footer">Preparado com oPregador</footer></article>
  </main>;
}
