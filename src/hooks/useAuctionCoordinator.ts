import { useEffect, useRef, useState } from 'react';

type CoordinatorMessage =
  | { type: 'owner-check'; senderId: string }
  | { type: 'owner-present'; senderId: string }
  | { type: 'owner-claimed'; senderId: string }
  | { type: 'owner-force'; senderId: string }
  | { type: 'owner-released'; senderId: string };

export const AUCTION_CHANNEL_NAME = 'quem-da-mais-auction';
const OWNER_DISCOVERY_MS = 100;

export function useAuctionCoordinator() {
  const [tabId] = useState(() => {
    const stored = sessionStorage.getItem('auction-tab-id');
    if (stored) return stored;
    const newId = `tab-${crypto.randomUUID()}`;
    sessionStorage.setItem('auction-tab-id', newId);
    return newId;
  });
  
  const channelRef = useRef<BroadcastChannel | null>(null);
  const ownerIdRef = useRef<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false); // Começa assumindo que pode, até descobrir que não

  const claimOwnership = () => {
    ownerIdRef.current = tabId;
    setIsReadOnly(false);
    channelRef.current?.postMessage({ type: 'owner-force', senderId: tabId } satisfies CoordinatorMessage);
  };

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      setIsReadOnly(false);
      return;
    }

    const channel = new BroadcastChannel(AUCTION_CHANNEL_NAME);
    channelRef.current = channel;

    let ownerDetected = false;
    let electionTimeout: number | null = null;

    const becomeOwner = () => {
      ownerIdRef.current = tabId;
      setIsReadOnly(false);
      channel.postMessage({ type: 'owner-claimed', senderId: tabId } satisfies CoordinatorMessage);
    };

    const requestOwnership = () => {
      ownerDetected = false;
      channel.postMessage({ type: 'owner-check', senderId: tabId } satisfies CoordinatorMessage);
      electionTimeout = window.setTimeout(() => {
        if (!ownerDetected) {
          becomeOwner();
        }
      }, OWNER_DISCOVERY_MS);
    };

    channel.onmessage = (event: MessageEvent<CoordinatorMessage>) => {
      const message = event.data;
      if (!message || message.senderId === tabId) return;

      if (message.type === 'owner-check' && ownerIdRef.current === tabId) {
        channel.postMessage({ type: 'owner-present', senderId: tabId } satisfies CoordinatorMessage);
        return;
      }

      if (message.type === 'owner-present') {
        ownerDetected = true;
        ownerIdRef.current = message.senderId;
        setIsReadOnly(true);
        return;
      }

      if (message.type === 'owner-claimed') {
        ownerDetected = true;
        const nextOwnerId =
          ownerIdRef.current === tabId && tabId.localeCompare(message.senderId) < 0 ? tabId : message.senderId;
        ownerIdRef.current = nextOwnerId;
        setIsReadOnly(nextOwnerId !== tabId);
        return;
      }

      if (message.type === 'owner-force') {
        ownerDetected = true;
        ownerIdRef.current = message.senderId;
        setIsReadOnly(true);
        return;
      }

      if (message.type === 'owner-released') {
        if (ownerIdRef.current === message.senderId) {
          ownerIdRef.current = null;
          requestOwnership();
        }
      }
    };

    requestOwnership();

    return () => {
      if (electionTimeout) {
        window.clearTimeout(electionTimeout);
      }

      if (ownerIdRef.current === tabId) {
        channel.postMessage({ type: 'owner-released', senderId: tabId } satisfies CoordinatorMessage);
      }

      channel.close();
      channelRef.current = null;
    };
  }, [tabId]);

  return {
    isReadOnly,
    canMutate: !isReadOnly,
    claimOwnership,
  };
}
