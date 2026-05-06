import { Crown, Flame, Medal, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { calculateAuctionStats } from '../../lib/auction';
import type { Donation, Donator, Game, StreamerInfo } from '../../types/auction';

export function AuctionStatsModal({
  games,
  donations,
  donators,
  streamerInfo,
  onClose,
}: {
  games: Game[];
  donations: Donation[];
  donators: Donator[];
  streamerInfo: StreamerInfo | null;
  onClose: () => void;
}) {
  const stats = calculateAuctionStats(games, donations, donators);
  const themedPanelStyle = {
    borderColor: 'color-mix(in srgb, var(--color-twitch) 32%, rgba(255,255,255,0.08))',
    background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-twitch) 18%, rgba(0,0,0,0.28)), rgba(0,0,0,0.22))',
  } as const;
  const themedSoftCardStyle = {
    borderColor: 'color-mix(in srgb, var(--color-twitch) 24%, rgba(255,255,255,0.08))',
    background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-twitch) 12%, rgba(255,255,255,0.04)), rgba(255,255,255,0.03))',
  } as const;
  const themedIconStyle = {
    color: 'color-mix(in srgb, var(--color-twitch) 78%, white)',
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[220] flex items-center justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        className="liquidglass relative my-auto w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 p-6 sm:p-8"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-twitch) 26%, rgba(255,255,255,0.08))',
          boxShadow: '0 36px 100px rgba(0,0,0,0.48)',
        }}
      >
        {(streamerInfo?.banner_url || streamerInfo?.offline_image_url || streamerInfo?.profile_image_url) && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={streamerInfo.banner_url || streamerInfo.offline_image_url || streamerInfo.profile_image_url}
              alt=""
              className="h-full w-full object-cover opacity-18 blur-[2px]"
            />
            <div className="absolute inset-0 bg-[#050507]/82" />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top, color-mix(in srgb, var(--color-twitch) 18%, transparent), transparent 34%), radial-gradient(circle at bottom left, color-mix(in srgb, var(--color-twitch) 12%, transparent), transparent 30%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 34%)',
          }}
        />
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 rounded-full border border-white/10 bg-black/35 p-2 text-neutral-400 transition hover:bg-white/8 hover:text-white"
          aria-label="Fechar estatísticas"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {streamerInfo?.profile_image_url && (
                <div
                  className="h-20 w-20 overflow-hidden rounded-full border p-1 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-twitch) 18%, rgba(255,255,255,0.16))' }}
                >
                  <img
                    src={streamerInfo.profile_image_url}
                    alt={streamerInfo.display_name ?? 'Canal'}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em]" style={themedIconStyle}>Leilão encerrado</p>
                <h2 className="mt-2 text-3xl font-display font-bold text-white sm:text-4xl">Resultado do leilão</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-300">
                  {streamerInfo?.display_name ? `Painel final da sessão de ${streamerInfo.display_name}.` : 'Painel final da sessão com os principais destaques do leilão.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border p-4" style={themedPanelStyle}>
              <Medal className="mb-4 h-5 w-5" style={themedIconStyle} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Jogo vencedor</p>
              <p className="mt-2 text-lg font-black text-white">
                {stats.topGames[0]?.name ?? 'Sem vencedor'}
              </p>
              {stats.topGames[0] && <p className="mt-2 text-xs text-neutral-300">R$ {stats.topGames[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
            </div>
            <div className="rounded-[1.5rem] border p-4" style={themedPanelStyle}>
              <Sparkles className="mb-4 h-5 w-5" style={themedIconStyle} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Jogo mais sabotado</p>
              <p className="mt-2 text-lg font-black text-white">{stats.mostSabotagedGame?.name ?? 'Sem sabotagem'}</p>
              {stats.mostSabotagedGame && stats.mostSabotagedGame.sabotageTotal > 0 && (
                <p className="mt-2 text-xs text-neutral-300">R$ {stats.mostSabotagedGame.sabotageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} derrubados</p>
              )}
            </div>
            <div className="rounded-[1.5rem] border p-4" style={themedPanelStyle}>
              <Flame className="mb-4 h-5 w-5 text-rose-300" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Maior lance</p>
              {stats.biggestBid ? (
                <>
                  <p className="mt-2 text-2xl font-black text-white">R$ {stats.biggestBid.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="mt-2 text-xs text-neutral-300">{stats.biggestBid.donatorName}</p>
                </>
              ) : (
                <p className="mt-2 text-2xl font-black text-white">Sem dados</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border p-5" style={themedPanelStyle}>
              <div className="mb-5 flex items-center gap-3">
                <Crown className="h-5 w-5" style={themedIconStyle} />
                <div>
                  <h3 className="text-lg font-bold text-white">Ranking dos arrematantes</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Top 5 da sessão</p>
                </div>
              </div>

              <div className="space-y-3">
                {stats.topDonators.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-sm text-neutral-500">Nenhum lance registrado.</p>
                ) : (
                  stats.topDonators.map((donator, index) => (
                    <div key={donator.name} className="flex items-center justify-between rounded-2xl border px-4 py-3" style={themedSoftCardStyle}>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white"
                          style={{ background: 'color-mix(in srgb, var(--color-twitch) 22%, rgba(255,255,255,0.06))' }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{donator.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Arrematante</p>
                        </div>
                      </div>
                      <p className="font-mono text-lg font-black" style={themedIconStyle}>R$ {donator.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border p-5" style={themedPanelStyle}>
                <div className="mb-4 flex items-center gap-3">
                  <Medal className="h-5 w-5" style={themedIconStyle} />
                  <div>
                    <h3 className="text-lg font-bold text-white">Podium dos jogos</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Top arrecadação</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {stats.topGames.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/10 py-6 text-center text-sm text-neutral-500">Sem jogos no leilão.</p>
                  ) : (
                    stats.topGames.map((game, index) => (
                      <div key={game.id} className="rounded-2xl border px-4 py-3" style={themedSoftCardStyle}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-bold text-white">
                            {index + 1}. {game.name}
                          </p>
                          <p className="font-mono text-sm font-black" style={themedIconStyle}>R$ {game.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-[2rem] border p-5" style={themedPanelStyle}>
                <h3 className="text-lg font-bold text-white">Maior sabotador</h3>
                <div className="mt-4 rounded-2xl border p-4 text-sm text-neutral-300" style={themedSoftCardStyle}>
                  <p className="mt-2 font-bold text-white">
                    {stats.biggestSabotator
                      ? `${stats.biggestSabotator.name} derrubou R$ ${stats.biggestSabotator.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no total.`
                      : 'Nenhuma sabotagem foi registrada nesta sessão.'}
                  </p>
                  {stats.biggestImposterBid && (
                    <p className="mt-3 text-neutral-300">
                      Maior golpe unico: {stats.biggestImposterBid.donatorName} tirou R$ {Math.abs(stats.biggestImposterBid.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {stats.biggestImposterBid.gameName}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
