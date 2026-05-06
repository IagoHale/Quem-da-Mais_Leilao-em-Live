import { AlertTriangle, History, Pause, Pencil, Play, Redo2, RotateCcw, Search, Timer, Undo2 } from 'lucide-react';
import type { Donation, Game } from '../../types/auction';

type RightSidebarProps = {
  isTimerRunning: boolean;
  timerSeconds: number;
  formatTime: (seconds: number) => string;
  timerInput: string;
  handleTimerInputChange: (value: string) => void;
  handleTimerInputBlur: () => void;
  handleStartTimer: () => void;
  handleResetTimer: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyFilter: string;
  setHistoryFilter: (value: string) => void;
  donations: Donation[];
  games: Game[];
  onEditDonation: (donation: Donation) => void;
};

export function RightSidebar({
  isTimerRunning,
  timerSeconds,
  formatTime,
  timerInput,
  handleTimerInputChange,
  handleTimerInputBlur,
  handleStartTimer,
  handleResetTimer,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyFilter,
  setHistoryFilter,
  donations,
  games,
  onEditDonation,
}: RightSidebarProps) {
  const filteredDonations = donations.filter((donation) => (historyFilter === 'all' ? true : donation.gameId === historyFilter));

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 order-3">
      <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
          <Timer className="w-4 h-4 text-twitch" />
          <div className="flex-1 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Timer</h2>
            <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="text-5xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-[0_0_20px_rgba(145,70,255,0.15)]">{formatTime(timerSeconds)}</div>

          <div className="flex items-center gap-1 w-full p-1 bg-black/40 rounded-xl border border-white/5 focus-within:border-twitch/50 transition-colors">
            <input
              type="text"
              value={timerInput}
              onChange={(e) => handleTimerInputChange(e.target.value)}
              onBlur={handleTimerInputBlur}
              placeholder="00:00"
              className="w-16 bg-transparent border-none px-2 py-1 text-center font-mono text-xs text-white focus:outline-none placeholder:text-neutral-700"
            />
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <button
                onClick={handleStartTimer}
                title={isTimerRunning ? 'Pausar' : 'Iniciar'}
                className={`p-1.5 rounded-lg transition-all shadow-lg ${isTimerRunning ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' : 'bg-twitch/20 text-twitch hover:bg-twitch/30'}`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                onClick={handleResetTimer}
                title="Reiniciar com novo tempo"
                className="p-1.5 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
        <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
          <History className="w-4 h-4 text-emerald-500" />
          <div className="flex flex-1 items-center justify-between gap-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Histórico</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="rounded-lg p-1.5 text-neutral-600 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                title="Desfazer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="rounded-lg p-1.5 text-neutral-600 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                title="Refazer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3 relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-3 h-3 text-neutral-600 group-focus-within:text-twitch transition-colors" />
          </div>
          <select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-8 py-2.5 text-[9px] font-black uppercase tracking-widest text-[#efeff1] outline-none focus:border-twitch/30 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Filtro: Todos</option>
            {donations.some((donation) => donation.gameId === 'orphaned') && (
              <option value="orphaned" className="text-red-500">
                ⚠ Lances Órfãos
              </option>
            )}
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white" />
          </div>
        </div>

        <div className="space-y-1.5 max-h-[300px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredDonations.length === 0 ? (
            <p className="text-[10px] text-neutral-600 font-bold uppercase text-center py-4">Nenhum lance encontrado</p>
          ) : (
            filteredDonations.map((donation) => (
              <div
                key={donation.id}
                className={`p-3 pr-24 rounded-xl border group relative overflow-hidden transition-all min-h-[58px] flex flex-col justify-center ${
                  donation.gameId === 'orphaned' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' : 'bg-black/20 border-white/5 hover:border-white/20'
                }`}
              >
                {donation.gameId === 'orphaned' && (
                  <div className="absolute top-0 right-0 p-1">
                    <AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                  </div>
                )}
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-black text-twitch truncate max-w-[120px]">{donation.donatorName}</span>
                  <p className={`text-[11px] font-bold truncate leading-tight ${donation.gameId === 'orphaned' ? 'text-red-400' : 'text-neutral-500'}`}>➔ {donation.gameName}</p>
                </div>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-right pointer-events-none">
                  <span className={`text-[11px] font-mono font-black ${donation.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {donation.amount < 0 ? `-R$ ${Math.abs(donation.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `+R$ ${donation.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>

                <button
                  onClick={() => onEditDonation(donation)}
                  className="absolute top-1 right-1 p-1 rounded-md bg-black/60 border border-white/5 text-neutral-500 hover:text-white hover:border-white/10 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-xl"
                  title="Editar lance"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
