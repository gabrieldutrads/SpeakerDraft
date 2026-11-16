import { describe, it, expect } from 'vitest';
import { DocumentSchema, CreateDocumentInputSchema } from '../src/schemas/document';
import { FolderSchema, EventSchema } from '../src/schemas/models';

describe('Schemas Zod do Core', () => {
  it('deve validar um documento válido e definir valores padrão', () => {
    const input = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      owner_id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Meu Sermão',
    };
    const parsed = DocumentSchema.parse(input);
    
    expect(parsed.title).toBe('Meu Sermão');
    expect(parsed.status).toBe('draft'); // Valor padrão testado
    expect(parsed.kind).toBe('sermon'); // Valor padrão testado
    expect(parsed.bible_references).toEqual([]);
  });

  it('deve rejeitar um documento sem título', () => {
    const input = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      owner_id: '123e4567-e89b-12d3-a456-426614174001',
      title: '', // Inválido
    };
    expect(() => DocumentSchema.parse(input)).toThrow();
  });

  it('deve validar um input de criação sem id', () => {
    const input = { title: 'Novo Estudo' };
    const parsed = CreateDocumentInputSchema.parse(input);
    expect(parsed.title).toBe('Novo Estudo');
  });

  it('deve validar uma pasta válida', () => {
    const input = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      owner_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Minha Pasta'
    };
    const parsed = FolderSchema.parse(input);
    expect(parsed.name).toBe('Minha Pasta');
    expect(parsed.parent_id).toBeNull();
  });

  it('deve rejeitar evento com data em formato inválido', () => {
    const input = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      owner_id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Culto',
      date: '10/10/2026', // Formato inválido (deve ser YYYY-MM-DD)
      time: '19:00'
    };
    expect(() => EventSchema.parse(input)).toThrow();
  });
});