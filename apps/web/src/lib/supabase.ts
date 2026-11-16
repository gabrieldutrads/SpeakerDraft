import { createClient, SupabaseClient } from '@supabase/supabase-js';

/* ==========================================================================
   Supabase Client Configuration
   ========================================================================== */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create a mock client that throws helpful errors when Supabase is not configured
function createMockClient(): SupabaseClient<any> {
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      callback('INITIAL_SESSION', null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
    updateUser: async () => ({ data: null, error: new Error('Supabase not configured') }),
  };

  const mockStorage = {
    from: (bucket: string) => ({
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' }, error: null }),
      createSignedUploadUrl: async () => ({ data: null, error: new Error('Supabase not configured') }),
      upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
      remove: async () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
  };

  const mockDb = {
    from: (table: string) => ({
      select: () => mockDb.from(table),
      insert: () => mockDb.from(table),
      update: () => mockDb.from(table),
      delete: () => mockDb.from(table),
      eq: () => mockDb.from(table),
      neq: () => mockDb.from(table),
      gt: () => mockDb.from(table),
      gte: () => mockDb.from(table),
      lt: () => mockDb.from(table),
      lte: () => mockDb.from(table),
      like: () => mockDb.from(table),
      ilike: () => mockDb.from(table),
      is: () => mockDb.from(table),
      in: () => mockDb.from(table),
      contains: () => mockDb.from(table),
      containedBy: () => mockDb.from(table),
      rangeGt: () => mockDb.from(table),
      rangeGte: () => mockDb.from(table),
      rangeLt: () => mockDb.from(table),
      rangeLte: () => mockDb.from(table),
      rangeAdjacent: () => mockDb.from(table),
      overlaps: () => mockDb.from(table),
      textSearch: () => mockDb.from(table),
      match: () => mockDb.from(table),
      not: () => mockDb.from(table),
      or: () => mockDb.from(table),
      filter: () => mockDb.from(table),
      order: () => mockDb.from(table),
      limit: () => mockDb.from(table),
      range: () => mockDb.from(table),
      single: async () => ({ data: null, error: new Error('Supabase not configured') }),
      maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }),
      csv: async () => ({ data: '', error: new Error('Supabase not configured') }),
      geojson: async () => ({ data: null, error: new Error('Supabase not configured') }),
      explain: async () => ({ data: null, error: new Error('Supabase not configured') }),
      rollback: async () => ({ data: null, error: new Error('Supabase not configured') }),
      returns: async () => ({ data: null, error: new Error('Supabase not configured') }),
      then: (resolve: any) => resolve({ data: null, error: new Error('Supabase not configured') }),
    }),
    channel: (name: string) => ({
      on: () => mockDb.channel(name),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
  };

  return {
    auth: mockAuth,
    storage: mockStorage,
    from: mockDb.from,
    channel: mockDb.channel,
    rpc: async () => ({ data: null, error: new Error('Supabase not configured') }),
    functions: {
      invoke: async () => ({ data: null, error: new Error('Supabase not configured') }),
    },
    realtime: {
      setAuth: () => {},
    },
  } as unknown as SupabaseClient<any>;
}

// Create client only if configured, otherwise create a mock client
let supabaseClient: SupabaseClient<any>;

if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key) => {
          if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
          }
          return null;
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
        },
      },
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'speakerdraft-web',
      },
    },
  });
} else {
  // Create a mock client for development without Supabase
  console.warn('Supabase not configured. Using mock client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  supabaseClient = createMockClient();
}

// Export the client (or mock)
export const supabase = supabaseClient;

/* ==========================================================================
   Supabase Helpers
   ========================================================================== */

export function getSupabaseClient(): SupabaseClient<any> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Check your environment variables.');
  }
  return supabaseClient;
}

