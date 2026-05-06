import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { fetchTwitchAccessToken, getTwitchCredentials, searchIgdbGames } from "./src/server/igdb";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Gerenciamento de Token da IGDB
let twitchAccessToken: string | null = null;
let tokenExpiry: number = 0;

async function getTwitchToken() {
  const credentials = getTwitchCredentials(process.env);

  if (!credentials) {
    console.error("ERRO: VITE_TWITCH_CLIENT_ID ou VITE_TWITCH_CLIENT_SECRET não definidos no ambiente.");
    return null;
  }

  if (twitchAccessToken && Date.now() < tokenExpiry) {
    return twitchAccessToken;
  }

  try {
    const data = await fetchTwitchAccessToken(credentials);
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
  const credentials = getTwitchCredentials(process.env);
  const clientId = credentials?.clientId;

  if (!token || !clientId) {
    return res.status(500).json({ error: "Configuração da API da Twitch incompleta" });
  }

  try {
    const formattedData = await searchIgdbGames(String(q), token, clientId);
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
