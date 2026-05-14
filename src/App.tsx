import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Gavel, Github } from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { GameList } from './components/auction/GameList';
import { useToast } from './components/feedback/ToastProvider';
import { AppHeader } from './components/layout/AppHeader';
import { AuctionStatsModal } from './components/modals/AuctionStatsModal';
import { BidDonatorModal } from './components/modals/BidDonatorModal';
import { EditDonationModal } from './components/modals/EditDonationModal';
import { EditGameModal } from './components/modals/EditGameModal';
import { RemoveGameModal } from './components/modals/RemoveGameModal';
import { ResetModal } from './components/modals/ResetModal';
import { SessionSettingsModal } from './components/modals/SessionSettingsModal';
import { PerformanceWelcomeModal } from './components/modals/PerformanceWelcomeModal';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { RightSidebar } from './components/sidebar/RightSidebar';
import { useAuctionCoordinator } from './hooks/useAuctionCoordinator';
import { useAuctionManager } from './hooks/useAuctionManager';
import { useGameSearch } from './hooks/useGameSearch';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useAuctionTimer } from './hooks/useAuctionTimer';
import { formatTime } from './lib/auction';
import { STORAGE_KEYS } from './lib/storage';
import { fetchTwitchUser } from './lib/twitch';
import type { AuctionSessionExport, Donation, Game, StreamerInfo } from './types/auction';

