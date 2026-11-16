import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { routes, useAppNavigate } from '@/app/router';
import { getRepositories, queryKeys } from '@/lib/repositories';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Tooltip } from 'primereact/tooltip';
import { Divider } from 'primereact/divider';
import {
  ScriptureBlock,
  IllustrationBlock,
  ApplicationBlock,
  TransitionBlock,
  ConclusionBlock,
  PrayerBlock,
  SERMON_BLOCKS,
  SermonBlockConfig,
} from '@/lib/sermon-blocks';

/* ==========================================================================
   Outline Editor Component
   ========================================================================== */

interface OutlineEditorProps {
  outlineId?: string;
  isNew?: boolean;
}

export function OutlineEditor({ outlineId, isNew = false }: OutlineEditorProps) {
  const { t } = useTranslation('outlines');
  const navigate = useNavigate();
  const appNavigate = useAppNavigate();
  const queryClient = useQueryClient();
  const repos = getRepositories();
  const currentOutlineId = outlineId;
  const isEditing = !isNew && !!currentOutlineId;

  // State - using legacy Outline fields
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'ready'>('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });

  // Categories for dropdown
  const categories = [
    { label: 'Mensagem', value: 'Mensagem' },
    { label: 'Estudo', value: 'Estudo' },
    { label: 'Devocional', value: 'Devocional' },
    { label: 'Temático', value: 'Temático' },
    { label: 'Outro', value: 'Outro' },
  ];

  // Fetch existing outline if editing
  const { data: outline, isLoading: outlineLoading } = useQuery({
    queryKey: queryKeys.outline(currentOutlineId || ''),
    queryFn: () => repos.outlines.getById(currentOutlineId!),
    enabled: isEditing && !!currentOutlineId,
    staleTime: 1000 * 60 * 5,
  });

  // Load outline data when fetched
  useEffect(() => {
    if (outline) {
      setTitle(outline.title ?? '');
      setReference(outline.reference ?? '');
      setSelectedCategory(outline.category ?? '');
      setStatus(outline.status ?? 'draft');
    }
  }, [outline]);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: t('editor.placeholder') || 'Comece a escrever seu esboço...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      CharacterCount,
      ScriptureBlock,
      IllustrationBlock,
      ApplicationBlock,
      TransitionBlock,
      ConclusionBlock,
      PrayerBlock,
    ],
    content: outline?.content || undefined,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-xl mx-auto focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save logic could go here
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; reference: string; content: any; category: string; status: 'draft' | 'ready' }) => {
      if (isEditing && currentOutlineId) {
        return repos.outlines.update(currentOutlineId, {
          title: data.title,
          reference: data.reference,
          content: data.content,
          category: data.category || null,
          status: data.status,
        });
      } else {
        return repos.outlines.create({
          title: data.title,
          reference: data.reference,
          content: data.content,
          category: data.category || null,
          status: data.status,
        });
      }
    },
    onSuccess: (savedOutline) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outlines });
      setLastSaved(new Date());
      if (!isEditing && savedOutline) {
        navigate(routes.outlineEdit.replace(':id', savedOutline.id), { replace: true });
      }
    },
    onError: (error) => {
      console.error('Failed to save outline:', error);
      alert(t('editor.errorSaving') || 'Failed to save outline');
    },
  });

  // Handle saving
  const handleSave = useCallback(async () => {
    if (!editor || !title.trim()) {
      alert(t('editor.titleRequired') || 'Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getJSON();

      await saveMutation.mutateAsync({
        title,
        reference,
        content,
        category: selectedCategory,
        status,
      });
    } finally {
      setIsSaving(false);
    }
  }, [editor, title, reference, selectedCategory, status, saveMutation]);

  // Insert sermon block
  const insertSermonBlock = useCallback((blockConfig: SermonBlockConfig) => {
    if (!editor) return;

    const { type, defaultAttrs } = blockConfig;
    editor.chain().focus()[type as keyof typeof editor.chain](defaultAttrs).run();
    setShowBlockMenu(false);
  }, [editor]);

  // Handle slash command for block menu
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/' && editor) {
      e.preventDefault();
      const selection = editor.view.state.selection;
      const coords = editor.view.coordsAtPos(selection.from);
      setBlockMenuPosition({ x: coords.left, y: coords.bottom + 5 });
      setShowBlockMenu(true);
    } else if (e.key === 'Escape') {
      setShowBlockMenu(false);
    }
  }, [editor]);

  // Helper functions for toolbar
  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;
  const isActiveHeading = (level: number) => editor?.isActive('heading', { level }) ?? false;
  const isActiveMark = (mark: string) => editor?.isActive(mark) ?? false;
  const isActiveTextAlign = (align: string) => editor?.isActive({ textAlign: align }) ?? false;
  const isActiveNode = (node: string) => editor?.isActive(node) ?? false;

  // Word count from CharacterCount extension
  const wordCount = editor?.storage.characterCount?.words() ?? 0;

  if (outlineLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner-lg" aria-hidden="true" />
      </div>
    );
  }

  if (isEditing && !outline) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div className="text-error text-4xl mb-4">⚠️</div>
        <p className="text-secondary">{t('editor.notFound') || 'Outline not found'}</p>
        <Button label={t('back') || 'Back to Outlines'} icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate(routes.outlines)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <Toolbar className="mb-4 p-3 bg-surface border border-border rounded-lg">
        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <InputText
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('editor.title') || 'Título do esboço'}
            className="flex-1 text-lg font-medium bg-transparent border-none focus:ring-2 focus:ring-primary"
            aria-label={t('editor.title') || 'Título do esboço'}
          />
        </div>

        {/* Reference */}
        <div className="flex items-center gap-3 mb-3">
          <InputText
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('reference') || 'Referência bíblica (ex: João 3:16)'}
            className="flex-1 bg-transparent border-none focus:ring-2 focus:ring-primary"
            aria-label={t('reference') || 'Referência bíblica'}
          />
        </div>

        <Divider />

        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <Button
            icon="pi pi-undo"
            severity="secondary"
            rounded
            className="p-2"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!canUndo}
            aria-label={t('editor.toolbar.undo') || 'Desfazer'}
          >
            <Tooltip>{t('editor.toolbar.undo') || 'Desfazer (Ctrl+Z)'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-redo"
            severity="secondary"
            rounded
            className="p-2"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!canRedo}
            aria-label={t('editor.toolbar.redo') || 'Refazer'}
          >
            <Tooltip>{t('editor.toolbar.redo') || 'Refazer (Ctrl+Y)'}</Tooltip>
          </Button>

          <Divider className="hidden sm:block" layout="vertical" />

          {/* Heading buttons */}
          <Button
            icon="pi pi-heading"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveHeading(1) ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label={t('editor.toolbar.heading1') || 'Título 1'}
          >
            <Tooltip>H1 - {t('editor.toolbar.heading1') || 'Título 1'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-heading"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveHeading(2) ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label={t('editor.toolbar.heading2') || 'Título 2'}
          >
            <Tooltip>H2 - {t('editor.toolbar.heading2') || 'Título 2'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-heading"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveHeading(3) ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label={t('editor.toolbar.heading3') || 'Título 3'}
          >
            <Tooltip>H3 - {t('editor.toolbar.heading3') || 'Título 3'}</Tooltip>
          </Button>

          <Divider className="hidden sm:block" layout="vertical" />

          {/* Text formatting */}
          <Button
            icon="pi pi-bold"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveMark('bold') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            aria-label={t('editor.toolbar.bold') || 'Negrito'}
          >
            <Tooltip>{t('editor.toolbar.bold') || 'Negrito (Ctrl+B)'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-italic"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveMark('italic') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            aria-label={t('editor.toolbar.italic') || 'Itálico'}
          >
            <Tooltip>{t('editor.toolbar.italic') || 'Itálico (Ctrl+I)'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-underline"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveMark('underline') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            aria-label={t('editor.toolbar.underline') || 'Sublinhado'}
          >
            <Tooltip>{t('editor.toolbar.underline') || 'Sublinhado (Ctrl+U)'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-highlighter"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveMark('highlight') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            aria-label={t('editor.toolbar.highlight') || 'Destaque'}
          >
            <Tooltip>{t('editor.toolbar.highlight') || 'Destaque'}</Tooltip>
          </Button>

          <Divider className="hidden sm:block" layout="vertical" />

          {/* Lists */}
          <Button
            icon="pi pi-list"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveNode('bulletList') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            aria-label={t('editor.toolbar.bulletList') || 'Lista com marcadores'}
          >
            <Tooltip>{t('editor.toolbar.bulletList') || 'Lista com marcadores'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-ol"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveNode('orderedList') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            aria-label={t('editor.toolbar.orderedList') || 'Lista numerada'}
          >
            <Tooltip>{t('editor.toolbar.orderedList') || 'Lista numerada'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-check-square"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveNode('taskList') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            aria-label={t('editor.toolbar.taskList') || 'Lista de tarefas'}
          >
            <Tooltip>{t('editor.toolbar.taskList') || 'Lista de tarefas'}</Tooltip>
          </Button>

          <Divider className="hidden sm:block" layout="vertical" />

          {/* Alignment */}
          <Button
            icon="pi pi-align-left"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveTextAlign('left') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            aria-label={t('editor.toolbar.alignLeft') || 'Alinhar à esquerda'}
          >
            <Tooltip>{t('editor.toolbar.alignLeft') || 'Alinhar à esquerda'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-align-center"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveTextAlign('center') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            aria-label={t('editor.toolbar.alignCenter') || 'Centralizar'}
          >
            <Tooltip>{t('editor.toolbar.alignCenter') || 'Centralizar'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-align-right"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveTextAlign('right') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            aria-label={t('editor.toolbar.alignRight') || 'Alinhar à direita'}
          >
            <Tooltip>{t('editor.toolbar.alignRight') || 'Alinhar à direita'}</Tooltip>
          </Button>

          <Divider className="hidden sm:block" layout="vertical" />

          {/* Quote & Code */}
          <Button
            icon="pi pi-quote-left"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveNode('blockquote') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            aria-label={t('editor.toolbar.blockquote') || 'Citação'}
          >
            <Tooltip>{t('editor.toolbar.blockquote') || 'Citação'}</Tooltip>
          </Button>
          <Button
            icon="pi pi-code"
            severity="secondary"
            rounded
            className={`p-2 ${isActiveNode('codeBlock') ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            aria-label={t('editor.toolbar.code') || 'Código'}
          >
            <Tooltip>{t('editor.toolbar.code') || 'Código'}</Tooltip>
          </Button>

          <Divider className="hidden sm:block" layout="vertical" />

          {/* Sermon Blocks - Slash Menu Trigger */}
          <div className="relative">
            <Button
              icon="pi pi-plus"
              severity="secondary"
              rounded
              className="p-2"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setBlockMenuPosition({ x: rect.left, y: rect.bottom + 5 });
                setShowBlockMenu(true);
              }}
              aria-label={t('editor.blocks.title') || 'Adicionar bloco de pregação'}
              aria-expanded={showBlockMenu}
              aria-haspopup="menu"
            >
              <Tooltip>{t('editor.blocks.title') || 'Adicionar bloco de pregação (/)'}</Tooltip>
            </Button>

            {/* Slash Menu */}
            {showBlockMenu && (
              <div
                className="absolute z-50 mt-1 bg-surface border border-border rounded-lg shadow-lg min-w-[200px] py-1"
                style={{ left: blockMenuPosition.x, top: blockMenuPosition.y }}
                role="menu"
              >
                {SERMON_BLOCKS.map((block) => (
                  <button
                    key={block.type}
                    className="w-full px-3 py-2 text-left hover:bg-secondary-bg flex items-center gap-2 text-sm"
                    onClick={() => insertSermonBlock(block)}
                    role="menuitem"
                  >
                    <span className="text-lg">{block.icon}</span>
                    <span>{block.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Toolbar>

      {/* Metadata Panel */}
      <div className="grid gap-4 md:grid-cols-3 mb-4">
        {/* Category */}
        <div className="md:col-span-1">
          <label className="form-label block mb-1">{t('category') || 'Categoria'}</label>
          <Dropdown
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.value)}
            options={categories}
            placeholder={t('selectCategory') || 'Selecione uma categoria'}
            className="w-full"
            optionLabel="label"
            optionValue="value"
          />
        </div>

        {/* Status */}
        <div className="md:col-span-1">
          <label className="form-label block mb-1">{t('status') || 'Status'}</label>
          <Dropdown
            value={status}
            onChange={(e) => setStatus(e.value)}
            options={[
              { label: t('status.draft', 'Rascunho'), value: 'draft' },
              { label: t('status.ready', 'Pronto'), value: 'ready' },
            ]}
            className="w-full"
            optionLabel="label"
            optionValue="value"
          />
        </div>

        {/* Empty spacer for 3-column layout */}
        <div className="md:col-span-1" />
      </div>

      {/* Editor */}
      <div className="flex-1 border border-border rounded-lg overflow-hidden">
        <EditorContent editor={editor} onKeyDown={handleKeyDown} />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-secondary">
          {lastSaved && (
            <span>{t('editor.lastSaved', 'Salvo em {{time}}', { time: lastSaved.toLocaleTimeString() })}</span>
          )}
          <span>{t('editor.wordCount', '{{count}} palavras', { count: wordCount })}</span>
          <span>{t('editor.readingTime', '~{{minutes}} min de leitura', { minutes: Math.ceil(wordCount / 200) })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            label={t('preview') || 'Visualizar'}
            icon="pi pi-eye"
            severity="secondary"
            onClick={() => currentOutlineId && navigate(routes.outlinePreview.replace(':id', currentOutlineId))}
            disabled={isNew}
          />
          <Button
            label={t('editor.save') || 'Salvar'}
            icon="pi pi-save"
            loading={isSaving}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Outline Editor Page Wrapper
   ========================================================================== */

import { PageLayout, Card } from '@/app/layout';

export function OutlineEditorPage() {
  const { t } = useTranslation('outlines');
  const navigate = useAppNavigate();
  const params = useParams();
  const isNew = !params.id;

  return (
    <PageLayout
      title={isNew ? t('new', 'Novo Esboço') : t('edit', 'Editar Esboço')}
      description={isNew ? 'Crie um novo esboço de pregação' : 'Escreva e estruture seu sermão'}
      actions={
        <>
          <Button
            label={t('preview') || 'Visualizar'}
            icon="pi pi-eye"
            severity="secondary"
            className="p-2 mr-2"
            onClick={() => params.id && navigate.goToOutlinePreview(params.id)}
            disabled={isNew}
          />
          <Button
            label={t('back') || 'Voltar'}
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={() => navigate.goTo(routes.outlines)}
          />
        </>
      }
    >
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <OutlineEditor outlineId={params.id} isNew={isNew} />
      </Card>
    </PageLayout>
  );
}