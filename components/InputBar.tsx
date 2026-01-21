
import React, { useState, useRef, useEffect } from 'react';
import { parseShoppingInput } from '../geminiService';
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
  const holdTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      // Set continuous to true to allow longer speech segments without auto-stopping
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        // We only care about the final results when the user releases the button, 
        // but we could use interim results for UI feedback if needed.
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          processInput(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Sync recognition language when the user toggles the selector
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const processInput = async (input: string) => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const parsedItems = await parseShoppingInput(input);
      if (parsedItems.length > 0) {
        onAddItems(parsedItems);
        setText('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = (e: React.PointerEvent) => {
    // Prevent default context menus or scrolling on mobile while holding
    if (e.pointerType === 'touch') {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }

    if (!isListening && recognitionRef.current) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(60);
      }
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
      if (window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'es-ES' ? 'ca-ES' : 'es-ES';
    setLanguage(nextLang);
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processInput(text);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <form onSubmit={handleSubmit} className="glass p-2 rounded-full flex items-center gap-2 shadow-2xl relative overflow-hidden">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#f05a28] animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          )}
          
          <button 
            type="button"
            onClick={toggleLanguage}
            className="ml-2 px-3 py-1.5 rounded-full bg-gray-900/50 border border-white/5 text-[9px] font-black tracking-widest uppercase transition-all active:scale-90 flex items-center gap-1"
          >
            <span className={language === 'es-ES' ? 'text-[#f05a28]' : 'text-gray-600'}>ES</span>
            <span className="text-gray-800">|</span>
            <span className={language === 'ca-ES' ? 'text-[#f05a28]' : 'text-gray-600'}>CAT</span>
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isListening ? "Escuchando..." : "Mantén para hablar..."}
            className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-white placeholder:text-gray-600 font-bold"
          />

          <button 
            type="button"
            onPointerDown={startListening}
            onPointerUp={stopListening}
            onPointerLeave={stopListening}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 flex-shrink-0 select-none touch-none ${
              isListening ? 'orange-gradient orange-glow scale-125 z-20' : 'bg-gray-800 text-white'
            }`}
          >
            {isListening ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="wave-bar w-0.5 h-3 bg-white rounded-full" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <span className="text-[7px] font-black uppercase text-white/80 animate-pulse">Habla</span>
              </>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </form>
        {isListening && (
          <div className="text-center mt-4 animate-bounce">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#f05a28] drop-shadow-sm">Suelte para finalizar</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBar;
