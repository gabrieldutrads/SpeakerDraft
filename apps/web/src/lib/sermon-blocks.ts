import { Node, mergeAttributes, RawCommands } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

/* ==========================================================================
   Module Augmentation - Extend RawCommands for custom sermon block commands
   ========================================================================== */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    scriptureBlock: {
      /**
       * Insert a scripture block
       */
      setScriptureBlock: (attributes: { reference?: string; translation?: string }) => ReturnType;
    };
    illustrationBlock: {
      /**
       * Insert an illustration block
       */
      setIllustrationBlock: (attributes: { title?: string; source?: string }) => ReturnType;
    };
    applicationBlock: {
      /**
       * Insert an application block
       */
      setApplicationBlock: (attributes: { title?: string }) => ReturnType;
    };
    transitionBlock: {
      /**
       * Insert a transition block
       */
      setTransitionBlock: (attributes: { title?: string }) => ReturnType;
    };
    conclusionBlock: {
      /**
       * Insert a conclusion block
       */
      setConclusionBlock: (attributes: { title?: string }) => ReturnType;
    };
    prayerBlock: {
      /**
       * Insert a prayer block
       */
      setPrayerBlock: (attributes: { title?: string }) => ReturnType;
    };
  }
}

/* ==========================================================================
   Custom Sermon Block Nodes
   ========================================================================== */

// Scripture Block - for Bible verses
export const ScriptureBlock = Node.create({
  name: 'scriptureBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      reference: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-reference'),
        renderHTML: (attributes) => {
          if (!attributes.reference) return {};
          return { 'data-reference': attributes.reference };
        },
      },
      translation: {
        default: 'WEB',
        parseHTML: (element) => element.getAttribute('data-translation'),
        renderHTML: (attributes) => {
          if (!attributes.translation) return {};
          return { 'data-translation': attributes.translation };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="scripture-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'scripture-block', class: 'scripture-block' }), 0];
  },

  addCommands() {
    return {
      setScriptureBlock: (attributes: { reference?: string; translation?: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'text', text: '' }],
        });
      },
    };
  },
});

// Illustration Block - for sermon illustrations
export const IllustrationBlock = Node.create({
  name: 'illustrationBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
      source: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-source'),
        renderHTML: (attributes) => {
          if (!attributes.source) return {};
          return { 'data-source': attributes.source };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="illustration-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'illustration-block', class: 'illustration-block' }), 0];
  },

  addCommands() {
    return {
      setIllustrationBlock: (attributes: { title?: string; source?: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'text', text: '' }],
        });
      },
    };
  },
});

// Application Block - for practical applications
export const ApplicationBlock = Node.create({
  name: 'applicationBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: 'Aplicação',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="application-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'application-block', class: 'application-block' }), 0];
  },

  addCommands() {
    return {
      setApplicationBlock: (attributes: { title?: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'text', text: '' }],
        });
      },
    };
  },
});

// Transition Block - for sermon transitions
export const TransitionBlock = Node.create({
  name: 'transitionBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: 'Transição',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="transition-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'transition-block', class: 'transition-block' }), 0];
  },

  addCommands() {
    return {
      setTransitionBlock: (attributes: { title?: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'text', text: '' }],
        });
      },
    };
  },
});

// Conclusion Block - for sermon conclusions
export const ConclusionBlock = Node.create({
  name: 'conclusionBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: 'Conclusão',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="conclusion-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'conclusion-block', class: 'conclusion-block' }), 0];
  },

  addCommands() {
    return {
      setConclusionBlock: (attributes: { title?: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'text', text: '' }],
        });
      },
    };
  },
});

// Prayer Block - for closing prayers
export const PrayerBlock = Node.create({
  name: 'prayerBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: 'Oração',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="prayer-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'prayer-block', class: 'prayer-block' }), 0];
  },

  addCommands() {
    return {
      setPrayerBlock: (attributes: { title?: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'text', text: '' }],
        });
      },
    };
  },
});

/* ==========================================================================
   Sermon Block Types
   ========================================================================== */

export type SermonBlockType =
  | 'scriptureBlock'
  | 'illustrationBlock'
  | 'applicationBlock'
  | 'transitionBlock'
  | 'conclusionBlock'
  | 'prayerBlock';

export interface SermonBlockConfig {
  type: SermonBlockType;
  label: string;
  icon: string;
  defaultAttrs: Record<string, any>;
}

export const SERMON_BLOCKS: SermonBlockConfig[] = [
  {
    type: 'scriptureBlock',
    label: 'Escritura',
    icon: '📖',
    defaultAttrs: { reference: '', translation: 'WEB' },
  },
  {
    type: 'illustrationBlock',
    label: 'Ilustração',
    icon: '💡',
    defaultAttrs: { title: '', source: '' },
  },
  {
    type: 'applicationBlock',
    label: 'Aplicação',
    icon: '✅',
    defaultAttrs: { title: 'Aplicação' },
  },
  {
    type: 'transitionBlock',
    label: 'Transição',
    icon: '➡️',
    defaultAttrs: { title: 'Transição' },
  },
  {
    type: 'conclusionBlock',
    label: 'Conclusão',
    icon: '🎯',
    defaultAttrs: { title: 'Conclusão' },
  },
  {
    type: 'prayerBlock',
    label: 'Oração',
    icon: '🙏',
    defaultAttrs: { title: 'Oração' },
  },
];

/* ==========================================================================
   Helper Functions
   ========================================================================== */

export function getSermonBlockConfig(type: SermonBlockType): SermonBlockConfig | undefined {
  return SERMON_BLOCKS.find((block) => block.type === type);
}

export function isSermonBlock(type: string): type is SermonBlockType {
  return SERMON_BLOCKS.some((block) => block.type === type);
}