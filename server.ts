import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ROTA PÚBLICA (IVR API): Busca dados do canal sem necessidade de tokens privados
  app.get("/api/public/user/:login", async (req, res) => {
    const { login } = req.params;

    try {
      // IVR API v2 - Endpoint público para dados de usuário
      let response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${login.toLowerCase()}`);
      
      if (response.status === 404) {
        response = await fetch(`https://api.ivr.fi/v2/twitch/user/${login.toLowerCase()}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `Erro na API: ${response.status}`,
          details: errorText
        });
      }

      const data = await response.json();
      const user = Array.isArray(data) ? data[0] : data;

      if (user && (user.id || user.login || user.displayName)) {
        res.json({
          id: user.id || "0",
          login: user.login || login,
          display_name: user.displayName || user.display_name || login,
          profile_image_url: user.logo || user.profile_image_url,
          banner_url: user.banner,
          primaryColorHex: user.chatColor || user.primaryColorHex,
          offline_image_url: user.offlineBanner || user.offline_image_url,
          description: user.bio || user.description
        });
      } else {
        res.status(404).json({ error: "Canal não encontrado" });
      }
    } catch (error) {
      console.error("Public API Error:", error);
      res.status(500).json({ error: "Erro ao comunicar com a API Pública" });
    }
  });

  // Configuração do Vite (Middleware para Dev / Estático para Prod)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
