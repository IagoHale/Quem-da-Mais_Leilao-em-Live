import { AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export function ResetModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="liquidglass relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] text-center"
      >
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--color-twitch) 18%, transparent), transparent 40%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--color-twitch) 10%, transparent), transparent 40%)'
          }}
        />
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Zerar Tudo?</h2>
        <p className="text-neutral-400 mb-8 text-sm">Essa ação limpará todos os lances e jogos.</p>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[10px] transition-all">
            Confirmar Reset
          </button>
          <button onClick={onCancel} className="w-full py-3 rounded-xl text-neutral-500 hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest transition-all">
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
