import { AlertTriangle, Gavel, Pencil, Target, Trash2, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomBidInput, ImposterBidInput } from './BidInputs';
import type { Game } from '../../types/auction';

type GameListProps = {
  games: Game[];
  sortedGames: Game[];
  addBid: (id: string, amount: number) => void;
  onEditGame: (game: Game) => void;
  onDeleteGame: (game: Game) => void;
};

export function GameList({ games, sortedGames, addBid, onEditGame, onDeleteGame }: GameListProps) {
  return (
    <div className="flex flex-col gap-4 min-h-[600px] w-full flex-grow transition-all duration-500">
      {games.length === 0 ? (
        <div className="w-full flex-1 text-center py-40 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center opacity-30">
            <Target className="w-10 h-10 text-neutral-400" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-display font-medium text-neutral-500">Arena de Leilão Vazia</p>
            <p className="text-sm text-neutral-600 max-w-xs mx-auto font-medium">Capture a atenção do chat! Adicione o primeiro jogo para começar a disputa.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 relative">
          <AnimatePresence mode="popLayout">
            {sortedGames.map((game, index) => {
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;
              const isLeader = index === 0;
              const leaderValue = sortedGames[0].value;
              const progressPercentage = leaderValue > 0 ? (game.value / leaderValue) * 100 : 0;

              return (
                <motion.div
                  layout
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className={`relative group rounded-2xl transition-all duration-500 overflow-hidden liquidglass ${
                    isGold
                      ? 'border-yellow-500/40 shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/20'
                      : isSilver
                        ? 'border-neutral-400/40 shadow-[0_0_40px_rgba(163,163,163,0.1)] ring-1 ring-neutral-400/20'
                        : isBronze
                          ? 'border-amber-700/40 shadow-[0_0_30px_rgba(180,83,9,0.1)] ring-1 ring-amber-700/20'
                          : 'hover:border-white/20'
                  }`}
                >
                  {game.value > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      className={`absolute inset-y-0 left-0 z-0 opacity-[0.05] ${
                        isGold ? 'bg-yellow-500' : isSilver ? 'bg-neutral-400' : isBronze ? 'bg-amber-700' : 'bg-emerald-500'
                      }`}
                    />
                  )}

                  <div className="relative z-10 p-3 sm:p-3.5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      <button
                        onClick={() => onEditGame(game)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-all bg-black/20 backdrop-blur-sm"
                        title="Editar jogo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGame(game)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 rounded-lg text-neutral-500 hover:text-red-500 transition-all bg-black/20 backdrop-blur-sm"
                        title="Remover jogo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div
                      className={`absolute -left-1 top-4 flex items-center justify-center w-8 h-8 rounded-lg font-mono font-black text-[10px] z-20 shadow-lg border border-white/10 rotate-[-12deg] ${
                        isGold
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black scale-110 shadow-yellow-500/20'
                          : isSilver
                            ? 'bg-gradient-to-br from-neutral-200 to-neutral-400 text-black'
                            : isBronze
                              ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                              : 'bg-[#0e0e10] text-neutral-500'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                      {game.imageUrl ? (
                        <div className={`w-20 h-32 sm:w-24 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${isLeader ? 'border-twitch' : 'border-white/5'}`}>
                          <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-20 h-32 sm:w-24 sm:h-36 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-800 flex-shrink-0 border border-white/5">
                          <Gavel className="w-10 h-10 opacity-20" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-lg sm:text-xl font-bold truncate tracking-tight ${isLeader ? 'text-white' : 'text-neutral-200'}`}>{game.name}</h3>
                          {index === 0 && game.value > 0 && <Trophy className="w-4 h-4 text-yellow-400" />}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div
                            className={`font-mono text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-1.5 ${
                              game.value > 0 ? 'text-emerald-400' : game.value < 0 ? 'text-red-500' : 'text-white'
                            }`}
                          >
                            <span className="text-xs opacity-40 italic">R$</span>
                            {game.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          {game.lastDonator && <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest truncate bg-white/5 px-2 py-1 rounded">Líder: {game.lastDonator}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
                      <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 md:flex-none min-w-0">
                        <label className="text-[8px] sm:text-[10px] font-black uppercase text-emerald-500/60 tracking-widest pl-1 truncate">Lance Normal</label>
                        <CustomBidInput onBid={(amount) => addBid(game.id, amount)} />
                      </div>

                      <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 md:flex-none min-w-0">
                        <label className="text-[8px] sm:text-[10px] font-black uppercase text-red-500/60 tracking-widest pl-1 truncate">Lance Impostor</label>
                        <ImposterBidInput onBid={(amount) => addBid(game.id, amount)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
