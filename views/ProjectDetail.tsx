
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { BlockType, ProjectType, Level, Block } from '../types';
// Fix: Added missing imports 'Target' and 'Zap' from lucide-react
import { 
  ArrowLeft, ArrowRight, Plus, Type, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, 
  CheckSquare, Bell, MoreVertical, Trash2, Calendar, 
  History, Search, LayoutGrid, Info, Upload, Download, File as FileIcon, X, Play,
  Target, Zap, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const PROJECT_PHASES = [
  { label: 'Estudo de Ideia', value: 10 },
  { label: 'Planejamento', value: 25 },
  { label: 'Criação/Design', value: 50 },
  { label: 'Desenvolvimento', value: 75 },
  { label: 'Lançamento', value: 90 },
  { label: 'Concluído', value: 100 },
];

const BlockRenderer: React.FC<{ 
  block: Block, 
  onDelete: (id: string) => void, 
  onUpdate: (id: string, updates: Partial<Block>) => void 
}> = ({ block, onDelete, onUpdate }) => {
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Aviso: Arquivos grandes podem impactar a performance do navegador. Recomendado até 10MB.");
    }

    try {
      const base64 = await fileToBase64(file);
      onUpdate(block.id, { 
        content: block.content || file.name,
        metadata: { 
          ...block.metadata, 
          url: base64, 
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        } 
      });
    } catch (err) {
      alert("Erro ao processar arquivo.");
    }
  };

  const getTypeColor = (type: BlockType) => {
    switch (type) {
      case BlockType.IMAGE: return 'text-blue-600 bg-blue-50';
      case BlockType.VIDEO: return 'text-indigo-600 bg-indigo-50';
      case BlockType.REMINDER: return 'text-amber-600 bg-amber-50';
      case BlockType.TODO: return 'text-emerald-600 bg-emerald-50';
      case BlockType.FILE: return 'text-violet-600 bg-violet-50';
      case BlockType.LINK: return 'text-sky-600 bg-sky-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getTypeIcon = (type: BlockType) => {
    switch (type) {
      case BlockType.IMAGE: return <ImageIcon size={14} />;
      case BlockType.VIDEO: return <VideoIcon size={14} />;
      case BlockType.REMINDER: return <Bell size={14} />;
      case BlockType.TODO: return <CheckSquare size={14} />;
      case BlockType.FILE: return <FileIcon size={14} />;
      case BlockType.LINK: return <LinkIcon size={14} />;
      default: return <Type size={14} />;
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case BlockType.TEXT:
        return (
          <textarea
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 leading-relaxed resize-none p-0 text-sm min-h-[80px]"
            placeholder="Escreva aqui..."
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            rows={Math.max(3, block.content.split('\n').length)}
          />
        );
      case BlockType.TODO:
        return (
          <div className="flex items-start gap-3 w-full">
            <input 
              type="checkbox" 
              checked={!!block.metadata?.completed}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, completed: e.target.checked } })}
            />
            <textarea
              className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm font-medium resize-none ${block.metadata?.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Tarefa a realizar..."
              rows={1}
            />
          </div>
        );
      case BlockType.IMAGE:
        return (
          <div className="space-y-3 w-full">
             {block.metadata?.url ? (
               <div className="relative group/img overflow-hidden rounded-xl bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center">
                 <img src={block.metadata.url} alt="Referência" className="w-full h-full object-cover" />
               </div>
             ) : (
               <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group"
               >
                 <Upload size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                 <span className="text-xs font-bold text-slate-500">Adicionar Imagem</span>
                 <input 
                   ref={fileInputRef}
                   type="file" 
                   accept="image/*"
                   className="hidden"
                   onChange={(e) => handleFileChange(e, 'image')}
                 />
               </div>
             )}
             <input
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-slate-500 font-medium px-1"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Legenda..."
            />
          </div>
        );
      case BlockType.VIDEO:
        return (
          <div className="space-y-3 w-full">
            {block.metadata?.url ? (
              <div className="relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center">
                <video src={block.metadata.url} controls className="w-full h-full object-contain" />
              </div>
            ) : (
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer group"
              >
                <Play size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-xs font-bold text-slate-500">Adicionar Vídeo</span>
                <input 
                   ref={videoInputRef}
                   type="file" 
                   accept="video/*"
                   className="hidden"
                   onChange={(e) => handleFileChange(e, 'video')}
                 />
              </div>
            )}
            <input
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-slate-500 font-medium px-1"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Descrição do vídeo..."
            />
          </div>
        );
      case BlockType.FILE:
        return (
          <div className="space-y-3 w-full">
            {block.metadata?.url ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl group/file hover:border-violet-300 transition-all">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 text-violet-600">
                  <FileIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{block.metadata.fileName}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {(block.metadata.fileSize ? (block.metadata.fileSize / 1024).toFixed(0) : 0)} KB
                  </p>
                </div>
                <a 
                  href={block.metadata.url} 
                  download={block.metadata.fileName}
                  className="p-2 text-slate-400 hover:text-violet-600 hover:bg-white rounded-lg transition-all"
                >
                  <Download size={16} />
                </a>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-violet-400 transition-all cursor-pointer group"
              >
                <Upload size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-violet-500 transition-colors" />
                <span className="text-xs font-bold text-slate-500">Anexar Arquivo</span>
                <input 
                   ref={fileInputRef}
                   type="file" 
                   className="hidden"
                   onChange={(e) => handleFileChange(e, 'image')}
                 />
              </div>
            )}
          </div>
        );
      case BlockType.LINK:
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-sky-300 transition-all">
              <LinkIcon size={16} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
              <input
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-slate-900 p-0"
                value={block.metadata?.url || ''}
                onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, url: e.target.value } })}
                placeholder="https://..."
              />
              {block.metadata?.url && (
                <a href={block.metadata.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border border-slate-100 rounded-lg hover:bg-sky-500 hover:text-white transition-all text-slate-400">
                  <ArrowRight size={12} className="-rotate-45" />
                </a>
              )}
            </div>
            <textarea
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-slate-500 font-medium px-1 leading-relaxed"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Notas sobre o link..."
              rows={1}
            />
          </div>
        );
      case BlockType.REMINDER:
        return (
          <div className="flex flex-col gap-3">
            <textarea
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-bold text-lg resize-none p-0 leading-tight placeholder:text-slate-300"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Lembrete importante..."
              rows={2}
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                <Calendar size={12} className="text-amber-500" />
                <input 
                  type="date" 
                  className="bg-transparent text-xs font-bold text-amber-700 focus:outline-none cursor-pointer"
                  value={block.metadata?.dueDate || ''}
                  onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, dueDate: e.target.value } })}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/30">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getTypeColor(block.type)}`}>
           {getTypeIcon(block.type)}
           {block.type}
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-slate-300 font-medium">
             {format(new Date(block.createdAt), "d MMM", { locale: ptBR })}
          </span>
          <button 
            onClick={() => onDelete(block.id)}
            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-300 transition-all"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4 flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

