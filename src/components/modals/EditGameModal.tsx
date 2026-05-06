import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { Game } from '../../types/auction';

export function EditGameModal({
  game,
  onConfirm,
  onCancel,
}: {
  game: Game;
  onConfirm: (id: string, name: string, imageUrl: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(game.name);
  const [imageUrl, setImageUrl] = useState(game.imageUrl || '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="liquidglass relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:p-8"
      >
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--color-twitch) 18%, transparent), transparent 40%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--color-twitch) 10%, transparent), transparent 40%)'
          }}
        />
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-twitch/10 flex items-center justify-center text-twitch">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Editar Atividade</h2>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 font-black uppercase tracking-widest">Personalize o nome e o visual</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Nome do Jogo/Atividade</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/5 focus:border-twitch/30 rounded-2xl px-4 py-3 sm:py-3.5 text-sm text-white outline-none transition-all font-bold placeholder:text-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Link da Imagem (URL)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Cole o link de uma imagem"
              className="w-full bg-black/40 border border-white/5 focus:border-twitch/30 rounded-2xl px-4 py-3 sm:py-3.5 text-sm text-white outline-none transition-all font-medium placeholder:text-neutral-700"
            />
            <p className="text-[8px] sm:text-[9px] text-neutral-600 font-medium ml-1">* Recomendamos links de imagens verticais.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 mt-8 sm:mt-10">
          <button
            onClick={() => onConfirm(game.id, name, imageUrl)}
            disabled={!name.trim()}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-twitch hover:bg-twitch-dark text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl shadow-twitch/20 active:scale-95 disabled:opacity-50"
          >
            Salvar Alterações
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 sm:py-3 text-[10px] font-bold text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest"
          >
            Voltar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
