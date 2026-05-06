import { AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Game } from '../../types/auction';

export function RemoveGameModal({
  game,
  onConfirm,
  onCancel,
}: {
  game: Game;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="liquidglass relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:p-8"
      >
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--color-twitch) 18%, transparent), transparent 40%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--color-twitch) 10%, transparent), transparent 40%)'
          }}
        />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Remover Jogo?</h2>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Esta ação é irreversível</p>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl mb-6">
          <p className="text-sm text-neutral-300 leading-relaxed">
            Ao remover <span className="text-white font-bold">"{game.name}"</span>, todos os <span className="text-red-400 font-bold">R$ {game.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> acumulados em lances serão perdidos permanentemente.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            Sim, remover e apagar lances
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 text-[10px] font-bold text-neutral-600 hover:text-white transition-colors uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
