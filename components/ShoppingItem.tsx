
import React, { useState } from 'react';
import { ShoppingItem as ItemType, STORES } from '../types';

interface ShoppingItemProps {
  item: ItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove?: (id: string) => void;
  onUpdateStore?: (id: string, store: string) => void;
  moveLabel?: string;
  activeStore?: string;
}

const ShoppingItem: React.FC<ShoppingItemProps> = ({ item, onToggle, onDelete, onMove, onUpdateStore, moveLabel, activeStore }) => {
  const [isChangingStore, setIsChangingStore] = useState(false);
  const isCompleted = item.status === 'COMPLETED';
  const isMatch = activeStore !== 'Todos' && item.store === activeStore;

  const cycleStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateStore) return;
    const availableStores = STORES.filter(s => s !== 'Todos');
    const currentIndex = availableStores.indexOf(item.store);
    const nextIndex = (currentIndex + 1) % availableStores.length;
    onUpdateStore(item.id, availableStores[nextIndex]);
    if (window.navigator.vibrate) window.navigator.vibrate(5);
  };

  return (
    <div className={`glass p-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${isCompleted ? 'grayscale opacity-60' : ''} ${isMatch ? 'border-l-4 border-l-[#f05a28]' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#f05a28]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <button 
        onClick={() => onToggle(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
          isCompleted 
            ? 'bg-[#f05a28] border-[#f05a28]' 
            : 'border-gray-600 hover:border-[#f05a28]'
        }`}
      >
        {isCompleted && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg flex-shrink-0">{item.emoji}</span>
          <div className="truncate">
            <h3 className={`font-bold text-sm tracking-wide truncate ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
              {item.name}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={cycleStore}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isMatch ? 'text-[#f05a28]' : 'text-gray-500 hover:text-white'}`}
              >
                {item.store}
              </button>
              <span className="text-[10px] text-gray-700 font-medium uppercase tracking-tighter">
                • {item.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {onMove && (
          <button 
            onClick={() => onMove(item.id)}
            className="text-[10px] font-black uppercase text-gray-500 hover:text-white"
          >
            {moveLabel}
          </button>
        )}
        <button 
          onClick={() => onDelete(item.id)}
          className="text-gray-500 hover:text-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ShoppingItem;
