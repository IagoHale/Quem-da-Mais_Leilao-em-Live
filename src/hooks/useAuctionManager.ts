import { useEffect, useRef, useState } from 'react';
import { useToast } from '../components/feedback/ToastProvider';
import { AUCTION_CHANNEL_NAME } from './useAuctionCoordinator';
import { calculateDonatorTotals, calculateLeader } from '../lib/auction';
import { STORAGE_KEYS } from '../lib/storage';
import type { AuctionState, Donation, Game, PendingBid } from '../types/auction';

const EMPTY_AUCTION_STATE: AuctionState = {
  games: [],
  donators: [],
  donations: [],
};

function readJsonFromStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Falha ao ler ${key} do localStorage:`, error);
    return null;
  }
}

function rebuildAuctionState(input: AuctionState): AuctionState {
  const donations = Array.isArray(input.donations) ? input.donations : [];
    const games = Array.isArray(input.games) ? input.games : [];
    const donationsByGameId = new Map<string, Donation[]>();

    donations.forEach((donation) => {
      const current = donationsByGameId.get(donation.gameId) ?? [];
      current.push(donation);
      donationsByGameId.set(donation.gameId, current);
    });

    return {
      donations,
      donators: calculateDonatorTotals(donations),
      games: games.map((game) => {
        const gameDonations = donationsByGameId.get(game.id) ?? [];
        const value = gameDonations.reduce((total, donation) => total + donation.amount, 0);
        const totalRaised = gameDonations.reduce((total, donation) => total + Math.abs(donation.amount), 0);

        return {
          ...game,
          value,
          totalRaised,
          lastDonator: gameDonations.length > 0 ? calculateLeader(game.id, donations) : undefined,
        };
      }),
    };
}

function loadInitialAuctionState(): AuctionState {
  const sessionState = readJsonFromStorage<AuctionState>(STORAGE_KEYS.auctionSession);
  if (sessionState) {
    return rebuildAuctionState(sessionState);
  }

  const games = readJsonFromStorage<Game[]>(STORAGE_KEYS.auctionGames) ?? [];
  const donations = readJsonFromStorage<Donation[]>(STORAGE_KEYS.donations) ?? [];

  if (games.length === 0 && donations.length === 0) {
    return EMPTY_AUCTION_STATE;
  }

  return rebuildAuctionState({
    games,
    donations,
    donators: readJsonFromStorage(STORAGE_KEYS.donators) ?? [],
  });
}

function cloneAuctionState(state: AuctionState): AuctionState {
  return {
    games: state.games.map((game) => ({ ...game })),
    donators: state.donators.map((donator) => ({ ...donator })),
    donations: state.donations.map((donation) => ({ ...donation })),
  };
}

type SessionMessage = {
  type: 'session-updated';
  senderId: string;
  payload: AuctionState;
};

export function useAuctionManager(canMutate = true) {
  const { showToast } = useToast();
  const [auctionState, setAuctionState] = useState<AuctionState>(loadInitialAuctionState);
  const [pendingBid, setPendingBid] = useState<PendingBid | null>(null);
  const [pastStates, setPastStates] = useState<AuctionState[]>([]);
  const [futureStates, setFutureStates] = useState<AuctionState[]>([]);
  const auctionStateRef = useRef(auctionState);
  const isExternalSyncRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const senderIdRef = useRef(`session-${crypto.randomUUID()}`);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel(AUCTION_CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      const message = event.data;
      if (!message || message.type !== 'session-updated' || message.senderId === senderIdRef.current) return;

      isExternalSyncRef.current = true;
      setAuctionState(rebuildAuctionState(message.payload));
      setPendingBid(null);
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    auctionStateRef.current = auctionState;

    if (isExternalSyncRef.current) {
      isExternalSyncRef.current = false;
      return;
    }

    localStorage.setItem(STORAGE_KEYS.auctionSession, JSON.stringify(auctionState));
    localStorage.setItem(STORAGE_KEYS.auctionGames, JSON.stringify(auctionState.games));
    localStorage.setItem(STORAGE_KEYS.donators, JSON.stringify(auctionState.donators));
    localStorage.setItem(STORAGE_KEYS.donations, JSON.stringify(auctionState.donations));
    channelRef.current?.postMessage({
      type: 'session-updated',
      senderId: senderIdRef.current,
      payload: auctionState,
    } satisfies SessionMessage);
  }, [auctionState]);

  const ensureCanMutate = () => {
    if (canMutate) return true;

    showToast({
      title: 'Aba em modo leitura',
      message: 'Outra aba está controlando esta sessão. Use a aba principal para editar.',
      variant: 'error',
      duration: 2600,
    });
    return false;
  };

  const commitState = (nextState: AuctionState) => {
    if (!ensureCanMutate()) return false;

    const currentState = auctionStateRef.current;
    setPastStates((prev) => [...prev.slice(-39), cloneAuctionState(currentState)]);
    setFutureStates([]);
    setAuctionState(nextState);
    return true;
  };

  const handleAddGame = (name: string, imageUrl?: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return false;

    const currentState = auctionStateRef.current;
    if (currentState.games.some((game) => game.name.toLowerCase() === normalizedName.toLowerCase())) {
      return false;
    }

    return commitState({
      ...currentState,
      games: [
        ...currentState.games,
        {
          id: crypto.randomUUID(),
          name: normalizedName,
          value: 0,
          imageUrl,
        },
      ],
    });
  };

  const addBid = (id: string, amount: number) => {
    if (!ensureCanMutate()) return false;
    setPendingBid({ gameId: id, amount });
    return true;
  };

  const completeBid = (name: string) => {
    const currentState = auctionStateRef.current;
    if (!pendingBid) return false;

    const { gameId, amount } = pendingBid;
    const targetGame = currentState.games.find((game) => game.id === gameId);
    if (!targetGame) return false;

    const finalName = name.trim() || 'Anônimo';
    const newDonation: Donation = {
      id: crypto.randomUUID(),
      donatorName: finalName,
      amount,
      gameId,
      gameName: targetGame.name,
      timestamp: Date.now(),
    };

    const updatedDonations = [newDonation, ...currentState.donations];
    const updatedState = rebuildAuctionState({
      ...currentState,
      donations: updatedDonations,
    });

    if (!commitState(updatedState)) return false;
    setPendingBid(null);
    return true;
  };

  const handleUpdateDonation = (donationId: string, name: string, amount: number, gameId: string) => {
    const currentState = auctionStateRef.current;
    const oldDonation = currentState.donations.find((donation) => donation.id === donationId);
    if (!oldDonation) return false;

    const newGame = currentState.games.find((game) => game.id === gameId);
    if (!newGame) return false;

    const finalName = name.trim() || 'Anônimo';
    const updatedDonations = currentState.donations.map((donation) =>
      donation.id === donationId ? { ...donation, donatorName: finalName, amount, gameId, gameName: newGame.name } : donation,
    );

    return commitState(
      rebuildAuctionState({
        ...currentState,
        donations: updatedDonations,
      }),
    );
  };

  const handleUpdateGame = (gameId: string, name: string, imageUrl: string) => {
    const currentState = auctionStateRef.current;
    const normalizedName = name.trim();

    return commitState({
      ...currentState,
      games: currentState.games.map((game) => (game.id === gameId ? { ...game, name: normalizedName, imageUrl: imageUrl.trim() } : game)),
      donations: currentState.donations.map((donation) => (donation.gameId === gameId ? { ...donation, gameName: normalizedName } : donation)),
    });
  };

  const handleDeleteGame = (id: string) => {
    const currentState = auctionStateRef.current;
    const game = currentState.games.find((item) => item.id === id);
    if (!game) return false;

    return commitState({
      ...currentState,
      games: currentState.games.filter((item) => item.id !== id),
      donations: currentState.donations.map((donation) => (donation.gameId === id ? { ...donation, gameId: 'orphaned', gameName: '[Jogo Removido]' } : donation)),
    });
  };

  const replaceAuctionState = (nextState: AuctionState) => {
    if (!ensureCanMutate()) return false;

    const normalized = rebuildAuctionState(nextState);
    const currentState = auctionStateRef.current;
    setPastStates((prev) => [...prev.slice(-39), cloneAuctionState(currentState)]);
    setFutureStates([]);
    setAuctionState(normalized);
    setPendingBid(null);
    return true;
  };

  const resetAuction = () => {
    if (!ensureCanMutate()) return false;

    setPastStates((prev) => [...prev.slice(-39), cloneAuctionState(auctionStateRef.current)]);
    setFutureStates([]);
    setAuctionState(EMPTY_AUCTION_STATE);
    setPendingBid(null);
    return true;
  };

  const undo = () => {
    const currentState = auctionStateRef.current;
    const previousState = pastStates[pastStates.length - 1];
    if (!previousState) return false;

    setPastStates((prev) => prev.slice(0, -1));
    setFutureStates((prev) => [cloneAuctionState(currentState), ...prev].slice(0, 40));
    setAuctionState(previousState);
    setPendingBid(null);
    return true;
  };

  const redo = () => {
    const currentState = auctionStateRef.current;
    const [nextState, ...remainingStates] = futureStates;
    if (!nextState) return false;

    setPastStates((prev) => [...prev.slice(-39), cloneAuctionState(currentState)]);
    setFutureStates(remainingStates);
    setAuctionState(nextState);
    setPendingBid(null);
    return true;
  };

  const { games, donators, donations } = auctionState;
  const sortedGames = [...games].sort((a, b) => b.value - a.value);
  const sortedDonators = [...donators].sort((a, b) => b.total - a.total).slice(0, 10);
  const totalRaised = donations.reduce((acc, donation) => acc + Math.abs(donation.amount), 0);

  return {
    games,
    donators,
    donations,
    sortedGames,
    sortedDonators,
    totalRaised,
    pendingBid,
    handleAddGame,
    addBid,
    completeBid,
    handleUpdateDonation,
    handleUpdateGame,
    handleDeleteGame,
    replaceAuctionState,
    resetAuction,
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
}
