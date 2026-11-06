import { NextResponse } from 'next/server';
import { ItemCategory, SavedItem } from '@/types';
import { INITIAL_SAVED_ITEMS } from '@/lib/initialData';

// Curated live database of night experiences and verified metadata
const CURATED_DISCOVERIES: Omit<SavedItem, 'dateAdded'>[] = [
  // Steam Games
  {
    id: 'disc_elden_ring',
    title: 'Elden Ring: Shadow of the Erdtree',
    subtitle: 'FromSoftware Inc.',
    category: 'game',
    artworkUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'steam',
    externalUrl: 'https://store.steampowered.com/app/2778580/ELDEN_RING_Shadow_of_the_Erdtree/',
    externalId: '2778580',
    tags: ['Soulslike', 'Dark Fantasy', 'Masterpiece', 'RPG'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      year: '2024',
      steamAppId: '2778580',
      genre: 'Action RPG',
      ratingScore: '94% Positive on Steam',
      originalPlatformName: 'Steam',
      platformDeepLink: 'steam://store/2778580',
    },
  },
  {
    id: 'disc_hades2',
    title: 'Hades II',
    subtitle: 'Supergiant Games',
    category: 'game',
    artworkUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'steam',
    externalUrl: 'https://store.steampowered.com/app/1145350/Hades_II/',
    externalId: '1145350',
    tags: ['Roguelike', 'Mythology', 'Action', 'Indie'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      year: '2024',
      steamAppId: '1145350',
      genre: 'Rogue-like Action',
      ratingScore: '98% Overwhelmingly Positive',
      originalPlatformName: 'Steam',
      platformDeepLink: 'steam://store/1145350',
    },
  },
  {
    id: 'disc_alanwake2',
    title: 'Alan Wake 2',
    subtitle: 'Remedy Entertainment',
    category: 'game',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'steam',
    externalUrl: 'https://store.epicgames.com/en-US/p/alan-wake-2',
    tags: ['Survival Horror', 'Psychological', 'Nocturne'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      year: '2023',
      genre: 'Survival Horror',
      ratingScore: '89 Metascore',
      originalPlatformName: 'Remedy / Steam',
    },
  },

  // Cinema & Shows
  {
    id: 'disc_drive',
    title: 'Drive',
    subtitle: 'Nicolas Winding Refn',
    category: 'movie',
    artworkUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'tmdb',
    externalUrl: 'https://www.themoviedb.org/movie/64690-drive',
    tags: ['Neo-Noir', 'Synthwave', 'Crime', 'LA Nocturne'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      year: '2011',
      duration: '100 min',
      genre: 'Neo-Noir Thriller',
      streamingServices: ['Prime Video', 'Apple TV'],
      ratingScore: '7.8 IMDb',
      originalPlatformName: 'TMDb',
    },
  },
  {
    id: 'disc_interstellar',
    title: 'Interstellar',
    subtitle: 'Christopher Nolan',
    category: 'movie',
    artworkUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'tmdb',
    externalUrl: 'https://www.themoviedb.org/movie/157336-interstellar',
    tags: ['Sci-Fi', 'Space', 'Hans Zimmer Score'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      year: '2014',
      duration: '169 min',
      genre: 'Sci-Fi Adventure',
      streamingServices: ['Max', 'Apple TV'],
      ratingScore: '8.7 IMDb',
      originalPlatformName: 'TMDb',
    },
  },
  {
    id: 'disc_arcane',
    title: 'Arcane: League of Legends',
    subtitle: 'Riot Games & Fortiche Production',
    category: 'movie',
    artworkUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'tmdb',
    externalUrl: 'https://www.netflix.com/title/81435684',
    tags: ['Animation', 'Steampunk', 'Cyberpunk', 'Netflix'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      year: '2021-2024',
      duration: '2 Seasons',
      genre: 'Animated Action Drama',
      streamingServices: ['Netflix'],
      ratingScore: '9.0 IMDb',
      originalPlatformName: 'Netflix',
    },
  },

  // Places
  {
    id: 'disc_tokyo_golden_gai',
    title: 'Shinjuku Golden Gai',
    subtitle: 'Kabukicho, Tokyo',
    category: 'place',
    artworkUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'google_maps',
    externalUrl: 'https://maps.google.com/?q=Shinjuku+Golden+Gai+Tokyo',
    tags: ['Micro-Bars', 'Tokyo', 'Nocturne', 'Post-War Alleyways'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      city: 'Tokyo, Japan',
      locationAddress: '1 Chome-1-6 Kabukicho, Shinjuku City',
      ratingScore: '4.5 (Google Maps)',
      originalPlatformName: 'Google Maps',
    },
  },
  {
    id: 'disc_berlin_watergate',
    title: 'Watergate Club',
    subtitle: 'Kreuzberg, Berlin',
    category: 'place',
    artworkUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'google_maps',
    externalUrl: 'https://maps.google.com/?q=Watergate+Club+Berlin',
    tags: ['Electronic Music', 'Spree River', 'Kreuzberg', 'Sunrise'],
    rating: 4,
    status: 'want',
    collectionIds: [],
    metadata: {
      city: 'Berlin, Germany',
      locationAddress: 'Falckensteinstraße 49, 10997 Berlin',
      ratingScore: '4.3 (Google Maps)',
      originalPlatformName: 'Google Maps',
    },
  },
  {
    id: 'disc_london_brilliant_corners',
    title: 'Brilliant Corners (Audiophile Bar)',
    subtitle: 'Dalston, London',
    category: 'place',
    artworkUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    externalProvider: 'google_maps',
    externalUrl: 'https://maps.google.com/?q=Brilliant+Corners+Dalston+London',
    tags: ['Audiophile', 'Klipsch Speakers', 'Vinyl', 'Natural Wine'],
    rating: 5,
    status: 'want',
    collectionIds: [],
    metadata: {
      city: 'London, UK',
      locationAddress: '470 Kingsland Rd, London E8 4AE',
      ratingScore: '4.6 (Google Maps)',
      originalPlatformName: 'Google Maps',
    },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';
  const category = (searchParams.get('category') || 'all') as ItemCategory | 'all';

  try {
    let liveMusicResults: SavedItem[] = [];
    let liveGameResults: SavedItem[] = [];

    // 1. Live Steam Games Search
    if (query && (category === 'all' || category === 'game')) {
      try {
        const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`;
        const res = await fetch(steamUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 60 }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            liveGameResults = data.items.map((game: any) => {
              const priceStr = game.price
                ? (game.price.final === 0 ? 'Free to Play' : `${(game.price.final / 100).toFixed(2)} ${game.price.currency || 'USD'}`)
                : 'Steam Store';
              return {
                id: `steam_${game.id}`,
                title: game.name || 'Unknown Steam Game',
                subtitle: priceStr,
                category: 'game' as ItemCategory,
                artworkUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.id}/header.jpg`,
                fallbackGradient: 'from-cyan-950 to-blue-950',
                externalProvider: 'steam',
                externalUrl: `https://store.steampowered.com/app/${game.id}`,
                externalId: String(game.id),
                dateAdded: new Date().toISOString(),
                tags: ['Steam', 'PC Game', 'Steam Live'],
                rating: game.metascore ? Math.min(5, Math.max(1, Math.round(Number(game.metascore) / 20))) : 5,
                status: 'want',
                collectionIds: [],
                metadata: {
                  steamAppId: String(game.id),
                  genre: 'Steam Game',
                  ratingScore: game.metascore ? `${game.metascore}/100 Metascore` : 'Steam Store',
                  originalPlatformName: 'Steam Store & Launcher',
                  platformDeepLink: `steam://run/${game.id}`,
                  isInstalled: false,
                },
              };
            });
          }
        }
      } catch (err) {
        console.warn('Steam API live search error:', err);
      }
    }

    // 2. Comprehensive Music Search: Deezer + iTunes CZ + iTunes Global
    if (query && (category === 'all' || category === 'music')) {
      const deezerPromise = fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`, {
        next: { revalidate: 60 }
      }).then(r => r.ok ? r.json() : null).catch(() => null);

      const itunesCzPromise = fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=CZ&media=music&entity=song&limit=25`, {
        next: { revalidate: 60 }
      }).then(r => r.ok ? r.json() : null).catch(() => null);

      const itunesGlobalPromise = fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`, {
        next: { revalidate: 60 }
      }).then(r => r.ok ? r.json() : null).catch(() => null);

      const [deezerRes, itunesCzRes, itunesGlobalRes] = await Promise.all([
        deezerPromise,
        itunesCzPromise,
        itunesGlobalPromise
      ]);

      const seenTrackKeys = new Set<string>();

      // Parse Deezer results
      if (deezerRes?.data && Array.isArray(deezerRes.data)) {
        for (const track of deezerRes.data) {
          const title = track.title || track.title_short || 'Unknown Title';
          const artist = track.artist?.name || 'Unknown Artist';
          const normKey = `${title.toLowerCase().trim()}_${artist.toLowerCase().trim()}`;
          if (!seenTrackKeys.has(normKey)) {
            seenTrackKeys.add(normKey);
            const durationSec = track.duration || 30;
            const mins = Math.floor(durationSec / 60);
            const secs = Math.floor(durationSec % 60);
            liveMusicResults.push({
              id: `deezer_${track.id}`,
              title,
              subtitle: artist,
              category: 'music' as ItemCategory,
              artworkUrl: track.album?.cover_xl || track.album?.cover_big || track.album?.cover_medium || track.artist?.picture_big || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
              fallbackGradient: 'from-purple-900 to-indigo-950',
              externalProvider: 'spotify',
              externalUrl: `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`,
              externalId: `spotify:search:${encodeURIComponent(title + ' ' + artist)}`,
              dateAdded: new Date().toISOString(),
              tags: ['Music', 'Live Search'],
              rating: 5,
              status: 'want',
              collectionIds: [],
              metadata: {
                duration: `${mins}:${secs.toString().padStart(2, '0')}`,
                genre: track.genre_id ? 'Music' : undefined,
                previewAudioUrl: track.preview,
                originalPlatformName: 'Spotify / Deezer',
                platformDeepLink: `spotify:search:${encodeURIComponent(title + ' ' + artist)}`,
              },
            });
          }
        }
      }

      // Parse iTunes CZ results
      if (itunesCzRes?.results && Array.isArray(itunesCzRes.results)) {
        for (const track of itunesCzRes.results) {
          const title = track.trackName || 'Unknown Title';
          const artist = track.artistName || 'Unknown Artist';
          const normKey = `${title.toLowerCase().trim()}_${artist.toLowerCase().trim()}`;
          if (!seenTrackKeys.has(normKey)) {
            seenTrackKeys.add(normKey);
            liveMusicResults.push({
              id: `itunes_${track.trackId}`,
              title,
              subtitle: artist,
              category: 'music' as ItemCategory,
              artworkUrl: (track.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              fallbackGradient: 'from-purple-900 to-indigo-950',
              externalProvider: 'spotify',
              externalUrl: `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`,
              externalId: `spotify:search:${encodeURIComponent(title + ' ' + artist)}`,
              dateAdded: new Date().toISOString(),
              tags: [track.primaryGenreName || 'Music', 'Live Search'],
              rating: 5,
              status: 'want',
              collectionIds: [],
              metadata: {
                year: track.releaseDate ? new Date(track.releaseDate).getFullYear().toString() : undefined,
                duration: track.trackTimeMillis ? `${Math.floor(track.trackTimeMillis / 60000)}:${Math.floor((track.trackTimeMillis % 60000) / 1000).toString().padStart(2, '0')}` : undefined,
                genre: track.primaryGenreName,
                previewAudioUrl: track.previewUrl,
                originalPlatformName: 'Spotify / Apple Music',
                platformDeepLink: `spotify:search:${encodeURIComponent(title + ' ' + artist)}`,
              },
            });
          }
        }
      }

      // Parse iTunes Global results
      if (itunesGlobalRes?.results && Array.isArray(itunesGlobalRes.results)) {
        for (const track of itunesGlobalRes.results) {
          const title = track.trackName || 'Unknown Title';
          const artist = track.artistName || 'Unknown Artist';
          const normKey = `${title.toLowerCase().trim()}_${artist.toLowerCase().trim()}`;
          if (!seenTrackKeys.has(normKey)) {
            seenTrackKeys.add(normKey);
            liveMusicResults.push({
              id: `itunes_gl_${track.trackId}`,
              title,
              subtitle: artist,
              category: 'music' as ItemCategory,
              artworkUrl: (track.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              fallbackGradient: 'from-purple-900 to-indigo-950',
              externalProvider: 'spotify',
              externalUrl: `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`,
              externalId: `spotify:search:${encodeURIComponent(title + ' ' + artist)}`,
              dateAdded: new Date().toISOString(),
              tags: [track.primaryGenreName || 'Music', 'Live Search'],
              rating: 5,
              status: 'want',
              collectionIds: [],
              metadata: {
                year: track.releaseDate ? new Date(track.releaseDate).getFullYear().toString() : undefined,
                duration: track.trackTimeMillis ? `${Math.floor(track.trackTimeMillis / 60000)}:${Math.floor((track.trackTimeMillis % 60000) / 1000).toString().padStart(2, '0')}` : undefined,
                genre: track.primaryGenreName,
                previewAudioUrl: track.previewUrl,
                originalPlatformName: 'Spotify / Apple Music',
                platformDeepLink: `spotify:search:${encodeURIComponent(title + ' ' + artist)}`,
              },
            });
          }
        }
      }
    }

    // Local / Curated pool
    const combinedPool = [
      ...INITIAL_SAVED_ITEMS,
      ...CURATED_DISCOVERIES.map(d => ({ ...d, dateAdded: new Date().toISOString() }))
    ];

    let filtered = combinedPool;

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        (item.metadata?.genre && item.metadata.genre.toLowerCase().includes(q))
      );
    }

    // Merge live results first (games and music)
    const allResults = [...liveGameResults, ...liveMusicResults, ...filtered];

    // Deduplicate by title + category
    const seen = new Set<string>();
    const deduplicated = allResults.filter(item => {
      const key = `${item.category}:${item.title.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      query,
      category,
      count: deduplicated.length,
      results: deduplicated,
      providers: {
        musicLive: liveMusicResults.length > 0,
        steamLive: liveGameResults.length > 0,
        steamCatalog: true,
        cinemaCatalog: true,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process search query', message: error.message },
      { status: 500 }
    );
  }
}