export default function App() {
  const { showToast } = useToast();
  const { canMutate, isReadOnly, claimOwnership } = useAuctionCoordinator();
  const {
    games,
    donators,
    donations,
    sortedGames,
    sortedDonators,
    totalRaised,
    handleAddGame: addGameToAuction,
    addBid,
    completeBid: finalizeBid,
    handleUpdateDonation: updateDonation,
    handleUpdateGame: updateGame,
    handleDeleteGame: deleteGame,
    replaceAuctionState,
    resetAuction: clearAuction,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAuctionManager(canMutate);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuctionStatsModalOpen, setIsAuctionStatsModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isEditDonationModalOpen, setIsEditDonationModalOpen] = useState(false);
  const [isEditGameModalOpen, setIsEditGameModalOpen] = useState(false);
  const [isRemoveGameModalOpen, setIsRemoveGameModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [showTotal, setShowTotal] = useState(true);
  const isAnyModalOpen = isResetModalOpen || isSettingsModalOpen || isAuctionStatsModalOpen || isBidModalOpen || isEditDonationModalOpen || isEditGameModalOpen || isRemoveGameModalOpen;
  const [streamerInfo, setStreamerInfo] = useLocalStorageState<StreamerInfo | null>(STORAGE_KEYS.streamerInfo, null);
  const [performanceMode, setPerformanceMode] = useLocalStorageState<'lite' | 'beautiful'>('qmd_performance_mode', 'beautiful');
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorageState<boolean>('qmd_has_seen_welcome', false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (performanceMode === 'lite') {
      document.documentElement.classList.add('performance-lite');
    } else {
      document.documentElement.classList.remove('performance-lite');
    }
  }, [performanceMode]);

  // Efeito para injetar a cor primária do streamer no CSS
  useEffect(() => {
    if (streamerInfo?.primaryColorHex) {
      document.documentElement.style.setProperty('--color-twitch', streamerInfo.primaryColorHex);
      // Calcula uma versão mais escura para o hover, se possível, ou usa a mesma
      document.documentElement.style.setProperty('--color-twitch-dark', streamerInfo.primaryColorHex + 'CC');
    } else {
      // Volta para o roxo padrão se não houver cor customizada
      document.documentElement.style.setProperty('--color-twitch', '#9146FF');
      document.documentElement.style.setProperty('--color-twitch-dark', '#772ce8');
    }
  }, [streamerInfo]);

  const {
    timerSeconds,
    isTimerRunning,
    timerInput,
    handleTimerInputChange,
    handleTimerInputBlur,
    handleStartTimer,
    handleResetTimer,
    exportTimerState,
    importTimerState,
  } = useAuctionTimer();

  // Registra estatística de uso quando o streamerInfo já existe no localStorage (visita de retorno)
  useEffect(() => {
    const alreadyTrackedThisSession = sessionStorage.getItem('qmd_tracked');
    if (streamerInfo?.login && !alreadyTrackedThisSession) {
      sessionStorage.setItem('qmd_tracked', '1');
      fetch('/api/stats', {
        method: 'POST',
        body: JSON.stringify({ nick: streamerInfo.login }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error('Erro no registro de estatística (retorno):', err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ Roda apenas uma vez na montagem do componente

  const [isLinking, setIsLinking] = useState(false);
  const [isParisMode, setIsParisMode] = useState(false);
  const parisAudioRef = useRef<HTMLAudioElement | null>(null);
  const { dropdownRef, newGameName, setNewGameName, searchResults, setSearchResults, isSearching, showDropdown, setShowDropdown } = useGameSearch();

  const handleAddGame = (name: string, imageUrl?: string) => {
    const added = addGameToAuction(name, imageUrl);
    setNewGameName('');
    if (added) {
      setSearchResults([]);
    }
    setShowDropdown(false);
  };

  const completeBid = (name: string) => {
    if (!finalizeBid(name)) return;
    setIsBidModalOpen(false);
  };

  const handleUpdateDonation = (donationId: string, name: string, amount: number, gameId: string) => {
    if (!updateDonation(donationId, name, amount, gameId)) return;
    setIsEditDonationModalOpen(false);
    setEditingDonation(null);
  };

  const handleUpdateGame = (gameId: string, name: string, imageUrl: string) => {
    if (!updateGame(gameId, name, imageUrl)) return;
    setIsEditGameModalOpen(false);
    setEditingGame(null);
  };

  const handleLinkStreamer = async (login: string) => {
    if (isReadOnly) {
      showToast({
        title: 'Aba em modo leitura',
        message: 'Outra aba está controlando esta sessão. Troque para a aba principal para editar.',
        variant: 'error',
      });
      return;
    }

    // Rastreio de uso (Cloudflare D1)
    sessionStorage.setItem('qmd_tracked', '1');
    fetch('/api/stats', {
      method: 'POST',
      body: JSON.stringify({ nick: login }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error('Erro no registro de estatística:', err));

    setIsLinking(true);
    try {
      if (login.toLowerCase() === 'paris') {
        setIsParisMode(true);
        if (!parisAudioRef.current) {
          parisAudioRef.current = new Audio('/som.mp3');
          parisAudioRef.current.loop = true;
        }
        
        if (parisAudioRef.current.paused) {
          parisAudioRef.current.play().catch(error => {
            console.error('Erro ao tocar som:', error);
          });
        }
        return;
      }

      setIsParisMode(false);
      const data = await fetchTwitchUser(login);
      setStreamerInfo(data);
      showToast({
        title: 'Canal conectado',
        message: `Perfil de ${data.display_name} carregado com sucesso.`,
        variant: 'success',
      });
    } catch {
      showToast({
        title: 'Falha ao buscar canal',
        message: 'Verifique o nick informado na Twitch e tente novamente.',
        variant: 'error',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const resetAuction = () => {
    if (!clearAuction()) return;
    setIsResetModalOpen(false);
  };

  const handleUndo = () => {
    if (!undo()) return;
    showToast({
      title: 'Ação desfeita',
      message: 'O estado anterior do leilão foi restaurado.',
      variant: 'info',
      duration: 2200,
    });
  };

  const handleRedo = () => {
    if (!redo()) return;
    showToast({
      title: 'Ação refeita',
      message: 'A alteração voltou para a linha do tempo do leilão.',
      variant: 'info',
      duration: 2200,
    });
  };

  const handleExportSession = () => {
    const payload: AuctionSessionExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      auction: {
        games,
        donators,
        donations,
      },
      streamerInfo,
      timer: exportTimerState(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

    anchor.href = url;
    anchor.download = `quem-da-mais-session-${stamp}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    showToast({
      title: 'Sessão exportada',
      message: 'O snapshot do leilão foi baixado em JSON.',
      variant: 'success',
    });
  };

  const handleImportSessionClick = () => {
    importInputRef.current?.click();
  };

  const handleImportSessionFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const contents = await file.text();
      const parsed = JSON.parse(contents) as Partial<AuctionSessionExport>;

      if (parsed.version !== 1 || !parsed.auction) {
        throw new Error('Formato inválido');
      }

      if (!replaceAuctionState(parsed.auction)) return;
      setStreamerInfo(parsed.streamerInfo ?? null);
      importTimerState(parsed.timer ?? { input: '05:00', seconds: 0 });
      setIsSettingsModalOpen(false);

      showToast({
        title: 'Sessão importada',
        message: 'O leilão foi restaurado com sucesso a partir do arquivo.',
        variant: 'success',
      });
    } catch {
      showToast({
        title: 'Falha ao importar',
        message: 'Esse arquivo não parece ser uma sessão válida exportada pelo app.',
        variant: 'error',
      });
    }
  };

  return (
    <MotionConfig 
      reducedMotion={performanceMode === 'lite' ? 'always' : 'user'}
      transition={performanceMode === 'lite' ? { duration: 0 } : undefined}
    >
      <div className="min-h-screen flex flex-col bg-[#0e0e10] text-[#efeff1] font-sans selection:bg-twitch/30 relative overflow-x-hidden">
        <input ref={importInputRef} type="file" accept="application/json" onChange={handleImportSessionFile} className="hidden" />

        <AnimatePresence>
          {!hasSeenWelcome && (
            <PerformanceWelcomeModal 
              onSelectMode={(mode) => {
                setPerformanceMode(mode);
                setHasSeenWelcome(true);
              }} 
            />
          )}
        </AnimatePresence>

      {/* Background Banner (Prioriza a capa do canal, se não tiver usa o banner offline) */}
      {(isParisMode || streamerInfo?.banner_url || streamerInfo?.offline_image_url) && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            key={isParisMode ? 'paris-bg' : (streamerInfo?.banner_url || streamerInfo?.offline_image_url)}
            src={isParisMode ? '/imagem.jpg' : (streamerInfo?.banner_url || streamerInfo?.offline_image_url)} 
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-[#0e0e10]/40" />
        </div>
      )}

      <AppHeader
        dropdownRef={dropdownRef}
        isSearching={isSearching}
        newGameName={newGameName}
        setNewGameName={setNewGameName}
        setShowDropdown={setShowDropdown}
        handleAddGame={handleAddGame}
        showDropdown={showDropdown}
        searchResults={searchResults}
        showTotal={showTotal}
        setShowTotal={setShowTotal}
        totalRaised={totalRaised}
        openSettingsModal={() => setIsSettingsModalOpen(true)}
        openResetModal={() => setIsResetModalOpen(true)}
      />

      {isReadOnly && (
        <div className="sticky top-[72px] z-40 mx-auto mt-3 w-full max-w-[1500px] px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-300/15 bg-amber-500/10 px-4 py-3 text-[11px] font-bold tracking-[0.08em] text-amber-100 backdrop-blur-xl">
            <p>Esta aba está em modo leitura. Outra aba está controlando a sessão ativa do leilão.</p>
            <button 
              onClick={() => {
                claimOwnership();
                showToast({
                  title: 'Controle assumido',
                  message: 'Esta aba agora é a principal e pode realizar alterações.',
                  variant: 'success',
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/20 hover:bg-amber-500/30 text-amber-200 transition-colors uppercase tracking-widest text-[9px]"
            >
              Assumir controle
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1500px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-10 relative z-10 flex-grow">
        <LeftSidebar
          streamerInfo={streamerInfo}
          onClearStreamer={() => {
            if (isReadOnly) {
              showToast({
                title: 'Aba em modo leitura',
                message: 'Use a aba principal para alterar o host do leilão.',
                variant: 'error',
              });
              return;
            }
            setStreamerInfo(null);
            localStorage.removeItem(STORAGE_KEYS.streamerInfo);
          }}
          onLinkStreamer={handleLinkStreamer}
          isLinking={isLinking}
          sortedDonators={sortedDonators}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 flex flex-col items-stretch order-1 lg:order-2">
          <AnimatePresence>
            {isResetModalOpen && <ResetModal onConfirm={resetAuction} onCancel={() => setIsResetModalOpen(false)} />}
          </AnimatePresence>

          <AnimatePresence>
            {isBidModalOpen && <BidDonatorModal onConfirm={completeBid} onCancel={() => setIsBidModalOpen(false)} donators={donators} />}
          </AnimatePresence>

          <AnimatePresence>
            {isEditDonationModalOpen && editingDonation && (
              <EditDonationModal
                donation={editingDonation}
                games={games}
                onConfirm={handleUpdateDonation}
                onCancel={() => {
                  setIsEditDonationModalOpen(false);
                  setEditingDonation(null);
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isEditGameModalOpen && editingGame && (
              <EditGameModal
                game={editingGame}
                onConfirm={handleUpdateGame}
                onCancel={() => {
                  setIsEditGameModalOpen(false);
                  setEditingGame(null);
                }}
              />
            )}
          </AnimatePresence>

          <GameList
            games={games}
            sortedGames={sortedGames}
            showTotal={showTotal}
            addBid={(id, amount) => {
              if (!addBid(id, amount)) return;
              setIsBidModalOpen(true);
            }}
            onEditGame={(game) => {
              setEditingGame(game);
              setIsEditGameModalOpen(true);
            }}
            onDeleteGame={(game) => {
              setGameToDelete(game);
              setIsRemoveGameModalOpen(true);
            }}
          />
        </main>

        <RightSidebar
          isTimerRunning={isTimerRunning}
          timerSeconds={timerSeconds}
          formatTime={formatTime}
          timerInput={timerInput}
          handleTimerInputChange={handleTimerInputChange}
          handleTimerInputBlur={handleTimerInputBlur}
          handleStartTimer={handleStartTimer}
          handleResetTimer={handleResetTimer}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          donations={donations}
          games={games}
          onEditDonation={(donation) => {
            setEditingDonation(donation);
            setIsEditDonationModalOpen(true);
          }}
        />
        {isRemoveGameModalOpen && gameToDelete && (
          <RemoveGameModal 
            game={gameToDelete}
            onConfirm={() => {
              if (!deleteGame(gameToDelete.id)) return;
              setIsRemoveGameModalOpen(false);
              setGameToDelete(null);
            }}
            onCancel={() => {
              setIsRemoveGameModalOpen(false);
              setGameToDelete(null);
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {!isAnyModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-none fixed inset-x-4 bottom-20 z-[95] flex justify-center"
          >
            <button
              onClick={() => setIsAuctionStatsModalOpen(true)}
              className="pointer-events-auto inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-white backdrop-blur-2xl transition hover:scale-[1.02]"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-twitch) 28%, transparent)',
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--color-twitch) 22%, transparent), rgba(255,255,255,0.08))',
                boxShadow: performanceMode === 'lite' 
                  ? 'none' 
                  : '0 20px 70px rgba(0,0,0,0.35), 0 0 28px color-mix(in srgb, var(--color-twitch) 28%, transparent)',
              }}
            >
              <Gavel className="h-4 w-4" style={{ color: 'color-mix(in srgb, var(--color-twitch) 72%, white)' }} />
              Encerrar leilão
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsModalOpen && (
          <SessionSettingsModal 
            performanceMode={performanceMode}
            onTogglePerformanceMode={setPerformanceMode}
            onExport={handleExportSession} 
            onImport={handleImportSessionClick} 
            onClose={() => setIsSettingsModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuctionStatsModalOpen && (
          <AuctionStatsModal
            games={games}
            donations={donations}
            donators={donators}
            streamerInfo={streamerInfo}
            onClose={() => setIsAuctionStatsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Spacer para o footer fixo */}
      <div className="h-16 flex-shrink-0" />

      <footer className="fixed bottom-0 left-0 right-0 py-2.5 border-t border-white/5 bg-transparent backdrop-blur-md flex flex-row items-center justify-center gap-4 z-[100] opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
          Idealizado por{' '}
          <a
            href="https://www.twitch.tv/branca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 transition-colors hover:text-white"
          >
            Branca
          </a>
        </span>
        <div className="hidden sm:block h-3 w-[1px] bg-white/10" />
        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
          Vibecodado por{' '}
          <a
            href="https://bsky.app/profile/iagohale.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 transition-colors hover:text-white"
          >
            iagohale
          </a>
        </span>
        <div className="hidden sm:block h-3 w-[1px] bg-white/10" />
        <a 
          href="https://github.com/IagoHale/Quem-da-Mais_Leilao-em-Live" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-tighter group-hover:underline">Repositório</span>
        </a>
        <div className="hidden sm:block h-3 w-[1px] bg-white/10" />
        <a
          href="https://pixgg.com/iagohale"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-black uppercase tracking-tighter text-neutral-500 hover:text-emerald-300 transition-colors"
        >
          Gostou? Me pague um pastel
        </a>
      </footer>
    </div>
    </MotionConfig>
  );
}
