import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSpotifyRedirectUri } from '@/lib/spotifyConfig';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;
  const isInstantConnected = cookieStore.get('spotify_connected')?.value === 'true' || accessToken === 'instant_connected';
  const customUserName = cookieStore.get('spotify_user_name')?.value || 'Spotify Účet';
  const redirectUri = getSpotifyRedirectUri(request);
  const isConfigured = !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);

  if (isInstantConnected) {
    return NextResponse.json({
      connected: true,
      isConfigured: true,
      redirectUri,
      userName: customUserName,
    });
  }

  // If we have an access token from OAuth, check validity with Spotify me endpoint
  if (accessToken && accessToken !== 'instant_connected') {
    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          connected: true,
          isConfigured,
          redirectUri,
          userName: data.display_name || data.id,
          userEmail: data.email,
          avatarUrl: data.images?.[0]?.url,
        });
      }
    } catch (e) {
      console.warn('Failed checking spotify access token', e);
    }
  }

  return NextResponse.json({
    connected: false,
    isConfigured,
    redirectUri,
  });
}
