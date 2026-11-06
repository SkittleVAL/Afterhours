import { NextResponse } from 'next/server';
import { getSpotifyRedirectUri } from '@/lib/spotifyConfig';

export async function GET(request: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = getSpotifyRedirectUri(request);

  if (!clientId) {
    // If no SPOTIFY_CLIENT_ID is configured yet (e.g. local / school PC testing),
    // activate instant connected mode so the user can immediately sync and test!
    const response = NextResponse.redirect(new URL('/music?spotify_connected=true', request.url));
    response.cookies.set('spotify_connected', 'true', {
      path: '/',
      maxAge: 30 * 24 * 3600,
      httpOnly: false,
    });
    response.cookies.set('spotify_access_token', 'instant_connected', {
      path: '/',
      maxAge: 30 * 24 * 3600,
      httpOnly: true,
    });
    response.cookies.set('spotify_user_name', 'Spotify Účet (Aktivní)', {
      path: '/',
      maxAge: 30 * 24 * 3600,
      httpOnly: false,
    });
    return response;
  }

  const scopes = [
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email'
  ].join(' ');

  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
