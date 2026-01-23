
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

  const handleCreate = () => {
    const finalCode = generateCode();
    localStorage.setItem('familyCode', finalCode);
    onJoin(finalCode);
  };

  const handleJoin = () => {
    if (code.length === 6) {
      localStorage.setItem('familyCode', code.toUpperCase());
      onJoin(code.toUpperCase());
    } else {
      alert("Introdueix un codi de 6 caràcters.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-12 z-10">
        
        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-tighter text-white">
            diloy<span className="text-brand">listo</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
            La llista de la compra col·laborativa que realment funciona.
          </p>
        </div>

        <div className="w-full space-y-10">
          {/* Opción 1: Crear */}
          <div className="space-y-4">
            <button 
              onClick={handleCreate}
              className="w-full orange-gradient p-5 rounded-3xl text-white font-black tracking-widest uppercase text-sm shadow-2xl orange-glow active:scale-95 transition-all"
            >
              Començar Llista Nova
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">O si ja tens un codi familiar:</p>
          </div>

          {/* Opción 2: Unirse */}
          <div className="bg-neutral-900/50 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
            <input 
              type="text" 
              placeholder="CODI (Ex: AB12C3)"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-center text-2xl font-black tracking-[0.3em] text-brand focus:border-brand/50 outline-none placeholder:tracking-normal placeholder:text-neutral-800"
            />
            <button 
              onClick={handleJoin}
              disabled={code.length < 6}
              className={`w-full p-4 rounded-2xl font-black tracking-widest uppercase text-xs transition-all ${
                code.length === 6 
                ? 'bg-white text-black active:scale-95' 
                : 'bg-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed'
              }`}
            >
              Unir-se a la Llista
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest pt-8">
          <span>Real-time</span>
          <span>•</span>
          <span>Family Sync</span>
          <span>•</span>
          <span>Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
