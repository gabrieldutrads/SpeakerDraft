import type { WorkspaceRepository } from '../repositories/WorkspaceRepository';
import type { Document, Folder, Tag, Event, LibraryItem, Profile } from "@speaker-draft/core";
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@speaker-draft/db-types';

export class SupabaseWorkspaceRepository implements WorkspaceRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await this.supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw error;
    return data as unknown as Profile;
  }

  async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error } = await this.supabase.from('profiles').update(profileData as any).eq('id', user.id).select().single();
    if (error) throw error;
    return data as unknown as Profile;
  }

  async getDocuments(): Promise<Document[]> {
    const { data, error } = await this.supabase.from('documents').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data as unknown as Document[];
  }

  async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await this.supabase.from('documents').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as unknown as Document | null;
  }

  async saveDocument(doc: Partial<Document> & { title: string }): Promise<Document> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const payload = { ...doc, owner_id: user.id };
    const { data, error } = await this.supabase.from('documents').upsert(payload as any).select().single();
    if (error) throw error;
    return data as unknown as Document;
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await this.supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
  }

  async getFolders(): Promise<Folder[]> {
    const { data, error } = await this.supabase.from('folders').select('*').order('name');
    if (error) throw error;
    return data as unknown as Folder[];
  }

  async saveFolder(folder: Partial<Folder> & { name: string }): Promise<Folder> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const payload = { ...folder, owner_id: user.id };
    const { data, error } = await this.supabase.from('folders').upsert(payload as any).select().single();
    if (error) throw error;
    return data as unknown as Folder;
  }

  async deleteFolder(id: string): Promise<void> {
    const { error } = await this.supabase.from('folders').delete().eq('id', id);
    if (error) throw error;
  }

  async getEvents(): Promise<Event[]> {
    const { data, error } = await this.supabase.from('events').select('*').order('date', { ascending: true }).order('time', { ascending: true });
    if (error) throw error;
    return data as unknown as Event[];
  }

  async saveEvent(event: Partial<Event> & { title: string; date: string; time: string }): Promise<Event> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const payload = { ...event, owner_id: user.id };
    const { data, error } = await this.supabase.from('events').upsert(payload as any).select().single();
    if (error) throw error;
    return data as unknown as Event;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  }

  async getLibraryItems(): Promise<LibraryItem[]> {
    const { data, error } = await this.supabase.from('library_items').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as LibraryItem[];
  }

  async saveLibraryItem(item: Partial<LibraryItem> & { title: string; content: string }): Promise<LibraryItem> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const payload = { ...item, owner_id: user.id };
    const { data, error } = await this.supabase.from('library_items').upsert(payload as any).select().single();
    if (error) throw error;
    return data as unknown as LibraryItem;
  }

  async deleteLibraryItem(id: string): Promise<void> {
    const { error } = await this.supabase.from('library_items').delete().eq('id', id);
    if (error) throw error;
  }
}