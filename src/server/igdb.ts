import { buildIgdbSearchQuery, formatIgdbResults, sanitizeSearchQuery } from '../shared/igdb';

type TwitchCredentials = {
  clientId: string;
  clientSecret: string;
};

export function getTwitchCredentials(env: Record<string, string | undefined>): TwitchCredentials | null {
  const clientId = env.TWITCH_CLIENT_ID || env.VITE_TWITCH_CLIENT_ID;
  const clientSecret = env.TWITCH_CLIENT_SECRET || env.VITE_TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export async function fetchTwitchAccessToken(credentials: TwitchCredentials) {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${credentials.clientId}&client_secret=${credentials.clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(`Falha ao obter token da Twitch: ${response.status}`);
  }

  return response.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function searchIgdbGames(query: string, accessToken: string, clientId: string) {
  const sanitizedQuery = sanitizeSearchQuery(query);
  const response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
    },
    body: buildIgdbSearchQuery(sanitizedQuery),
  });

  if (!response.ok) {
    throw new Error(`Falha na busca IGDB: ${response.status}`);
  }

  const data = (await response.json()) as Array<{
    id: number;
    name: string;
    cover?: { url?: string };
    first_release_date?: number;
  }>;

  return formatIgdbResults(data);
}
