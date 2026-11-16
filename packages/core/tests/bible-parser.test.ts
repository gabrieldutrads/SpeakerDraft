import { describe, it, expect } from 'vitest';
import { parseBibleReference, extractBibleReferences } from '../src/bible/reference-parser';

describe('Parser de Referências Bíblicas', () => {
  it('deve parsear um versículo simples (João 3:16)', () => {
    const result = parseBibleReference('João 3:16');
    expect(result).not.toBeNull();
    expect(result?.bookName).toBe('João');
    expect(result?.chapterStart).toBe(3);
    expect(result?.verseStart).toBe(16);
    expect(result?.canonical).toBe('João 3:16');
  });

  it('deve parsear abreviações (1Co 13:4-8)', () => {
    const result = parseBibleReference('1Co 13:4-8');
    expect(result?.bookName).toBe('1 Coríntios');
    expect(result?.chapterStart).toBe(13);
    expect(result?.verseStart).toBe(4);
    expect(result?.verseEnd).toBe(8);
  });

  it('deve extrair múltiplas referências de um texto', () => {
    const text = 'Como diz em João 3:16 e também em Salmos 23:1, Deus é bom.';
    const results = extractBibleReferences(text);
    
    expect(results.length).toBe(2);
    expect(results[0].bookName).toBe('João');
    expect(results[1].bookName).toBe('Salmos');
  });

  it('deve retornar null para texto sem referência', () => {
    const result = parseBibleReference('Isso não é um versículo.');
    expect(result).toBeNull();
  });
});