import { Eye, EyeOff, Gavel, Ghost, Loader2, Plus, RotateCcw, Search, Settings2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { RefObject } from 'react';
import type { GameSearchResult } from '../../types/auction';

type AppHeaderProps = {
  dropdownRef: RefObject<HTMLDivElement | null>;
  isSearching: boolean;
  newGameName: string;
  setNewGameName: (value: string) => void;
  setShowDropdown: (value: boolean) => void;
  handleAddGame: (name: string, imageUrl?: string) => void;
  showDropdown: boolean;
  searchResults: GameSearchResult[];
  showTotal: boolean;
  setShowTotal: (value: boolean) => void;
  totalRaised: number;
  openSettingsModal: () => void;
  openResetModal: () => void;
};

export function AppHeader({
  dropdownRef,
  isSearching,
  newGameName,
  setNewGameName,
  setShowDropdown,
  handleAddGame,
  showDropdown,
  searchResults,
  showTotal,
  setShowTotal,
  totalRaised,
  openSettingsModal,
  openResetModal,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 liquidglass shadow-none relative backdrop-blur-3xl !border-none border-0">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-h-[72px]">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="bg-twitch p-2 rounded-xl shadow-[0_0_20px_var(--color-twitch)] flex-shrink-0"
          >
            <Gavel className="w-5 h-5 text-white" />
          </motion.div>
          <h1 className="text-lg font-display font-bold tracking-tight text-white uppercase flex flex-col leading-none">
            QUEM DA MAIS
            <span className="text-twitch text-[8px] tracking-[0.2em] font-black opacity-60">LEILÃO EM LIVE</span>
          </h1>
        </div>

        <div ref={dropdownRef} className="flex-1 max-w-xl mx-4 relative group z-40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="relative liquidglass rounded-xl p-1 flex items-center shadow-xl focus-within:ring-2 focus-within:ring-twitch/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />
            <div className="relative z-10 flex items-center w-full">
              <div className="pl-3 pr-2 text-neutral-500">
                {isSearching ? <Loader2 className="w-4 h-4 text-twitch animate-spin" /> : <Search className="w-4 h-4" />}
              </div>
              <input
                type="text"
                value={newGameName}
                onChange={(e) => {
                  setNewGameName(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Busque jogos ou adicione uma atividade..."
                className="flex-1 bg-transparent border-none text-xs px-1 py-1.5 focus:outline-none text-white placeholder:text-neutral-600 font-medium"
                maxLength={60}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => handleAddGame(newGameName)}
                disabled={!newGameName.trim()}
                className="bg-twitch hover:bg-twitch-dark text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-tighter transition-all text-[10px] disabled:opacity-20 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </form>

          <AnimatePresence>
            {showDropdown && newGameName.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-3 bg-[#121214]/95 border border-white/20 rounded-2xl shadow-[0_40px_70px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden z-[60]"
              >
                <div className="px-4 py-2 border-b border-white/10 bg-white/5 flex items-center justify-between min-h-[32px]">
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-2.5 h-2.5 text-twitch animate-spin" />
                      <span className="text-[9px] font-black text-twitch uppercase tracking-widest">Buscando na IGDB...</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                      {searchResults.length > 0 ? 'Resultados da Busca' : 'Resultados'}
                    </span>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-black/5">
                  {searchResults.length > 0 &&
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => {
                          handleAddGame(result.name, result.thumb);
                        }}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-all text-left group/result border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-24 rounded-lg bg-black flex-shrink-0 border border-white/10 relative overflow-hidden shadow-xl group-hover/result:border-twitch/30 transition-colors">
                            {result.thumb ? (
                              <img src={result.thumb} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={result.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Ghost className="w-6 h-6 text-neutral-800" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="block font-black text-[#efeff1] group-hover/result:text-twitch transition-colors truncate text-base leading-tight">
                              {result.name}
                            </span>
                            {result.year && (
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5 block">{result.year}</span>
                            )}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-neutral-600 group-hover/result:text-white transition-colors mr-2" />
                      </button>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddGame(newGameName)}
                  className="w-full flex items-center justify-between p-3 bg-[#121214]/90 hover:bg-twitch/20 transition-all text-left group/manual border-t border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-twitch/10 flex items-center justify-center text-twitch/50 flex-shrink-0 group-hover/manual:bg-twitch/20 group-hover/manual:text-twitch transition-colors border border-twitch/20 shadow-inner">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="block font-black text-[#efeff1] group-hover/manual:text-twitch transition-colors truncate text-sm">
                          Adicionar "{newGameName}"
                        </span>
                        <span className="text-[8px] font-black text-twitch uppercase tracking-widest bg-twitch/10 px-1.5 py-0.5 rounded ml-1">Manual</span>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5 block truncate max-w-[240px]">Nova atividade personalizada</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-twitch uppercase opacity-0 group-hover/manual:opacity-100 transition-opacity mr-2">Criar</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-end gap-3 sm:gap-6">
          <div className="flex items-center gap-3 bg-black/40 px-3 sm:px-4 py-1.5 rounded-2xl border border-white/5 ring-1 ring-white/5">
            <button
              onClick={() => setShowTotal(!showTotal)}
              className="text-neutral-600 hover:text-white transition-all p-1"
              title={showTotal ? 'Esconder total' : 'Mostrar total'}
            >
              {showTotal ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[7px] text-neutral-500 uppercase tracking-widest font-black mb-0.5">Total Arrematado</span>
              <div className="flex items-baseline gap-1 text-emerald-400 leading-none">
                <span className="text-[9px] font-black opacity-60 mr-1">R$</span>
                <span className="text-lg font-mono font-bold tracking-tighter">
                  {showTotal ? totalRaised.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '****'}
                </span>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-1" />

            <div className="flex items-center gap-1">
              <button
                onClick={openSettingsModal}
                className="p-1.5 text-neutral-600 hover:text-white transition-all"
                title="Configurações da sessão"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={openResetModal}
                className="p-1.5 text-neutral-600 hover:text-red-500 transition-all"
                title="Reiniciar Leilão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
