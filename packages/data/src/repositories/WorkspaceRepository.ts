import type { Document, Folder, Tag, Event, LibraryItem, Profile } from "@speaker-draft/core";

export interface WorkspaceRepository {
  // Profiles
  getProfile(): Promise<Profile | null>;
  updateProfile(data: Partial<Profile>): Promise<Profile>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | null>;
  saveDocument(doc: Partial<Document> & { title: string }): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Folders
  getFolders(): Promise<Folder[]>;
  saveFolder(folder: Partial<Folder> & { name: string }): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;

  // Events
  getEvents(): Promise<Event[]>;
  saveEvent(event: Partial<Event> & { title: string; date: string; time: string }): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  // Library
  getLibraryItems(): Promise<LibraryItem[]>;
  saveLibraryItem(item: Partial<LibraryItem> & { title: string; content: string }): Promise<LibraryItem>;
  deleteLibraryItem(id: string): Promise<void>;
}