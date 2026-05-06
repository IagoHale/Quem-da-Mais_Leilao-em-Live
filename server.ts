import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ROTA DA TWITCH: Busca dados do canal usando a IVR API (Mais leve e com banner correto)
  app.get("/api/twitch/user/:login", async (req, res) => {
    const { login } = req.params;

    try {
      // Tenta primeiro com query parameter, que é o padrão mais comum em APIs IVR
      let response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${login.toLowerCase()}`);
      
      // Se falhar, tenta como path parameter (caso tenha mudado)
      if (response.status === 404) {
        response = await fetch(`https://api.ivr.fi/v2/twitch/user/${login.toLowerCase()}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`IVR API error status: ${response.status}`, errorText);
        return res.status(response.status).json({ 
          error: `Erro na API IVR: ${response.status}`,
          details: errorText
        });
      }

      const data = await response.json();
      console.log(`IVR API Response for ${login}:`, JSON.stringify(data).substring(0, 200));

      // IVR API pode retornar um array ou um único objeto dependendo da versão/usuário
      const user = Array.isArray(data) ? data[0] : data;

      if (user && (user.id || user.login || user.displayName)) {
        res.json({
          id: user.id || "0",
          login: user.login || login,
          display_name: user.displayName || user.display_name || login,
          profile_image_url: user.logo || user.profile_image_url,
          banner_url: user.banner, // A "capa" real do canal vindo da IVR
          offline_image_url: user.offlineBanner || user.offline_image_url,
          description: user.bio || user.description
        });
      } else {
        console.warn(`Dados de usuário não encontrados no JSON da IVR para: ${login}`, data);
        res.status(404).json({ 
          error: "Usuário não encontrado nos dados da IVR",
          debug: data 
        });
      }
    } catch (error) {
      console.error("IVR API Error:", error);
      res.status(500).json({ error: "Erro ao comunicar com a API da Comunidade" });
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
