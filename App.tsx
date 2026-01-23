
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingItem, Status } from './types';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import StoreFilter from './components/StoreFilter';
import ShoppingList from './components/ShoppingList';
import InputBar from './components/InputBar';
import ShoppingMode from './components/ShoppingMode';
import { isAiEnabled } from './geminiService';

const App: React.FC = () => {
  const [familyCode, setFamilyCode] = useState<string | null>(localStorage.getItem('familyCode'));
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeStore, setActiveStore] = useState('Todos');
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Ref para evitar ciclos infinitos y proteger la escritura
  const lastFetchedDataRef = useRef<string>('');
  const isWritingRef = useRef<boolean>(false);

  const SYNC_URL = `https://kvdb.io/AnV9B1Uq8G9uS3mH8p4W5A/${familyCode}`;

  const fetchItems = useCallback(async (showLoader = true) => {
    if (!familyCode || isWritingRef.current) return;
    
    if (showLoader) setIsSyncing(true);
    try {
      const response = await fetch(SYNC_URL);
      if (response.ok) {
        const data = await response.json();
        const dataString = JSON.stringify(data);
        
        // Solo actualizamos si los datos externos son diferentes y no estamos escribiendo
        if (dataString !== lastFetchedDataRef.current && !isWritingRef.current) {
          setItems(data);
          lastFetchedDataRef.current = dataString;
          localStorage.setItem(`items_${familyCode}`, dataString);
        }
      }
    } catch (error) {
      console.warn("Sync error (polling)");
    } finally {
      if (showLoader) setIsSyncing(false);
    }
  }, [familyCode, SYNC_URL]);

  const saveItems = async (currentItems: ShoppingItem[]) => {
    if (!familyCode) return;
    
    isWritingRef.current = true; // Bloqueamos lecturas entrantes
    setIsSyncing(true);
    
    const dataString = JSON.stringify(currentItems);
    
    try {
      // Guardado local inmediato
      setItems(currentItems);
      localStorage.setItem(`items_${familyCode}`, dataString);
      lastFetchedDataRef.current = dataString;

      await fetch(SYNC_URL, {
        method: 'POST',
        body: dataString,
      });
    } catch (error) {
      console.error("Error saving to cloud:", error);
    } finally {
      // Pequeña pausa para asegurar que el servidor KVDB se actualice antes de permitir la siguiente lectura
      setTimeout(() => {
        isWritingRef.current = false;
        setIsSyncing(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (familyCode) {
      const saved = localStorage.getItem(`items_${familyCode}`);
      if (saved) {
        setItems(JSON.parse(saved));
        lastFetchedDataRef.current = saved;
      }
      fetchItems();
      const interval = setInterval(() => fetchItems(false), 5000);
      return () => clearInterval(interval);
    }
  }, [familyCode, fetchItems]);

  const addItem = (newItems: Partial<ShoppingItem>[]) => {
    const formatted: ShoppingItem[] = newItems.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      name: item.name || 'Producto desconocido',
      store: item.store || 'Cualquiera',
      category: item.category || 'Varios',
      emoji: item.emoji || '🛒',
      status: (item.status as Status) || 'ACTIVE',
      createdAt: Date.now()
    }));

    // Usamos el estado más reciente para la fusión
    setItems(prevItems => {
      const updated = [...formatted, ...prevItems];
      saveItems(updated);
      return updated;
    });
  };

  const toggleStatus = (id: string) => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, status: (item.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED') as Status } : item
      );
      saveItems(updated);
      return updated;
    });
  };

  const deleteItem = (id: string) => {
    setItems(prevItems => {
      const updated = prevItems.filter(item => item.id !== id);
      saveItems(updated);
      return updated;
    });
  };

  const updateItemStore = (id: string, newStore: string) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, store: newStore } : item
      );
      saveItems(updated);
      return updated;
    });
  };

  const moveToDraft = (id: string) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, status: 'DRAFT' as Status } : item
      );
      saveItems(updated);
      return updated;
    });
  };

  const moveToActive = (id: string) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, status: 'ACTIVE' as Status } : item
      );
      saveItems(updated);
      return updated;
    });
  };

  const clearCompletedItems = () => {
    if (window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
    setItems(prevItems => {
      const updated = prevItems.filter(item => item.status !== 'COMPLETED');
      saveItems(updated);
      return updated;
    });
    setIsShoppingMode(false);
  };

  const filterItemsByStatus = (status: Status) => {
    return items.filter(item => {
      if (item.status !== status) return false;
      if (activeStore === 'Todos') return true;
      return item.store === activeStore || item.store === 'Cualquiera' || item.store === 'Otros';
    }).sort((a, b) => b.createdAt - a.createdAt);
  };

  if (!familyCode) {
    return <Onboarding onJoin={setFamilyCode} />;
  }

  return (
    <div className="min-h-screen pb-32 flex flex-col max-w-md mx-auto relative px-4">
      {isShoppingMode ? (
        <ShoppingMode 
          items={filterItemsByStatus('ACTIVE').concat(filterItemsByStatus('COMPLETED'))} 
          onClose={() => setIsShoppingMode(false)}
          onToggleStatus={toggleStatus}
          onAddItems={addItem}
          onFinishPurchase={clearCompletedItems}
          activeStore={activeStore}
        />
      ) : (
        <>
          <Header 
            familyCode={familyCode} 
            isSyncing={isSyncing}
            onRefresh={() => fetchItems(true)}
            onExit={() => {
              if (confirm("¿Seguro que quieres salir de esta lista familiar?")) {
                localStorage.removeItem('familyCode');
                setFamilyCode(null);
              }
            }} 
          />

          {!isAiEnabled && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tight">
                ⚠️ IA no configurada. Reconocimiento de voz desactivado.
              </p>
            </div>
          )}
          
          <StoreFilter 
            activeStore={activeStore} 
            onSelectStore={setActiveStore} 
          />

          <div className="flex-1 space-y-8 mt-4 overflow-y-auto hide-scrollbar">
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xs font-black tracking-widest text-gray-500 uppercase">Pendents</h2>
                <button 
                  onClick={() => setIsShoppingMode(true)}
                  className="text-[10px] font-bold text-brand border border-brand/30 px-3 py-1.5 rounded-full uppercase tracking-tight active:bg-brand active:text-white transition-colors"
                >
                  Modo Compra
                </button>
              </div>
              <ShoppingList 
                items={filterItemsByStatus('ACTIVE')} 
                onToggle={toggleStatus}
                onDelete={deleteItem}
                onMove={moveToDraft}
                onUpdateStore={updateItemStore}
                moveLabel="Per després"
                activeStore={activeStore}
              />
            </section>

            <section>
              <h2 className="text-xs font-black tracking-widest text-gray-500 mb-4 uppercase">Per Després</h2>
              <ShoppingList 
                items={items.filter(i => i.status === 'DRAFT')} 
                onToggle={toggleStatus}
                onDelete={deleteItem}
                onMove={moveToActive}
                moveLabel="Afegir ara"
              />
            </section>

            <section className="opacity-40">
              <h2 className="text-xs font-black tracking-widest text-gray-500 mb-4 uppercase">Comprat</h2>
              <ShoppingList 
                items={filterItemsByStatus('COMPLETED')} 
                onToggle={toggleStatus}
                onDelete={deleteItem}
                activeStore={activeStore}
              />
            </section>
          </div>

          <InputBar onAddItems={addItem} />
        </>
      )}
    </div>
  );
};

export default App;
