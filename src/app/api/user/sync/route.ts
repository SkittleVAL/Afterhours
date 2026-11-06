import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('afterhours_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Nepřihlášený uživatel' }, { status: 401 });
    }

    const sessionData = serverDb.getUserByToken(token);
    if (!sessionData) {
      return NextResponse.json({ success: false, error: 'Platnost relace vypršela' }, { status: 401 });
    }

    const body = await request.json();
    const { collections, items, profile } = body;

    if (collections || items) {
      serverDb.saveUserData(sessionData.user.id, {
        collections,
        items,
      });
    }

    if (profile) {
      serverDb.updateUserProfile(sessionData.user.id, profile);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Chyba při synchronizaci dat' }, { status: 500 });
  }
}
