import type { Outline, StudyNote, CalendarEvent, WorkspaceData, Document, Folder, Tag, Event, LibraryItem, Profile } from '@speaker-draft/core';
import { v4 as uuidv4 } from 'uuid';

/* ==========================================================================
   Repository Interfaces
   ========================================================================== */

export interface OutlineRepository {
  getAll(): Promise<Outline[]>;
  getById(id: string): Promise<Outline | null>;
  create(outline: Omit<Outline, 'id' | 'updatedAt'>): Promise<Outline>;
  update(id: string, updates: Partial<Outline>): Promise<Outline | null>;
  delete(id: string): Promise<boolean>;
}

export interface NotesRepository {
  getAll(): Promise<StudyNote[]>;
  getById(id: string): Promise<StudyNote | null>;
  create(note: Omit<StudyNote, 'id' | 'updatedAt'>): Promise<StudyNote>;
  update(id: string, updates: Partial<StudyNote>): Promise<StudyNote | null>;
  delete(id: string): Promise<boolean>;
}

export interface EventsRepository {
  getAll(): Promise<CalendarEvent[]>;
  getById(id: string): Promise<CalendarEvent | null>;
  create(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
  delete(id: string): Promise<boolean>;
}

export interface DocumentsRepository {
  getAll(): Promise<Document[]>;
  getById(id: string): Promise<Document | null>;
  create(doc: Partial<Document>): Promise<Document>;
  update(id: string, updates: Partial<Document>): Promise<Document | null>;
  delete(id: string): Promise<boolean>;
}

export interface FoldersRepository {
  getAll(): Promise<Folder[]>;
  getById(id: string): Promise<Folder | null>;
  create(folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>): Promise<Folder>;
  update(id: string, updates: Partial<Folder>): Promise<Folder | null>;
  delete(id: string): Promise<boolean>;
}

export interface TagsRepository {
  getAll(): Promise<Tag[]>;
  getById(id: string): Promise<Tag | null>;
  create(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag>;
  update(id: string, updates: Partial<Tag>): Promise<Tag | null>;
  delete(id: string): Promise<boolean>;
}

export interface EventsRepositoryV2 {
  getAll(): Promise<Event[]>;
  getById(id: string): Promise<Event | null>;
  create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event>;
  update(id: string, updates: Partial<Event>): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
}

export interface LibraryRepository {
  getAll(): Promise<LibraryItem[]>;
  getById(id: string): Promise<LibraryItem | null>;
  create(item: Omit<LibraryItem, 'id' | 'created_at' | 'updated_at'>): Promise<LibraryItem>;
  update(id: string, updates: Partial<LibraryItem>): Promise<LibraryItem | null>;
  delete(id: string): Promise<boolean>;
}

export interface ProfileRepository {
  getProfile(): Promise<Profile | null>;
  updateProfile(updates: Partial<Profile>): Promise<Profile | null>;
}

/* ==========================================================================
   LocalStorage Implementation
   ========================================================================== */

const STORAGE_KEY = 'speakerdraft.workspace.v1';

function readWorkspace(): WorkspaceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { outlines: [], notes: [], events: [] };
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('outlines' in value) ||
      !('notes' in value) ||
      !('events' in value)
    )
      return { outlines: [], notes: [], events: [] };
    const workspace = value as WorkspaceData;
    if (
      !Array.isArray(workspace.outlines) ||
      !Array.isArray(workspace.notes) ||
      !Array.isArray(workspace.events)
    )
      return { outlines: [], notes: [], events: [] };
    return workspace;
  } catch {
    return { outlines: [], notes: [], events: [] };
  }
}

