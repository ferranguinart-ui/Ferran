
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingItem, Status, STORES } from './types';
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
  
  // Usamos una referencia para comparar si los datos externos son diferentes a los locales
  // y evitar bucles de actualización innecesarios.
  const lastFetchedDataRef = useRef<string>('');

  const SYNC_URL = `https://kvdb.io/AnV9B1Uq8G9uS3mH8p4W5A/${familyCode}`;

  const fetchItems = useCallback(async (showLoader = true) => {
    if (!familyCode) return;
    if (showLoader) setIsSyncing(true);
    
    try {
      const response = await fetch(SYNC_URL);
      if (response.ok) {
        const data = await response.json();
        const dataString = JSON.stringify(data);
        
        // Solo actualizamos el estado si los datos han cambiado realmente en el servidor
        if (dataString !== lastFetchedDataRef.current) {
          setItems(data);
          lastFetchedDataRef.current = dataString;
          localStorage.setItem(`items_${familyCode}`, dataString);
        }
      }
    } catch (error) {
      console.warn("Error de sincronización o modo offline.");
    } finally {
      if (showLoader) setIsSyncing(false);
    }
  }, [familyCode, SYNC_URL]);

  const saveItems = async (currentItems: ShoppingItem[]) => {
    if (!familyCode) return;
    
    // Actualizamos localmente primero para feedback instantáneo
    const dataString = JSON.stringify(currentItems);
    setItems(currentItems);
    lastFetchedDataRef.current = dataString;
    localStorage.setItem(`items_${familyCode}`, dataString);
    
    setIsSyncing(true);
    try {
      await fetch(SYNC_URL, {
        method: 'POST',
        body: dataString,
      });
    } catch (error) {
      console.error("Error al guardar en la nube:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Efecto para la carga inicial y el sistema de "Auto-Refresco" (Polling)
  useEffect(() => {
    if (familyCode) {
      // Cargar caché local para velocidad inmediata
      const saved = localStorage.getItem(`items_${familyCode}`);
      if (saved) {
        setItems(JSON.parse(saved));
        lastFetchedDataRef.current = saved;
      }
      
      // Primera carga desde el servidor
      fetchItems();

      // Configurar el temporizador para sincronización automática cada 5 segundos
      const interval = setInterval(() => {
        fetchItems(false); // Refresco silencioso (sin activar el spinner de carga)
      }, 5000);

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
    const updated = [...formatted, ...items];
    saveItems(updated);
  };

  const toggleStatus = (id: string) => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    const updated = items.map(item => {
      if (item.id === id) {
        const nextStatus: Status = item.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
  };

  const updateItemStore = (id: string, newStore: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, store: newStore } : item
    );
    saveItems(updated);
  };

  const moveToDraft = (id: string) => {
    const updated: ShoppingItem[] = items.map(item => 
      item.id === id ? { ...item, status: 'DRAFT' as Status } : item
    );
    saveItems(updated);
  };

  const moveToActive = (id: string) => {
    const updated: ShoppingItem[] = items.map(item => 
      item.id === id ? { ...item, status: 'ACTIVE' as Status } : item
    );
    saveItems(updated);
  };

  const clearCompletedItems = () => {
    if (window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
    const updated = items.filter(item => item.status !== 'COMPLETED');
    saveItems(updated);
    setIsShoppingMode(false);
  };

  const filterItems = (status: Status) => {
    return items.filter(item => {
      if (item.status !== status) return false;
      if (activeStore === 'Todos') return true;
      return item.store === activeStore || item.store === 'Cualquiera' || item.store === 'Otros';
    }).sort((a, b) => {
      if (activeStore !== 'Todos') {
        if (a.store === activeStore && b.store !== activeStore) return -1;
        if (a.store !== activeStore && b.store === activeStore) return 1;
      }
      return b.createdAt - a.createdAt;
    });
  };

  if (!familyCode) {
    return <Onboarding onJoin={setFamilyCode} />;
  }

  return (
    <div className="min-h-screen pb-32 flex flex-col max-w-md mx-auto relative px-4">
      {isShoppingMode ? (
        <ShoppingMode 
          items={filterItems('ACTIVE').concat(filterItems('COMPLETED'))} 
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
              localStorage.removeItem('familyCode');
              setFamilyCode(null);
            }} 
          />

          {!isAiEnabled && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tight leading-tight">
                ⚠️ Falta la API Key de Gemini. El reconocimiento de voz y categorización automática están desactivados.
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
                <h2 className="text-xs font-black tracking-widest text-gray-500 uppercase">Pendientes</h2>
                <button 
                  onClick={() => setIsShoppingMode(true)}
                  className="text-[10px] font-bold text-brand border border-brand/30 px-2 py-1 rounded-full uppercase tracking-tighter"
                >
                  Modo Compra
                </button>
              </div>
              <ShoppingList 
                items={filterItems('ACTIVE')} 
                onToggle={toggleStatus}
                onDelete={deleteItem}
                onMove={moveToDraft}
                onUpdateStore={updateItemStore}
                moveLabel="Para luego"
                activeStore={activeStore}
              />
            </section>

            <section>
              <h2 className="text-xs font-black tracking-widest text-gray-500 mb-4 uppercase">Para Luego</h2>
              <ShoppingList 
                items={items.filter(i => i.status === 'DRAFT')} 
                onToggle={toggleStatus}
                onDelete={deleteItem}
                onMove={moveToActive}
                moveLabel="Añadir ahora"
              />
            </section>

            <section className="opacity-40">
              <h2 className="text-xs font-black tracking-widest text-gray-500 mb-4 uppercase">Comprado</h2>
              <ShoppingList 
                items={filterItems('COMPLETED')} 
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
