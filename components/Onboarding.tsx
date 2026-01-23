
import React, { useState } from 'react';

interface OnboardingProps {
  onJoin: (code: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onJoin }) => {
  const [code, setCode] = useState('');

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleStart = () => {
    const isJoining = code.trim().length === 6;
    const finalCode = isJoining ? code.toUpperCase() : generateCode();
    localStorage.setItem('familyCode', finalCode);
    onJoin(finalCode);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-700 relative z-10">
        
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 mb-4">
            <span className="text-brand text-[10px] font-black uppercase tracking-widest">Sincronització Realtime</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white">
            diloy<span className="text-brand">listo</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            La teva llista de la compra intel·ligent i compartida amb la família.
          </p>
        </div>

        <div className="w-full space-y-6 pt-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Tens un codi? Introdueix-lo aquí</p>
            <input 
              type="text" 
              placeholder="Ex: AB12C3"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-neutral-900 border border-white/5 p-5 rounded-3xl text-center text-2xl font-black tracking-[0.2em] text-brand focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all outline-none placeholder:text-neutral-800 placeholder:tracking-normal placeholder:font-bold shadow-inner"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleStart}
              className="w-full orange-gradient p-5 rounded-3xl text-white font-black tracking-widest uppercase text-sm shadow-2xl orange-glow hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              {code.length === 6 ? 'Unir-se a la Llista' : 'Començar Llista Nova'}
            </button>
            
            {code.length === 0 && (
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">
                Si vols crear una llista de zero, no escriguis res i prem el botó.
              </p>
            )}
          </div>
        </div>

        <div className="pt-8 space-y-3 opacity-40">
          <div className="flex justify-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <span>Multi-dispositiu</span>
            <span>•</span>
            <span>IA Gemini</span>
            <span>•</span>
            <span>PWA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
