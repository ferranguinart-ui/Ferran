
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
          diloy<span className="text-[#f05a28]">listo</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Smart Family Shopping List</p>
      </div>

      <div className="w-full max-w-xs space-y-6">
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Introduce código (opcional)"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full glass bg-transparent border-gray-800 p-4 rounded-2xl text-center text-xl font-black tracking-widest text-[#f05a28] focus:border-[#f05a28] transition-colors uppercase outline-none"
          />
          <p className="text-[10px] text-gray-600 font-medium">Usa un código de 6 letras para compartir lista</p>
        </div>

        <button 
          onClick={handleStart}
          className="w-full orange-gradient p-5 rounded-2xl text-white font-black tracking-widest uppercase text-sm shadow-2xl orange-glow hover:scale-[1.02] transition-transform"
        >
          {code.length === 6 ? 'Unirse a Familia' : 'Crear Nueva Lista'}
        </button>

        <div className="pt-12 text-[10px] text-gray-700 font-medium space-y-4">
          <p>Powered by Google Gemini 3 Flash</p>
          <div className="flex justify-center gap-4 opacity-50">
            <span>MODO OSCURO</span>
            <span>CONTROL POR VOZ</span>
            <span>COLABORATIVO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
