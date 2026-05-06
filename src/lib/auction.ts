import type { Donation, Donator, Game } from '../types/auction';

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateLeader(gameId: string, allDonations: Donation[]) {
  const gameDonations = allDonations.filter((donation) => donation.gameId === gameId);
  if (gameDonations.length === 0) return undefined;

  const totals: Record<string, number> = {};
  gameDonations.forEach((donation) => {
    totals[donation.donatorName] = (totals[donation.donatorName] || 0) + donation.amount;
  });

  let leaderName = '';
  let maxAmount = -Infinity;

  Object.entries(totals).forEach(([name, amount]) => {
    if (amount > maxAmount || (amount === maxAmount && leaderName === '')) {
      maxAmount = amount;
      leaderName = name;
    }
  });

  return leaderName;
}

export function calculateDonatorTotals(donations: Donation[]): Donator[] {
  const totals: Record<string, number> = {};

  donations.forEach((donation) => {
    totals[donation.donatorName] = (totals[donation.donatorName] || 0) + Math.abs(donation.amount);
  });

  return Object.entries(totals).map(([name, total]) => ({ name, total }));
}

export function calculateAuctionStats(games: Game[], donations: Donation[], donators: Donator[]) {
  const topDonators = [...donators].sort((a, b) => b.total - a.total).slice(0, 5);
  const topGames = [...games].sort((a, b) => b.value - a.value).slice(0, 3);
  const positiveDonations = donations.filter((donation) => donation.amount > 0);
  const negativeDonations = donations.filter((donation) => donation.amount < 0);
  const mostDisputedGame = [...games]
    .map((game) => ({
      ...game,
      bidCount: donations.filter((donation) => donation.gameId === game.id).length,
    }))
    .sort((a, b) => b.bidCount - a.bidCount || b.value - a.value)[0];
  const mostSabotagedGame = [...games]
    .map((game) => ({
      ...game,
      sabotageTotal: Math.abs(
        donations
          .filter((donation) => donation.gameId === game.id && donation.amount < 0)
          .reduce((total, donation) => total + donation.amount, 0),
      ),
    }))
    .sort((a, b) => b.sabotageTotal - a.sabotageTotal || a.value - b.value)[0];

  const biggestBid = positiveDonations.reduce<Donation | null>((highest, donation) => {
    if (!highest || donation.amount > highest.amount) return donation;
    return highest;
  }, null);

  const biggestImposterBid = negativeDonations.reduce<Donation | null>((lowest, donation) => {
    if (!lowest || donation.amount < lowest.amount) return donation;
    return lowest;
  }, null);
  const biggestSabotator = Object.entries(
    negativeDonations.reduce<Record<string, number>>((totals, donation) => {
      totals[donation.donatorName] = (totals[donation.donatorName] ?? 0) + Math.abs(donation.amount);
      return totals;
    }, {}),
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)[0];

  const totalRaised = donations.reduce((total, donation) => total + Math.abs(donation.amount), 0);

  return {
    totalRaised,
    topDonators,
    topGames,
    totalGames: games.length,
    totalBids: donations.length,
    averageBid: donations.length > 0 ? totalRaised / donations.length : 0,
    mostDisputedGame,
    mostSabotagedGame,
    biggestBid,
    biggestImposterBid,
    biggestSabotator,
  };
}
