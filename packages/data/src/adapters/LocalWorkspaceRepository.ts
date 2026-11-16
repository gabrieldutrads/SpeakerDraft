import type { WorkspaceRepository } from '../repositories/WorkspaceRepository';
import type { Document, Folder, Tag, Event, LibraryItem, Profile } from "@speaker-draft/core";

const STORAGE_KEY = "speakerdraft.workspace.v2";

const emptyData = {
  documents: [] as Document[],
  folders: [] as Folder[],
  events: [] as Event[],
  library: [] as LibraryItem[],
};

export class LocalWorkspaceRepository implements WorkspaceRepository {
  private read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...emptyData };
      return JSON.parse(raw);
    } catch {
      return { ...emptyData };
    }
  }

  private write(data: any) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getProfile(): Promise<Profile | null> { return null; }
  async updateProfile(data: Partial<Profile>): Promise<Profile> { throw new Error("Não implementado no modo local."); }

  async getDocuments(): Promise<Document[]> { return this.read().documents; }
  async getDocumentById(id: string): Promise<Document | null> { return this.read().documents.find((d: any) => d.id === id) || null; }
  
    async saveDocument(doc: Partial<Document> & { title: string }): Promise<Document> {
    const data = this.read();
    const existingIndex = data.documents.findIndex((d: any) => d.id === doc.id);
    
    // O ...doc vem primeiro para preencher o que existir.
    // O que vem depois sobrescreve com os valores padrão seguros.
    const newDoc = {
      ...doc,
      id: doc.id || crypto.randomUUID(),
      title: doc.title,
      content: doc.content || { type: 'doc', schema_version: 1, content: [{ type: 'paragraph' }] },
      updated_at: new Date().toISOString(),
    } as unknown as Document;
    
    if (existingIndex >= 0) data.documents[existingIndex] = newDoc;
    else data.documents.unshift(newDoc);
    this.write(data);
    return newDoc;
  }
  
  async deleteDocument(id: string): Promise<void> {
    const data = this.read();
    data.documents = data.documents.filter((d: any) => d.id !== id);
    this.write(data);
  }

  async getFolders(): Promise<Folder[]> { return this.read().folders; }
  
  async saveFolder(folder: Partial<Folder> & { name: string }): Promise<Folder> {
    const data = this.read();
    const newFolder = { id: folder.id || crypto.randomUUID(), ...folder } as Folder;
    const index = data.folders.findIndex((f: any) => f.id === newFolder.id);
    if (index >= 0) data.folders[index] = newFolder;
    else data.folders.push(newFolder);
    this.write(data);
    return newFolder;
  }
  
  async deleteFolder(id: string): Promise<void> {
    const data = this.read();
    data.folders = data.folders.filter((f: any) => f.id !== id);
    this.write(data);
  }

  async getEvents(): Promise<Event[]> { return this.read().events; }
  
  async saveEvent(event: Partial<Event> & { title: string; date: string; time: string }): Promise<Event> {
    const data = this.read();
    const newEvent = { id: event.id || crypto.randomUUID(), ...event } as Event;
    const index = data.events.findIndex((e: any) => e.id === newEvent.id);
    if (index >= 0) data.events[index] = newEvent;
    else data.events.push(newEvent);
    this.write(data);
    return newEvent;
  }
  
  async deleteEvent(id: string): Promise<void> {
    const data = this.read();
    data.events = data.events.filter((e: any) => e.id !== id);
    this.write(data);
  }

  async getLibraryItems(): Promise<LibraryItem[]> { return this.read().library; }
  
  async saveLibraryItem(item: Partial<LibraryItem> & { title: string; content: string }): Promise<LibraryItem> {
    const data = this.read();
    const newItem = { id: item.id || crypto.randomUUID(), ...item } as LibraryItem;
    const index = data.library.findIndex((i: any) => i.id === newItem.id);
    if (index >= 0) data.library[index] = newItem;
    else data.library.push(newItem);
    this.write(data);
    return newItem;
  }
  
  async deleteLibraryItem(id: string): Promise<void> {
    const data = this.read();
    data.library = data.library.filter((i: any) => i.id !== id);
    this.write(data);
  }
}