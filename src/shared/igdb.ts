export type IgdbGameResult = {
  id: number | string;
  name: string;
  thumb?: string;
  year: number | null;
};

type IgdbApiGame = {
  id: number;
  name: string;
  cover?: {
    url?: string;
  };
  first_release_date?: number;
};

export function sanitizeSearchQuery(query: string) {
  return query.replace(/"/g, '').trim();
}

export function buildIgdbSearchQuery(query: string) {
  const sanitizedQuery = sanitizeSearchQuery(query);
  return `search "${sanitizedQuery}"; fields name, cover.url, first_release_date; limit 5;`;
}

export function formatIgdbResults(games: IgdbApiGame[]): IgdbGameResult[] {
  return games.map((game) => {
    let thumb = undefined;

    if (game.cover?.url) {
      thumb = game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url;
      thumb = thumb.replace('t_thumb', 't_cover_big');
    }

    return {
      id: game.id,
      name: game.name,
      thumb,
      year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
    };
  });
}
