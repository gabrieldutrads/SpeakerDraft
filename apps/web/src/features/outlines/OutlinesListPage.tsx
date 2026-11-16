import { PageLayout, Card } from '@/app/layout';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { routes } from '@/app/router';
import { useAppNavigate } from '@/app/router';
import { getRepositories, queryKeys } from '@/lib/repositories';
import { Tooltip } from 'primereact/tooltip';

export function OutlinesListPage() {
  const { t } = useTranslation('outlines');
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();
  const repos = getRepositories();

  // Fetch outlines
  const { data: outlines = [], isLoading, error } = useQuery({
    queryKey: queryKeys.outlines,
    queryFn: () => repos.outlines.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => repos.outlines.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outlines });
    },
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirmDelete', 'Are you sure you want to delete this outline?'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleRowClick = (outline: any) => {
    navigate.goToOutlineEdit(outline.id);
  };

  const statusBadge = (status: string) => (
    <span className={`px-2 py-0.5 text-xs rounded-full ${status === 'ready' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
      {status === 'ready' ? t('status.ready', 'Ready') : t('status.draft', 'Draft')}
    </span>
  );

  // Column body renderers for PrimeReact DataTable
  const titleBody = (data: any) => <div className="font-medium text-primary">{data.title}</div>;

  const statusBody = (data: any) => statusBadge(data.status);

  const updatedAtBody = (data: any) => (
    <span className="text-secondary text-sm">{new Date(data.updatedAt).toLocaleDateString()}</span>
  );

  const actionsBody = (data: any) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-eye"
        severity="secondary"
        rounded
        className="p-2"
        onClick={(e) => { e.stopPropagation(); navigate.goToOutlinePreview(data.id); }}
        aria-label={t('preview', 'Preview')}
      >
        <Tooltip>{t('preview', 'Preview')}</Tooltip>
      </Button>
      <Button
        icon="pi pi-trash"
        severity="danger"
        rounded
        className="p-2"
        onClick={(e) => handleDelete(data.id, e)}
        aria-label={t('delete', 'Delete')}
      >
        <Tooltip>{t('delete', 'Delete')}</Tooltip>
      </Button>
    </div>
  );

  return (
    <PageLayout
      title={t('title', 'Outlines')}
      description="Manage your sermon outlines"
      actions={<Button label={t('new', 'New Outline')} icon="pi pi-plus" onClick={() => navigate.goTo(routes.outlineNew)} />}
    >
      <Card>
        {isLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-error text-4xl mb-4">⚠️</div>
            <p className="text-secondary">{t('errorLoading', 'Failed to load outlines')}</p>
          </div>
        ) : outlines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" aria-hidden="true">📝</div>
            <h3 className="text-xl font-semibold text-primary mb-2">{t('noOutlines', 'No outlines yet')}</h3>
            <p className="text-secondary mb-6">{t('noOutlinesDesc', 'Create your first sermon outline to get started.')}</p>
            <Button label={t('new', 'Create Your First Outline')} icon="pi pi-plus" onClick={() => navigate.goTo(routes.outlineNew)} size="large" />
          </div>
        ) : (
          <DataTable
            value={outlines}
            responsiveLayout="scroll"
            className="w-full"
            dataKey="id"
            rowHover
            onRowClick={handleRowClick}
          >
            <Column field="title" header={t('title', 'Title')} style={{ minWidth: '200px' }} body={titleBody} />
            <Column field="reference" header={t('reference', 'Reference')} style={{ minWidth: '150px' }} />
            <Column field="category" header={t('category', 'Category')} style={{ minWidth: '120px' }} />
            <Column field="status" header={t('status', 'Status')} style={{ minWidth: '100px' }} body={statusBody} />
            <Column field="updatedAt" header={t('updated', 'Updated')} style={{ minWidth: '150px' }} body={updatedAtBody} />
            <Column header={t('actions', 'Actions')} style={{ minWidth: '100px' }} body={actionsBody} />
          </DataTable>
        )}
      </Card>
    </PageLayout>
  );
}

export function OutlineEditorPage() {
  const { t } = useTranslation('outlines');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('edit', 'Edit Outline')}
      description="Write and structure your sermon"
      actions={<Button label={t('preview', 'Preview')} icon="pi pi-eye" severity="secondary" className="p-2" onClick={() => navigate.goTo(routes.outlinePreview)} />}
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">✏️</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Outline Editor</h3>
          <p className="text-secondary mb-6">TipTap block editor coming soon.</p>
          <Button label={t('back', 'Back to Outlines')} icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate.goTo(routes.outlines)} />
        </div>
      </Card>
    </PageLayout>
  );
}

export function OutlinePreachingPage() {
  const { t } = useTranslation('preaching');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('title', 'Preaching Mode')}
      description="Immersive preaching experience"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">🎤</div>
          <h3 className="text-xl font-semibold text-primary mb-2">{t('title', 'Preaching Mode')}</h3>
          <p className="text-secondary mb-6">Immersive reader with timer and keyboard navigation coming soon.</p>
          <Button label={t('exitPreaching', 'Exit')} icon="pi pi-times" severity="secondary" onClick={() => navigate.goTo(routes.outlines)} />
        </div>
      </Card>
    </PageLayout>
  );
}

export function OutlinePreviewPage() {
  const { t } = useTranslation('outlines');
  const navigate = useAppNavigate();

  return (
    <PageLayout
      title={t('preview', 'Preview Outline')}
      description="See how your outline will look when preaching"
    >
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">👁️</div>
          <h3 className="text-xl font-semibold text-primary mb-2">Preview</h3>
          <p className="text-secondary mb-6">Print preview and export options coming soon.</p>
          <Button label={t('back', 'Back to Editor')} icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate.goBack()} />
        </div>
      </Card>
    </PageLayout>
  );
}