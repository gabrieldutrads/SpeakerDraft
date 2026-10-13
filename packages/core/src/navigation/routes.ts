/**
 * Canonical navigation routes and deep link scheme for SpeakerDraft.
 */

export const DEEP_LINK_SCHEME = 'speakerdraft://';

export const APP_ROUTES = {
  HOME: '/',
  DOCUMENTS: '/documents',
  DOCUMENT_EDITOR: (id: string = ':id') => `/documents/${id}`,
  PREACH_MODE: (id: string = ':id') => `/preach/${id}`,
  BIBLE: '/bible',
  BIBLE_PASSAGE: (book: string = ':book', chapter: number | string = ':chapter') =>
    `/bible/${book}/${chapter}`,
  AGENDA: '/agenda',
  LIBRARY: '/library',
  SEARCH: '/search',
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const;

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Início', icon: 'home', path: APP_ROUTES.HOME },
  { id: 'documents', label: 'Esboços', icon: 'file', path: APP_ROUTES.DOCUMENTS },
  { id: 'bible', label: 'Bíblia', icon: 'book', path: APP_ROUTES.BIBLE },
  { id: 'agenda', label: 'Agenda', icon: 'calendar', path: APP_ROUTES.AGENDA },
  { id: 'library', label: 'Biblioteca', icon: 'library', path: APP_ROUTES.LIBRARY },
];
