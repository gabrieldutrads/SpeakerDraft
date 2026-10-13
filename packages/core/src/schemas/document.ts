import { z } from 'zod';

export const DocumentKindSchema = z.enum([
  'sermon',
  'teaching',
  'devotional',
  'study_note',
  'quick_note',
]);
export type DocumentKind = z.infer<typeof DocumentKindSchema>;

export const DocumentStatusSchema = z.enum([
  'draft',
  'in_progress',
  'ready',
  'archived',
]);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

// Canonical ProseMirror / TipTap node schemas
export const InlineMarkSchema = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.unknown()).optional(),
});
export type InlineMark = z.infer<typeof InlineMarkSchema>;

export const ProseMirrorInlineNodeSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: z.array(InlineMarkSchema).optional(),
});
export type ProseMirrorInlineNode = z.infer<typeof ProseMirrorInlineNodeSchema>;

export const ProseMirrorBlockNodeSchema: z.ZodType<{
  type: string;
  attrs?: Record<string, unknown>;
  content?: unknown[];
}> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(z.union([ProseMirrorInlineNodeSchema, ProseMirrorBlockNodeSchema])).optional(),
  })
);

export const ProseMirrorDocSchema = z.object({
  type: z.literal('doc'),
  content: z.array(ProseMirrorBlockNodeSchema),
  schema_version: z.number().default(1),
});
export type ProseMirrorDoc = z.infer<typeof ProseMirrorDocSchema>;

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  kind: DocumentKindSchema.default('sermon'),
  title: z.string().min(1, 'O título não pode estar vazio').default('Sem título'),
  bible_references: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  folder_id: z.string().uuid().nullable().default(null),
  status: DocumentStatusSchema.default('draft'),
  content: ProseMirrorDocSchema.default({
    type: 'doc',
    schema_version: 1,
    content: [{ type: 'paragraph' }],
  }),
  plain_text: z.string().default(''),
  duration_minutes: z.number().int().positive().nullable().default(null),
  preached_at: z.string().datetime().nullable().default(null),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const CreateDocumentInputSchema = DocumentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  owner_id: true,
  kind: true,
  bible_references: true,
  tags: true,
  folder_id: true,
  status: true,
  content: true,
  plain_text: true,
  duration_minutes: true,
  preached_at: true,
});
export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;

export const UpdateDocumentInputSchema = DocumentSchema.partial().omit({
  id: true,
  owner_id: true,
});
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentInputSchema>;
