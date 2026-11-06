import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('afterhours_session')?.value;

  if (token) {
    serverDb.logout(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('afterhours_session');
  return response;
}
