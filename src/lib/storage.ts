import { Collection, SavedItem, UserProfile, ProviderConnection, ExperienceStatus } from '@/types';
import { INITIAL_COLLECTIONS, INITIAL_SAVED_ITEMS, INITIAL_USER, INITIAL_PROVIDER_CONNECTIONS } from './initialData';

const STORAGE_KEYS = {
  ITEMS: 'afterhours_items_v1',
  COLLECTIONS: 'afterhours_collections_v1',
  USER: 'afterhours_user_v1',
  PROVIDERS: 'afterhours_providers_v1',
};

// Event-based notification for multi-component reactivity across the client
const STORAGE_EVENT = 'afterhours_storage_sync';

export function notifyStorageChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

export const storage = {
  // --- ITEMS ---
  getItems(): SavedItem[] {
    if (typeof window === 'undefined') return INITIAL_SAVED_ITEMS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_SAVED_ITEMS));
        return INITIAL_SAVED_ITEMS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to read items from storage', e);
      return INITIAL_SAVED_ITEMS;
    }
  },

  getItem(id: string): SavedItem | undefined {
    return this.getItems().find((item) => item.id === id);
  },

  saveItem(item: Omit<SavedItem, 'id' | 'dateAdded'> & { id?: string }): { success: boolean; item: SavedItem; isDuplicate: boolean } {
    const items = this.getItems();
    
    // Check duplicate by title + category or externalId / externalUrl
    const existing = items.find((i) => 
      (item.externalUrl && i.externalUrl === item.externalUrl) ||
      (item.externalId && i.externalId === item.externalId) ||
      (i.title.toLowerCase() === item.title.toLowerCase() && i.category === item.category)
    );

    if (existing) {
      // If already exists, we link to requested collections if any new
      if (item.collectionIds && item.collectionIds.length > 0) {
        const mergedCollections = Array.from(new Set([...existing.collectionIds, ...item.collectionIds]));
        existing.collectionIds = mergedCollections;
        this.updateItem(existing.id, { collectionIds: mergedCollections });
      }
      return { success: true, item: existing, isDuplicate: true };
    }

    const newItem: SavedItem = {
      ...item,
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dateAdded: new Date().toISOString(),
      collectionIds: item.collectionIds || [],
      tags: item.tags || [],
      status: item.status || 'want',
    };

    const updated = [newItem, ...items];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
    }

    // Also update collection item counts
    if (newItem.collectionIds.length > 0) {
      this.recomputeCollectionCounts();
    }

    notifyStorageChange();
    return { success: true, item: newItem, isDuplicate: false };
  },

  updateItem(id: string, updates: Partial<SavedItem>): SavedItem | undefined {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    }

    if (updates.collectionIds) {
      this.recomputeCollectionCounts();
    }

    notifyStorageChange();
    return updatedItem;
  },

  deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filtered));
    }

    this.recomputeCollectionCounts();
    notifyStorageChange();
    return true;
  },

  toggleFavorite(id: string): boolean {
    const item = this.getItem(id);
    if (!item) return false;
    const isFav = !item.isFavorite;
    this.updateItem(id, { isFavorite: isFav });
    return isFav;
  },

  // --- COLLECTIONS ---
  getCollections(): Collection[] {
    if (typeof window === 'undefined') return INITIAL_COLLECTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
        return INITIAL_COLLECTIONS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to read collections from storage', e);
      return INITIAL_COLLECTIONS;
    }
  },

  getCollection(id: string): Collection | undefined {
    return this.getCollections().find((c) => c.id === id);
  },

  createCollection(data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'itemCount'> & { id?: string }): Collection {
    const collections = this.getCollections();
    const newCol: Collection = {
      ...data,
      id: data.id || `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
      isFavorite: data.isFavorite ?? false,
      isPrivate: data.isPrivate ?? false,
    };

    const updated = [...collections, newCol];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(updated));
    }

    notifyStorageChange();
    return newCol;
  },

  updateCollection(id: string, updates: Partial<Collection>): Collection | undefined {
    const collections = this.getCollections();
    const idx = collections.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    const updated = {
      ...collections[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    collections[idx] = updated;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    }

    notifyStorageChange();
    return updated;
  },

  deleteCollection(id: string): boolean {
    const collections = this.getCollections();
    const filtered = collections.filter((c) => c.id !== id);
    if (filtered.length === collections.length) return false;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(filtered));
    }

    // Remove this collection from all saved items
    const items = this.getItems();
    let modified = false;
    items.forEach((item) => {
      if (item.collectionIds.includes(id)) {
        item.collectionIds = item.collectionIds.filter((cid) => cid !== id);
        modified = true;
      }
    });
    if (modified && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    }

    notifyStorageChange();
    return true;
  },

  recomputeCollectionCounts() {
    const collections = this.getCollections();
    const items = this.getItems();

    const updated = collections.map((col) => {
      const count = items.filter((i) => i.collectionIds.includes(col.id)).length;
      return { ...col, itemCount: count };
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(updated));
    }
  },

  // --- USER PROFILE ---
  getUserProfile(): UserProfile {
    if (typeof window === 'undefined') return INITIAL_USER;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
        return INITIAL_USER;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_USER;
    }
  },

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    notifyStorageChange();
    return updated;
  },

  // --- PROVIDER CONNECTIONS ---
  getProviders(): ProviderConnection[] {
    if (typeof window === 'undefined') return INITIAL_PROVIDER_CONNECTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(INITIAL_PROVIDER_CONNECTIONS));
        return INITIAL_PROVIDER_CONNECTIONS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PROVIDER_CONNECTIONS;
    }
  },

  updateProvider(providerKey: string, updates: Partial<ProviderConnection>): ProviderConnection[] {
    const providers = this.getProviders();
    const idx = providers.findIndex((p) => p.provider === providerKey);
    if (idx !== -1) {
      providers[idx] = { ...providers[idx], ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
      }
      notifyStorageChange();
    }
    return providers;
  },

  // --- BACKUP & RESTORE ---
  exportBackup(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items: this.getItems(),
      collections: this.getCollections(),
      user: this.getUserProfile(),
      providers: this.getProviders(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed.items) || !Array.isArray(parsed.collections)) {
        return { success: false, error: 'Invalid backup format: missing items or collections.' };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(parsed.items));
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(parsed.collections));
        if (parsed.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed.user));
        if (parsed.providers) localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(parsed.providers));
      }

      notifyStorageChange();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse JSON backup.' };
    }
  },

  resetAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_SAVED_ITEMS));
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(INITIAL_PROVIDER_CONNECTIONS));
    }
    notifyStorageChange();
  },
};

export { STORAGE_EVENT };
