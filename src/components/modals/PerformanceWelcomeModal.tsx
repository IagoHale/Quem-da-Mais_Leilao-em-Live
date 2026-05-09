import { MonitorPlay, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function PerformanceWelcomeModal({ onSelectMode }: { onSelectMode: (mode: 'lite' | 'beautiful') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-3xl"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="liquidglass relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] text-center"
      >
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top, color-mix(in srgb, var(--color-twitch) 15%, transparent), transparent 60%)'
          }}
        />
        
        <h1 className="text-3xl font-display font-bold mb-3 text-white">Bem-vindo ao Leilão!</h1>
        <p className="text-neutral-300 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
          Antes de começarmos, escolha como você prefere visualizar o site. 
          O "Modo Bonito" requer que a <strong>aceleração de hardware</strong> esteja ativada no seu navegador para não causar travamentos.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* MODO LITE */}
          <button
            onClick={() => onSelectMode('lite')}
            className="group relative overflow-hidden rounded-[1.5rem] border border-neutral-700/50 bg-neutral-800/30 p-6 text-left transition hover:border-amber-400/30 hover:bg-amber-500/10"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-800 text-neutral-400 group-hover:border-amber-400/20 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Modo Lite</h3>
            <p className="text-xs leading-relaxed text-neutral-400 group-hover:text-neutral-300">
              Focado em performance. Remove efeitos de desfoque (blur) e simplifica animações. Ideal para PCs mais modestos ou se a live estiver travando.
            </p>
          </button>

          {/* MODO BONITO */}
          <button
            onClick={() => onSelectMode('beautiful')}
            className="group relative overflow-hidden rounded-[1.5rem] border border-twitch/20 bg-twitch/5 p-6 text-left transition hover:border-twitch/50 hover:bg-twitch/15"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-twitch/30 bg-twitch/20 text-twitch-300 group-hover:border-twitch/50 group-hover:bg-twitch/30 group-hover:text-white transition-colors">
              <MonitorPlay className="h-6 w-6" style={{ color: 'var(--color-twitch)' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Modo Bonito</h3>
            <p className="text-xs leading-relaxed text-neutral-400 group-hover:text-neutral-300">
              Experiência visual completa com desfoques, gradientes e animações fluidas. <strong>Requer aceleração gráfica ativada</strong> no navegador.
            </p>
          </button>
        </div>
        
        <p className="mt-6 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
          Você pode alterar isso depois nas configurações.
        </p>
      </motion.div>
    </motion.div>
  );
}
