import { z } from 'zod';

export const FolderSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string().min(1, 'Nome da pasta é obrigatório'),
  parent_id: z.string().uuid().nullable().default(null),
  color: z.string().nullable().default(null),
  icon: z.string().nullable().default(null),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Folder = z.infer<typeof FolderSchema>;

export const TagSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string().min(1, 'Nome da tag é obrigatório'),
  color: z.string().nullable().default(null),
  created_at: z.string().datetime().optional(),
});
export type Tag = z.infer<typeof TagSchema>;

export const EventTypeSchema = z.enum([
  'culto',
  'ebd',
  'estudo',
  'conferencia',
  'reuniao',
  'outro',
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const EventStatusSchema = z.enum([
  'scheduled',
  'completed',
  'cancelled',
]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  title: z.string().min(1, 'Título do compromisso é obrigatório'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora deve estar no formato HH:MM'),
  location: z.string().nullable().default(null),
  event_type: EventTypeSchema.default('culto'),
  document_id: z.string().uuid().nullable().default(null),
  notes: z.string().nullable().default(null),
  status: EventStatusSchema.default('scheduled'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Event = z.infer<typeof EventSchema>;

export const LibraryItemTypeSchema = z.enum([
  'illustration',
  'quote',
  'exegetical_note',
  'commentary',
  'outline_template',
]);
export type LibraryItemType = z.infer<typeof LibraryItemTypeSchema>;

export const LibraryItemSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  item_type: LibraryItemTypeSchema.default('illustration'),
  title: z.string().min(1, 'Título do item é obrigatório'),
  author: z.string().nullable().default(null),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  citation: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  bible_references: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type LibraryItem = z.infer<typeof LibraryItemSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  avatar_url: z.string().url().nullable().default(null),
  role: z.string().nullable().default(null),
  denomination: z.string().nullable().default(null),
  theme_preference: z.enum(['system', 'light', 'dark']).default('system'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;