import { UploadModal } from '../components/UploadModal';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { projects, deleteProject, addBlock, updateBlock, deleteBlock, updateProject } = useStore();
  
  const project = projects.find(p => p.id === id);
  const [view, setView] = React.useState<'blocks' | 'timeline' | 'strategy'>('blocks');
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState<BlockType | 'ALL'>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  if (!project) return <div className="p-12 text-center font-bold text-slate-400">Repositório não encontrado</div>;

  const filteredBlocks = project.blocks.filter(b => {
    const matchesSearch = b.content.toLowerCase().includes(search.toLowerCase()) || 
                          (b.metadata?.fileName?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filterType === 'ALL' || b.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddBlock = (type: BlockType) => {
    addBlock(project.id, {
      type,
      content: '',
      tags: [],
      metadata: type === BlockType.TODO ? { completed: false } : {}
    });
  };

  const handleUploadComplete = async (file: File, type: BlockType) => {
    try {
      const base64 = await fileToBase64(file);
      addBlock(project.id, {
        type,
        content: '', // Can be empty initially
        tags: [],
        metadata: { 
          url: base64, 
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      });
      addToast("Arquivo enviado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao processar arquivo.", "error");
    }
  };

  return (
    <div className="min-h-full pb-40 bg-white">
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUploadComplete} 
      />
      {/* Header Premium High-Tech */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{project.name}</h1>
              <div className="h-6 w-px bg-slate-100"></div>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] bg-slate-900 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
                  {project.type}
                 </span>
                 <select 
                    value={project.status}
                    onChange={(e) => updateProject(project.id, { status: e.target.value as any })}
                    className="text-[10px] bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] focus:outline-none cursor-pointer hover:border-blue-400 transition-all"
                 >
                    <option value="Não Iniciado">Não Iniciado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Em Espera">Em Espera</option>
                    <option value="Concluído">Concluído</option>
                 </select>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 {project.blocks.length} módulos ativos
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative mr-2 hidden xl:block">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
             <input 
              type="text" 
              placeholder="Filtrar base de conhecimento..."
              className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-50 w-72 transition-all focus:w-96 placeholder:text-slate-300 text-slate-900"
              value={search}
              onChange={e => setSearch(e.target.value)}
             />
          </div>
          <button 
            onClick={() => {
              if(confirm("Confirma a destruição permanente deste repositório?")) {
                deleteProject(project.id);
                addToast("Repositório destruído.", "info");
                navigate('/');
              }
            }}
            className="p-3.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
            title="Destruir Repositório"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12 space-y-16">
        
        {/* Navegação de Seções */}
        <div className="flex items-center gap-12 border-b border-slate-100">
           <button 
            onClick={() => setView('blocks')}
            className={`flex items-center gap-3 pb-6 text-[11px] font-black uppercase tracking-[0.25em] transition-all border-b-4 px-2 ${view === 'blocks' ? 'text-slate-950 border-slate-950' : 'text-slate-300 border-transparent hover:text-slate-500'}`}
           >
             <LayoutGrid size={16} />
             Base de Dados
           </button>
           <button 
            onClick={() => setView('strategy')}
            className={`flex items-center gap-3 pb-6 text-[11px] font-black uppercase tracking-[0.25em] transition-all border-b-4 px-2 ${view === 'strategy' ? 'text-slate-950 border-slate-950' : 'text-slate-300 border-transparent hover:text-slate-500'}`}
           >
             <Target size={16} />
             Setup Estratégico
           </button>
        </div>

        {view === 'blocks' && (
          <div className="space-y-8">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterType(BlockType.TEXT)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === BlockType.TEXT ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                Texto
              </button>
              <button 
                onClick={() => setFilterType(BlockType.IMAGE)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === BlockType.IMAGE ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                Prints
              </button>
              <button 
                onClick={() => setFilterType(BlockType.VIDEO)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === BlockType.VIDEO ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                Vídeo
              </button>
              <button 
                onClick={() => setFilterType(BlockType.LINK)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === BlockType.LINK ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                Links
              </button>
              <button 
                onClick={() => setFilterType(BlockType.FILE)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === BlockType.FILE ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                Arquivos
              </button>
            </div>

            {/* Toolbar de Módulos (Estilo Command Center) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
               <button onClick={() => handleAddBlock(BlockType.TEXT)} className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-[2rem] hover:bg-slate-950 hover:text-white transition-all group">
                  <Type size={20} className="text-slate-400 group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Texto</span>
               </button>
               <button onClick={() => handleAddBlock(BlockType.IMAGE)} className="flex flex-col items-center gap-3 p-6 bg-blue-50 text-blue-700 rounded-[2rem] hover:bg-blue-600 hover:text-white transition-all group">
                  <ImageIcon size={20} className="group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Print</span>
               </button>
               <button onClick={() => handleAddBlock(BlockType.VIDEO)} className="flex flex-col items-center gap-3 p-6 bg-indigo-50 text-indigo-700 rounded-[2rem] hover:bg-indigo-600 hover:text-white transition-all group">
                  <VideoIcon size={20} className="group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Vídeo</span>
               </button>
               <button onClick={() => handleAddBlock(BlockType.LINK)} className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-[2rem] hover:bg-slate-950 hover:text-white transition-all group">
                  <LinkIcon size={20} className="text-slate-400 group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Link</span>
               </button>
               <button onClick={() => handleAddBlock(BlockType.REMINDER)} className="flex flex-col items-center gap-3 p-6 bg-amber-50 text-amber-700 rounded-[2rem] hover:bg-amber-500 hover:text-white transition-all group">
                  <Bell size={20} className="group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Alerta</span>
               </button>
               <button onClick={() => handleAddBlock(BlockType.TODO)} className="flex flex-col items-center gap-3 p-6 bg-emerald-50 text-emerald-700 rounded-[2rem] hover:bg-emerald-600 hover:text-white transition-all group">
                  <CheckSquare size={20} className="group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Task</span>
               </button>
            </div>

            {/* Repositório de Blocos */}
            <div className="space-y-4">
              {filteredBlocks.length === 0 ? (
                <div className="py-40 text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-100 shadow-sm">
                    <LayoutGrid size={48} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900 font-black text-xl uppercase tracking-tighter">Repositório Vazio</p>
                    <p className="text-slate-400 text-sm font-medium">Capture referências, vídeos e anotações para começar.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBlocks.map(block => (
                    <BlockRenderer 
                      key={block.id} 
                      block={block} 
                      onDelete={(bid) => deleteBlock(project.id, bid)}
                      onUpdate={(bid, updates) => updateBlock(project.id, bid, updates)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'strategy' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                   <Target size={16} />
                </div>
                Diretrizes Estratégicas
              </h3>
              
              <div className="space-y-6">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dor Principal Solucionada</label>
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-bold placeholder:text-slate-300 resize-none min-h-[100px]"
                    placeholder="O que motiva o usuário a gastar dinheiro?"
                    value={project.strategicFields.mainPain}
                    onChange={(e) => updateProject(project.id, { strategicFields: { ...project.strategicFields, mainPain: e.target.value } })}
                  />
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Público-Alvo Específico</label>
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-bold placeholder:text-slate-300 resize-none min-h-[100px]"
                    placeholder="Quem é o cliente ideal?"
                    value={project.strategicFields.targetAudience}
                    onChange={(e) => updateProject(project.id, { strategicFields: { ...project.strategicFields, targetAudience: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                   <Zap size={16} />
                </div>
                Análise de Viabilidade
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Urgência</label>
                    <select 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-bold cursor-pointer"
                      value={project.strategicFields.urgency}
                      onChange={(e) => updateProject(project.id, { strategicFields: { ...project.strategicFields, urgency: e.target.value as Level } })}
                    >
                      {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Complexidade</label>
                    <select 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-bold cursor-pointer"
                      value={project.strategicFields.complexity}
                      onChange={(e) => updateProject(project.id, { strategicFields: { ...project.strategicFields, complexity: e.target.value as Level } })}
                    >
                      {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
              </div>

              <div className="bg-slate-950 text-white p-10 rounded-[2.5rem] space-y-6 shadow-2xl">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block">Potencial de Escala</label>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-white font-bold placeholder:text-slate-800"
                      placeholder="Até onde isso pode crescer?"
                      value={project.strategicFields.scalePotential}
                      onChange={(e) => updateProject(project.id, { strategicFields: { ...project.strategicFields, scalePotential: e.target.value } })}
                    />
                 </div>
                 <div className="h-px bg-slate-900"></div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block">Riscos Identificados</label>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-white font-bold placeholder:text-slate-800"
                      placeholder="O que pode impedir a execução?"
                      value={project.strategicFields.risks}
                      onChange={(e) => updateProject(project.id, { strategicFields: { ...project.strategicFields, risks: e.target.value } })}
                    />
                 </div>
              </div>
            </div>
          </div>
        )}

        {view === 'timeline' && (
          <div className="relative pl-12 space-y-16 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[3px] before:bg-slate-100 before:rounded-full">
            {project.blocks.length === 0 ? (
              <p className="text-slate-400 text-center py-20 font-bold uppercase text-[10px] tracking-widest">Documente o processo para registrar o histórico.</p>
            ) : (
              [...project.blocks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((block, idx) => (
                <div key={block.id} className="relative group">
                  <div className={`absolute -left-[43px] top-1 w-10 h-10 rounded-2xl border-[6px] border-white shadow-xl flex items-center justify-center text-white ${
                    block.type === BlockType.REMINDER ? 'bg-amber-500' :
                    block.type === BlockType.TODO ? 'bg-emerald-500' :
                    block.type === BlockType.IMAGE ? 'bg-blue-600' : 
                    block.type === BlockType.VIDEO ? 'bg-indigo-600' : 'bg-slate-900'
                  }`}>
                    {block.type === BlockType.IMAGE ? <ImageIcon size={16}/> : 
                     block.type === BlockType.VIDEO ? <Play size={14} className="fill-current"/> : 
                     block.type === BlockType.REMINDER ? <Bell size={16}/> :
                     block.type === BlockType.TODO ? <CheckSquare size={16}/> : <Type size={16}/>}
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] transition-all hover:bg-white hover:border-slate-200">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] block mb-3">
                      {format(new Date(block.createdAt), "EEEE, d 'de' MMMM · HH:mm", { locale: ptBR })}
                    </span>
                    <h4 className="text-slate-900 font-black text-lg leading-tight">
                      {block.content || `${block.type} capturado`}
                    </h4>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
