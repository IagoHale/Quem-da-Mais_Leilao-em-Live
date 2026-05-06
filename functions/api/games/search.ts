import { fetchTwitchAccessToken, getTwitchCredentials, searchIgdbGames } from "../../../src/server/igdb";

export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const q = searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ error: "Query vazia" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const credentials = getTwitchCredentials(context.env);

  if (!credentials) {
    return new Response(JSON.stringify({ error: "Configuração da API ausente no Cloudflare" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const tokenData = await fetchTwitchAccessToken(credentials);
    const token = tokenData.access_token;
    const formattedData = await searchIgdbGames(q, token, credentials.clientId);

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
