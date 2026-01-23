import React, { useState, useRef, useEffect } from 'react';
import { parseShoppingInput, isAiEnabled } from '../geminiService';
import { ShoppingItem } from '../types';

interface InputBarProps {
  onAddItems: (items: Partial<ShoppingItem>[]) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onAddItems }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'es-ES' | 'ca-ES'>('es-ES');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const voiceTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript) {
          voiceTranscriptRef.current += ' ' + currentTranscript;
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (voiceTranscriptRef.current.trim()) {
          processInput(voiceTranscriptRef.current.trim());
          voiceTranscriptRef.current = '';
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };
    }
  }, [language]);

  const processInput = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    try {
      if (!isAiEnabled) {
        // Fallback manual si no hay IA
        const manualItems = input.split(',').map(name => ({
          name: name.trim(),
          store: 'Cualquiera',
          category: 'Varios',
          emoji: '🛒',
          status: 'ACTIVE' as any
        }));
        onAddItems(manualItems);
      } else {
        const parsedItems = await parseShoppingInput(input);
        if (parsedItems.length > 0) {
          onAddItems(parsedItems);
        }
      }
      setText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = (e: React.PointerEvent) => {
    // Prevent default browser behavior on mobile
    if (e.pointerType === 'touch') {
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch(e){}
    }

    if (!isAiEnabled) {
      alert("Configura la API Key para usar la voz.");
      return;
    }

    if (!isListening && recognitionRef.current) {
      voiceTranscriptRef.current = '';
      if (window.navigator.vibrate) window.navigator.vibrate(60);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  };

  const stopListening = () => {
    if (isListening && recognitionRef.current) {
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      recognitionRef.current.stop();
      // processInput will be called in onend
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es-ES' ? 'ca-ES' : 'es-ES');
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    processInput(text);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-[100] pointer-events-none pb-[env(safe-area-inset-bottom,1.5rem)]">
      <div className="max-w-md mx-auto pointer-events-auto flex flex-col gap-3">
        
        {/* Banner de estado IA (Solo si no hay key) */}
        {!isAiEnabled && text.length === 0 && !isProcessing && (
          <div className="text-center animate-pulse">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/20">
              Modo Manual: Sin API Key
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Barra de Texto Principal */}
          <form 
            onSubmit={handleSubmit} 
            className="glass flex-1 p-1.5 rounded-full flex items-center gap-2 shadow-2xl relative overflow-hidden h-14"
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md z-20">
                <div className="flex gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            
            <button 
              type="button"
              onClick={toggleLanguage}
              className="ml-1 px-3 py-1.5 h-10 rounded-full bg-white/5 border border-white/5 text-[10px] font-black tracking-widest uppercase transition-all active:scale-90 flex items-center gap-1 shrink-0"
            >
              <span className={language === 'es-ES' ? 'text-brand' : 'text-gray-500'}>ES</span>
              <span className="text-gray-800">|</span>
              <span className={language === 'ca-ES' ? 'text-brand' : 'text-gray-500'}>CAT</span>
            </button>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isListening ? "Escuchando..." : "Escribe o habla..."}
              className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-white placeholder:text-gray-600 font-bold min-w-0"
            />

            {text.trim().length > 0 && (
              <button 
                type="submit"
                className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center transition-all active:scale-90 shrink-0 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </form>

          {/* Botón de Micrófono Hold-to-Talk */}
          <button 
            type="button"
            onPointerDown={startListening}
            onPointerUp={stopListening}
            onPointerLeave={stopListening}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 flex-shrink-0 select-none touch-none shadow-2xl relative group ${
              isListening 
                ? 'orange-gradient orange-glow scale-125 -translate-y-4 z-50 ring-4 ring-white/20' 
                : isAiEnabled ? 'bg-neutral-800 text-white active:bg-neutral-700' : 'bg-neutral-900 text-gray-700 opacity-50'
            }`}
            style={{ touchAction: 'none' }}
          >
            {isListening ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="wave-bar w-0.5 h-3 bg-white rounded-full" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-[8px] font-black uppercase text-white animate-pulse">Habla</span>
              </>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isAiEnabled ? 'group-active:scale-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
            
            {/* Tooltip táctil */}
            {isAiEnabled && !isListening && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[7px] font-black text-gray-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Mantén</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;