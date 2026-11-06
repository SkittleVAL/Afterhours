export type ItemCategory = 'music' | 'game' | 'movie' | 'place' | 'other';

export type ExperienceStatus = 'want' | 'experiencing' | 'completed' | 'archived';

export interface ItemMetadata {
  year?: string;
  duration?: string;
  genre?: string;
  previewAudioUrl?: string;
  spotifyTrackId?: string;
  steamAppId?: string;
  isInstalled?: boolean; // Track if game is installed on this PC
  installPath?: string;  // Custom launch path or command
  streamingServices?: string[];
  locationAddress?: string;
  city?: string;
  ratingScore?: string;
  originalPlatformName?: string;
  platformDeepLink?: string;
}

export interface SavedItem {
  id: string;
  title: string;
  subtitle: string; // Artist, developer, studio, neighborhood
  category: ItemCategory;
  artworkUrl: string;
  fallbackGradient?: string;
  externalProvider: 'spotify' | 'steam' | 'tmdb' | 'google_maps' | 'apple_music' | 'custom';
  externalUrl: string;
  externalId?: string;
  dateAdded: string;
  personalNotes?: string;
  tags: string[];
  rating?: number; // 1-5 stars
  status: ExperienceStatus;
  collectionIds: string[];
  isFavorite?: boolean;
  metadata?: ItemMetadata;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  icon?: string;
  category?: ItemCategory | 'mixed';
  isFavorite: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  theme: 'nocturne' | 'obsidian' | 'twilight';
  joinedDate: string;
  stats?: {
    totalSaved: number;
    completed: number;
    collectionsCount: number;
  };
}

export interface ProviderConnection {
  provider: 'spotify' | 'steam' | 'tmdb' | 'google_maps' | 'supabase';
  name: string;
  tagline: string;
  isConnected: boolean;
  accountName?: string;
  accountId?: string;
  lastSyncedAt?: string;
  supportedFeatures: string[];
  setupGuide: {
    steps: string[];
    docsUrl: string;
    envKeyExample: string;
  };
}

export interface SearchFilterState {
  query: string;
  category: 'all' | ItemCategory;
  status?: ExperienceStatus | 'all';
  sortBy: 'dateAdded' | 'title' | 'rating';
  viewMode: 'grid' | 'list';
}
