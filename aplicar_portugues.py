#!/usr/bin/env python3
"""Atualiza namespaces i18next e os rótulos da navegação, preservando o resto do projeto.
Execute na raiz do monorepo. Faz backups datados antes de escrever.
"""
from pathlib import Path
from datetime import datetime
import sys

root = Path.cwd()
i18n_path = root / 'apps/web/src/lib/i18n.ts'
layout_path = root / 'apps/web/src/app/layout.tsx'
for p in (i18n_path, layout_path):
    if not p.exists():
        raise SystemExit(f'Arquivo não encontrado: {p}\nExecute na raiz do projeto SpeakerDraft.')

def write_with_backup(path: Path, old: str, new: str) -> None:
    if old == new:
        print(f'Sem alterações: {path.relative_to(root)}')
        return
    backup = path.with_name(f'{path.name}.backup-{datetime.now():%Y%m%d-%H%M%S}')
    backup.write_text(old, encoding='utf-8')
    path.write_text(new, encoding='utf-8')
    print(f'Atualizado: {path.relative_to(root)} | backup: {backup.name}')

source = i18n_path.read_text(encoding='utf-8')
if 'const namespacedResources =' not in source:
    marker = '/* ==========================================================================' + '\n   i18n Configuration'
    if marker not in source or '    resources,' not in source:
        raise SystemExit('Estrutura i18n diferente do snapshot: não alterei nenhum arquivo. Envie i18n.ts atual.')
    inject = '''/**
 * Compatibilidade entre as chamadas useTranslation('bible'/'agenda'/...)
 * e os recursos legados agrupados em translation.
 * Não duplica nem substitui as mensagens originais.
 */
const namespacedResources = Object.fromEntries(
  Object.entries(resources).map(([language, bundle]) => {
    const base = bundle.translation as Record<string, unknown>;
    const namespaces: Record<string, Record<string, unknown>> = { translation: base };
    for (const [name, entries] of Object.entries(base)) {
      if (entries !== null && typeof entries === 'object' && !Array.isArray(entries)) {
        const values = entries as Record<string, unknown>;
        namespaces[name] = {
          ...values,
          // Compatibilidade com páginas que usam t('bible.title') em useTranslation('bible').
          [name]: values,
          common: base.common,
          settings: base.settings,
          preaching: base.preaching,
          editor: base.editor,
          status: (base.outlines as { status?: unknown } | undefined)?.status,
        };
      }
    }
    return [language, namespaces];
  })
);

'''
    source2 = source.replace(marker, inject + marker, 1)
    source2 = source2.replace('    resources,', "    resources: namespacedResources,\n    defaultNS: 'translation',", 1)
else:
    source2 = source

# Sidebar: alterar somente literais label: dos itens do menu, sem alterar URLs, estilos ou componentes.
layout = layout_path.read_text(encoding='utf-8')
nav_labels = {
    'Dashboard': 'Painel', 'Outlines': 'Esboços', 'Bible': 'Bíblia',
    'Library': 'Biblioteca', 'Notes': 'Anotações', 'Profile': 'Perfil',
    'Appearance': 'Aparência', 'Data & Sync': 'Dados e sincronização',
    'Account': 'Conta', 'Settings': 'Configurações', 'Sign Out': 'Sair',
    'Keyboard Shortcuts': 'Atalhos de teclado',
}
layout2 = layout
for english, portuguese in nav_labels.items():
    layout2 = layout2.replace(f"label: '{english}'", f"label: '{portuguese}'")
# Textos auxiliares recorrentes no layout, sem substituir CSS ou componentes.
for english, portuguese in {
    '>Collapse<': '>Recolher<', '>Expand<': '>Expandir<',
    '>SETTINGS<': '>CONFIGURAÇÕES<',
    'aria-label="Open menu"': 'aria-label="Abrir menu"',
    'aria-label="Main navigation"': 'aria-label="Navegação principal"',
}.items():
    layout2 = layout2.replace(english, portuguese)

write_with_backup(i18n_path, i18n_path.read_text(encoding='utf-8'), source2)
write_with_backup(layout_path, layout, layout2)
print('\nConcluído. Execute: pnpm --filter "@speaker-draft/web" typecheck')
