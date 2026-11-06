import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, displayName } = body;

    const result = serverDb.register(username, email, password, displayName);
    if (!result.success || !result.token) {
      return NextResponse.json({ success: false, error: result.error || 'Registrace se nezdařila' }, { status: 400 });
    }

    const userData = serverDb.getUserData(result.user!.id);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      collections: userData.collections,
      items: userData.items,
    });

    response.cookies.set('afterhours_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Chyba serveru při registraci' }, { status: 500 });
  }
}
