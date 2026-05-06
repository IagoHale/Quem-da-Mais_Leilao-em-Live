# QUEM DA MAIS - Leilão em Live 🔨💜
[quemdamais.pages.dev](https://quemdamais.pages.dev/)

O **QUEM DA MAIS** é um sistema de LEILÃO para streamers, projetado para criadores de conteúdo que desejam engajar sua audiência através votações financeiras, permitindo que o público influencie diretamente o conteúdo da live através de lances.

## 🔒 Privacidade e Dados
*   **Sem Integrações Externas:** O Sistema depende de uma pessoa adicioando os lances manualmente. não há conexão com serviços de terceiros para processar lances.
*   **Sem Login:** Não é necessário criar conta ou realizar login. Nenhum dado pessoal é solicitado ou armazenado.
*   **Armazenamento Local:** Nenhum dado é salvo em bancos de dados externos. Toda a sessão do leilão é salva exclusivamente no **cache local (LocalStorage)** do seu navegador. Se você limpar os dados do navegador ou trocar de computador, os dados serão perdidos.

## 🚀 Principais Funcionalidades

### 1. Sistema de Lances e Lances Impotores
*   **Lance Normal (+):** Aumenta o valor acumulado de um jogo ou atividade, ajudando-o a subir no ranking.
*   **Lance Impostor (-):** Uma mecânica de "troll" onde o lance diminui o valor de um jogo específico.

### 2. Gestão Dinâmica de Jogos/Atividades
*   **Busca de Jogos:** Pesquisa rápida com capas oficiais.
*   **Adição Manual:** Suporte para atividades personalizadas (ex: "Assistir Filme", "Live de IRL", etc).

### 3. Painel de Auditoria e Controle
*   **Histórico de Lances:** Lista completa de todas as movimentações com filtros por jogo.
*   **Edição de Lances:** Corrija valores ou mude o destino de um lance.
*   **Ranking de Doadores:** Destaque para os maiores apoiadores da sessão do leilão.
*   **Design reativo:** O site da match com a estética do seu canal na twitch (sem necessidade de login).

## 🛠️ Tecnologias Utilizadas
*   **React + TypeScript:** Interface robusta e performática.
*   **Tailwind CSS:** Estilização moderna e responsiva.
*   **Motion:** Animações fluidas para transições de ranking.
*   **LocalStorage:** Persistência de dados totalmente local.
*   **APIs:** IGDB API e IVR API.

## 💻 Como usar em Localhost

Se você deseja rodar o projeto localmente em sua máquina:

1.  **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2.  **Clone o repositório ou baixe os arquivos.**
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
5.  **Acesse no navegador:**
    Abra `http://localhost:3000` (ou a porta indicada no terminal).

---

**Este site foi totalmente construído com Inteligência Artificial.**
