"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react";
import { Mic, Paperclip, Send, Square } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

const PLACEHOLDERS = [
  "Gerar site com HextaUI",
  "Criar novo projeto com Next.js",
  "Qual o sentido da vida?",
  "Qual a melhor forma de aprender React?",
  "Como preparar uma refeição deliciosa?",
  "Resuma este artigo",
];

interface AIChatInputProps { 
  onSend: (message: string, file?: { name: string, content: string }) => void;
  loading?: boolean;
  onStop?: () => void;
  toolbar?: React.ReactNode;
}

const AIChatInput = ({ onSend, loading, onStop, toolbar }: AIChatInputProps) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string, content: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition
  const { isListening, transcript, toggleListening } = useSpeechRecognition();
  const [valueBeforeSpeech, setValueBeforeSpeech] = useState("");

  useEffect(() => {
    if (isListening && transcript) {
      setInputValue((valueBeforeSpeech ? valueBeforeSpeech + " " : "") + transcript);
    }
  }, [transcript, isListening, valueBeforeSpeech]);

  const handleMicClick = () => {
    if (!isListening) {
      setValueBeforeSpeech(inputValue);
      setIsActive(true); // Ensure expanded
    }
    toggleListening();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simple text read for code/logs
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setSelectedFile({ name: file.name, content });
      setIsActive(true); // Keep active to show file
    };
    reader.readAsText(file);
  };

  const handleSend = () => {
    if (!inputValue.trim() && !selectedFile) return;
    onSend(inputValue, selectedFile || undefined);
    setInputValue("");
    setSelectedFile(null);
    setIsActive(false);
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStop?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || inputValue) return;

    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, inputValue]);

  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!inputValue) setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue]);

  const handleActivate = () => setIsActive(true);

  const containerVariants = {
    collapsed: {
      height: 68,
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    expanded: {
      height: 128,
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.16)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  const placeholderContainerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.025 } },
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
  };

  const letterVariants = {
    initial: {
      opacity: 0,
      filter: "blur(12px)",
      y: 10,
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        opacity: { duration: 0.25 },
        filter: { duration: 0.4 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      y: -10,
      transition: {
        opacity: { duration: 0.2 },
        filter: { duration: 0.3 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
  };

  return (
    <div className="w-full min-h-[150px] flex justify-center items-end pb-6 text-black">
      <motion.div
        ref={wrapperRef}
        className="w-full max-w-3xl"
        variants={containerVariants}
        animate={isActive || inputValue ? "expanded" : "collapsed"}
        initial="collapsed"
        style={{ overflow: "hidden", borderRadius: 32, background: "#fff" }}
        onClick={handleActivate}
      >
        <div className="flex flex-col items-stretch w-full h-full">
          {/* Top Toolbar Area (Expanded Only) */}
          <motion.div
             className="px-4 pt-3 flex items-center justify-start overflow-hidden"
             animate={{ 
               height: isActive || inputValue ? "auto" : 0,
               opacity: isActive || inputValue ? 1 : 0
             }}
             transition={{ duration: 0.2 }}
          >
             {toolbar}
          </motion.div>

          {/* Input Row */}
          <div className="flex items-center gap-2 px-3 pb-3 pt-1 rounded-full bg-white max-w-3xl w-full flex-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept=".txt,.js,.ts,.tsx,.json,.log,.md,.css,.html"
            />
            <button
              className={`p-3 rounded-full hover:bg-gray-100 transition ${selectedFile ? 'text-blue-600 bg-blue-50' : ''}`}
              title="Anexar arquivo"
              type="button"
              tabIndex={-1}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Paperclip size={20} />
            </button>

            {/* Text Input & Placeholder */}
            <div className="relative flex-1 h-full flex items-center">
              {selectedFile && (
                <div className="absolute -top-10 left-0 text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600 flex items-center gap-1 shadow-sm">
                   <Paperclip size={10} /> {selectedFile.name}
                </div>
              )}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal focus:ring-0 h-full"
                style={{ position: "relative", zIndex: 1 }}
                onFocus={handleActivate}
              />
              <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center px-3">
                <AnimatePresence mode="wait">
                  {showPlaceholder && !isActive && !inputValue && (
                    <motion.span
                      key={placeholderIndex}
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        zIndex: 0,
                      }}
                      variants={placeholderContainerVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {PLACEHOLDERS[placeholderIndex]
                        .split("")
                        .map((char, i) => (
                          <motion.span
                            key={i}
                            variants={letterVariants}
                            style={{ display: "inline-block" }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </motion.span>
                        ))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              className={`p-3 rounded-full transition ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'hover:bg-gray-100'}`}
              title={isListening ? "Parar gravação" : "Entrada de voz"}
              type="button"
              tabIndex={-1}
              disabled={loading}
              onClick={handleMicClick}
            >
               {isListening ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
            </button>
            
            {loading ? (
              <button
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full font-medium justify-center transition-all animate-pulse"
                title="Interromper"
                type="button"
                tabIndex={-1}
                onClick={handleStop}
              >
                <Square size={18} fill="currentColor" />
              </button>
            ) : (
              <button
                className="flex items-center gap-1 bg-black hover:bg-zinc-700 text-white p-3 rounded-full font-medium justify-center transition-all"
                title="Enviar"
                type="button"
                tabIndex={-1}
                onClick={handleSend}
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { AIChatInput };