import { useState } from 'react';
import { Ghost, Pencil, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { Donation, Game } from '../../types/auction';

export function EditDonationModal({
  donation,
  games,
  onConfirm,
  onCancel,
}: {
  donation: Donation;
  games: Game[];
  onConfirm: (id: string, name: string, amount: number, gameId: string) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(donation.amount.toString());
  const [selectedGameId, setSelectedGameId] = useState(donation.gameId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-2 backdrop-blur-xl sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="liquidglass relative flex w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 p-0 shadow-[0_40px_120px_rgba(0,0,0,0.55)] max-h-[95vh]"
      >
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--color-twitch) 18%, transparent), transparent 40%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--color-twitch) 10%, transparent), transparent 40%)'
          }}
        />
        <div className="flex flex-col md:flex-row w-full overflow-y-auto custom-scrollbar">
          <div className="flex-1 min-w-0 p-6 sm:p-8 md:p-10 border-r border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-6 sm:mb-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Pencil className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Editar Lance</h2>
                <p className="text-[9px] sm:text-[10px] text-neutral-500 font-black uppercase tracking-widest">Ajustes rápidos de auditoria</p>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black text-neutral-600 uppercase tracking-widest pl-1">Doador Original</label>
                <div className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-neutral-400 font-bold flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-[#9146FF] flex-shrink-0" />
                  <span className="truncate min-w-0" title={donation.donatorName}>{donation.donatorName}</span>
                </div>
                <p className="text-[8px] sm:text-[9px] text-neutral-600 font-bold italic ml-1">* O nome do doador não pode ser alterado.</p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black text-neutral-600 uppercase tracking-widest pl-1">Valor do Lance (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-mono font-bold text-xs sm:text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/30 rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-base sm:text-lg text-emerald-400 outline-none transition-all font-mono font-black"
                  />
                </div>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-white/5">
                <button
                  disabled={selectedGameId === 'orphaned'}
                  onClick={() => {
                    const parsedAmount = parseFloat(amount.replace(',', '.'));
                    if (!isNaN(parsedAmount)) {
                      onConfirm(donation.id, donation.donatorName, parsedAmount, selectedGameId);
                    }
                  }}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  Confirmar Alterações
                </button>
                <button
                  onClick={onCancel}
                  className="w-full mt-3 sm:mt-4 py-2 text-[9px] sm:text-[10px] font-bold text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest"
                >
                  Cancelar Edição
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 p-6 sm:p-8 md:p-10 bg-black/20">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex flex-col">
                <label className="text-[9px] sm:text-[10px] font-black text-neutral-500 uppercase tracking-widest">Alterar Destino</label>
                {donation.gameId === 'orphaned' && (
                  <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">⚠ Lance sem jogo vinculado</span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-600 font-bold">{games.length} opções</span>
            </div>

            {games.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 bg-black/40 rounded-3xl border border-dashed border-white/5">
                <Ghost className="w-8 h-8 text-neutral-800 mb-2" />
                <p className="text-[10px] text-neutral-600 font-black uppercase text-center">Nenhum jogo ativo para vincular</p>
              </div>
            ) : (
              <div className="grid gap-2 sm:gap-2.5 max-h-[300px] md:max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl text-left text-sm font-bold transition-all border min-w-0 w-full ${
                      selectedGameId === game.id
                        ? 'bg-twitch border-twitch text-white shadow-lg shadow-twitch/20'
                        : 'bg-[#1f1f23] border-white/5 text-neutral-400 hover:border-white/10 hover:text-neutral-200'
                    }`}
                  >
                    {game.imageUrl && (
                      <div className="w-8 h-10 rounded-lg overflow-hidden flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <img src={game.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <span className="truncate min-w-0">{game.name}</span>
                    {selectedGameId === game.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