function writeWorkspace(workspace: WorkspaceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function generateId(): string {
  return uuidv4();
}

function nowISO(): string {
  return new Date().toISOString();
}

/* ==========================================================================
   LocalStorage Repository Implementations
   ========================================================================== */

export const localOutlineRepository: OutlineRepository = {
  async getAll() {
    const workspace = readWorkspace();
    return [...workspace.outlines].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getById(id: string) {
    const workspace = readWorkspace();
    return workspace.outlines.find((o) => o.id === id) || null;
  },

  async create(outline) {
    const newOutline: Outline = {
      ...outline,
      id: generateId(),
      updatedAt: nowISO(),
    };
    const workspace = readWorkspace();
    workspace.outlines.unshift(newOutline);
    writeWorkspace(workspace);
    return newOutline;
  },

  async update(id, updates) {
    const workspace = readWorkspace();
    const index = workspace.outlines.findIndex((o) => o.id === id);
    if (index < 0) return null;
    const updated = { ...workspace.outlines[index], ...updates, updatedAt: nowISO() };
    workspace.outlines[index] = updated;
    writeWorkspace(workspace);
    return updated;
  },

  async delete(id) {
    const workspace = readWorkspace();
    const index = workspace.outlines.findIndex((o) => o.id === id);
    if (index < 0) return false;
    workspace.outlines.splice(index, 1);
    writeWorkspace(workspace);
    return true;
  },
};

export const localNotesRepository: NotesRepository = {
  async getAll() {
    const workspace = readWorkspace();
    return [...workspace.notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getById(id: string) {
    const workspace = readWorkspace();
    return workspace.notes.find((n) => n.id === id) || null;
  },

  async create(note) {
    const newNote: StudyNote = {
      ...note,
      id: generateId(),
      updatedAt: nowISO(),
    };
    const workspace = readWorkspace();
    workspace.notes.unshift(newNote);
    writeWorkspace(workspace);
    return newNote;
  },

  async update(id, updates) {
    const workspace = readWorkspace();
    const index = workspace.notes.findIndex((n) => n.id === id);
    if (index < 0) return null;
    const updated = { ...workspace.notes[index], ...updates, updatedAt: nowISO() };
    workspace.notes[index] = updated;
    writeWorkspace(workspace);
    return updated;
  },

  async delete(id) {
    const workspace = readWorkspace();
    const index = workspace.notes.findIndex((n) => n.id === id);
    if (index < 0) return false;
    workspace.notes.splice(index, 1);
    writeWorkspace(workspace);
    return true;
  },
};

export const localEventsRepository: EventsRepository = {
  async getAll() {
    const workspace = readWorkspace();
    return [...workspace.events].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  },

  async getById(id: string) {
    const workspace = readWorkspace();
    return workspace.events.find((e) => e.id === id) || null;
  },

  async create(event) {
    const newEvent: CalendarEvent = {
      ...event,
      id: generateId(),
    };
    const workspace = readWorkspace();
    workspace.events.push(newEvent);
    workspace.events.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    writeWorkspace(workspace);
    return newEvent;
  },

  async update(id, updates) {
    const workspace = readWorkspace();
    const index = workspace.events.findIndex((e) => e.id === id);
    if (index < 0) return null;
    const updated = { ...workspace.events[index], ...updates };
    workspace.events[index] = updated;
    workspace.events.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    writeWorkspace(workspace);
    return updated;
  },

  async delete(id) {
    const workspace = readWorkspace();
    const index = workspace.events.findIndex((e) => e.id === id);
    if (index < 0) return false;
    workspace.events.splice(index, 1);
    writeWorkspace(workspace);
    return true;
  },
};

/* ==========================================================================
   In-Memory Repositories for New Document-based Models
   ========================================================================== */

// These are placeholders for the new document-based models
// They will be replaced with Supabase implementations later

const documentsStore = new Map<string, Document>();
const foldersStore = new Map<string, Folder>();
const tagsStore = new Map<string, Tag>();
const eventsStore = new Map<string, Event>();
const libraryStore = new Map<string, LibraryItem>();
let currentProfile: Profile | null = null;

export const localDocumentsRepository: DocumentsRepository = {
  async getAll() {
    return [...documentsStore.values()].sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
  },

  async getById(id: string) {
    return documentsStore.get(id) || null;
  },

  async create(doc) {
    const newDoc: Document = {
      id: generateId(),
      owner_id: 'demo-user-1',
      kind: 'sermon',
      title: doc.title || 'Sem título',
      bible_references: doc.bible_references || [],
      tags: doc.tags || [],
      folder_id: doc.folder_id || null,
      status: doc.status || 'draft',
      content: doc.content || { type: 'doc', schema_version: 1, content: [{ type: 'paragraph' }] },
      plain_text: doc.plain_text || '',
      duration_minutes: doc.duration_minutes || null,
      preached_at: doc.preached_at || null,
      created_at: nowISO(),
      updated_at: nowISO(),
      ...doc,
    };
    documentsStore.set(newDoc.id, newDoc);
    return newDoc;
  },

  async update(id, updates) {
    const existing = documentsStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: nowISO() };
    documentsStore.set(id, updated);
    return updated;
  },

  async delete(id) {
    return documentsStore.delete(id);
  },
};

export const localFoldersRepository: FoldersRepository = {
  async getAll() {
    return [...foldersStore.values()].sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string) {
    return foldersStore.get(id) || null;
  },

  async create(folder) {
    const newFolder: Folder = {
      ...folder,
      id: generateId(),
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    foldersStore.set(newFolder.id, newFolder);
    return newFolder;
  },

  async update(id, updates) {
    const existing = foldersStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: nowISO() };
    foldersStore.set(id, updated);
    return updated;
  },

  async delete(id) {
    return foldersStore.delete(id);
  },
};

export const localTagsRepository: TagsRepository = {
  async getAll() {
    return [...tagsStore.values()].sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string) {
    return tagsStore.get(id) || null;
  },

  async create(tag) {
    const newTag: Tag = {
      ...tag,
      id: generateId(),
      created_at: nowISO(),
    };
    tagsStore.set(newTag.id, newTag);
    return newTag;
  },

  async update(id, updates) {
    const existing = tagsStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    tagsStore.set(id, updated);
    return updated;
  },

  async delete(id) {
    return tagsStore.delete(id);
  },
};

export const localEventsRepositoryV2: EventsRepositoryV2 = {
  async getAll() {
    return [...eventsStore.values()].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  },

  async getById(id: string) {
    return eventsStore.get(id) || null;
  },

  async create(event) {
    const newEvent: Event = {
      ...event,
      id: generateId(),
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    eventsStore.set(newEvent.id, newEvent);
    return newEvent;
  },

  async update(id, updates) {
    const existing = eventsStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: nowISO() };
    eventsStore.set(id, updated);
    return updated;
  },

  async delete(id) {
    return eventsStore.delete(id);
  },
};

export const localLibraryRepository: LibraryRepository = {
  async getAll() {
    return [...libraryStore.values()].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  },

  async getById(id: string) {
    return libraryStore.get(id) || null;
  },

  async create(item) {
    const newItem: LibraryItem = {
      ...item,
      id: generateId(),
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    libraryStore.set(newItem.id, newItem);
    return newItem;
  },

  async update(id, updates) {
    const existing = libraryStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: nowISO() };
    libraryStore.set(id, updated);
    return updated;
  },

  async delete(id) {
    return libraryStore.delete(id);
  },
};

export const localProfileRepository: ProfileRepository = {
  async getProfile() {
    return currentProfile;
  },

  async updateProfile(updates) {
    if (!currentProfile) return null;
    currentProfile = { ...currentProfile, ...updates, updated_at: nowISO() };
    return currentProfile;
  },
};

/* ==========================================================================
   Repository Factory
   ========================================================================== */

import { isSupabaseConfigured } from './supabase';

export interface Repositories {
  outlines: OutlineRepository;
  notes: NotesRepository;
  events: EventsRepository;
  documents: DocumentsRepository;
  folders: FoldersRepository;
  tags: TagsRepository;
  eventsV2: EventsRepositoryV2;
  library: LibraryRepository;
  profile: ProfileRepository;
}

let repositoriesCache: Repositories | null = null;

export function getRepositories(): Repositories {
  if (repositoriesCache) return repositoriesCache;

  if (isSupabaseConfigured) {
    // TODO: Implement Supabase repositories
    console.warn('Supabase configured but repositories not implemented yet, falling back to localStorage');
  }

  repositoriesCache = {
    outlines: localOutlineRepository,
    notes: localNotesRepository,
    events: localEventsRepository,
    documents: localDocumentsRepository,
    folders: localFoldersRepository,
    tags: localTagsRepository,
    eventsV2: localEventsRepositoryV2,
    library: localLibraryRepository,
    profile: localProfileRepository,
  };

  return repositoriesCache;
}

/* ==========================================================================
   React Query Keys
   ========================================================================== */

export const queryKeys = {
  outlines: ['outlines'] as const,
  outline: (id: string) => ['outlines', id] as const,
  notes: ['notes'] as const,
  note: (id: string) => ['notes', id] as const,
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  documents: ['documents'] as const,
  document: (id: string) => ['documents', id] as const,
  folders: ['folders'] as const,
  folder: (id: string) => ['folders', id] as const,
  tags: ['tags'] as const,
  tag: (id: string) => ['tags', id] as const,
  eventsV2: ['eventsV2'] as const,
  eventV2: (id: string) => ['eventsV2', id] as const,
  library: ['library'] as const,
  libraryItem: (id: string) => ['library', id] as const,
  profile: ['profile'] as const,
};