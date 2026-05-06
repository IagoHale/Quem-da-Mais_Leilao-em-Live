import { Download, Settings2, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';

export function SessionSettingsModal({
  onExport,
  onImport,
  onClose,
}: {
  onExport: () => void;
  onImport: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        className="liquidglass relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 p-7 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(145,70,255,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_38%)]" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-neutral-500 transition hover:bg-white/5 hover:text-white"
          aria-label="Fechar configurações"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-twitch">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Sessão</p>
              <h2 className="text-2xl font-display font-bold text-white">Configurações do leilão</h2>
            </div>
          </div>

          <p className="mb-7 max-w-lg text-sm leading-relaxed text-neutral-300">
            Exporte um snapshot completo para backup ou importe uma sessão anterior para continuar de onde parou.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={onExport}
              className="group rounded-[1.5rem] border border-emerald-400/15 bg-emerald-500/8 p-5 text-left transition hover:border-emerald-300/30 hover:bg-emerald-500/12"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-500/10 text-emerald-300">
                <Download className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/80">Exportar</p>
              <h3 className="mt-2 text-lg font-bold text-white">Baixar sessão</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-300">Salva jogos, lances, ranking, streamer vinculado e configuração atual do timer.</p>
            </button>

            <button
              onClick={onImport}
              className="group rounded-[1.5rem] border border-sky-400/15 bg-sky-500/8 p-5 text-left transition hover:border-sky-300/30 hover:bg-sky-500/12"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/15 bg-sky-500/10 text-sky-300">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/80">Importar</p>
              <h3 className="mt-2 text-lg font-bold text-white">Restaurar snapshot</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-300">Carrega um arquivo `.json` exportado pelo app e substitui o estado atual do leilão.</p>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
