
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { BlockType, ProjectType, Level, Block } from '../types';
// Fix: Added missing imports 'Target' and 'Zap' from lucide-react
import { 
  ArrowLeft, Plus, Type, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, 
  CheckSquare, Bell, MoreVertical, Trash2, Calendar, 
  History, Search, LayoutGrid, Info, Upload, Download, File as FileIcon, X, Play,
  Target, Zap
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

  const renderContent = () => {
    switch (block.type) {
      case BlockType.TEXT:
        return (
          <textarea
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 leading-relaxed resize-none notion-scroll p-0 text-base"
            placeholder="Digite suas ideias ou hipóteses..."
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            rows={Math.max(1, block.content.split('\n').length)}
          />
        );
      case BlockType.TODO:
        return (
          <div className="flex items-start gap-4 w-full">
            <input 
              type="checkbox" 
              checked={!!block.metadata?.completed}
              className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, completed: e.target.checked } })}
            />
            <input
              className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-base font-medium ${block.metadata?.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Próximo passo do projeto..."
            />
          </div>
        );
      case BlockType.IMAGE:
        return (
          <div className="space-y-3 w-full">
             {block.metadata?.url ? (
               <div className="relative group/img overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 max-h-[600px] flex items-center justify-center shadow-lg">
                 <img src={block.metadata.url} alt="Print de Referência" className="max-w-full h-auto object-contain" />
                 <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-all translate-y-2 group-hover/img:translate-y-0">
                   <button 
                    onClick={() => onUpdate(block.id, { metadata: { ...block.metadata, url: '' } })}
                    className="bg-white/95 p-2 rounded-xl hover:bg-white shadow-xl text-red-500 hover:scale-110 transition-all border border-slate-100"
                   >
                     <X size={18} />
                   </button>
                 </div>
               </div>
             ) : (
               <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer group bg-slate-50/50"
               >
                 <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400 group-hover:scale-110 group-hover:text-slate-900 shadow-sm transition-all">
                    <Upload size={24} />
                 </div>
                 <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Anexar Print ou Referência</p>
                 <p className="text-xs text-slate-400 mt-2 font-medium">PNG, JPG ou Prints colados (Upload Local)</p>
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
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-400 font-bold italic px-1"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Legenda da referência..."
            />
          </div>
        );
      case BlockType.VIDEO:
        return (
          <div className="space-y-3 w-full">
            {block.metadata?.url ? (
              <div className="relative group/vid overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl aspect-video flex items-center justify-center">
                <video src={block.metadata.url} controls className="w-full h-full object-contain" />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/vid:opacity-100 transition-all">
                   <button 
                    onClick={() => onUpdate(block.id, { metadata: { ...block.metadata, url: '' } })}
                    className="bg-white/95 p-2 rounded-xl hover:bg-white shadow-xl text-red-500 hover:scale-110 transition-all"
                   >
                     <X size={18} />
                   </button>
                 </div>
              </div>
            ) : (
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer group bg-slate-50/50"
              >
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400 group-hover:scale-110 group-hover:text-blue-600 shadow-sm transition-all">
                   <Play size={24} className="fill-current" />
                </div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Subir Referência em Vídeo</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">MP4, MOV ou WebM (Max 10MB p/ Storage local)</p>
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
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-400 font-bold italic px-1"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Notas sobre o vídeo..."
            />
          </div>
        );
      case BlockType.FILE:
        return (
          <div className="space-y-2 w-full">
            {block.metadata?.url ? (
              <div className="flex items-center gap-5 p-5 bg-white border border-slate-200 rounded-[1.5rem] group/file hover:border-slate-400 hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                  <FileIcon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-slate-900 truncate">{block.metadata.fileName}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                    {(block.metadata.fileSize ? (block.metadata.fileSize / 1024).toFixed(1) : 0)} KB • {block.metadata.fileType?.split('/')[1] || 'DOC'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={block.metadata.url} 
                    download={block.metadata.fileName}
                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Download size={22} />
                  </a>
                  <button 
                    onClick={() => onUpdate(block.id, { metadata: { ...block.metadata, url: '' } })}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl p-10 text-center hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <Upload size={24} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-slate-900">Documentação Técnica</span>
                  <span className="text-xs font-medium text-slate-400">Anexe PDFs, Planilhas ou Briefings</span>
                </div>
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
            <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-slate-900 transition-all">
              <LinkIcon size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
              <input
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-base font-bold text-slate-900 p-0"
                value={block.metadata?.url || ''}
                onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, url: e.target.value } })}
                placeholder="https://referencia-ou-concorrente.com"
              />
              {block.metadata?.url && (
                <a href={block.metadata.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-slate-400 shadow-sm">
                  <Play size={14} className="-rotate-90 fill-current" />
                </a>
              )}
            </div>
            <textarea
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-500 font-medium px-1 leading-relaxed mt-2"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="O que aprender com este link?"
              rows={1}
            />
          </div>
        );
      case BlockType.REMINDER:
        return (
          <div className="flex flex-col gap-4 p-6 bg-blue-900 text-white rounded-[2rem] w-full shadow-2xl">
            <div className="flex items-center gap-2 text-blue-300 font-black text-[10px] uppercase tracking-[0.2em]">
              <Bell size={14} className="fill-blue-300" />
              Lembrete Estratégico
            </div>
            <textarea
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white font-bold text-xl resize-none p-0 leading-tight placeholder:text-blue-300"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Algo vital para o sucesso..."
              rows={1}
            />
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
                <Calendar size={14} className="text-slate-500" />
                <input 
                  type="date" 
                  className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
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
    <div className="group/block relative flex items-start gap-6 p-6 hover:bg-slate-50/80 rounded-[2.5rem] transition-all border border-transparent hover:border-slate-100">
      <div className="flex flex-col items-center gap-3 opacity-0 group-hover/block:opacity-100 transition-all pt-2 scale-90">
        <div className="p-2.5 bg-white border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing shadow-sm text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all">
          <MoreVertical size={18} />
        </div>
        <button 
          onClick={() => onDelete(block.id)}
          className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-300 transition-all shadow-sm border border-transparent hover:border-red-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest">
          <span className={`px-3 py-1 rounded-full ${
             block.type === BlockType.IMAGE ? 'bg-blue-600 text-white' :
             block.type === BlockType.VIDEO ? 'bg-indigo-600 text-white' :
             block.type === BlockType.REMINDER ? 'bg-blue-900 text-white' :
             block.type === BlockType.TODO ? 'bg-emerald-600 text-white' :
             'bg-slate-200 text-slate-600'
          }`}>{block.type}</span>
          <span className="text-slate-300">{format(new Date(block.createdAt), "d 'de' MMM, HH:mm", { locale: ptBR })}</span>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { projects, deleteProject, addBlock, updateBlock, deleteBlock, updateProject } = useStore();
  
  const project = projects.find(p => p.id === id);
  const [view, setView] = React.useState<'blocks' | 'timeline' | 'strategy'>('blocks');
  const [search, setSearch] = React.useState('');

  if (!project) return <div className="p-12 text-center font-bold text-slate-400">Repositório não encontrado</div>;

  const filteredBlocks = project.blocks.filter(b => 
    b.content.toLowerCase().includes(search.toLowerCase()) || 
    (b.metadata?.fileName?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddBlock = (type: BlockType) => {
    addBlock(project.id, {
      type,
      content: '',
      tags: [],
      metadata: type === BlockType.TODO ? { completed: false } : {}
    });
  };

  return (
    <div className="min-h-full pb-40 bg-white">
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
              <span className="text-[10px] bg-slate-900 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
                {project.type}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {project.blocks.length} módulos ativos no repositório
            </p>
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
          <div className="space-y-12">
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
                filteredBlocks.map(block => (
                  <BlockRenderer 
                    key={block.id} 
                    block={block} 
                    onDelete={(bid) => deleteBlock(project.id, bid)}
                    onUpdate={(bid, updates) => updateBlock(project.id, bid, updates)}
                  />
                ))
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
