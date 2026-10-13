import type { BibleBook } from './types';

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento (39 livros)
  { id: 1, name: 'Gênesis', abbrev: 'Gn', testament: 'OT', chapters: 50, aliases: ['genesis', 'gn', 'gen', 'gn.'] },
  { id: 2, name: 'Êxodo', abbrev: 'Êx', testament: 'OT', chapters: 40, aliases: ['exodo', 'ex', 'êx', 'exod', 'êx.'] },
  { id: 3, name: 'Levítico', abbrev: 'Lv', testament: 'OT', chapters: 27, aliases: ['levitico', 'lv', 'lev', 'lv.'] },
  { id: 4, name: 'Números', abbrev: 'Nm', testament: 'OT', chapters: 36, aliases: ['numeros', 'nm', 'num', 'nm.'] },
  { id: 5, name: 'Deuteronômio', abbrev: 'Dt', testament: 'OT', chapters: 34, aliases: ['deuteronomio', 'dt', 'deut', 'dt.'] },
  { id: 6, name: 'Josué', abbrev: 'Js', testament: 'OT', chapters: 24, aliases: ['josue', 'js', 'jos', 'js.'] },
  { id: 7, name: 'Juízes', abbrev: 'Jz', testament: 'OT', chapters: 21, aliases: ['juizes', 'jz', 'juiz', 'jz.'] },
  { id: 8, name: 'Rute', abbrev: 'Rt', testament: 'OT', chapters: 4, aliases: ['rute', 'rt', 'rt.'] },
  { id: 9, name: '1 Samuel', abbrev: '1Sm', testament: 'OT', chapters: 31, aliases: ['1samuel', '1 samuel', '1sm', '1 sm', '1sam', '1 sam'] },
  { id: 10, name: '2 Samuel', abbrev: '2Sm', testament: 'OT', chapters: 24, aliases: ['2samuel', '2 samuel', '2sm', '2 sm', '2sam', '2 sam'] },
  { id: 11, name: '1 Reis', abbrev: '1Rs', testament: 'OT', chapters: 22, aliases: ['1reis', '1 reis', '1rs', '1 rs', '1re', '1 re'] },
  { id: 12, name: '2 Reis', abbrev: '2Rs', testament: 'OT', chapters: 25, aliases: ['2reis', '2 reis', '2rs', '2 rs', '2re', '2 re'] },
  { id: 13, name: '1 Crônicas', abbrev: '1Cr', testament: 'OT', chapters: 29, aliases: ['1cronicas', '1 cronicas', '1cr', '1 cr', '1cron', '1 cron'] },
  { id: 14, name: '2 Crônicas', abbrev: '2Cr', testament: 'OT', chapters: 36, aliases: ['2cronicas', '2 cronicas', '2cr', '2 cr', '2cron', '2 cron'] },
  { id: 15, name: 'Esdras', abbrev: 'Ed', testament: 'OT', chapters: 10, aliases: ['esdras', 'ed', 'esd', 'ed.'] },
  { id: 16, name: 'Neemias', abbrev: 'Ne', testament: 'OT', chapters: 13, aliases: ['neemias', 'ne', 'neem', 'ne.'] },
  { id: 17, name: 'Ester', abbrev: 'Et', testament: 'OT', chapters: 10, aliases: ['ester', 'et', 'est', 'et.'] },
  { id: 18, name: 'Jó', abbrev: 'Jó', testament: 'OT', chapters: 42, aliases: ['jo', 'jó', 'job'] },
  { id: 19, name: 'Salmos', abbrev: 'Sl', testament: 'OT', chapters: 150, aliases: ['salmos', 'salmo', 'sl', 'psalms', 'psalm', 'sl.'] },
  { id: 20, name: 'Provérbios', abbrev: 'Pv', testament: 'OT', chapters: 31, aliases: ['proverbios', 'proverbio', 'pv', 'prov', 'pv.'] },
  { id: 21, name: 'Eclesiastes', abbrev: 'Ec', testament: 'OT', chapters: 12, aliases: ['eclesiastes', 'ec', 'ecl', 'ec.'] },
  { id: 22, name: 'Cânticos', abbrev: 'Ct', testament: 'OT', chapters: 8, aliases: ['canticos', 'cantares', 'ct', 'cant', 'ct.'] },
  { id: 23, name: 'Isaías', abbrev: 'Is', testament: 'OT', chapters: 66, aliases: ['isaias', 'is', 'isa', 'is.'] },
  { id: 24, name: 'Jeremias', abbrev: 'Jr', testament: 'OT', chapters: 52, aliases: ['jeremias', 'jr', 'jer', 'jr.'] },
  { id: 25, name: 'Lamentações', abbrev: 'Lm', testament: 'OT', chapters: 5, aliases: ['lamentacoes', 'lm', 'lam', 'lm.'] },
  { id: 26, name: 'Ezequiel', abbrev: 'Ez', testament: 'OT', chapters: 48, aliases: ['ezequiel', 'ez', 'ezeq', 'ez.'] },
  { id: 27, name: 'Daniel', abbrev: 'Dn', testament: 'OT', chapters: 12, aliases: ['daniel', 'dn', 'dan', 'dn.'] },
  { id: 28, name: 'Oseias', abbrev: 'Os', testament: 'OT', chapters: 14, aliases: ['oseias', 'os', 'ose', 'os.'] },
  { id: 29, name: 'Joel', abbrev: 'Jl', testament: 'OT', chapters: 3, aliases: ['joel', 'jl', 'jl.'] },
  { id: 30, name: 'Amós', abbrev: 'Am', testament: 'OT', chapters: 9, aliases: ['amos', 'am', 'am.'] },
  { id: 31, name: 'Obadias', abbrev: 'Ob', testament: 'OT', chapters: 1, aliases: ['obadias', 'ob', 'obad', 'ob.'] },
  { id: 32, name: 'Jonas', abbrev: 'Jn', testament: 'OT', chapters: 4, aliases: ['jonas', 'jn', 'jon', 'jn.'] },
  { id: 33, name: 'Miqueias', abbrev: 'Mq', testament: 'OT', chapters: 7, aliases: ['miqueias', 'mq', 'miq', 'mq.'] },
  { id: 34, name: 'Naum', abbrev: 'Na', testament: 'OT', chapters: 3, aliases: ['naum', 'na', 'na.'] },
  { id: 35, name: 'Habacuque', abbrev: 'Hc', testament: 'OT', chapters: 3, aliases: ['habacuque', 'hc', 'hab', 'hc.'] },
  { id: 36, name: 'Sofonias', abbrev: 'Sf', testament: 'OT', chapters: 3, aliases: ['sofonias', 'sf', 'sof', 'sf.'] },
  { id: 37, name: 'Ageu', abbrev: 'Ag', testament: 'OT', chapters: 2, aliases: ['ageu', 'ag', 'ag.'] },
  { id: 38, name: 'Zacarias', abbrev: 'Zc', testament: 'OT', chapters: 14, aliases: ['zacarias', 'zc', 'zac', 'zc.'] },
  { id: 39, name: 'Malaquias', abbrev: 'Ml', testament: 'OT', chapters: 4, aliases: ['malaquias', 'ml', 'mal', 'ml.'] },

  // Novo Testamento (27 livros)
  { id: 40, name: 'Mateus', abbrev: 'Mt', testament: 'NT', chapters: 28, aliases: ['mateus', 'mt', 'mat', 'mt.'] },
  { id: 41, name: 'Marcos', abbrev: 'Mc', testament: 'NT', chapters: 16, aliases: ['marcos', 'mc', 'marc', 'mc.'] },
  { id: 42, name: 'Lucas', abbrev: 'Lc', testament: 'NT', chapters: 24, aliases: ['lucas', 'lc', 'luc', 'lc.'] },
  { id: 43, name: 'João', abbrev: 'Jo', testament: 'NT', chapters: 21, aliases: ['joao', 'jo', 'joh', 'jo.'] },
  { id: 44, name: 'Atos', abbrev: 'At', testament: 'NT', chapters: 28, aliases: ['atos', 'at', 'act', 'at.'] },
  { id: 45, name: 'Romanos', abbrev: 'Rm', testament: 'NT', chapters: 16, aliases: ['romanos', 'rm', 'rom', 'rm.'] },
  { id: 46, name: '1 Coríntios', abbrev: '1Co', testament: 'NT', chapters: 16, aliases: ['1corintios', '1 corintios', '1co', '1 co', '1cor', '1 cor'] },
  { id: 47, name: '2 Coríntios', abbrev: '2Co', testament: 'NT', chapters: 13, aliases: ['2corintios', '2 corintios', '2co', '2 co', '2cor', '2 cor'] },
  { id: 48, name: 'Gálatas', abbrev: 'Gl', testament: 'NT', chapters: 6, aliases: ['galatas', 'gl', 'gal', 'gl.'] },
  { id: 49, name: 'Efésios', abbrev: 'Ef', testament: 'NT', chapters: 6, aliases: ['efesios', 'ef', 'efe', 'ef.'] },
  { id: 50, name: 'Filipenses', abbrev: 'Fp', testament: 'NT', chapters: 4, aliases: ['filipenses', 'fp', 'fil', 'fp.'] },
  { id: 51, name: 'Colossenses', abbrev: 'Cl', testament: 'NT', chapters: 4, aliases: ['colossenses', 'cl', 'col', 'cl.'] },
  { id: 52, name: '1 Tessalonicenses', abbrev: '1Ts', testament: 'NT', chapters: 5, aliases: ['1tessalonicenses', '1 tessalonicenses', '1ts', '1 ts', '1tes', '1 tes'] },
  { id: 53, name: '2 Tessalonicenses', abbrev: '2Ts', testament: 'NT', chapters: 3, aliases: ['2tessalonicenses', '2 tessalonicenses', '2ts', '2 ts', '2tes', '2 tes'] },
  { id: 54, name: '1 Timóteo', abbrev: '1Tm', testament: 'NT', chapters: 6, aliases: ['1timoteo', '1 timoteo', '1tm', '1 tm', '1tim', '1 tim'] },
  { id: 55, name: '2 Timóteo', abbrev: '2Tm', testament: 'NT', chapters: 4, aliases: ['2timoteo', '2 timoteo', '2tm', '2 tm', '2tim', '2 tim'] },
  { id: 56, name: 'Tito', abbrev: 'Tt', testament: 'NT', chapters: 3, aliases: ['tito', 'tt', 'tit', 'tt.'] },
  { id: 57, name: 'Filemom', abbrev: 'Fm', testament: 'NT', chapters: 1, aliases: ['filemom', 'fm', 'flm', 'fm.'] },
  { id: 58, name: 'Hebreus', abbrev: 'Hb', testament: 'NT', chapters: 13, aliases: ['hebreus', 'hb', 'heb', 'hb.'] },
  { id: 59, name: 'Tiago', abbrev: 'Tg', testament: 'NT', chapters: 5, aliases: ['tiago', 'tg', 'tia', 'tg.'] },
  { id: 60, name: '1 Pedro', abbrev: '1Pe', testament: 'NT', chapters: 5, aliases: ['1pedro', '1 pedro', '1pe', '1 pe', '1ped', '1 ped'] },
  { id: 61, name: '2 Pedro', abbrev: '2Pe', testament: 'NT', chapters: 3, aliases: ['2pedro', '2 pedro', '2pe', '2 pe', '2ped', '2 ped'] },
  { id: 62, name: '1 João', abbrev: '1Jo', testament: 'NT', chapters: 5, aliases: ['1joao', '1 joao', '1jo', '1 jo'] },
  { id: 63, name: '2 João', abbrev: '2Jo', testament: 'NT', chapters: 1, aliases: ['2joao', '2 joao', '2jo', '2 jo'] },
  { id: 64, name: '3 João', abbrev: '3Jo', testament: 'NT', chapters: 1, aliases: ['3joao', '3 joao', '3jo', '3 jo'] },
  { id: 65, name: 'Judas', abbrev: 'Jd', testament: 'NT', chapters: 1, aliases: ['judas', 'jd', 'jud', 'jd.'] },
  { id: 66, name: 'Apocalipse', abbrev: 'Ap', testament: 'NT', chapters: 22, aliases: ['apocalipse', 'ap', 'apoc', 'rev', 'revelation', 'ap.'] },
];

const aliasMap = new Map<string, BibleBook>();

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .trim();
}

for (const book of BIBLE_BOOKS) {
  aliasMap.set(normalizeStr(book.name), book);
  aliasMap.set(normalizeStr(book.abbrev), book);
  for (const alias of book.aliases) {
    aliasMap.set(normalizeStr(alias), book);
  }
}

export function findBibleBook(nameOrAlias: string): BibleBook | undefined {
  const norm = normalizeStr(nameOrAlias);
  return aliasMap.get(norm);
}
