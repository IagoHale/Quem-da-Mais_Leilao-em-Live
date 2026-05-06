# QUEM DA MAIS - Leilão em Live 🔨💜

O **QUEM DA MAIS** é um sistema profissional e interativo de gerenciamento de leilões em tempo real, projetado especificamente para streamers e criadores de conteúdo que desejam engajar sua audiência através de metas, votações financeiras ou arrecadações para caridade.

Com uma estética moderna inspirada na Twitch, o app permite que o público influencie diretamente o conteúdo da live através de lances.

## 🚀 Principais Funcionalidades

### 1. Sistema de Lances Duplo
*   **Lance Normal (+):** Aumenta o valor acumulado de um jogo ou atividade, ajudando-o a subir no ranking.
*   **Lance Impostor (-):** Uma mecânica de "troll" ou sabotagem onde o lance diminui o valor de um jogo específico, mas **continua somando no valor total acumulado** da live. Ideal para criar disputas saudáveis no chat!

### 2. Gestão Dinâmica de Jogos
*   **Busca Inteligente:** Integração com banco de dados para puxar automaticamente capas (posters) e nomes oficiais de jogos de PC.
*   **Adição Manual:** Suporte para adicionar jogos de consoles antigos (PS2, Retro), atividades personalizadas (ex: "Streamer paga 10 flexões") ou qualquer outra meta.
*   **Edição Completa:** Permite trocar nomes e URLs de imagens a qualquer momento para personalizar o visual da live.

### 3. Painel de Auditoria e Controle
*   **Histórico de Lances:** Lista completa de todas as movimentações financeiras.
*   **Edição de Lances:** Corrija valores ou mude o destino de um lance caso o doador mude de ideia, com recalque automático de todos os rankings.
*   **Ranking de Doadores:** Destaque para os maiores apoiadores (Top 5 Donators) da sessão.

### 4. Ferramentas Integradas
*   **Timer Setável:** Cronômetro customizável para gerenciar o tempo das rodadas ou metas da live, com funções de iniciar, pausar e resetar.
*   **Visual "Stream-Ready":**
    *   **Ranking em Tempo Real:** Jogos são ordenados automaticamente com animações fluidas de subida/descida.
    *   **Destaque de Medalhas:** Ranking de 1º, 2º e 3º lugar com cores temáticas (Ouro, Prata e Bronze).
    *   **Contadores Globais:** Exibição clara do valor total arrecadado.

## 🛠️ Tecnologias Utilizadas
*   **React + TypeScript:** Interface robusta e performática.
*   **Tailwind CSS:** Estilização moderna e responsiva.
*   **Motion (Framer Motion):** Animações fluidas para transições de ranking e modais com `layout projections`.
*   **Lucide React:** Conjunto de ícones minimalistas.
*   **LocalStorage:** Persistência de dados local.
*   **API IGDB (via Twitch Auth):** Integração para busca de dados precisos de jogos, capas em alta resolução e informações de lançamento.
*   **API Pública (IVR):** Integração direta para busca de dados de canais da Twitch.

---

## ⚙️ Configuração (Variáveis de Ambiente)
Este projeto utiliza a API da IGDB via **Cloudflare Pages Functions**.

### No Cloudflare Dashboard (Produção):
Acesse **Settings > Environment Variables** no seu projeto Pages e adicione:
*   `TWITCH_CLIENT_ID`: Seu Client ID da Twitch.
*   `TWITCH_CLIENT_SECRET`: Seu Client Secret da Twitch.

### No Ambiente Local:
Crie um arquivo `.env` na raiz com o prefixo `VITE_`:
```env
VITE_TWITCH_CLIENT_ID=seu_id
VITE_TWITCH_CLIENT_SECRET=sua_secret
```

---
*Desenvolvido para transformar donation alerts em entretenimento real.*

**Este site foi totalmente construído com Inteligência Artificial.**
