
import React, { useState } from 'react';

interface HeaderProps {
  familyCode: string;
  isSyncing?: boolean;
  onRefresh?: () => void;
  onExit: () => void;
}

const Header: React.FC<HeaderProps> = ({ familyCode, isSyncing, onRefresh, onExit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(familyCode);
    setCopied(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="pt-8 pb-4 flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            diloy<span className="text-brand">listo</span>
          </h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-white/5">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">
              {isSyncing ? 'Sincronitzant' : 'En Línia'}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 group active:scale-95 transition-transform"
          >
            <span className="text-lg font-black tracking-[0.2em] text-white">
              {familyCode}
            </span>
            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${copied ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
              {copied ? 'Copiat!' : 'Copiar'}
            </span>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={onRefresh}
          className={`glass p-2.5 rounded-full hover:bg-white/10 transition-all ${isSyncing ? 'animate-spin opacity-50' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          onClick={onExit}
          className="glass p-2.5 rounded-full hover:bg-red-500/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