/* ==========================================================================
   Database Types (generated from Supabase)
   ========================================================================== */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      outlines: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: unknown;
          plain_text: string | null;
          word_count: number;
          reading_time: number;
          tags: string[];
          category: string | null;
          is_favorite: boolean;
          is_archived: boolean;
          preaching_duration: number | null;
          target_duration: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: unknown;
          plain_text?: string | null;
          word_count?: number;
          reading_time?: number;
          tags?: string[];
          category?: string | null;
          is_favorite?: boolean;
          is_archived?: boolean;
          preaching_duration?: number | null;
          target_duration?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: unknown;
          plain_text?: string | null;
          word_count?: number;
          reading_time?: number;
          tags?: string[];
          category?: string | null;
          is_favorite?: boolean;
          is_archived?: boolean;
          preaching_duration?: number | null;
          target_duration?: number | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: unknown;
          plain_text: string | null;
          tags: string[];
          is_pinned: boolean;
          is_archived: boolean;
          linked_outline_id: string | null;
          linked_event_id: string | null;
          linked_bible_ref: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: unknown;
          plain_text?: string | null;
          tags?: string[];
          is_pinned?: boolean;
          is_archived?: boolean;
          linked_outline_id?: string | null;
          linked_event_id?: string | null;
          linked_bible_ref?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: unknown;
          plain_text?: string | null;
          tags?: string[];
          is_pinned?: boolean;
          is_archived?: boolean;
          linked_outline_id?: string | null;
          linked_event_id?: string | null;
          linked_bible_ref?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          location: string | null;
          start_time: string;
          end_time: string;
          all_day: boolean;
          recurrence_rule: string | null;
          recurrence_end: string | null;
          reminders: unknown;
          linked_outline_id: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          start_time: string;
          end_time: string;
          all_day?: boolean;
          recurrence_rule?: string | null;
          recurrence_end?: string | null;
          reminders?: unknown;
          linked_outline_id?: string | null;
          color?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          start_time?: string;
          end_time?: string;
          all_day?: boolean;
          recurrence_rule?: string | null;
          recurrence_end?: string | null;
          reminders?: unknown;
          linked_outline_id?: string | null;
          color?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      library_files: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          original_name: string;
          mime_type: string;
          size: number;
          storage_path: string;
          extracted_text: string | null;
          page_count: number | null;
          tags: string[];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          original_name: string;
          mime_type: string;
          size: number;
          storage_path: string;
          extracted_text?: string | null;
          page_count?: number | null;
          tags?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          extracted_text?: string | null;
          page_count?: number | null;
          tags?: string[];
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          icon?: string | null;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string | null;
          parent_id?: string | null;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

/* ==========================================================================
   Type Helpers
   ========================================================================== */

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Convenience types
export type Profile = Tables<'profiles'>;
export type Outline = Tables<'outlines'>;
export type Note = Tables<'notes'>;
export type Event = Tables<'events'>;
export type LibraryFile = Tables<'library_files'>;
export type Category = Tables<'categories'>;
export type Tag = Tables<'tags'>;

/* ==========================================================================
   Supabase Storage Helpers
   ========================================================================== */

export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  library: 'library-files',
  exports: 'exports',
} as const;

export function getStorageUrl(bucket: string, path: string): string {
  if (!isSupabaseConfigured) return '';
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getSignedUploadUrl(bucket: string, path: string, expiresIn = 3600) {
  if (!isSupabaseConfigured) return Promise.resolve({ data: null, error: new Error('Not configured') });
  return (supabaseClient.storage.from(bucket) as any).createSignedUploadUrl(path, { expiresIn });
}

export function uploadFile(bucket: string, path: string, file: Blob, options?: { upsert?: boolean; contentType?: string }) {
  if (!isSupabaseConfigured) return Promise.resolve({ data: null, error: new Error('Not configured') });
  return supabaseClient.storage.from(bucket).upload(path, file, options as any);
}

export function deleteFile(bucket: string, paths: string[]) {
  if (!isSupabaseConfigured) return Promise.resolve({ data: null, error: new Error('Not configured') });
  return supabaseClient.storage.from(bucket).remove(paths);
}

/* ==========================================================================
   Realtime Helpers
   ========================================================================== */

export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: { new: Database['public']['Tables'][T]['Row'] | null; old: Database['public']['Tables'][T]['Row'] | null; eventType: 'INSERT' | 'UPDATE' | 'DELETE' }) => void,
  filter?: string
) {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} };
  }

  let channel = supabaseClient.channel(`realtime:${table}`);

  if (filter) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, callback as any);
  } else {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, callback as any);
  }

  return channel.subscribe();
}

/* ==========================================================================
   Auth Helpers
   ========================================================================== */

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return { user: null, error: new Error('Not configured') };
  return supabaseClient.auth.getUser();
}

export async function getSession() {
  if (!isSupabaseConfigured) return { session: null, error: new Error('Not configured') };
  return supabaseClient.auth.getSession();
}

export async function refreshSession() {
  if (!isSupabaseConfigured) return { session: null, error: new Error('Not configured') };
  return supabaseClient.auth.refreshSession();
}