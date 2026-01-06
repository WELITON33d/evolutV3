
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { ProjectType, Level } from '../types';
import { ArrowLeft, Plus, Zap, Target } from 'lucide-react';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useStore();
  const { addToast } = useToast();

  const [formData, setFormData] = React.useState({
    name: '',
    type: ProjectType.SAAS,
    description: '',
    tags: '',
    strategicFields: {
      mainPain: '',
      targetAudience: '',
      urgency: Level.MEDIUM,
      complexity: Level.MEDIUM,
      scalePotential: '',
      risks: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    const id = await addProject({
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    });

    if (id) {
      addToast('Repositório criado com sucesso!', 'success');
      navigate(`/project/${id}`);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all mb-8 font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-200/50 border border-slate-100 overflow-hidden">
          <div className="p-10 md:p-14">
            <header className="mb-10">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Plus size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Iniciar Novo Projeto</h1>
              <p className="text-slate-400 font-medium mt-2">Dê um nome e defina a categoria da sua ideia.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="Ex: App de Biohacking, Suplemento Nootrópico..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-300"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as ProjectType })}
                  >
                    {Object.values(ProjectType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags Iniciais</label>
                  <input
                    type="text"
                    placeholder="MVP, Pesquisa..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200/50 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Criar Repositório
                <Zap size={18} className="fill-white" />
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <Target size={14} />
              Foco em Execução
            </div>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              Pesquisa de Mercado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
