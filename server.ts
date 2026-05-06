import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Gerenciamento de Token da IGDB
let twitchAccessToken: string | null = null;
let tokenExpiry: number = 0;

async function getTwitchToken() {
  const clientId = process.env.VITE_TWITCH_CLIENT_ID;
  const clientSecret = process.env.VITE_TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("ERRO: VITE_TWITCH_CLIENT_ID ou VITE_TWITCH_CLIENT_SECRET não definidos no ambiente.");
    return null;
  }

  if (twitchAccessToken && Date.now() < tokenExpiry) {
    return twitchAccessToken;
  }

  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" }
    );
    const data = await response.json();
    twitchAccessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Expira 1 min antes por segurança
    return twitchAccessToken;
  } catch (error) {
    console.error("Erro ao obter token da Twitch:", error);
    return null;
  }
}

// Rota de busca na IGDB
app.get("/api/games/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query de busca vazia" });

  const token = await getTwitchToken();
  const clientId = process.env.VITE_TWITCH_CLIENT_ID;

  if (!token || !clientId) {
    return res.status(500).json({ error: "Configuração da API da Twitch incompleta" });
  }

  try {
    // Busca na IGDB: Nome, Capa e Data de lançamento
    const query = `
      search "${q}";
      fields name, cover.url, first_release_date, platforms.name;
      limit 10;
    `;

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${token}`,
      },
      body: query,
    });

    const data = await response.json();
    
    // Formatar os resultados para o frontend
    const formattedData = data.map((game: any) => {
      let thumb = undefined;
      if (game.cover?.url) {
        // Garantir protocolo HTTPS e trocar para tamanho de capa grande
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

    res.json(formattedData);
  } catch (error) {
    console.error("Erro na busca IGDB:", error);
    res.status(500).json({ error: "Falha na comunicação com a IGDB" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
