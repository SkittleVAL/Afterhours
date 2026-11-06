import { NextResponse } from 'next/server';
import { getSpotifyRedirectUri } from '@/lib/spotifyConfig';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL(`/settings?spotify_error=${encodeURIComponent(error || 'missing_code')}`, request.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = getSpotifyRedirectUri(request);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/settings?spotify_error=missing_credentials', request.url));
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('Spotify token exchange failed', errBody);
      return NextResponse.redirect(new URL('/settings?spotify_error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();

    // Fetch user profile to verify identity
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    let userName = 'Spotify User';
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      userName = profile.display_name || profile.id;
    }

    // Set secure HTTP-only cookies or redirect with connected parameters
    const redirectTarget = new URL('/settings?spotify_connected=true', request.url);
    redirectTarget.searchParams.set('account', userName);

    const response = NextResponse.redirect(redirectTarget);
    response.cookies.set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600,
      path: '/',
    });

    if (tokens.refresh_token) {
      response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 3600, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    console.error('Error during Spotify OAuth callback', err);
    return NextResponse.redirect(new URL(`/settings?spotify_error=${encodeURIComponent(err.message)}`, request.url));
  }
}
