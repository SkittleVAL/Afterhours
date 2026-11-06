import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('afterhours_session')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const sessionData = serverDb.getUserByToken(token);
  if (!sessionData) {
    const res = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    res.cookies.delete('afterhours_session');
    return res;
  }

  return NextResponse.json({
    authenticated: true,
    user: sessionData.user,
    collections: sessionData.data.collections,
    items: sessionData.data.items,
  });
}
