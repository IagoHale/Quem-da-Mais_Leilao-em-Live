interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { nick } = await context.request.json() as { nick: string };

    if (!nick) {
      return new Response(JSON.stringify({ error: "Nick é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insere no banco de dados D1
    // O binding 'DB' deve estar configurado no painel da Cloudflare
    await context.env.DB.prepare(
      "INSERT INTO usage_logs (nick) VALUES (?)"
    ).bind(nick).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Erro ao salvar log: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
