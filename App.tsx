
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
  
  // Refs para control de flujo y evitar colisiones
  const lastFetchedDataRef = useRef<string>('');
  const cooldownRef = useRef<number>(0);

  const SYNC_URL = `https://kvdb.io/AnV9B1Uq8G9uS3mH8p4W5A/${familyCode}`;

  const fetchItems = useCallback(async (showLoader = false) => {
    // Si estamos en "cooldown" (acabamos de guardar), no leemos de la nube para evitar datos viejos
    if (!familyCode || Date.now() < cooldownRef.current) return;
    
    if (showLoader) setIsSyncing(true);
    try {
      const response = await fetch(SYNC_URL);
      if (response.ok) {
        const cloudData: ShoppingItem[] = await response.json();
        const dataString = JSON.stringify(cloudData);
        
        if (dataString !== lastFetchedDataRef.current) {
          // Fusión inteligente: Mantenemos items locales que quizá no se han subido aún
          setItems(prevItems => {
            const mergedMap = new Map();
            // 1. Metemos lo que hay en la nube
            cloudData.forEach(item => mergedMap.set(item.id, item));
            // 2. Metemos lo local que sea muy reciente (últimos 10 seg) por si acaso no llegó a la nube
            prevItems.forEach(item => {
              if (!mergedMap.has(item.id) && (Date.now() - item.createdAt < 10000)) {
                mergedMap.set(item.id, item);
              }
            });
            const merged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
            lastFetchedDataRef.current = JSON.stringify(merged);
            localStorage.setItem(`items_${familyCode}`, lastFetchedDataRef.current);
            return merged;
          });
        }
      }
    } catch (error) {
      console.warn("Cloud sync pulse failed (Offline mode)");
    } finally {
      if (showLoader) setIsSyncing(false);
    }
  }, [familyCode, SYNC_URL]);

  const saveToCloud = async (currentItems: ShoppingItem[]) => {
    if (!familyCode) return;
    
    // Activamos cooldown: No leeremos de la nube en los próximos 3 segundos
    cooldownRef.current = Date.now() + 3000;
    setIsSyncing(true);
    
    const dataString = JSON.stringify(currentItems);
    
    try {
      // Guardado local inmediato para UX fluida
      localStorage.setItem(`items_${familyCode}`, dataString);
      lastFetchedDataRef.current = dataString;

      await fetch(SYNC_URL, {
        method: 'POST',
        body: dataString,
      });
    } catch (error) {
      console.error("Error saving to cloud:", error);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 500);
    }
  };

  // Efecto de Polling (Consulta constante cada 3 segundos)
  useEffect(() => {
    if (familyCode) {
      // Carga inicial desde caché
      const saved = localStorage.getItem(`items_${familyCode}`);
      if (saved) {
        setItems(JSON.parse(saved));
        lastFetchedDataRef.current = saved;
      }
      
      fetchItems(true);
      const interval = setInterval(() => fetchItems(false), 3000);
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

    setItems(prevItems => {
      const updated = [...formatted, ...prevItems];
      saveToCloud(updated);
      return updated;
    });
  };

  const toggleStatus = (id: string) => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, status: (item.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED') as Status } : item
      );
      saveToCloud(updated);
      return updated;
    });
  };

  const deleteItem = (id: string) => {
    setItems(prevItems => {
      const updated = prevItems.filter(item => item.id !== id);
      saveToCloud(updated);
      return updated;
    });
  };

  const updateItemStore = (id: string, newStore: string) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, store: newStore } : item
      );
      saveToCloud(updated);
      return updated;
    });
  };

  const moveToDraft = (id: string) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, status: 'DRAFT' as Status } : item
      );
      saveToCloud(updated);
      return updated;
    });
  };

  const moveToActive = (id: string) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => 
        item.id === id ? { ...item, status: 'ACTIVE' as Status } : item
      );
      saveToCloud(updated);
      return updated;
    });
  };

  const clearCompletedItems = () => {
    if (window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
    setItems(prevItems => {
      const updated = prevItems.filter(item => item.status !== 'COMPLETED');
      saveToCloud(updated);
      return updated;
    });
    setIsShoppingMode(false);
  };

  const filterItemsByStatus = (status: Status) => {
    return items.filter(item => {
      if (item.status !== status) return false;
      if (activeStore === 'Todos') return true;
      return item.store === activeStore || item.store === 'Cualquiera';
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
              if (confirm("¿Seguro que quieres salir de esta lista?")) {
                localStorage.removeItem('familyCode');
                setFamilyCode(null);
              }
            }} 
          />
          
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
                  className="text-[10px] font-bold text-brand border border-brand/30 px-3 py-1.5 rounded-full uppercase"
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

            {items.some(i => i.status === 'DRAFT') && (
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
            )}

            {filterItemsByStatus('COMPLETED').length > 0 && (
              <section className="opacity-40">
                <h2 className="text-xs font-black tracking-widest text-gray-500 mb-4 uppercase">Comprat</h2>
                <ShoppingList 
                  items={filterItemsByStatus('COMPLETED')} 
                  onToggle={toggleStatus}
                  onDelete={deleteItem}
                  activeStore={activeStore}
                />
              </section>
            )}
          </div>

          <InputBar onAddItems={addItem} />
        </>
      )}
    </div>
  );
};

export default App;
