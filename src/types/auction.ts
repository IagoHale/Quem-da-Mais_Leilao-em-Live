export type Game = {
  id: string;
  name: string;
  value: number;
  imageUrl?: string;
  lastDonator?: string;
  totalRaised?: number;
};

export type Donator = {
  name: string;
  total: number;
};

export type Donation = {
  id: string;
  donatorName: string;
  amount: number;
  gameId: string;
  gameName: string;
  timestamp: number;
};

export type StreamerInfo = {
  display_name: string;
  profile_image_url: string;
  offline_image_url: string;
  banner_url?: string;
  primaryColorHex?: string;
  login?: string;
};

export type PendingBid = {
  gameId: string;
  amount: number;
};

export type AuctionState = {
  games: Game[];
  donators: Donator[];
  donations: Donation[];
};

export type AuctionTimerState = {
  input: string;
  seconds: number;
};

export type AuctionSessionExport = {
  version: 1;
  exportedAt: string;
  auction: AuctionState;
  streamerInfo: StreamerInfo | null;
  timer: AuctionTimerState;
};

export type GameSearchResult = {
  id: string;
  name: string;
  thumb?: string;
  year: number | null;
};
