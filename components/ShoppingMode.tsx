
import React, { useMemo } from 'react';
import { ShoppingItem } from '../types';
import InputBar from './InputBar';

interface ShoppingModeProps {
  items: ShoppingItem[];
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onAddItems: (items: Partial<ShoppingItem>[]) => void;
  onFinishPurchase: () => void;
  activeStore?: string;
}

const ShoppingMode: React.FC<ShoppingModeProps> = ({ items, onClose, onToggleStatus, onAddItems, onFinishPurchase, activeStore }) => {
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    items.forEach(item => {
      const storeKey = item.store;
      if (!groups[storeKey]) groups[storeKey] = [];
      groups[storeKey].push(item);
    });

    const sortedStores = Object.keys(groups).sort((a, b) => {
      if (a === activeStore) return -1;
      if (b === activeStore) return 1;
      if (a === 'Cualquiera' || a === 'Otros') return 1;
      if (b === 'Cualquiera' || b === 'Otros') return -1;
      return a.localeCompare(b);
    });

    return { sortedStores, groups };
  }, [items, activeStore]);

  const hasCompletedItems = useMemo(() => items.some(i => i.status === 'COMPLETED'), [items]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      <div className="p-6 flex justify-between items-center bg-black/80 backdrop-blur-md z-20">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Modo <span className="text-[#f05a28]">Compra</span></h2>
          {activeStore !== 'Todos' && (
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tienda actual: <span className="text-[#f05a28]">{activeStore}</span></p>
          )}
        </div>
        <div className="flex gap-2">
          {hasCompletedItems && (
            <button 
              onClick={onFinishPurchase}
              className="orange-gradient orange-glow px-4 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest animate-pulse"
            >
              Finalizar
            </button>
          )}
          <button 
            onClick={onClose}
            className="glass p-3 rounded-full text-gray-400 active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-2 hide-scrollbar">
        <div className="space-y-12">
          {groupedItems.sortedStores.map((store) => (
            <div key={store}>
              <h3 className={`text-xs font-black tracking-widest uppercase mb-4 border-b pb-2 ${store === activeStore ? 'text-[#f05a28] border-[#f05a28]/40' : 'text-gray-500 border-white/10'}`}>
                {store} {store === activeStore ? ' (Tienda Seleccionada)' : ''}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {groupedItems.groups[store].map(item => {
                  const isCompleted = item.status === 'COMPLETED';
                  return (
                    <button
                      key={item.id}
                      onClick={() => onToggleStatus(item.id)}
                      className={`glass p-6 rounded-3xl text-left flex items-center justify-between active:scale-95 transition-all duration-300 group ${isCompleted ? 'opacity-30 grayscale' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <span className={`block text-xl font-bold text-white mb-1 ${isCompleted ? 'line-through' : ''}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.category}</span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'border-[#f05a28] bg-[#f05a28]/10' : 'border-gray-800'}`}>
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#f05a28]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-transparent border border-gray-700" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-black uppercase tracking-widest text-xs">¡Todo Comprado!</p>
            </div>
          )}
        </div>
      </div>
      
      <InputBar onAddItems={onAddItems} />
    </div>
  );
};

export default ShoppingMode;
