import { useEffect, useRef, useState } from 'react';
import type { GameSearchResult } from '../types/auction';

export function useGameSearch() {
  const [newGameName, setNewGameName] = useState('');
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(newGameName)}`);
        if (!response.ok) throw new Error('Erro na busca');
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [newGameName]);

  return {
    dropdownRef,
    newGameName,
    setNewGameName,
    searchResults,
    setSearchResults,
    isSearching,
    showDropdown,
    setShowDropdown,
  };
}
