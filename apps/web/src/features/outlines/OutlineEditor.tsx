import { useEditor, EditorContent } from '@tiptap/react';
import { Mark, mergeAttributes } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes, useAppNavigate } from '@/app/router';
import { getRepositories, queryKeys } from '@/lib/repositories';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { bibleApi, BIBLE_BOOKS, type BibleChapter } from '@speaker-draft/core';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
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

// Marca de estilo compatível com o JSON TipTap, sem instalar dependências novas.
// Atributos persistem junto ao conteúdo do esboço.
const RichTextStyle = Mark.create({
  name: 'textStyle',
  priority: 101,
  addAttributes() {
    return {
      color: { default: null, parseHTML: element => (element as HTMLElement).style.color || null },
      fontSize: { default: null, parseHTML: element => (element as HTMLElement).style.fontSize || null },
      fontFamily: { default: null, parseHTML: element => (element as HTMLElement).style.fontFamily || null },
    };
  },
  parseHTML() { return [{ tag: 'span[style]' }]; },
  renderHTML({ HTMLAttributes }) {
    const { color, fontSize, fontFamily, ...rest } = HTMLAttributes;
    const style = [color && `color: ${color}`, fontSize && `font-size: ${fontSize}`, fontFamily && `font-family: ${fontFamily}`].filter(Boolean).join('; ');
    return ['span', mergeAttributes(rest, style ? { style } : {}), 0];
  },
});

const HIGHLIGHT_COLORS = ['#F9DE74','#FBCFE8','#BFDBFE','#BBF7D0','#FED7AA','#E9D5FF'];
const COLOR_SWATCHES = ['#17243A','#000000','#FFFFFF','#6B7280','#B91C1C','#EA580C','#D97706','#CA8A04','#166534','#0F766E','#1D4ED8','#4338CA','#7C3AED','#BE185D','#DB2777','#C6A66A'];

/* ==========================================================================
   Outline Editor Component
   ========================================================================== */

interface OutlineEditorProps {
  outlineId?: string;
  isNew?: boolean;
}

