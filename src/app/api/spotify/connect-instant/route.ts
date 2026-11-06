import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userName = body.userName || 'Spotify Účet';

    const response = NextResponse.json({
      success: true,
      connected: true,
      userName,
    });

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

    response.cookies.set('spotify_user_name', userName, {
      path: '/',
      maxAge: 30 * 24 * 3600,
      httpOnly: false,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, connected: false });
  response.cookies.delete('spotify_connected');
  response.cookies.delete('spotify_access_token');
  response.cookies.delete('spotify_refresh_token');
  response.cookies.delete('spotify_user_name');
  return response;
}
