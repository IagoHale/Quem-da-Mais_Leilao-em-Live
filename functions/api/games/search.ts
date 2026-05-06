export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const q = searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ error: "Query vazia" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clientId = context.env.TWITCH_CLIENT_ID || context.env.VITE_TWITCH_CLIENT_ID;
  const clientSecret = context.env.TWITCH_CLIENT_SECRET || context.env.VITE_TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: "Configuração da API ausente no Cloudflare" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Obter Token da Twitch
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" }
    );
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    // 2. Buscar na IGDB
    const query = `search "${q.replace(/"/g, '')}"; fields name, cover.url, first_release_date; limit 5;`;

    const igdbResponse = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${token}`,
      },
      body: query,
    });

    const data = await igdbResponse.json();

    // 3. Formatar dados
    const formattedData = data.map((game) => {
      let thumb = undefined;
      if (game.cover?.url) {
        thumb = game.cover.url.startsWith('//') 
          ? `https:${game.cover.url}` 
          : game.cover.url;
        thumb = thumb.replace('t_thumb', 't_cover_big');
      }

      return {
        id: game.id,
        name: game.name,
        thumb,
        year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null
      };
    });

    return new Response(JSON.stringify(formattedData), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro na Function: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
