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

    // Gera o horário de Brasília formatado (YYYY-MM-DD HH:MM:SS)
    const brazilTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date());

    // O formato do pt-BR vem como DD/MM/YYYY, HH:MM:SS, vamos converter para YYYY-MM-DD HH:MM:SS
    const [date, time] = brazilTime.split(', ');
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day} ${time}`;

    // Insere no banco de dados D1 usando o horário formatado
    await context.env.DB.prepare(
      "INSERT INTO usage_logs (nick, created_at) VALUES (?, ?)"
    ).bind(nick, formattedDate).run();

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
