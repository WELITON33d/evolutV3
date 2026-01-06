import React from 'react';
import { Copy, Check } from 'lucide-react';

export const CodeBlock = ({ language, children }: { language: string, children: React.ReactNode }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          <span className={copied ? "text-emerald-500" : ""}>{copied ? "Copiado!" : "Copiar"}</span>
        </button>
      </div>
      <pre className="bg-white p-5 overflow-x-auto m-0 text-slate-700">
        <code className={`language-${language} text-sm font-mono leading-relaxed`}>
          {children}
        </code>
      </pre>
    </div>
  );
};