export function OutlineEditor({ outlineId, isNew = false }: OutlineEditorProps) {
  const navigate = useNavigate();
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
  const [activePalette, setActivePalette] = useState<'font' | 'highlight' | null>(null);
  const [customFontColor, setCustomFontColor] = useState('#17243a');
  const [customHighlightColor, setCustomHighlightColor] = useState('#f9de74');
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Atalho @: o cursor é salvo antes de abrir o seletor, para a citação
  // entrar no ponto certo mesmo depois de clicar nos controles do painel.
  const editorPaperRef = useRef<HTMLDivElement>(null);
  const bibleInsertionPosRef = useRef<number | null>(null);
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [biblePickerOpen, setBiblePickerOpen] = useState(false);
  const [mentionPoint, setMentionPoint] = useState({ left: 20, top: 48 });
  const [pickerBookId, setPickerBookId] = useState<number>(BIBLE_BOOKS[18].id);
  const [pickerChapter, setPickerChapter] = useState(23);
  const [pickerVerseStart, setPickerVerseStart] = useState(1);
  const [pickerVerseEnd, setPickerVerseEnd] = useState(1);
  const [pickerChapterData, setPickerChapterData] = useState<BibleChapter | null>(null);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState('');
  const pickerBook = BIBLE_BOOKS.find(book => book.id === pickerBookId) ?? BIBLE_BOOKS[18];

  // A fonte da Bíblia é o mesmo serviço já utilizado no leitor e por sua
  // vez só oferece traduções verificadas. Não duplica nem inventa o texto.
  useEffect(() => {
    if (!biblePickerOpen) return;
    let active = true;
    setPickerLoading(true);
    setPickerError('');
    setPickerChapterData(null);
    bibleApi.getChapter(pickerBookId, pickerChapter, 'pt')
      .then(data => { if (active) setPickerChapterData(data); })
      .catch(error => { if (active) setPickerError(error instanceof Error ? error.message : 'Falha ao carregar capítulo.'); })
      .finally(() => { if (active) setPickerLoading(false); });
    return () => { active = false; };
  }, [biblePickerOpen, pickerBookId, pickerChapter]);

  const cancelBibleMention = () => {
    setMentionMenuOpen(false);
    setBiblePickerOpen(false);
    bibleInsertionPosRef.current = null;
  };

  const openBiblePicker = () => {
    setMentionMenuOpen(false);
    setPickerError('');
    setPickerVerseStart(1);
    setPickerVerseEnd(1);
    setBiblePickerOpen(true);
  };

  const addChosenBibleVerses = () => {
    if (!editor || !pickerChapterData || bibleInsertionPosRef.current === null) return;
    const verses = pickerChapterData.verses.filter(verse =>
      verse.verse >= pickerVerseStart && verse.verse <= pickerVerseEnd && verse.text?.trim()
    );
    if (!verses.length) { setPickerError('Selecione um versículo disponível.'); return; }
    const verseText = verses.map(verse => verse.text.trim()).join(' ');
    const referenceLabel = `${pickerBook.name} ${pickerChapter}:${pickerVerseStart}${pickerVerseEnd !== pickerVerseStart ? `-${pickerVerseEnd}` : ''} (Bíblia Livre)`;
    const at = Math.min(bibleInsertionPosRef.current, editor.state.doc.content.size);
    // É o mesmo nó TipTap de citação do editor, então permanece editável,
    // é salvo via repositório existente e sai formatado na visualização.
    editor.chain().focus().insertContentAt(at, [{
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: verseText }] },
        { type: 'paragraph', content: [{ type: 'text', text: `— ${referenceLabel}` }] },
      ],
    }, { type: 'paragraph' }]).run();
    cancelBibleMention();
  };


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
        placeholder: 'Comece a escrever sua mensagem...' ,
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
      RichTextStyle,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
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
        class: 'op-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save logic could go here
    },
  });

  // Ao editar um esboço, a consulta é assíncrona: sincronizar o conteúdo carregado.
  useEffect(() => {
    if (editor && outline?.content) {
      editor.commands.setContent(outline.content);
    }
  }, [editor, outline?.id]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; reference: string; content: any; category: string; status: 'draft' | 'ready' }) => {
      if (isEditing && currentOutlineId) {
        return repos.outlines.update(currentOutlineId, {
          title: data.title,
          reference: data.reference,
          content: data.content,
          category: data.category,
          status: data.status,
        });
      } else {
        return repos.outlines.create({
          title: data.title,
          reference: data.reference,
          content: data.content,
          category: data.category,
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
      alert('Não foi possível salvar o esboço.');
    },
  });

  // Handle saving
  const handleSave = useCallback(async () => {
    if (!editor || !title.trim()) {
      alert('Informe o título do esboço antes de salvar.');
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
    // Os comandos TipTap têm nomes set* e assinaturas diferentes.
    // Um switch explícito preserva a tipagem e a inserção de cada bloco.
    switch (type) {
      case 'scriptureBlock':
        editor.chain().focus().setScriptureBlock(defaultAttrs).run();
        break;
      case 'illustrationBlock':
        editor.chain().focus().setIllustrationBlock(defaultAttrs).run();
        break;
      case 'applicationBlock':
        editor.chain().focus().setApplicationBlock(defaultAttrs).run();
        break;
      case 'transitionBlock':
        editor.chain().focus().setTransitionBlock(defaultAttrs).run();
        break;
      case 'conclusionBlock':
        editor.chain().focus().setConclusionBlock(defaultAttrs).run();
        break;
      case 'prayerBlock':
        editor.chain().focus().setPrayerBlock(defaultAttrs).run();
        break;
    }
    setShowBlockMenu(false);
  }, [editor]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '@' && editor && !e.altKey && !e.ctrlKey && !e.metaKey) {
      // Ativa o comando sem inserir @ no texto. Cancelar deixa o conteúdo intacto.
      e.preventDefault();
      const at = editor.state.selection.from;
      bibleInsertionPosRef.current = at;
      const rect = editorPaperRef.current?.getBoundingClientRect();
      try {
        const caret = editor.view.coordsAtPos(at);
        if (rect) setMentionPoint({
          left: Math.max(12, Math.min(caret.left - rect.left, rect.width - 275)),
          top: Math.max(14, caret.bottom - rect.top + 10),
        });
      } catch { setMentionPoint({ left: 20, top: 48 }); }
      setBiblePickerOpen(false);
      setMentionMenuOpen(true);
    }
    if (e.key === '/' && editor) { e.preventDefault(); setShowBlockMenu(true); }
    if (e.key === 'Escape') {
      setShowBlockMenu(false);
      cancelBibleMention();
    }
  }, [editor]);

  const addLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Cole o endereço do link (https://...)', previous || 'https://');
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    try {
      const parsed = new URL(url.trim());
      if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Protocolo inválido');
      editor.chain().focus().extendMarkRange('link').setLink({ href: parsed.toString() }).run();
    } catch { window.alert('Informe um link http:// ou https:// válido.'); }
  };

  // Importação local: a imagem é reduzida e incorporada ao JSON do TipTap.
  // É uma solução temporária até a integração com Supabase Storage.
  const importImage = async (file: File) => {
    if (!editor) return;
    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Escolha um arquivo de imagem (PNG, JPG ou WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError('A imagem deve ter no máximo 8 MB antes da compactação.');
      return;
    }
    try {
      const imageUrl = URL.createObjectURL(file);
      try {
        const image = new window.Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
          image.src = imageUrl;
        });
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Não foi possível preparar a imagem.');
        // Fundo branco evita que transparências fiquem pretas ao salvar em JPEG.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.76);
        if (dataUrl.length > 900_000) {
          setImageError('A imagem ainda ficou muito grande. Tente uma imagem menor.');
          return;
        }
        editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Falha ao importar a imagem.');
    }
  };

  const applyFontColor = (color: string) => {
    editor?.chain().focus().setMark('textStyle', { color }).run();
    setActivePalette(null);
  };
  const applyHighlightColor = (color: string) => {
    editor?.chain().focus().setHighlight({ color }).run();
    setActivePalette(null);
  };

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
        <p className="text-secondary">Esboço não encontrado</p>
        <Button label="Voltar aos esboços" icon="pi pi-arrow-left" severity="secondary" onClick={() => navigate(routes.outlines)} />
      </div>
    );
  }

  const tool = (label: string, icon: string, action: () => void, active = false, disabled = false) => (
    <button type="button" title={label} aria-label={label} aria-pressed={active}
      className={`op-tool ${active ? 'op-tool-active' : ''}`}
      onClick={action} disabled={disabled || !editor}>
      {icon.startsWith('txt:') ? <span className="op-tool-glyph" aria-hidden="true">{icon.slice(4)}</span> : <i className={`pi ${icon}`} aria-hidden="true" />}
    </button>
  );

  return (
    <section className="op-studio" aria-label="Editor de esboços">
      <div className="op-studio-heading">
        <div><span className="op-studio-eyebrow">ESTÚDIO DE MENSAGENS</span>
          <h2>{isNew ? 'Preparar novo esboço' : 'Editar esboço'}</h2>
          <p>Organize a Palavra e desenvolva sua mensagem com clareza.</p>
        </div>
        <span className="op-studio-status"><i className="pi pi-circle-fill" /> {status === 'draft' ? 'Rascunho' : 'Pronto'}</span>
      </div>

      <div className="op-studio-fields">
        <label className="op-field op-field-title"><span>Título da mensagem</span>
          <InputText value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ex.: A fé que vence o impossível" aria-label="Título da mensagem" />
        </label>
        <label className="op-field"><span>Referência bíblica</span>
          <InputText value={reference} onChange={e => setReference(e.target.value)}
            placeholder="Ex.: Hebreus 11:1" aria-label="Referência bíblica" />
        </label>
        <label className="op-field"><span>Categoria</span>
          <Dropdown value={selectedCategory} onChange={e => setSelectedCategory(e.value)}
            options={categories} placeholder="Selecione a categoria" optionLabel="label" optionValue="value" />
        </label>
        <label className="op-field"><span>Situação</span>
          <Dropdown value={status} onChange={e => setStatus(e.value)}
            options={[{label:'Rascunho',value:'draft'},{label:'Pronto',value:'ready'}]}
            optionLabel="label" optionValue="value" />
        </label>
      </div>

      <div className="op-studio-workspace">
        <div className="op-studio-toolbar" role="toolbar" aria-label="Formatação do esboço">
          <div className="op-tool-group">
            {tool('Desfazer', 'pi-undo', () => editor?.chain().focus().undo().run(), false, !canUndo)}
            {tool('Refazer', 'pi-refresh', () => editor?.chain().focus().redo().run(), false, !canRedo)}
          </div>
          <div className="op-tool-group">
            {tool('Título 1', 'txt:H₁', () => editor?.chain().focus().toggleHeading({level:1}).run(), isActiveHeading(1))}
            {tool('Título 2', 'txt:H₂', () => editor?.chain().focus().toggleHeading({level:2}).run(), isActiveHeading(2))}
            {tool('Título 3', 'txt:H₃', () => editor?.chain().focus().toggleHeading({level:3}).run(), isActiveHeading(3))}
          </div>
          <div className="op-tool-group">
            {tool('Negrito (Ctrl+B)', 'txt:B', () => editor?.chain().focus().toggleBold().run(), isActiveMark('bold'))}
            {tool('Itálico (Ctrl+I)', 'txt:I', () => editor?.chain().focus().toggleItalic().run(), isActiveMark('italic'))}
            {tool('Sublinhado (Ctrl+U)', 'txt:U̲', () => editor?.chain().focus().toggleUnderline().run(), isActiveMark('underline'))}
            {tool('Tachado', 'txt:S̶', () => editor?.chain().focus().toggleStrike().run(), isActiveMark('strike'))}
          </div>
          <div className="op-tool-group op-format-group">
            <label className="op-select-label" title="Tipo de fonte">
              <span className="sr-only">Fonte</span>
              <select aria-label="Tipo de fonte" defaultValue="" onChange={e => { if (e.target.value) editor?.chain().focus().setMark('textStyle', { fontFamily: e.target.value }).run(); }}>
                <option value="" disabled>Fonte</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="monospace">Monoespaçada</option>
              </select>
            </label>
            <label className="op-select-label op-size-select" title="Tamanho da fonte">
              <span className="sr-only">Tamanho da fonte</span>
              <select aria-label="Tamanho da fonte" defaultValue="" onChange={e => { if (e.target.value) editor?.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run(); }}>
                <option value="" disabled>Tamanho</option>
                {['12','14','16','18','20','24','28','32','36','48'].map(size => <option key={size} value={`${size}px`}>{size} px</option>)}
              </select>
            </label>
            <div className="op-palette-wrap">
              <button type="button" className="op-tool op-color-tool" onMouseDown={e => e.preventDefault()} aria-label="Cor da fonte" title="Cor da fonte" aria-expanded={activePalette === 'font'} onClick={() => setActivePalette(v => v === 'font' ? null : 'font')}>
                <span className="op-font-icon">A</span><span className="op-color-line" style={{ background: editor?.getAttributes('textStyle').color || '#c6a66a' }} />
              </button>
              {activePalette === 'font' && <div className="op-palette op-palette-expanded" role="group" aria-label="Cores da fonte">
                <strong>Cor da fonte</strong><div className="op-swatches">
                  {COLOR_SWATCHES.map(color => <button key={color} type="button" title={color} aria-label={`Aplicar cor ${color}`} className="op-swatch" style={{ background: color }} onMouseDown={e => e.preventDefault()} onClick={() => applyFontColor(color)} />)}
                </div>
                <label className="op-custom-color">Escolher outra cor <input type="color" aria-label="Cor personalizada da fonte" value={customFontColor} onChange={e => setCustomFontColor(e.target.value)} /><button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyFontColor(customFontColor)}>Aplicar</button></label>
                <button className="op-palette-clear" type="button" onClick={() => { editor?.chain().focus().setMark('textStyle', { color: null }).run(); setActivePalette(null); }}>Remover cor</button>
              </div>}
            </div>
            <div className="op-palette-wrap">
              <button type="button" className="op-tool op-color-tool" onMouseDown={e => e.preventDefault()} aria-label="Marca-texto" title="Marca-texto" aria-expanded={activePalette === 'highlight'} onClick={() => setActivePalette(v => v === 'highlight' ? null : 'highlight')}>
                <i className="pi pi-pencil" aria-hidden="true"/><span className="op-color-line" style={{ background: editor?.getAttributes('highlight').color || '#F9DE74' }} />
              </button>
              {activePalette === 'highlight' && <div className="op-palette" role="group" aria-label="Cores do marca-texto">
                <strong>Marca-texto</strong><div className="op-swatches">
                  {HIGHLIGHT_COLORS.map(color => <button key={color} type="button" title={color} aria-label={`Destacar com ${color}`} className="op-swatch" style={{ background: color }} onMouseDown={e => e.preventDefault()} onClick={() => applyHighlightColor(color)} />)}
                </div>
                <label className="op-custom-color">Escolher outra cor <input type="color" aria-label="Cor personalizada do marca-texto" value={customHighlightColor} onChange={e => setCustomHighlightColor(e.target.value)} /><button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyHighlightColor(customHighlightColor)}>Aplicar</button></label>
                <button className="op-palette-clear" type="button" onClick={() => { editor?.chain().focus().unsetHighlight().run(); setActivePalette(null); }}>Remover destaque</button>
              </div>}
            </div>
            {tool('Limpar formatação', 'pi-eraser', () => editor?.chain().focus().unsetAllMarks().run())}
          </div>
          <div className="op-tool-group">
            {tool('Lista com marcadores', 'pi-list', () => editor?.chain().focus().toggleBulletList().run(), isActiveNode('bulletList'))}
            {tool('Lista numerada', 'pi-bars', () => editor?.chain().focus().toggleOrderedList().run(), isActiveNode('orderedList'))}
            {tool('Lista de tarefas', 'pi-check-square', () => editor?.chain().focus().toggleTaskList().run(), isActiveNode('taskList'))}
          </div>
          <div className="op-tool-group">
            {tool('Alinhar à esquerda', 'pi-align-left', () => editor?.chain().focus().setTextAlign('left').run(), isActiveTextAlign('left'))}
            {tool('Centralizar', 'pi-align-center', () => editor?.chain().focus().setTextAlign('center').run(), isActiveTextAlign('center'))}
            {tool('Alinhar à direita', 'pi-align-right', () => editor?.chain().focus().setTextAlign('right').run(), isActiveTextAlign('right'))}
          </div>
          <div className="op-tool-group">
            {tool('Citação', 'pi-comment', () => editor?.chain().focus().toggleBlockquote().run(), isActiveNode('blockquote'))}
            {tool('Bloco de código', 'pi-code', () => editor?.chain().focus().toggleCodeBlock().run(), isActiveNode('codeBlock'))}
          </div>
          <div className="op-tool-group">
            {tool('Adicionar link', 'pi-link', addLink, isActiveMark('link'))}
            <button type="button" className="op-tool" title="Inserir imagem do computador" aria-label="Inserir imagem do computador" onClick={() => imageInputRef.current?.click()}><i className="pi pi-image" aria-hidden="true" /></button>
            <input ref={imageInputRef} className="op-file-input" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Selecionar imagem do computador" onChange={e => { const file = e.currentTarget.files?.[0]; if (file) void importImage(file); e.currentTarget.value = ''; }} />
            {tool('Inserir tabela 3×3', 'pi-table', () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
            {tool('Adicionar linha horizontal', 'pi-minus', () => editor?.chain().focus().setHorizontalRule().run())}
          </div>
          <div className="op-block-trigger">
            <button type="button" className="op-insert-btn" onClick={() => setShowBlockMenu(v => !v)} aria-expanded={showBlockMenu}>
              <i className="pi pi-plus" /> Inserir bloco <i className="pi pi-chevron-down" />
            </button>
            {showBlockMenu && <div className="op-block-menu" role="menu">
              {SERMON_BLOCKS.map(block => <button key={block.type} type="button" role="menuitem" onClick={() => insertSermonBlock(block)}>
                <span aria-hidden="true">{block.icon}</span> {block.label}
              </button>)}
            </div>}
          </div>
        </div>
        {imageError && <div className="op-image-error" role="alert">{imageError}</div>}
        <div className="op-editor-paper" ref={editorPaperRef} onKeyDown={handleKeyDown}>
          <EditorContent editor={editor} />
          {mentionMenuOpen && (
            <div className="op-bible-mention-menu" role="menu" aria-label="Inserir no esboço" style={{ left: mentionPoint.left, top: mentionPoint.top }}>
              <div className="op-bible-mention-hint">INSERIR COM @</div>
              <button type="button" role="menuitem" onMouseDown={e => e.preventDefault()} onClick={openBiblePicker}>
                <span className="op-bible-mention-icon"><i className="pi pi-book" /></span>
                <span><strong>Bíblia</strong><small>Escolher uma passagem e inserir como citação</small></span>
                <i className="pi pi-chevron-right" aria-hidden="true" />
              </button>
              <div className="op-bible-mention-escape">Esc para fechar</div>
            </div>
          )}
          {biblePickerOpen && (
            <div className="op-bible-picker" role="dialog" aria-modal="false" aria-label="Inserir passagem bíblica" style={{ left: mentionPoint.left, top: mentionPoint.top }}>
              <div className="op-bible-picker-header">
                <span className="op-bible-mention-icon"><i className="pi pi-book" /></span>
                <span><strong>Adicionar passagem bíblica</strong><small>Bíblia Livre • texto inserido no esboço</small></span>
                <button type="button" aria-label="Fechar seletor" onClick={cancelBibleMention}><i className="pi pi-times" /></button>
              </div>
              <div className="op-bible-picker-fields">
                <label>Livro
                  <select value={pickerBookId} onChange={e => {
                    const id = Number(e.currentTarget.value);
                    setPickerBookId(id); setPickerChapter(1);
                    setPickerVerseStart(1); setPickerVerseEnd(1);
                  }}>
                    {BIBLE_BOOKS.map(book => <option key={book.id} value={book.id}>{book.name}</option>)}
                  </select>
                </label>
                <label>Capítulo
                  <select value={pickerChapter} onChange={e => { setPickerChapter(Number(e.currentTarget.value)); setPickerVerseStart(1); setPickerVerseEnd(1); }}>
                    {Array.from({ length: pickerBook.chapters }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                  </select>
                </label>
                <label>Versículo inicial
                  <select value={pickerVerseStart} disabled={!pickerChapterData || pickerLoading} onChange={e => {
                    const value = Number(e.currentTarget.value); setPickerVerseStart(value); setPickerVerseEnd(Math.max(value, pickerVerseEnd));
                  }}>
                    {(pickerChapterData?.verses ?? []).map(verse => <option key={verse.verse} value={verse.verse}>{verse.verse}</option>)}
                  </select>
                </label>
                <label>Até o versículo
                  <select value={pickerVerseEnd} disabled={!pickerChapterData || pickerLoading} onChange={e => setPickerVerseEnd(Number(e.currentTarget.value))}>
                    {(pickerChapterData?.verses ?? []).filter(verse => verse.verse >= pickerVerseStart).map(verse => <option key={verse.verse} value={verse.verse}>{verse.verse}</option>)}
                  </select>
                </label>
              </div>
              <div className="op-bible-picker-preview" aria-live="polite">
                {pickerLoading ? <span><i className="pi pi-spin pi-spinner" /> Carregando passagem...</span> :
                 pickerError ? <span className="op-bible-picker-error" role="alert">{pickerError}</span> :
                 pickerChapterData ? <>
                   <span className="op-bible-picker-reference">{pickerBook.name} {pickerChapter}:{pickerVerseStart}{pickerVerseEnd > pickerVerseStart ? `-${pickerVerseEnd}` : ''}</span>
                   <p>{pickerChapterData.verses.filter(verse => verse.verse >= pickerVerseStart && verse.verse <= pickerVerseEnd).map(verse => verse.text).join(' ')}</p>
                 </> : null}
              </div>
              <div className="op-bible-picker-actions">
                <button type="button" onClick={cancelBibleMention}>Cancelar</button>
                <button type="button" className="op-bible-picker-confirm" onClick={addChosenBibleVerses} disabled={pickerLoading || !pickerChapterData || !!pickerError}>
                  <i className="pi pi-plus" /> Inserir no esboço
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="op-editor-footer">
          <span><i className="pi pi-file-edit" /> {wordCount} palavras · ~{Math.ceil(wordCount/200)} min de leitura</span>
          <span>{lastSaved ? `Salvo às ${lastSaved.toLocaleTimeString()}` : 'Alterações não salvas automaticamente'}</span>
        </div>
      </div>
      <div className="op-studio-actions">
        <span className="op-studio-hint"><i className="pi pi-info-circle" /> Digite @ para inserir uma passagem bíblica. Salve antes de sair da página.</span>
        <div className="op-studio-action-buttons">
          <Button label="Visualizar" icon="pi pi-eye" severity="secondary"
            disabled={!currentOutlineId || isNew} onClick={() => currentOutlineId && navigate(routes.outlinePreview.replace(':id', currentOutlineId))} />
          <Button label="Salvar esboço" icon="pi pi-save" loading={isSaving} onClick={handleSave} className="op-save-btn" />
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Outline Editor Page Wrapper
   ========================================================================== */

import { PageLayout } from '@/app/layout';
import './outline-editor.css';

export function OutlineEditorPage() {
  const navigate = useAppNavigate();
  const params = useParams();
  const isNew = !params.id;

  return (
    <PageLayout
      title={isNew ? 'Novo esboço' : 'Editar esboço'}
      description={isNew ? 'Crie um novo esboço de pregação' : 'Escreva e estruture seu sermão'}
      actions={
        <>
          <Button
            label="Visualizar"
            icon="pi pi-eye"
            severity="secondary"
            className="p-2 mr-2"
            onClick={() => params.id && navigate.goToOutlinePreview(params.id)}
            disabled={isNew}
          />
          <Button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={() => navigate.goTo(routes.outlines)}
          />
        </>
      }
    >
      <OutlineEditor outlineId={params.id} isNew={isNew} />
    </PageLayout>
  );
}