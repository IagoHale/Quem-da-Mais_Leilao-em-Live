import { Loader2, Trophy, Twitch } from 'lucide-react';
import { motion } from 'motion/react';
import type { Donator, StreamerInfo } from '../../types/auction';

type LeftSidebarProps = {
  streamerInfo: StreamerInfo | null;
  onClearStreamer: () => void;
  onLinkStreamer: (login: string) => Promise<void>;
  isLinking: boolean;
  sortedDonators: Donator[];
};

export function LeftSidebar({
  streamerInfo,
  onClearStreamer,
  onLinkStreamer,
  isLinking,
  sortedDonators,
}: LeftSidebarProps) {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 order-2 lg:order-1">
      <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
          <Twitch className="w-4 h-4 text-twitch" />
          <div className="flex-1 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Host do leilão</h2>
            {streamerInfo && (
              <button onClick={onClearStreamer} className="text-[9px] text-neutral-600 hover:text-red-500 font-bold uppercase transition-colors">
                Trocar
              </button>
            )}
          </div>
        </div>

        <div className="min-h-[82px] flex flex-col justify-center">
          {streamerInfo ? (
            <div className="flex items-center gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-full border-2 border-twitch p-0.5 overflow-hidden flex-shrink-0">
                <img src={streamerInfo.profile_image_url} alt={streamerInfo.display_name} className="w-full h-full object-cover rounded-full" />
              </motion.div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-wider truncate mb-1">{streamerInfo.display_name}</p>
                <a 
                  href={`https://twitch.tv/${streamerInfo.login}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-twitch font-bold hover:underline truncate block"
                >
                  twitch.tv/{streamerInfo.login}
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nick da Twitch..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-twitch transition-all"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const login = e.currentTarget.value.trim();
                      if (!login) return;
                      await onLinkStreamer(login);
                    }
                  }}
                  disabled={isLinking}
                />
                {isLinking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3 h-3 text-twitch animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-[9px] text-neutral-600 leading-tight text-center">
                Digite o nick e aperte <span className="text-neutral-400 font-bold">ENTER</span> para carregar sua identidade.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-3">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Arrematantes</h2>
        </div>

        <div className="space-y-1.5">
          {sortedDonators.length === 0 ? (
            <p className="text-[10px] text-neutral-600 font-bold uppercase text-center py-4">Nenhum lance ainda</p>
          ) : (
            sortedDonators.map((donator, idx) => {
              const isGold = idx === 0;
              const isSilver = idx === 1;
              const isBronze = idx === 2;

              return (
                <motion.div
                  layout
                  key={donator.name}
                  className={`flex items-center justify-between group p-2 rounded-xl transition-all ${
                    isGold ? 'bg-yellow-500/5' : isSilver ? 'bg-neutral-200/5' : isBronze ? 'bg-amber-800/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] font-black w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border ${
                        isGold
                          ? 'bg-yellow-500 text-black border-yellow-400'
                          : isSilver
                            ? 'bg-neutral-300 text-black border-neutral-200'
                            : isBronze
                              ? 'bg-amber-700 text-white border-amber-600'
                              : 'text-white border-white/5 bg-white/5'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-sm font-bold truncate min-w-0 transition-colors ${
                        isGold ? 'text-yellow-200' : isSilver ? 'text-neutral-200' : isBronze ? 'text-amber-200' : 'text-neutral-300 group-hover:text-twitch'
                      }`}
                      title={donator.name}
                    >
                      {donator.name}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs font-black italic flex-shrink-0 ml-2 ${
                      isGold ? 'text-yellow-500' : isSilver ? 'text-neutral-300' : isBronze ? 'text-amber-600' : 'text-emerald-500/80'
                    }`}
                  >
                    R$ {donator.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
