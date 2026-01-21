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
    const finalCode = code.length === 6 ? code.toUpperCase() : generateCode();
    localStorage.setItem('familyCode', finalCode);
    onJoin(finalCode);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-12">
      {/* Demo Section Centrada */}
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
        
        {/* Títol i Subtítol */}
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 mb-4">
            <span className="text-brand text-[10px] font-black uppercase tracking-widest">v2.0 Beta</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white">
            diloy<span className="text-brand">listo</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            La teva llista de la compra intel·ligent, ara amb <span className="text-white font-bold">Tailwind nativament</span>.
          </p>
        </div>

        {/* Formulari i Botó (Classes Tailwind) */}
        <div className="w-full space-y-4 pt-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Codi familiar (opcional)"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center text-xl font-black tracking-widest text-brand focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all outline-none placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-bold"
            />
          </div>

          <button 
            onClick={handleStart}
            className="w-full orange-gradient p-5 rounded-3xl text-white font-black tracking-widest uppercase text-sm shadow-2xl orange-glow hover:scale-[1.03] active:scale-95 transition-all duration-300"
          >
            {code.length === 6 ? 'Unir-se a la Llista' : 'Començar Ara'}
          </button>
        </div>

        {/* Footer Info */}
        <div className="pt-8 space-y-2 opacity-50">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Powered by Gemini + Vite</p>
          <div className="flex justify-center gap-3 text-[9px] font-black text-slate-600 uppercase tracking-tighter">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">No CDN</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;