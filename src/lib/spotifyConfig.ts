export function getSpotifyRedirectUri(request: Request): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}/api/auth/spotify/callback`;
  }

  const host = request.headers.get('host');
  if (host) {
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const proto = isLocal ? 'http' : 'https';
    return `${proto}://${host}/api/auth/spotify/callback`;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}/api/auth/spotify/callback`;
}
