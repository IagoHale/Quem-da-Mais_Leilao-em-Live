import { Crown, Flame, Ghost, Medal, X } from 'lucide-react';
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
  } as const;
  const themedSoftCardStyle = {
    borderColor: 'color-mix(in srgb, var(--color-twitch) 24%, rgba(255,255,255,0.08))',
  } as const;
  const themedIconStyle = {
    color: 'color-mix(in srgb, var(--color-twitch) 78%, white)',
  } as const;
  const valueClassName = 'font-mono font-black text-emerald-300';
  const sabotageValueClassName = 'font-mono font-black text-rose-300';

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
            <div className="liquidglass rounded-[1.35rem] border p-3.5" style={themedPanelStyle}>
              <div className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Jogo vencedor</p>
              </div>
              <p className="mt-2 text-lg font-black text-white">
                {stats.topGames[0]?.name ?? 'Sem vencedor'}
              </p>
              {stats.topGames[0] && <p className={`mt-2 text-xs ${valueClassName}`}>R$ {stats.topGames[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
            </div>
            <div className="liquidglass rounded-[1.35rem] border p-3.5" style={themedPanelStyle}>
              <div className="flex items-center gap-2">
                <Ghost className="h-4 w-4 text-rose-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Jogo mais sabotado</p>
              </div>
              <p className="mt-2 text-lg font-black text-white">{stats.mostSabotagedGame?.name ?? 'Sem sabotagem'}</p>
              {stats.mostSabotagedGame && stats.mostSabotagedGame.sabotageTotal > 0 && (
                <p className={`mt-2 text-xs ${valueClassName}`}>R$ {stats.mostSabotagedGame.sabotageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} derrubados</p>
              )}
            </div>
            <div className="liquidglass rounded-[1.35rem] border p-3.5" style={themedPanelStyle}>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-emerald-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Maior lance</p>
              </div>
              {stats.biggestBid ? (
                <>
                  <p className={`mt-2 text-2xl ${valueClassName}`}>R$ {stats.biggestBid.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="mt-2 text-xs text-neutral-300">{stats.biggestBid.donatorName}</p>
                </>
              ) : (
                <p className="mt-2 text-2xl font-black text-white">Sem dados</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="liquidglass rounded-[1.7rem] border p-4" style={themedPanelStyle}>
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
                    <div key={donator.name} className="liquidglass flex items-center justify-between rounded-[1.15rem] border px-3.5 py-2.5" style={themedSoftCardStyle}>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white"
                          style={{ background: 'color-mix(in srgb, var(--color-twitch) 22%, rgba(255,255,255,0.06))' }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-lg font-black text-white">{donator.name}</p>
                        </div>
                      </div>
                      <p className={valueClassName}>R$ {donator.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="liquidglass rounded-[1.7rem] border p-4" style={themedPanelStyle}>
                <div className="mb-4 flex items-center gap-3">
                  <Medal className="h-5 w-5" style={themedIconStyle} />
                  <div>
                    <h3 className="text-lg font-bold text-white">Podium dos jogos</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Top arrecadação</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {stats.topGames.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/10 py-6 text-center text-sm text-neutral-500">Sem jogos no leilão.</p>
                  ) : (
                    stats.topGames.map((game, index) => (
                      <div key={game.id} className="liquidglass rounded-[1.15rem] border px-3.5 py-2" style={themedSoftCardStyle}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-bold text-white">
                            {index + 1}. {game.name}
                          </p>
                          <p className={valueClassName}>R$ {game.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="liquidglass rounded-[1.7rem] border p-4" style={themedPanelStyle}>
                <div className="flex items-center gap-3">
                  <Ghost className="h-5 w-5" style={themedIconStyle} />
                  <h3 className="text-lg font-bold text-white">Sabotadores</h3>
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="liquidglass rounded-[1.15rem] border p-2.5 text-sm text-neutral-300" style={themedSoftCardStyle}>
                    <p className="font-bold text-white">
                      {stats.biggestSabotator
                        ? <>Maior sabotador: {stats.biggestSabotator.name} sabotou um total de <span className={sabotageValueClassName}>R$ {stats.biggestSabotator.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>.</>
                        : 'Nenhuma sabotagem foi registrada nesta sessão.'}
                    </p>
                  </div>
                  <div className="liquidglass rounded-[1.15rem] border p-2.5 text-sm text-neutral-300" style={themedSoftCardStyle}>
                    <p className="font-bold text-white">
                      {stats.biggestImposterBid
                        ? <>Maior golpe: {stats.biggestImposterBid.donatorName} sabotou <span className={sabotageValueClassName}>R$ {Math.abs(stats.biggestImposterBid.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> em {stats.biggestImposterBid.gameName} de uma vez.</>
                        : 'Nenhum golpe unico foi registrado nesta sessão.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
