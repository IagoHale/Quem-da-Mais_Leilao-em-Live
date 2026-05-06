import { useState } from 'react';
import { Ghost, Plus } from 'lucide-react';

export function CustomBidInput({ onBid }: { onBid: (amount: number) => void }) {
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
        className="w-full bg-emerald-500/5 border border-emerald-500/10 focus:border-emerald-500/40 rounded-xl pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base text-emerald-400 outline-none transition-all font-black placeholder:text-emerald-900/40 placeholder:text-[9px] sm:placeholder:text-[10px]"
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

export function ImposterBidInput({ onBid }: { onBid: (amount: number) => void }) {
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
        className="w-full bg-red-500/5 border border-red-500/10 focus:border-red-500/40 rounded-xl pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base text-red-500 outline-none transition-all font-black placeholder:text-red-900/40 placeholder:text-[9px] sm:placeholder:text-[10px]"
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
