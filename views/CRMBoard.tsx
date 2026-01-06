import React, { useState } from 'react';
import { useStore } from '../store';
import { ProjectStatus, Project, ProjectType } from '../types';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { 
  Kanban, Plus, MoreVertical, Calendar, CheckCircle2, 
  AlertCircle, Clock, ArrowRight, Search, Filter,
  TrendingUp, Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CRMBoard: React.FC = () => {
  const { projects, updateProject } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // Fallback
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    if (!draggingId) return;
    
    await updateProject(draggingId, { status });
    setDraggingId(null);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-green-500';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-500';
      case ProjectStatus.ON_HOLD: return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusLabelColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'text-green-600 bg-green-50';
      case ProjectStatus.IN_PROGRESS: return 'text-blue-600 bg-blue-50';
      case ProjectStatus.ON_HOLD: return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Kanban className="text-blue-600" />
            Pipeline de Projetos
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Gestão visual do fluxo de desenvolvimento
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrar projetos..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos os Tipos</option>
            {Object.values(ProjectType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button 
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-sm font-bold"
          >
            <Plus size={16} />
            Novo Projeto
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex gap-6 h-full min-w-max">
          {Object.values(ProjectStatus).map(status => {
            const projectsInStatus = filteredProjects.filter(p => (p.status || ProjectStatus.NOT_STARTED) === status);
            const totalValue = projectsInStatus.length;

            return (
              <div 
                key={status} 
                className="w-[340px] flex flex-col h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
                      {status}
                    </h3>
                  </div>
                  <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {totalValue}
                  </span>
                </div>

                {/* Drop Zone / List */}
                <div className={`flex-1 bg-slate-100/50 rounded-[1.5rem] border p-3 overflow-y-auto notion-scroll transition-colors ${draggingId ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200/60'}`}>
                  {projectsInStatus.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl m-2 opacity-50">
                      <span className="text-slate-400 text-xs font-medium">Arraste para cá</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectsInStatus.map(project => (
                        <div 
                          key={project.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, project.id)}
                          onDragEnd={() => setDraggingId(null)}
                          className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing relative ${draggingId === project.id ? 'opacity-50 scale-95 rotate-1 shadow-xl' : ''}`}
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          {/* Tags & Type */}
                          <div className="flex justify-between items-start mb-3">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md">
                               {project.type}
                             </span>
                             {/* Quick Actions (Hover) */}
                             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <select 
                                  className="bg-white border border-slate-200 text-[10px] rounded-lg shadow-lg py-1 px-2 cursor-pointer focus:outline-none hover:bg-slate-50"
                                  value={project.status}
                                  onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
                                >
                                  {Object.values(ProjectStatus).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                             </div>
                          </div>

                          <h4 className="text-slate-900 font-bold text-base mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h4>
                          
                          <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                            {project.description || "Sem descrição definida."}
                          </p>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Progresso</span>
                              <span className="text-[9px] font-bold text-slate-700">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${
                                  project.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${project.progress}%` }} 
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                             <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={12} />
                                <span className="text-[10px] font-medium">
                                  {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ptBR })}
                                </span>
                             </div>
                             <div className="flex items-center gap-1 text-slate-600 font-bold text-[10px]">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                {project.blocks.filter(b => b.type === 'TODO' && b.metadata?.completed).length} / {project.blocks.filter(b => b.type === 'TODO').length}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CRMBoard;