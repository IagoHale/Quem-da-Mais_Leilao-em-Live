import { useState, useEffect, useRef } from 'react';
import { Trophy, Plus, RotateCcw, Gavel, DollarSign, Target, TrendingUp, AlertTriangle, Search, Loader2, History, Pencil, Ghost, Github, Eye, EyeOff, Settings, Twitch, Timer, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Game = {
  id: string;
  name: string;
  value: number;
  imageUrl?: string;
  lastDonator?: string;
};

type Donator = {
  name: string;
  total: number;
};

type Donation = {
  id: string;
  donatorName: string;
  amount: number;
  gameId: string;
  gameName: string;
  timestamp: number;
};

export default function App() {
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('auctionGames');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Falha ao ler dados do localStorage:", e);
      }
    }
    return [];
  });

  const [donators, setDonators] = useState<Donator[]>(() => {
    const saved = localStorage.getItem('donators');
    return saved ? JSON.parse(saved) : [];
  });

  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem('donations');
    return saved ? JSON.parse(saved) : [];
  });

  const [newGameName, setNewGameName] = useState('');
  const [donatorName, setDonatorName] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isEditDonationModalOpen, setIsEditDonationModalOpen] = useState(false);
  const [isEditGameModalOpen, setIsEditGameModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showTotal, setShowTotal] = useState(true);
  const [isStreamerModalOpen, setIsStreamerModalOpen] = useState(false);
  const [streamerInfo, setStreamerInfo] = useState<{
    display_name: string;
    profile_image_url: string;
    offline_image_url: string;
    banner_url?: string;
    primaryColorHex?: string;
    login?: string;
  } | null>(() => {
    const saved = localStorage.getItem('streamerInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchTwitchUser = async (login: string) => {
    // Busca direta da API IVR (Funciona em qualquer ambiente, inclusive Cloudflare/Vercel)
    try {
      let response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${login.toLowerCase()}`);
      
      // Se não encontrar via query param, tenta o path param (v2 suporta ambos dependendo do endpoint)
      if (response.status === 404) {
        response = await fetch(`https://api.ivr.fi/v2/twitch/user/${login.toLowerCase()}`);
      }

      if (!response.ok) throw new Error("Erro na API da Twitch");

      const data = await response.json();
      // A API IVR pode retornar um array ou um objeto único
      const user = Array.isArray(data) ? data[0] : data;

      if (user && (user.id || user.login || user.displayName)) {
        return {
          id: user.id || "0",
          login: user.login || login,
          display_name: user.displayName || user.display_name || login,
          profile_image_url: user.logo || user.profile_image_url || user.profile_image,
          banner_url: user.banner,
          primaryColorHex: user.chatColor || user.primaryColorHex || "#9146FF",
          offline_image_url: user.offlineBanner || user.offline_image_url,
          description: user.bio || user.description
        };
      }
      throw new Error("Canal não encontrado");
    } catch (error) {
      console.error("Twitch API Error:", error);
      throw error;
    }
  };
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

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState("05:00");

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      const [m, s] = timerInput.split(':').map(Number);
      if (!isNaN(m) && !isNaN(s)) {
        if (timerSeconds === 0) setTimerSeconds(m * 60 + s);
        setIsTimerRunning(true);
      }
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    const [m, s] = timerInput.split(':').map(Number);
    setTimerSeconds(m * 60 + s);
  };
  
  // Helper to calculate leader of a specific game
  const calculateLeader = (gameId: string, allDonations: Donation[]) => {
    const gameDonations = allDonations.filter(d => d.gameId === gameId);
    if (gameDonations.length === 0) return undefined;
    
    const totals: Record<string, number> = {};
    gameDonations.forEach(d => {
      totals[d.donatorName] = (totals[d.donatorName] || 0) + d.amount;
    });

    let leaderName = '';
    let maxAmount = -Infinity;

    Object.entries(totals).forEach(([name, amount]) => {
      // Leader is the one with the highest total amount
      if (amount > maxAmount || (amount === maxAmount && leaderName === '')) {
        maxAmount = amount;
        leaderName = name;
      }
    });

    return leaderName;
  };

  const [isLinking, setIsLinking] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('auctionGames', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('donators', JSON.stringify(donators));
  }, [donators]);

  useEffect(() => {
    localStorage.setItem('donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    if (streamerInfo) {
      localStorage.setItem('streamerInfo', JSON.stringify(streamerInfo));
    } else {
      localStorage.removeItem('streamerInfo');
    }
  }, [streamerInfo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (newGameName.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(newGameName)}&limit=5`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [newGameName]);

  const handleAddGame = (name: string, imageUrl?: string) => {
    if (!name.trim()) return;

    if (games.some(g => g.name.toLowerCase() === name.trim().toLowerCase())) {
        setNewGameName('');
        setShowDropdown(false);
        return;
    }

    const newGame: Game = {
      id: crypto.randomUUID(),
      name: name.trim(),
      value: 0,
      imageUrl,
    };

    setGames(prev => [...prev, newGame]);
    setNewGameName('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const removeGame = (id: string) => {
    setGames(prev => prev.filter(game => game.id !== id));
  };

  const addBid = (id: string, amount: number) => {
    setPendingBid({ gameId: id, amount });
    setIsBidModalOpen(true);
  };

  const completeBid = (name: string) => {
    if (!pendingBid) return;
    const { gameId, amount } = pendingBid;
    const finalName = name.trim() || 'Anônimo';
    const targetGame = games.find(g => g.id === gameId);
    
    const newDonation: Donation = {
      id: crypto.randomUUID(),
      donatorName: finalName,
      amount,
      gameId,
      gameName: targetGame?.name || 'Unknown',
      timestamp: Date.now()
    };

    const updatedDonations = [newDonation, ...donations];
    setDonations(updatedDonations);

    setGames(prev =>
      prev.map(game => {
        if (game.id === gameId) {
          return { 
            ...game, 
            value: game.value + amount, 
            lastDonator: calculateLeader(gameId, updatedDonations) 
          };
        }
        return game;
      })
    );

    if (amount !== 0) {
      // Update donator stats (Cost is always absolute)
      const cost = Math.abs(amount);
      setDonators(prev => {
        const existing = prev.find(d => d.name.toLowerCase() === finalName.toLowerCase());
        if (existing) {
          return prev.map(d => d.name.toLowerCase() === finalName.toLowerCase() ? { ...d, total: d.total + cost } : d);
        }
        return [...prev, { name: finalName, total: cost }];
      });
    }

    setPendingBid(null);
    setIsBidModalOpen(false);
  };

  const reassignDonation = (donationId: string, newGameId: string) => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation) return;

    const oldGameId = donation.gameId;
    const newGame = games.find(g => g.id === newGameId);
    if (!newGame) return;

    const updatedDonations = donations.map(d => 
      d.id === donationId ? { ...d, gameId: newGameId, gameName: newGame.name } : d
    );
    setDonations(updatedDonations);

    setGames(prev => prev.map(game => {
      if (game.id === oldGameId) {
        return { 
          ...game, 
          value: game.value - donation.amount,
          lastDonator: calculateLeader(oldGameId, updatedDonations)
        };
      }
      if (game.id === newGameId) {
        return { 
          ...game, 
          value: game.value + donation.amount, 
          lastDonator: calculateLeader(newGameId, updatedDonations)
        };
      }
      return game;
    }));
  };

  const handleUpdateDonation = (donationId: string, name: string, amount: number, gameId: string) => {
    const oldDonation = donations.find(d => d.id === donationId);
    if (!oldDonation) return;

    const newGame = games.find(g => g.id === gameId);
    if (!newGame) return;

    const finalName = name.trim() || 'Anônimo';

    // 1. Atualizar registros de doação
    const updatedDonations = donations.map(d => 
      d.id === donationId 
        ? { ...d, donatorName: finalName, amount, gameId, gameName: newGame.name } 
        : d
    );
    setDonations(updatedDonations);

    // 2. Atualizar Jogos (com líderes corretos)
    setGames(prev => prev.map(game => {
      let newValue = game.value;

      if (game.id === oldDonation.gameId) {
        newValue = newValue - oldDonation.amount;
      }
      
      if (game.id === gameId) {
        newValue = newValue + (gameId === oldDonation.gameId ? (amount - oldDonation.amount) : amount);
      }

      // Se o jogo foi afetado, recalculamos o líder
      if (game.id === oldDonation.gameId || game.id === gameId) {
        return { 
          ...game, 
          value: newValue, 
          lastDonator: calculateLeader(game.id, updatedDonations) 
        };
      }

      return game;
    }));

    // 3. Atualizar Donators (Reajustar totais acumulados)
    setDonators(prev => {
      // Re-calculating all donator totals from donations for 100% accuracy after edit
      const totals: Record<string, number> = {};
      updatedDonations.forEach(d => {
        const dName = d.donatorName;
        totals[dName] = (totals[dName] || 0) + Math.abs(d.amount);
      });
      return Object.entries(totals).map(([dName, total]) => ({ name: dName, total }));
    });

    setIsEditDonationModalOpen(false);
    setEditingDonation(null);
  };

  const handleUpdateGame = (gameId: string, name: string, imageUrl: string) => {
    setGames(prev => prev.map(g => 
      g.id === gameId ? { ...g, name: name.trim(), imageUrl: imageUrl.trim() } : g
    ));
    
    // Atualizar também o nome do jogo nos registros de doações
    setDonations(prev => prev.map(d => 
      d.gameId === gameId ? { ...d, gameName: name.trim() } : d
    ));

    setIsEditGameModalOpen(false);
    setEditingGame(null);
  };

  const resetAuction = () => {
    setGames([]);
    setDonators([]);
    setDonations([]);
    localStorage.removeItem('auctionGames');
    localStorage.removeItem('donators');
    localStorage.removeItem('donations');
    setIsResetModalOpen(false);
  };

  const sortedGames = [...games].sort((a, b) => b.value - a.value);
  const totalRaised = donations.reduce((acc, d) => acc + Math.abs(d.amount), 0);
  const leadingGameId = sortedGames.length > 0 ? sortedGames[0].id : null;

  // Sort donators by total descending
  const sortedDonators = [...donators].sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e10] text-[#efeff1] font-sans selection:bg-twitch/30 relative overflow-x-hidden">
      {/* Background Banner (Prioriza a capa do canal, se não tiver usa o banner offline) */}
      {(streamerInfo?.banner_url || streamerInfo?.offline_image_url || streamerInfo?.profile_image_url) && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            key={streamerInfo.banner_url || streamerInfo.profile_image_url}
            src={streamerInfo.banner_url || streamerInfo.offline_image_url || streamerInfo.profile_image_url} 
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-[#0e0e10]/40" />
        </div>
      )}

      <header className="sticky top-0 z-50 liquidglass shadow-none relative backdrop-blur-3xl !border-none border-0">
        <div className="w-full max-w-[1500px] mx-auto px-4 py-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-h-[72px]">
          {/* Lado Esquerdo: Logo */}
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
          
          {/* Lado Direito: Acumulado e Botões */}
          <div className="flex items-center justify-end gap-3 sm:gap-6">
            <div className="flex items-center gap-3 bg-black/40 px-3 sm:px-4 py-1.5 rounded-2xl border border-white/5 ring-1 ring-white/5">
              <button
                onClick={() => setShowTotal(!showTotal)}
                className="text-neutral-600 hover:text-white transition-all p-1"
                title={showTotal ? "Esconder total" : "Mostrar total"}
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
                  onClick={() => setIsResetModalOpen(true)}
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

      <div className="w-full max-w-[1500px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-10 relative z-10 flex-grow">
        {/* Sidebar Left: Maiores Arrematadores */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 order-2 lg:order-1">
          <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
              <Twitch className="w-4 h-4 text-twitch" />
              <div className="flex-1 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Host do leilão</h2>
                {streamerInfo && (
                  <button 
                    onClick={() => {
                      setStreamerInfo(null);
                      localStorage.removeItem('streamer_info');
                    }}
                    className="text-[9px] text-neutral-600 hover:text-red-500 font-bold uppercase transition-colors"
                  >
                    Trocar
                  </button>
                )}
              </div>
            </div>
            
            <div className="min-h-[82px] flex flex-col justify-center">
              {streamerInfo ? (
                <div className="flex items-center gap-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full border-2 border-twitch p-0.5 overflow-hidden flex-shrink-0"
                  >
                    <img src={streamerInfo.profile_image_url} alt={streamerInfo.display_name} className="w-full h-full object-cover rounded-full" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white uppercase tracking-wider truncate mb-1">
                      {streamerInfo.display_name}
                    </p>
                    <a 
                      href={`https://twitch.tv/${streamerInfo.login}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] text-twitch font-bold hover:underline flex items-center gap-1"
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
                          
                          setIsLinking(true);
                          try {
                            const data = await fetchTwitchUser(login);
                            setStreamerInfo(data);
                            localStorage.setItem('streamer_info', JSON.stringify(data));
                          } catch (err) {
                            alert('Erro ao buscar canal. Verifique o nick.');
                          } finally {
                            setIsLinking(false);
                          }
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
                  <p className="text-[9px] text-neutral-600 leading-tight">
                    Digite o nick e aperte <span className="text-neutral-400 font-bold">ENTER</span> para carregar sua identidade.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-3">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Maiores Arrematadores</h2>
            </div>
            
            <div className="space-y-4">
              {sortedDonators.length === 0 ? (
                <p className="text-[10px] text-neutral-600 font-bold uppercase text-center py-4">Nenhum lance ainda</p>
              ) : (
                sortedDonators.map((donator, idx) => (
                  <motion.div 
                    layout
                    key={donator.name} 
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[10px] font-black ${idx === 0 ? 'text-yellow-500' : 'text-neutral-700'}`}>0{idx + 1}</span>
                      <span className="text-sm font-bold truncate group-hover:text-twitch transition-colors">{donator.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-500/80 italic">
                      R$ {donator.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 flex flex-col items-stretch order-1 lg:order-2">
        {/* Modal de Streamer/Twitch */}
        <AnimatePresence>
          {isStreamerModalOpen && (
            <StreamerSettingsModal 
              currentInfo={streamerInfo}
              onConfirm={(info) => {
                setStreamerInfo(info);
                setIsStreamerModalOpen(false);
              }}
              onCancel={() => setIsStreamerModalOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Modal de Reset Customizado */}
        <AnimatePresence>
          {isResetModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="liquidglass rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border-white/10"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-500/20">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-display font-bold mb-2">Zerar Tudo?</h2>
                <p className="text-neutral-400 mb-8 text-sm">
                  Essa ação limpará todos os lances e jogos.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={resetAuction}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[10px] transition-all"
                  >
                    Confirmar Reset
                  </button>
                  <button
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full py-3 rounded-xl text-neutral-500 hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Modal de confirmação de lance/donator */}
        <AnimatePresence>
          {isBidModalOpen && (
            <BidDonatorModal 
              onConfirm={completeBid} 
              onCancel={() => setIsBidModalOpen(false)}
              donators={donators}
            />
          )}
        </AnimatePresence>

        {/* Modal de edição de lance */}
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

        {/* Modal de edição de jogo */}
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

        {/* Barra de Busca Compacta */}
        <div ref={dropdownRef} className="mb-4 relative group z-40 w-full">
          <form 
            onSubmit={(e) => { 
                e.preventDefault(); 
                const firstResult = searchResults.length > 0 ? searchResults[0] : null;
                let finalThumbnail = undefined;
                if (firstResult && firstResult.external.toLowerCase().includes(newGameName.toLowerCase())) {
                    finalThumbnail = firstResult.steamAppID 
                        ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${firstResult.steamAppID}/library_600x900.jpg`
                        : firstResult.thumb;
                }
                handleAddGame(newGameName, finalThumbnail); 
            }} 
            className="relative liquidglass rounded-2xl p-1.5 flex items-center shadow-2xl focus-within:ring-2 focus-within:ring-twitch/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />
            <div className="relative z-10 flex items-center w-full">
              <div className="pl-4 pr-2 text-neutral-500">
                  {isSearching ? <Loader2 className="w-5 h-5 text-twitch animate-spin" /> : <Search className="w-5 h-5" />}
              </div>
              <input
                type="text"
                value={newGameName}
                onChange={(e) => {
                  setNewGameName(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Busque jogos ou adicione uma atividade personalizada"
                className="flex-1 bg-transparent border-none text-sm px-1 py-2 focus:outline-none text-white placeholder:text-neutral-600 font-medium"
                maxLength={60}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!newGameName.trim()}
                className="bg-twitch hover:bg-twitch-dark text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-tighter transition-all text-xs disabled:opacity-20 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Dropdown de Resultados da Busca */}
          <AnimatePresence>
            {showDropdown && newGameName.trim().length >= 2 && (
                <motion.div
                   initial={{ opacity: 0, y: -20, scale: 0.98 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -20, scale: 0.98 }}
                   className="absolute top-full left-0 right-0 mt-4 liquidglass rounded-3xl shadow-[0_40px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden z-[60]"
                >
                    <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Banco de Dados (PC)</span>
                      {isSearching && <Loader2 className="w-3 h-3 text-twitch animate-spin" />}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {searchResults.length > 0 && searchResults.map((result) => (
                            <button
                                key={result.gameID}
                                type="button"
                                onClick={() => {
                                    const posterUrl = result.steamAppID 
                                        ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${result.steamAppID}/library_600x900.jpg`
                                        : result.thumb;
                                    handleAddGame(result.external, posterUrl);
                                }}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all text-left group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10 relative">
                                        <img 
                                            src={result.steamAppID 
                                                ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${result.steamAppID}/library_600x900.jpg`
                                                : result.thumb} 
                                            className="w-full h-full object-cover" 
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block font-bold text-[#efeff1] group-hover:text-twitch transition-colors truncate text-sm">
                                          {result.external}
                                      </span>
                                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5 block">Resultado Automático</span>
                                    </div>
                                </div>
                                <Plus className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                            </button>
                        ))}

                        {/* Opção Manual sempre presente se houver texto */}
                        <button
                            type="button"
                            onClick={() => handleAddGame(newGameName)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-[#9146FF]/20 transition-all text-left group ${searchResults.length > 0 ? 'border-t border-white/5' : ''}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-10 h-14 rounded-lg bg-white/5 flex items-center justify-center text-neutral-600 flex-shrink-0 group-hover:bg-twitch/30 group-hover:text-white transition-colors">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="block font-bold text-[#efeff1] group-hover:text-[#9146FF] transition-colors truncate text-sm">
                                      Adicionar "{newGameName}" manualmente
                                  </span>
                                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5 block">Para consoles ou atividades customizadas</span>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-twitch uppercase opacity-0 group-hover:opacity-100 transition-opacity">Add Manual</span>
                        </button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lista de Jogos (Ranking) */}
        <div className="flex flex-col gap-4 min-h-[600px] w-full flex-grow transition-all duration-500">
          {games.length === 0 ? (
            <div className="w-full flex-1 text-center py-40 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center opacity-30">
                <Target className="w-10 h-10 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-display font-medium text-neutral-500">Arena de Leilão Vazia</p>
                <p className="text-sm text-neutral-600 max-w-xs mx-auto font-medium">Capture a atenção do chat! Adicione o primeiro jogo para começar a disputa.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 relative">
              <AnimatePresence mode="popLayout">
                {sortedGames.map((game, index) => {
                  const isLeader = game.id === leadingGameId;
                  const leaderValue = sortedGames[0].value;
                  const progressPercentage = leaderValue > 0 ? (game.value / leaderValue) * 100 : 0;

                  return (
                    <motion.div
                      layout
                      key={game.id}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      className={`relative group rounded-2xl transition-all duration-500 overflow-hidden liquidglass ${
                        isLeader 
                          ? 'border-twitch/40 shadow-[0_0_40px_var(--color-twitch)] ring-1 ring-twitch/20 hover:border-twitch/60' 
                          : 'hover:border-white/20'
                      }`}
                    >
                      {/* Barra de Progresso em Background */}
                      {game.value > 0 && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          className={`absolute inset-y-0 left-0 z-0 opacity-[0.05] ${
                            isLeader ? 'bg-twitch' : 'bg-emerald-500'
                          }`}
                        />
                      )}

                      <div className="relative z-10 p-3 sm:p-3.5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        
                        {/* Rank Badge */}
                        <div className={`absolute -left-1 top-4 flex items-center justify-center w-8 h-8 rounded-lg font-mono font-black text-[10px] z-20 shadow-lg border border-white/10 rotate-[-12deg] ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black' :
                            index === 1 ? 'bg-gradient-to-br from-neutral-300 to-neutral-500 text-black' :
                            index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
                            'bg-[#0e0e10] text-neutral-500'
                          }`}>
                          {index + 1}
                        </div>

                        {/* Informações Princiais */}
                        <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                          {game.imageUrl ? (
                              <div className={`w-20 h-32 sm:w-24 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${
                                isLeader ? 'border-twitch' : 'border-white/5'
                              }`}>
                                  <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                              </div>
                          ) : (
                              <div className="w-20 h-32 sm:w-24 sm:h-36 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-800 flex-shrink-0 border border-white/5">
                                  <Gavel className="w-10 h-10 opacity-20" />
                              </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className={`text-lg sm:text-xl font-bold truncate tracking-tight ${isLeader ? 'text-white' : 'text-neutral-200'}`}>
                                {game.name}
                              </h3>
                              <button
                                onClick={() => {
                                  setEditingGame(game);
                                  setIsEditGameModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-white/5 rounded text-neutral-600 hover:text-white transition-all"
                                title="Editar jogo"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              {index === 0 && game.value > 0 && (
                                <Trophy className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className={`font-mono text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-1.5 ${game.value > 0 ? 'text-emerald-400' : 'text-neutral-800'}`}>
                                <span className="text-xs opacity-40 italic">R$</span>
                                {game.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              {game.lastDonator && (
                                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest truncate bg-white/5 px-2 py-1 rounded">
                                  Líder: {game.lastDonator}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação Simplificados */}
                        <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
                          <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 md:flex-none min-w-0">
                            <label className="text-[7px] sm:text-[8px] font-black uppercase text-emerald-500/60 tracking-wider pl-1 truncate">Lance Normal</label>
                            <CustomBidInput onBid={(amount) => addBid(game.id, amount)} />
                          </div>

                          <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 md:flex-none min-w-0">
                            <label className="text-[7px] sm:text-[8px] font-black uppercase text-red-500/60 tracking-wider pl-1 truncate">Lance Impostor</label>
                            <ImposterBidInput onBid={(amount) => addBid(game.id, amount)} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
        </main>

        {/* Sidebar Right: History */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 order-3">
          {/* Timer Card */}
          <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
              <Timer className="w-4 h-4 text-twitch" />
              <div className="flex-1 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Timer</h2>
                <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-5">
              <div className="text-5xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-[0_0_20px_rgba(145,70,255,0.15)]">
                {formatTime(timerSeconds)}
              </div>
              
              <div className="flex items-center gap-1 w-full p-1.5 bg-black/40 rounded-xl border border-white/5">
                <input 
                  type="text" 
                  value={timerInput}
                  onChange={(e) => setTimerInput(e.target.value)}
                  placeholder="00:00"
                  disabled={isTimerRunning}
                  className="w-16 bg-transparent border-none px-2 py-1 text-center font-mono text-xs text-white focus:outline-none disabled:opacity-30 placeholder:text-neutral-700"
                />
                <div className="flex-1 h-px bg-white/5 mx-1" />
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleStartTimer}
                    title={isTimerRunning ? "Pausar" : "Iniciar"}
                    className={`p-2 rounded-lg transition-all shadow-lg ${isTimerRunning 
                      ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' 
                      : 'bg-twitch/10 text-twitch hover:bg-twitch/20'}`}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <button 
                    onClick={handleResetTimer}
                    title="Resetar"
                    className="p-2 bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="liquidglass rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-3">
              <History className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Histórico</h2>
            </div>
            
            <div className="space-y-3 max-h-[300px] lg:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {donations.length === 0 ? (
                <p className="text-[10px] text-neutral-600 font-bold uppercase text-center py-4">Nenhum lance</p>
              ) : (
                donations.map((donation) => (
                  <div key={donation.id} className="p-3 bg-black/20 rounded-xl border border-white/5 group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-twitch truncate max-w-[80px]">{donation.donatorName}</span>
                      <span className={`text-[10px] font-mono font-bold ${donation.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {donation.amount < 0 ? `-R$ ${Math.abs(donation.amount)}` : `+R$ ${donation.amount}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <p className="text-[9px] text-neutral-500 font-bold truncate leading-tight">➔ {donation.gameName}</p>
                       <button 
                          onClick={() => {
                            setEditingDonation(donation);
                            setIsEditDonationModalOpen(true);
                          }}
                          className="p-1 px-2 hover:bg-twitch/10 rounded text-neutral-600 hover:text-twitch transition-all"
                          title="Editar lance"
                       >
                         <Pencil className="w-3 h-3" />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Spacer para o footer fixo para que o conteúdo não fique escondido sob ele */}
      <div className="h-16 flex-shrink-0" />

      <footer className="fixed bottom-0 left-0 right-0 py-2 border-t border-white/5 bg-transparent backdrop-blur-md flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 z-[100] opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
          Vibecodado por iagohale
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
      </footer>
    </div>
  );
}

function EditGameModal({ 
  game, 
  onConfirm, 
  onCancel 
}: { 
  game: Game, 
  onConfirm: (id: string, name: string, imageUrl: string) => void,
  onCancel: () => void 
}) {
  const [name, setName] = useState(game.name);
  const [imageUrl, setImageUrl] = useState(game.imageUrl || '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
    >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="liquidglass rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl transition-all border-white/10"
        >
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

function EditDonationModal({ 
  donation, 
  games, 
  onConfirm, 
  onCancel 
}: { 
  donation: Donation, 
  games: Game[],
  onConfirm: (id: string, name: string, amount: number, gameId: string) => void,
  onCancel: () => void 
}) {
  const [amount, setAmount] = useState(donation.amount.toString());
  const [selectedGameId, setSelectedGameId] = useState(donation.gameId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl"
    >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="liquidglass rounded-[2.5rem] p-0 max-w-4xl w-full shadow-2xl transition-all border-white/10 overflow-hidden max-h-[95vh] flex"
        >
        <div className="flex flex-col md:flex-row w-full overflow-y-auto custom-scrollbar">
          {/* Coluna Esquerda: Info & Valor */}
          <div className="flex-1 p-6 sm:p-8 md:p-10 border-r border-white/5 bg-white/[0.01]">
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
                <div className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-neutral-400 font-bold flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#9146FF]" />
                   {donation.donatorName}
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
                  onClick={() => {
                    const parsedAmount = parseFloat(amount.replace(',', '.'));
                    if (!isNaN(parsedAmount)) {
                      onConfirm(donation.id, donation.donatorName, parsedAmount, selectedGameId);
                    }
                  }}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
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

          {/* Coluna Direita: Seleção de Destino */}
          <div className="flex-1 p-6 sm:p-8 md:p-10 bg-black/20">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
               <label className="text-[9px] sm:text-[10px] font-black text-neutral-500 uppercase tracking-widest">Alterar Destino</label>
               <span className="text-[9px] sm:text-[10px] font-mono text-neutral-600 font-bold">{games.length} opções</span>
            </div>
            
            <div className="grid gap-2 sm:gap-2.5 max-h-[300px] md:max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl text-left text-sm font-bold transition-all border ${
                    selectedGameId === game.id 
                      ? 'bg-twitch border-twitch text-white shadow-lg shadow-twitch/20' 
                      : 'bg-[#1f1f23] border-white/5 text-neutral-400 hover:border-white/10 hover:text-neutral-200'
                  }`}
                >
                  {game.imageUrl && (
                    <div className="w-8 h-10 rounded-lg overflow-hidden flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                       <img src={game.imageUrl} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="truncate">{game.name}</span>
                  {selectedGameId === game.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                       <Plus className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CustomBidInput({ onBid }: { onBid: (amount: number) => void }) {
  const [value, setValue] = useState('');

  const handleAction = () => {
    const amount = parseFloat(value.replace(',', '.'));
    if (!isNaN(amount) && amount > 0) {
      onBid(amount);
      setValue('');
    }
  };

  return (
    <div className="flex relative w-full lg:w-28 flex-shrink-0 group/input">
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="VALOR +"
        className="w-full bg-emerald-500/5 border border-white/5 focus:border-emerald-500/30 rounded-xl pl-2.5 sm:pl-3 pr-8 sm:pr-10 py-1.5 sm:py-2 text-[10px] sm:text-xs text-emerald-400 outline-none transition-all font-bold placeholder:text-neutral-700 placeholder:text-[8px] sm:placeholder:text-[9px]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAction();
        }}
      />
      <div className="absolute right-0.5 top-0.5 bottom-0.5 flex items-center">
        <button 
          onClick={handleAction}
          className="h-full px-1.5 sm:px-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-all flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-90"
          title="Adicionar"
        >
          <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}

function ImposterBidInput({ onBid }: { onBid: (amount: number) => void }) {
  const [value, setValue] = useState('');

  const handleAction = () => {
    const amount = parseFloat(value.replace(',', '.'));
    if (!isNaN(amount) && amount > 0) {
      onBid(-amount);
      setValue('');
    }
  };

  return (
    <div className="flex relative w-full lg:w-28 flex-shrink-0 group/imposter">
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="VALOR -"
        className="w-full bg-red-500/5 border border-red-500/10 focus:border-red-500/30 rounded-xl pl-2.5 sm:pl-3 pr-8 sm:pr-10 py-1.5 sm:py-2 text-[10px] sm:text-xs text-red-500 outline-none transition-all font-bold placeholder:text-red-900/40 placeholder:text-[8px] sm:placeholder:text-[9px]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAction();
        }}
      />
      <div className="absolute right-0.5 top-0.5 bottom-0.5 flex items-center">
        <button 
          onClick={handleAction}
          className="h-full px-1.5 sm:px-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-all flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-90"
          title="Subtrair Lance (Impostor)"
        >
          <Ghost className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}

function BidDonatorModal({ 
  onConfirm, 
  onCancel, 
  donators 
}: { 
  onConfirm: (name: string) => void, 
  onCancel: () => void,
  donators: Donator[]
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
              {donators.slice(0, 10).map((d) => (
                <button
                  key={d.name}
                  onClick={() => setName(d.name)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 border rounded-lg text-[9px] sm:text-[10px] font-bold transition-all ${
                    name === d.name 
                      ? 'bg-twitch border-twitch text-white' 
                      : 'bg-white/5 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {d.name}
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

function StreamerSettingsModal({ 
  currentInfo,
  onConfirm,
  onCancel 
}: { 
  currentInfo: any,
  onConfirm: (info: any) => void,
  onCancel: () => void 
}) {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!nickname.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTwitchUser(nickname.trim());
      onConfirm(data);
    } catch (err) {
      setError("Canal não encontrado ou erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="liquidglass rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border-white/10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-twitch/10 flex items-center justify-center text-twitch">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Vincular Canal</h2>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Acesse via API Pública (IVR)</p>
          </div>
        </div>

        <div className="space-y-6">
          {currentInfo && (
            <div className="p-4 bg-twitch/5 border border-twitch/20 rounded-2xl flex items-center gap-4 mb-4">
              <img src={currentInfo.profile_image_url} className="w-12 h-12 rounded-full border-2 border-twitch" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-twitch uppercase tracking-widest">Canal Atual</p>
                <p className="text-sm font-bold text-white truncate">{currentInfo.display_name}</p>
              </div>
              <button 
                onClick={() => onConfirm(null)}
                className="text-[9px] font-black text-red-500 uppercase hover:underline"
              >
                Remover
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Seu Nickname na Twitch</label>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: alanzoka"
                className="w-full bg-black/40 border border-white/5 focus:border-twitch/30 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-700"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-twitch animate-spin" />
                </div>
              )}
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold px-1">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSearch}
              disabled={isLoading || !nickname.trim()}
              className="w-full py-4 rounded-xl bg-twitch hover:bg-twitch-dark text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-twitch/20 disabled:opacity-20 translate-y-0 active:translate-y-1"
            >
              {isLoading ? "Buscando..." : "Sincronizar Canal"}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 text-[10px] font-bold text-neutral-600 hover:text-white transition-colors uppercase tracking-widest"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


