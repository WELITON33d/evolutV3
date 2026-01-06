import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ThinkingBlock = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  
  return (
    <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/50 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100/50 transition-colors"
      >
        <Brain size={14} />
        Processo de Pensamento
        {isOpen ? <ChevronDown size={14} className="ml-auto" /> : <ChevronRight size={14} className="ml-auto" />}
      </button>
      {isOpen && (
        <div className="px-4 py-3 text-xs text-slate-600 border-t border-blue-100 bg-white/50 font-mono leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
};

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  // Extract thinking content
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
  const cleanContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();

  const isUser = role === 'user';

  return (
    <div className={`flex gap-6 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
          : 'bg-white border border-slate-100 text-slate-600'
      }`}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
         <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm ${
           isUser 
             ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none' 
             : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
         }`}>
           {thinkingContent && <ThinkingBlock content={thinkingContent} />}
           
           <div className={`prose prose-base max-w-none break-words leading-relaxed ${isUser ? 'prose-invert' : 'prose-slate'}`}>
              <ReactMarkdown 
                components={{
                  code({node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <CodeBlock language={match[1]}>
                        {children}
                      </CodeBlock>
                    ) : (
                      <code className={`${isUser ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'} px-1.5 py-0.5 rounded font-mono text-sm`} {...props}>
                        {children}
                      </code>
                    )
                  },
                  p: ({children}) => <p className="mb-4 text-[15px] leading-7">{children}</p>,
                  li: ({children}) => <li className="mb-1 text-[15px] leading-7">{children}</li>
                }}
              >
                {cleanContent}
              </ReactMarkdown>
           </div>
         </div>
      </div>
    </div>
  );
};
