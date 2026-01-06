import React from 'react';
import { useStore } from '../store';
import { ProjectType, ProjectStatus } from '../types';
import { Search, Filter, Plus, Clock, Tag, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { projects } = useStore();
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'text-green-600 bg-green-50';
      case ProjectStatus.IN_PROGRESS: return 'text-blue-600 bg-blue-50';
      case ProjectStatus.ON_HOLD: return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seus Projetos</h1>
          <p className="text-slate-500 mt-1">Acompanhe o progresso e gerencie suas tarefas.</p>
        </div>
        <Link to="/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium">
          <Plus size={20} />
          Novo Projeto
        </Link>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou tag..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={18} />
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer hover:border-blue-300 transition-colors"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            {Object.values(ProjectType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer hover:border-blue-300 transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            {Object.values(ProjectStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Nenhum projeto encontrado</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Comece criando seu primeiro projeto para centralizar suas ideias.
          </p>
          <Link to="/new" className="mt-6 inline-block text-blue-600 font-semibold underline decoration-2 underline-offset-4">
            Criar meu primeiro projeto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Link 
              key={project.id} 
              to={`/project/${project.id}`}
              className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-200/50 transition-all border-b-4 border-b-slate-100 hover:border-b-blue-600 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <span className={`self-start px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {project.type}
                  </span>
                </div>
                {/* Progress Circle or Bar */}
                 <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Activity size={16} />
                 </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{project.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed h-10">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Progresso</span>
                  <span className="text-[11px] font-bold text-slate-700">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      project.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${project.progress}%` }} 
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
                {project.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && <span className="text-[11px] text-slate-400">+{project.tags.length - 3}</span>}
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ptBR })}
                </span>
                <span className="text-[11px] font-bold text-slate-700">
                  {project.blocks.length} tarefas
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
