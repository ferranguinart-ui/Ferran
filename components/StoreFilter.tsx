
import React from 'react';
import { STORES } from '../types';

interface StoreFilterProps {
  activeStore: string;
  onSelectStore: (store: string) => void;
}

const StoreFilter: React.FC<StoreFilterProps> = ({ activeStore, onSelectStore }) => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 py-2 -mx-4 px-4 sticky top-0 z-10 bg-black/80 backdrop-blur-md">
      {STORES.map((store) => (
        <button
          key={store}
          onClick={() => onSelectStore(store)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold tracking-wide transition-all duration-300 ${
            activeStore === store 
              ? 'orange-gradient orange-glow text-white' 
              : 'glass text-gray-400 hover:text-white'
          }`}
        >
          {store}
        </button>
      ))}
    </div>
  );
};

export default StoreFilter;
