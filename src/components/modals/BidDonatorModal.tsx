import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import type { Donator } from '../../types/auction';

export function BidDonatorModal({
  onConfirm,
  onCancel,
  donators,
}: {
  onConfirm: (name: string) => void;
  onCancel: () => void;
  donators: Donator[];
}) {
  const [name, setName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="liquidglass rounded-3xl p-6 max-w-sm w-full shadow-2xl border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-twitch/20 flex items-center justify-center text-twitch">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Quem é o Doador?</h2>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Identifique o autor do lance</p>
          </div>
        </div>

        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome..."
          className="w-full bg-black/40 border border-white/5 focus:border-twitch/30 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-white outline-none transition-all font-bold placeholder:text-neutral-700 mb-4 sm:mb-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm(name);
          }}
        />

        {donators.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-[9px] sm:text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-2 sm:mb-3 italic">Sugestões (Recentes)</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
              {donators.slice(0, 10).map((donator) => (
                <button
                  key={donator.name}
                  onClick={() => setName(donator.name)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 border rounded-lg text-[9px] sm:text-[10px] font-bold transition-all ${
                    name === donator.name
                      ? 'bg-twitch border-twitch text-white'
                      : 'bg-white/5 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {donator.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setName('Anônimo')}
              className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${
                name === 'Anônimo'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'
              }`}
            >
              Anônimo
            </button>
            <button
              onClick={() => onConfirm(name)}
              className="flex-[2] py-3 rounded-xl bg-twitch hover:bg-twitch-dark text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-twitch/20 active:scale-95"
            >
              Confirmar lance
            </button>
          </div>

          <button
            onClick={onCancel}
            className="w-full py-2 text-[10px] font-bold text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
