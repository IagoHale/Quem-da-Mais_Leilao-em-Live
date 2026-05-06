import { useState, useEffect, useRef } from 'react';
import { Trophy, Plus, Trash2, Gamepad2, DollarSign, Target, TrendingUp, AlertTriangle, Search, Loader2, History, Pencil, Ghost } from 'lucide-react';
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
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [pendingBid, setPendingBid] = useState<{ gameId: string, amount: number } | null>(null);
  
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
    
    setGames(prev =>
      prev.map(game =>
        game.id === gameId ? { ...game, value: game.value + amount, lastDonator: finalName } : game
      )
    );

    if (amount !== 0) {
      // Record individual donation
      setDonations(prev => [{
        id: crypto.randomUUID(),
        donatorName: finalName,
        amount,
        gameId,
        gameName: targetGame?.name || 'Unknown',
        timestamp: Date.now()
      }, ...prev]);

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

    setGames(prev => prev.map(game => {
      if (game.id === oldGameId) return { ...game, value: game.value - donation.amount };
      if (game.id === newGameId) return { ...game, value: game.value + donation.amount, lastDonator: donation.donatorName };
      return game;
    }));

    setDonations(prev => prev.map(d => 
      d.id === donationId ? { ...d, gameId: newGameId, gameName: newGame.name } : d
    ));
  };

  const handleUpdateDonation = (donationId: string, name: string, amount: number, gameId: string) => {
    const oldDonation = donations.find(d => d.id === donationId);
    if (!oldDonation) return;

    const newGame = games.find(g => g.id === gameId);
    if (!newGame) return;

    const finalName = name.trim() || 'Anônimo';

    // 1. Atualizar Jogos (Subtrair antigo, somar novo)
    setGames(prev => prev.map(game => {
      let newValue = game.value;
      let lastDonator = game.lastDonator;

      if (game.id === oldDonation.gameId) {
        newValue = newValue - oldDonation.amount;
      }
      
      if (game.id === gameId) {
        newValue = newValue + amount;
        lastDonator = finalName;
      }

      return { ...game, value: newValue, lastDonator };
    }));

    // 2. Atualizar Donators (Reajustar totais acumulados)
    setDonators(prev => {
      let next = [...prev];
      
      // Subtrair do antigo nome
      const oldDonatorIdx = next.findIndex(d => d.name.toLowerCase() === oldDonation.donatorName.toLowerCase());
      if (oldDonatorIdx !== -1) {
        next[oldDonatorIdx] = { ...next[oldDonatorIdx], total: next[oldDonatorIdx].total - oldDonation.amount };
      }

      // Somar no novo nome
      const newDonatorIdx = next.findIndex(d => d.name.toLowerCase() === finalName.toLowerCase());
      if (newDonatorIdx !== -1) {
        next[newDonatorIdx] = { ...next[newDonatorIdx], total: next[newDonatorIdx].total + amount };
      } else {
        next.push({ name: finalName, total: amount });
      }

      return next.filter(d => d.total > 0);
    });

    // 3. Atualizar o registro da doação
    setDonations(prev => prev.map(d => 
      d.id === donationId 
        ? { ...d, donatorName: finalName, amount, gameId, gameName: newGame.name } 
        : d
    ));

    setIsEditDonationModalOpen(false);
    setEditingDonation(null);
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
    <div className="min-h-screen bg-[#0e0e10] text-[#efeff1] font-sans selection:bg-[#9146FF]/30">
      <header className="sticky top-0 z-50 bg-[#18181b]/95 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="bg-[#9146FF] p-2 rounded-xl shadow-[0_0_20px_rgba(145,70,255,0.4)]"
            >
              <Gamepad2 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-white uppercase sm:text-2xl">
                LEILÃO <span className="text-[#9146FF]">LIVE</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8 bg-black/40 px-4 sm:px-8 py-2.5 rounded-2xl border border-white/5 ring-1 ring-white/5">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black mb-1">Acumulado</span>
              <div className="flex items-baseline gap-1 text-emerald-400">
                <span className="text-[10px] font-black opacity-60">R$</span>
                <span className="text-2xl font-mono font-bold leading-none tracking-tighter">
                  {totalRaised.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="h-8 w-[1px] bg-white/10" />

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="p-2.5 text-neutral-600 hover:text-red-500 transition-all"
              title="Resetar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Top Donators */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-[#18181b] rounded-2xl border border-white/5 p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-3">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Top Donators</h2>
            </div>
            
            <div className="space-y-4">
              {sortedDonators.length === 0 ? (
                <p className="text-[10px] text-neutral-600 font-bold uppercase text-center py-4">Sem doações</p>
              ) : (
                sortedDonators.map((donator, idx) => (
                  <motion.div 
                    layout
                    key={donator.name} 
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[10px] font-black ${idx === 0 ? 'text-yellow-500' : 'text-neutral-700'}`}>0{idx + 1}</span>
                      <span className="text-sm font-bold truncate group-hover:text-[#9146FF] transition-colors">{donator.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-500/80 italic">
                      {donator.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#18181b] rounded-2xl border border-white/5 p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-3">
              <History className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Histórico</h2>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {donations.length === 0 ? (
                <p className="text-[10px] text-neutral-600 font-bold uppercase text-center py-4">Nenhum lance</p>
              ) : (
                donations.map((donation) => (
                  <div key={donation.id} className="p-3 bg-black/20 rounded-xl border border-white/5 group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-[#9146FF] truncate max-w-[80px]">{donation.donatorName}</span>
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
                          className="p-1 px-2 hover:bg-[#9146FF]/10 rounded text-neutral-600 hover:text-[#9146FF] transition-all"
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

        {/* Content Area */}
        <main className="flex-1 max-w-2xl mx-auto w-full">
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
                className="bg-[#18181b] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
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

        {/* Barra de Busca Compacta */}
        <div ref={dropdownRef} className="mb-12 relative group z-40">
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
            className="relative bg-[#1f1f23] border border-white/10 rounded-2xl p-1.5 flex items-center shadow-xl focus-within:border-[#9146FF]/50 transition-colors"
          >
            <div className="pl-4 pr-2 text-neutral-500">
                {isSearching ? <Loader2 className="w-5 h-5 text-[#9146FF] animate-spin" /> : <Search className="w-5 h-5" />}
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
              className="bg-[#9146FF] hover:bg-[#a970ff] text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-tighter transition-all text-xs disabled:opacity-20 flex items-center justify-center gap-2 group/btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Dropdown de Resultados da Busca */}
          <AnimatePresence>
            {showDropdown && searchResults.length > 0 && (
                <motion.div
                   initial={{ opacity: 0, y: -20, scale: 0.98 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -20, scale: 0.98 }}
                   className="absolute top-full left-0 right-0 mt-4 bg-[#1f1f23] border border-white/10 rounded-3xl shadow-[0_40px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden z-[60] backdrop-blur-2xl bg-opacity-95"
                >
                    <div className="px-5 py-3 border-b border-white/5 bg-white/2">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Encontrado na Live-Database</span>
                    </div>
                    {searchResults.map((result) => (
                        <button
                            key={result.gameID}
                            type="button"
                            onClick={() => {
                                // Se tiver steamAppID, usamos a imagem vertical do Steam (poster)
                                // Caso contrário, usamos a thumb do CheapShark
                                const posterUrl = result.steamAppID 
                                    ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${result.steamAppID}/library_600x900.jpg`
                                    : result.thumb;
                                handleAddGame(result.external, posterUrl);
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-[#9146FF]/10 transition-all text-left group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-18 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10 shadow-lg relative group-hover:border-[#9146FF]/30 transition-colors">
                                    <img 
                                        src={result.steamAppID 
                                            ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${result.steamAppID}/library_600x900.jpg`
                                            : result.thumb} 
                                        alt={result.external} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="min-w-0">
                                  <span className="block font-bold text-[#efeff1] group-hover:text-[#9146FF] transition-colors truncate text-base">
                                      {result.external}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1 block">Game Ready</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-[#9146FF] group-hover:text-white transition-all">
                              <Plus className="w-5 h-5" />
                            </div>
                        </button>
                    ))}
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lista de Jogos (Ranking) */}
        <div className="grid gap-8">
          {games.length === 0 ? (
            <div className="text-center py-40 bg-white/2 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center opacity-30">
                <Target className="w-10 h-10 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-display font-medium text-neutral-500">Arena de Leilão Vazia</p>
                <p className="text-sm text-neutral-600 max-w-xs mx-auto font-medium">Capture a atenção do chat! Adicione o primeiro jogo para começar a disputa.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 relative">
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
                      className={`relative group rounded-2xl transition-all duration-300 overflow-hidden ${
                        isLeader 
                          ? 'bg-gradient-to-br from-[#1f1925] to-[#131118] border border-[#9146FF]/30 shadow-xl ring-1 ring-white/5' 
                          : 'bg-[#18181b] border border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Barra de Progresso em Background */}
                      {game.value > 0 && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          className={`absolute inset-y-0 left-0 z-0 opacity-[0.05] ${
                            isLeader ? 'bg-[#9146FF]' : 'bg-emerald-500'
                          }`}
                        />
                      )}

                      <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        
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
                              <div className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-black flex-shrink-0 border transition-all p-0.5 ${
                                isLeader ? 'border-[#9146FF]' : 'border-white/5'
                              }`}>
                                  <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                              </div>
                          ) : (
                              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-800 flex-shrink-0 border border-white/5">
                                  <Gamepad2 className="w-10 h-10 opacity-20" />
                              </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className={`text-lg sm:text-xl font-bold truncate tracking-tight ${isLeader ? 'text-white' : 'text-neutral-200'}`}>
                                {game.name}
                              </h3>
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
                        <div className="flex gap-4 w-full md:w-auto">
                          <div className="flex flex-col gap-1.5 flex-1 md:flex-none">
                            <label className="text-[8px] font-black uppercase text-emerald-500/60 tracking-wider pl-1">Lance Normal</label>
                            <CustomBidInput onBid={(amount) => addBid(game.id, amount)} />
                          </div>

                          <div className="flex flex-col gap-1.5 flex-1 md:flex-none">
                            <label className="text-[8px] font-black uppercase text-red-500/60 tracking-wider pl-1">Lance Impostor</label>
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
      </div>
    </div>
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
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#18181b] border border-white/10 rounded-[2.5rem] p-0 max-w-4xl w-full shadow-2xl ring-1 ring-white/5 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Coluna Esquerda: Info & Valor */}
          <div className="flex-1 p-8 md:p-10 border-r border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Editar Lance</h2>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Ajustes rápidos de auditoria</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest pl-1">Doador Original</label>
                <div className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-neutral-400 font-bold flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#9146FF]" />
                   {donation.donatorName}
                </div>
                <p className="text-[9px] text-neutral-600 font-bold italic ml-1">* O nome do doador não pode ser alterado por segurança.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest pl-1">Valor do Lance (R$)</label>
                <div className="relative">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-mono font-bold text-sm">R$</span>
                   <input
                     type="number"
                     step="0.01"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/30 rounded-2xl pl-12 pr-5 py-4 text-lg text-emerald-400 outline-none transition-all font-mono font-black"
                   />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={() => {
                    const parsedAmount = parseFloat(amount.replace(',', '.'));
                    if (!isNaN(parsedAmount)) {
                      onConfirm(donation.id, donation.donatorName, parsedAmount, selectedGameId);
                    }
                  }}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  Confirmar Alterações
                </button>
                <button
                  onClick={onCancel}
                  className="w-full mt-4 py-2 text-[10px] font-bold text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest"
                >
                  Cancelar Edição
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Seleção de Destino */}
          <div className="flex-1 p-8 md:p-10 bg-black/20">
            <div className="flex items-center justify-between mb-6">
               <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Alterar Destino (Jogo/Ação)</label>
               <span className="text-[10px] font-mono text-neutral-600 font-bold">{games.length} disponíveis</span>
            </div>
            
            <div className="grid gap-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl text-left text-sm font-bold transition-all border ${
                    selectedGameId === game.id 
                      ? 'bg-[#9146FF] border-[#9146FF] text-white shadow-lg shadow-[#9146FF]/20' 
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
    <div className="flex relative w-full md:w-28 flex-shrink-0 group/input">
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="VALOR +"
        className="w-full bg-emerald-500/5 border border-white/5 focus:border-emerald-500/30 rounded-xl pl-3 pr-10 py-2 text-xs text-emerald-400 outline-none transition-all font-bold placeholder:text-neutral-700 placeholder:text-[9px]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAction();
        }}
      />
      <div className="absolute right-1 top-1 bottom-1 flex items-center">
        <button 
          onClick={handleAction}
          className="h-full px-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-all flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-90"
          title="Adicionar"
        >
          <Plus className="w-3.5 h-3.5" />
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
    <div className="flex relative w-full md:w-28 flex-shrink-0 group/imposter">
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="VALOR -"
        className="w-full bg-red-500/5 border border-red-500/10 focus:border-red-500/30 rounded-xl pl-3 pr-10 py-2 text-xs text-red-500 outline-none transition-all font-bold placeholder:text-red-900/40 placeholder:text-[9px]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAction();
        }}
      />
      <div className="absolute right-1 top-1 bottom-1 flex items-center">
        <button 
          onClick={handleAction}
          className="h-full px-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-all flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-90"
          title="Subtrair Lance (Impostor)"
        >
          <Ghost className="w-3.5 h-3.5" />
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
        className="bg-[#18181b] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#9146FF]/20 flex items-center justify-center text-[#9146FF]">
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
          className="w-full bg-black/40 border border-white/5 focus:border-[#9146FF]/30 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all font-bold placeholder:text-neutral-700 mb-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm(name);
          }}
        />

        {donators.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-3 italic">Sugestões (Doadores Recentes)</h3>
            <div className="flex flex-wrap gap-2">
              {donators.slice(0, 8).map((d) => (
                <button
                  key={d.name}
                  onClick={() => setName(d.name)}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-all ${
                    name === d.name 
                      ? 'bg-[#9146FF] border-[#9146FF] text-white' 
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
              className="flex-[2] py-3 rounded-xl bg-[#9146FF] hover:bg-[#a970ff] text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-[#9146FF]/20 active:scale-95"
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


