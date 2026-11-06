'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Collection, SavedItem, UserProfile, ProviderConnection, ItemCategory } from '@/types';
import { storage, STORAGE_EVENT } from '@/lib/storage';
import { INITIAL_COLLECTIONS, INITIAL_SAVED_ITEMS, INITIAL_USER, INITIAL_PROVIDER_CONNECTIONS } from '@/lib/initialData';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface AfterhoursContextType {
  items: SavedItem[];
  collections: Collection[];
  user: UserProfile;
  providers: ProviderConnection[];
  isLoaded: boolean;
  saveItem: (item: Omit<SavedItem, 'id' | 'dateAdded'> & { id?: string }) => { success: boolean; item: SavedItem; isDuplicate: boolean };
  updateItem: (id: string, updates: Partial<SavedItem>) => SavedItem | undefined;
  deleteItem: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean;
  createCollection: (data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'itemCount'>) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => Collection | undefined;
  deleteCollection: (id: string) => boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateProvider: (provider: string, updates: Partial<ProviderConnection>) => void;

  // Authentication & Multi-user DB
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (login: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, pass: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // UI modals
  isSearchOpen: boolean;
  searchCategory: ItemCategory | 'all';
  openSearch: (cat?: ItemCategory | 'all') => void;
  closeSearch: () => void;
  activeItemDetail: SavedItem | null;
  openItemDetail: (item: SavedItem) => void;
  closeItemDetail: () => void;
  activeCollectionModal: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;

  // Toast notifications
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;

  // Native Audio Player & Queue
  activeAudioTrack: SavedItem | null;
  isPlayingAudio: boolean;
  playlistQueue: SavedItem[];
  currentTrackIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isQueueOpen: boolean;
  playTrack: (item: SavedItem, newQueue?: SavedItem[]) => void;
  pauseTrack: () => void;
  toggleTrack: (item: SavedItem) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  seekAudio: (seconds: number) => void;
  setAudioVolume: (val: number) => void;
  toggleQueue: () => void;
  addTrackToQueue: (item: SavedItem) => void;
  playCollection: (collectionId: string) => void;

  // Steam Launcher Actions
  toggleGameInstalled: (itemId: string) => void;
  launchGame: (item: SavedItem) => void;
}

const AfterhoursContext = createContext<AfterhoursContextType | undefined>(undefined);

export function AfterhoursProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [providers, setProviders] = useState<ProviderConnection[]>(INITIAL_PROVIDER_CONNECTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // UI Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<ItemCategory | 'all'>('all');
  const [activeItemDetail, setActiveItemDetail] = useState<SavedItem | null>(null);
  const [activeCollectionModal, setActiveCollectionModal] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Audio Player State
  const [activeAudioTrack, setActiveAudioTrack] = useState<SavedItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playlistQueue, setPlaylistQueue] = useState<SavedItem[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.85);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to show toasts
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to server database in background when authenticated
  const syncToServer = useCallback((data: { items?: SavedItem[]; collections?: Collection[]; profile?: Partial<UserProfile> }) => {
    fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err) => console.warn('Background sync error:', err));
  }, []);

  // Reload local storage data as base/cache
  const reloadFromStorage = useCallback(() => {
    setItems(storage.getItems());
    setCollections(storage.getCollections());
    setUser(storage.getUserProfile());
    setProviders(storage.getProviders());
  }, []);

  // Check initial user authentication session on server
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setUser(data.user);
          if (data.collections) setCollections(data.collections);
          if (data.items) setItems(data.items);
        } else {
          setIsAuthenticated(false);
          reloadFromStorage();
        }
      } catch {
        reloadFromStorage();
      } finally {
        setIsLoaded(true);
      }
    }

    checkSession();

    const handleStorageEvent = () => {
      if (!isAuthenticated) reloadFromStorage();
    };

    window.addEventListener(STORAGE_EVENT, handleStorageEvent);
    window.addEventListener('storage', handleStorageEvent);

    // Keyboard shortcut for Cmd/Ctrl + K to open universal search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setActiveItemDetail(null);
        setActiveCollectionModal(false);
        setIsAuthModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageEvent);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [reloadFromStorage, isAuthenticated]);

  // Auth actions
  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(async (loginIdentifier: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginIdentifier, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        if (data.collections) setCollections(data.collections);
        if (data.items) setItems(data.items);
        showToast(`Vítej zpět, ${data.user.displayName}!`, 'success');
        return { success: true };
      }
      return { success: false, error: data.error || 'Nesprávné přihlašovací údaje' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Chyba připojení k serveru' };
    }
  }, [showToast]);

  const register = useCallback(async (username: string, email: string, pass: string, displayName?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: pass, displayName }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        if (data.collections) setCollections(data.collections);
        if (data.items) setItems(data.items);
        showToast(`Účet vytvořen! Vítej v AFTERHOURS, ${data.user.displayName}`, 'success');
        return { success: true };
      }
      return { success: false, error: data.error || 'Registrace se nezdařila' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Chyba připojení k serveru' };
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn(e);
    }
    setIsAuthenticated(false);
    reloadFromStorage();
    showToast('Odhlášen z AFTERHOURS', 'info');
  }, [reloadFromStorage, showToast]);

  // Items and Collections mutations
  const saveItem = useCallback((itemData: Omit<SavedItem, 'id' | 'dateAdded'> & { id?: string }) => {
    const res = storage.saveItem(itemData);
    const newItems = storage.getItems();
    setItems(newItems);

    if (isAuthenticated) {
      syncToServer({ items: newItems });
    }

    if (res.isDuplicate) {
      showToast(`Již v tvé sbírce: "${res.item.title}"`, 'warning');
    } else {
      showToast(`Uloženo do sbírky: "${res.item.title}"`, 'success');
    }
    return res;
  }, [isAuthenticated, syncToServer, showToast]);

  const updateItem = useCallback((id: string, updates: Partial<SavedItem>) => {
    const res = storage.updateItem(id, updates);
    const newItems = storage.getItems();
    setItems(newItems);

    if (isAuthenticated) {
      syncToServer({ items: newItems });
    }

    showToast('Položka upravena', 'info');
    return res;
  }, [isAuthenticated, syncToServer, showToast]);

  const deleteItem = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    const success = storage.deleteItem(id);
    const newItems = storage.getItems();
    setItems(newItems);

    if (isAuthenticated) {
      syncToServer({ items: newItems });
    }

    if (success) {
      showToast(`Odebráno: "${item?.title || 'položka'}"`, 'info');
    }
    return success;
  }, [items, isAuthenticated, syncToServer, showToast]);

  const toggleFavorite = useCallback((id: string) => {
    const res = storage.toggleFavorite(id);
    const newItems = storage.getItems();
    setItems(newItems);

    if (isAuthenticated) {
      syncToServer({ items: newItems });
    }

    return res;
  }, [isAuthenticated, syncToServer]);

  const createCollection = useCallback((data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'itemCount'>) => {
    const res = storage.createCollection(data);
    const newCollections = storage.getCollections();
    setCollections(newCollections);

    if (isAuthenticated) {
      syncToServer({ collections: newCollections });
    }

    showToast(`Vytvořen playlist/kolekce "${res.title}"`, 'success');
    return res;
  }, [isAuthenticated, syncToServer, showToast]);

  const updateCollection = useCallback((id: string, updates: Partial<Collection>) => {
    const res = storage.updateCollection(id, updates);
    const newCollections = storage.getCollections();
    setCollections(newCollections);

    if (isAuthenticated) {
      syncToServer({ collections: newCollections });
    }

    showToast('Kolekce upravena', 'info');
    return res;
  }, [isAuthenticated, syncToServer, showToast]);

  const deleteCollection = useCallback((id: string) => {
    const col = collections.find((c) => c.id === id);
    const success = storage.deleteCollection(id);
    const newCollections = storage.getCollections();
    setCollections(newCollections);

    if (isAuthenticated) {
      syncToServer({ collections: newCollections });
    }

    if (success) {
      showToast(`Kolekce "${col?.title || 'Kolekce'}" smazána`, 'info');
    }
    return success;
  }, [collections, isAuthenticated, syncToServer, showToast]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    storage.updateUserProfile(updates);
    const newProfile = storage.getUserProfile();
    setUser(newProfile);

    if (isAuthenticated) {
      syncToServer({ profile: updates });
    }

    showToast('Profil aktualizován', 'success');
  }, [isAuthenticated, syncToServer, showToast]);

  const updateProvider = useCallback((providerKey: string, updates: Partial<ProviderConnection>) => {
    storage.updateProvider(providerKey, updates);
    setProviders(storage.getProviders());
    showToast(`Aktualizováno: ${providerKey}`, 'info');
  }, [showToast]);

  const openSearch = useCallback((cat: ItemCategory | 'all' = 'all') => {
    setSearchCategory(cat);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const openItemDetail = useCallback((item: SavedItem) => {
    setActiveItemDetail(item);
  }, []);

  const closeItemDetail = useCallback(() => {
    setActiveItemDetail(null);
  }, []);

  const openCreateCollectionModal = useCallback(() => {
    setActiveCollectionModal(true);
  }, []);

  const closeCreateCollectionModal = useCallback(() => {
    setActiveCollectionModal(false);
  }, []);

  // --- NATIVE MUSIC PLAYER & PLAYLIST QUEUE ---
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
  }, []);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingAudio(false);
  }, []);

  const playAudioElement = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audio.volume = volume;
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onended = () => {
      // Auto-advance to next track in queue if available
      playNextTrackRef.current();
    };

    audio.play().then(() => {
      setIsPlayingAudio(true);
    }).catch((e) => {
      console.warn('Audio play prevented:', e);
      setIsPlayingAudio(false);
    });
  }, [volume]);

  const playTrack = useCallback((item: SavedItem, newQueue?: SavedItem[]) => {
    setActiveAudioTrack(item);

    let queue = newQueue || playlistQueue;
    if (!queue || queue.length === 0) {
      // Find all music items as default queue
      const allMusic = items.filter((i) => i.category === 'music');
      queue = allMusic.length > 0 ? allMusic : [item];
    }
    
    // Ensure item is in queue
    const itemIndex = queue.findIndex((q) => q.id === item.id);
    if (itemIndex === -1) {
      queue = [...queue, item];
      setCurrentTrackIndex(queue.length - 1);
    } else {
      setCurrentTrackIndex(itemIndex);
    }
    setPlaylistQueue(queue);

    const streamUrl = item.metadata?.previewAudioUrl;
    if (streamUrl) {
      playAudioElement(streamUrl);
    } else {
      setIsPlayingAudio(false);
      showToast(`Ukázka není dostupná. Otevři v externí platformě: "${item.title}"`, 'info');
    }
  }, [items, playlistQueue, playAudioElement, showToast]);

  const playNextTrack = useCallback(() => {
    if (playlistQueue.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % playlistQueue.length;
    setCurrentTrackIndex(nextIdx);
    const nextItem = playlistQueue[nextIdx];
    if (nextItem) {
      playTrack(nextItem, playlistQueue);
    }
  }, [playlistQueue, currentTrackIndex, playTrack]);

  const playPrevTrack = useCallback(() => {
    if (playlistQueue.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + playlistQueue.length) % playlistQueue.length;
    setCurrentTrackIndex(prevIdx);
    const prevItem = playlistQueue[prevIdx];
    if (prevItem) {
      playTrack(prevItem, playlistQueue);
    }
  }, [playlistQueue, currentTrackIndex, playTrack]);

  // Keep ref for audio onended
  const playNextTrackRef = useRef(playNextTrack);
  useEffect(() => {
    playNextTrackRef.current = playNextTrack;
  }, [playNextTrack]);

  const toggleTrack = useCallback((item: SavedItem) => {
    if (activeAudioTrack?.id === item.id) {
      if (isPlayingAudio) {
        pauseTrack();
      } else if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch((e) => console.warn(e));
      } else {
        playTrack(item);
      }
    } else {
      playTrack(item);
    }
  }, [activeAudioTrack, isPlayingAudio, pauseTrack, playTrack]);

  const seekAudio = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setAudioVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const addTrackToQueue = useCallback((item: SavedItem) => {
    setPlaylistQueue((prev) => [...prev, item]);
    showToast(`"${item.title}" přidáno do fronty`, 'info');
  }, [showToast]);

  const playCollection = useCallback((collectionId: string) => {
    const collectionItems = items.filter((i) => i.collectionIds.includes(collectionId) && i.category === 'music');
    if (collectionItems.length === 0) {
      showToast('V tomto playlistu zatím nejsou žádné skladby', 'warning');
      return;
    }
    setPlaylistQueue(collectionItems);
    playTrack(collectionItems[0], collectionItems);
    showToast(`Přehrávám playlist (${collectionItems.length} skladeb)`, 'success');
  }, [items, playTrack, showToast]);

  // Steam Launcher Actions
  const toggleGameInstalled = useCallback((itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const nowInstalled = !item.metadata?.isInstalled;
    const updated = storage.updateItem(itemId, {
      metadata: {
        ...item.metadata,
        isInstalled: nowInstalled,
      },
    });
    const newItems = storage.getItems();
    setItems(newItems);
    if (isAuthenticated) {
      syncToServer({ items: newItems });
    }
    if (nowInstalled) {
      showToast(`🎮 "${item.title}" označen jako [Nainstalováno na tomto PC]`, 'success');
    } else {
      showToast(`📦 "${item.title}" označen jako [Ke stažení]`, 'info');
    }
    return updated;
  }, [items, isAuthenticated, syncToServer, showToast]);

  const launchGame = useCallback((item: SavedItem) => {
    const appId = item.metadata?.steamAppId || item.externalId;
    const deepLink = item.metadata?.platformDeepLink || (appId ? `steam://run/${appId}` : null);
    
    showToast(`🚀 Spouštím "${item.title}" přes Steam...`, 'info');

    if (deepLink) {
      window.location.href = deepLink;
      setTimeout(() => {
        showToast(
          `Pokud se Steam neotevřel (např. na školním PC), otevři odkaz ve webovém Steam Store.`,
          'warning'
        );
      }, 2500);
    } else if (item.externalUrl) {
      window.open(item.externalUrl, '_blank');
    }
  }, [showToast]);

  return (
    <AfterhoursContext.Provider
      value={{
        items,
        collections,
        user,
        providers,
        isLoaded,
        saveItem,
        updateItem,
        deleteItem,
        toggleFavorite,
        createCollection,
        updateCollection,
        deleteCollection,
        updateUserProfile,
        updateProvider,

        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,

        isSearchOpen,
        searchCategory,
        openSearch,
        closeSearch,
        activeItemDetail,
        openItemDetail,
        closeItemDetail,
        activeCollectionModal,
        openCreateCollectionModal,
        closeCreateCollectionModal,

        toasts,
        showToast,
        removeToast,

        activeAudioTrack,
        isPlayingAudio,
        playlistQueue,
        currentTrackIndex,
        currentTime,
        duration,
        volume,
        isQueueOpen,
        playTrack,
        pauseTrack,
        toggleTrack,
        playNextTrack,
        playPrevTrack,
        seekAudio,
        setAudioVolume,
        toggleQueue,
        addTrackToQueue,
        playCollection,

        toggleGameInstalled,
        launchGame,
      }}
    >
      {children}
    </AfterhoursContext.Provider>
  );
}

export function useAfterhours() {
  const context = useContext(AfterhoursContext);
  if (!context) {
    throw new Error('useAfterhours must be used within an AfterhoursProvider');
  }
  return context;
}
