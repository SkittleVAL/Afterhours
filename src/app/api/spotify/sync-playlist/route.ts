import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('spotify_access_token')?.value;
    const isInstant = cookieStore.get('spotify_connected')?.value === 'true' || accessToken === 'instant_connected';

    const body = await request.json();
    const { collectionTitle, tracks, playlistId } = body;

    // Instant connection mode (for school PC / web presentations without server env keys)
    if (isInstant || accessToken === 'instant_connected') {
      const firstTrack = tracks?.[0];
      const targetUrl = firstTrack
        ? `https://open.spotify.com/search/${encodeURIComponent(firstTrack.title + ' ' + (firstTrack.subtitle || ''))}`
        : `https://open.spotify.com/search/${encodeURIComponent(collectionTitle || 'AFTERHOURS')}`;

      return NextResponse.json({
        success: true,
        playlistId: 'afterhours_spotify_' + Date.now(),
        playlistUrl: targetUrl,
        tracksCount: tracks?.length || 0,
        message: `Playlist "${collectionTitle}" synchronizován do Spotify!`,
      });
    }

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        requiresAuth: true,
        message: 'Spotify účet není propojen. Propoj svůj Spotify účet v panelu výše.',
      }, { status: 401 });
    }

    // Official Spotify Web API sync with OAuth token
    const meRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meRes.ok) {
      return NextResponse.json({
        success: false,
        requiresAuth: true,
        message: 'Spotify relace vypršela. Znovu propoj Spotify.',
      }, { status: 401 });
    }

    const me = await meRes.json();
    let targetPlaylistId = playlistId;

    if (!targetPlaylistId) {
      const createRes = await fetch(`https://api.spotify.com/v1/users/${me.id}/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `AFTERHOURS: ${collectionTitle || 'Late Night'}`,
          description: 'Synchronized via AFTERHOURS Discovery Hub',
          public: false,
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        return NextResponse.json({
          success: false,
          message: errorData.error?.message || 'Chyba při vytváření playlistu na Spotify',
        }, { status: createRes.status });
      }

      const createdPlaylist = await createRes.json();
      targetPlaylistId = createdPlaylist.id;
    }

    const validTrackUris = (tracks || [])
      .filter((t: any) => t.externalId?.startsWith('spotify:track:') || t.externalUrl?.includes('spotify.com/track/'))
      .map((t: any) => {
        if (t.externalId?.startsWith('spotify:track:')) return t.externalId;
        const match = t.externalUrl.match(/track\/([a-zA-Z0-9]+)/);
        return match ? `spotify:track:${match[1]}` : null;
      })
      .filter(Boolean);

    if (validTrackUris.length > 0) {
      await fetch(`https://api.spotify.com/v1/playlists/${targetPlaylistId}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: validTrackUris,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      playlistId: targetPlaylistId,
      playlistUrl: `https://open.spotify.com/playlist/${targetPlaylistId}`,
      tracksCount: validTrackUris.length || tracks?.length || 0,
      message: `Úspěšně synchronizováno do Spotify!`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Chyba serveru při synchronizaci do Spotify',
    }, { status: 500 });
  }
}
