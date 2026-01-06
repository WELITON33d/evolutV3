
import React from 'react';
import { useStore } from '../store';
import { Bell, Calendar, ChevronRight, CheckCircle2, Clock, Trash2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RemindersView: React.FC = () => {
  const { addToast } = useToast();
  const { getReminders, updateBlock, deleteBlock } = useStore();
  const reminders = getReminders();

  const handleToggle = (projectId: string, reminderId: string, completed: boolean) => {
    updateBlock(projectId, reminderId, { metadata: { completed } });
  };

  const pending = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bell className="text-blue-500" size={32} />
          Central de Lembretes
        </h1>
        <p className="text-slate-500 mt-1">Acompanhe todos os seus prazos e insights críticos.</p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            Pendente
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pending.length}
            </span>
          </h2>
          
          {pending.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-400 text-sm">
              Tudo em dia! Nenhum lembrete pendente no momento.
            </div>
          ) : (
            <div className="grid gap-4">
              {pending.map(reminder => {
                const isOverdue = isPast(new Date(reminder.date)) && !isToday(new Date(reminder.date));
                return (
                  <div key={reminder.id} className={`bg-white border-l-4 p-5 rounded-xl border border-slate-200 flex items-start justify-between group hover:shadow-lg hover:shadow-blue-100 transition-all ${
                    isOverdue ? 'border-l-red-500' : 'border-l-blue-500'
                  }`}>
                    <div className="flex gap-4">
                       <button 
                        onClick={() => handleToggle(reminder.projectId, reminder.id, true)}
                        className="mt-1 w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center text-transparent hover:text-slate-300 hover:border-blue-400 transition-colors"
                       >
                         <CheckCircle2 size={16} />
                       </button>
                       <div>
                         <p className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                            {reminder.text || 'Sem texto'}
                         </p>
                         <div className="flex items-center gap-4 mt-2">
                           <Link to={`/project/${reminder.projectId}`} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
                             <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase">{reminder.projectName}</span>
                             <ChevronRight size={12} />
                           </Link>
                           <div className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                             <Calendar size={14} />
                             {format(new Date(reminder.date), "d 'de' MMM", { locale: ptBR })}
                             {isOverdue && <span className="font-bold uppercase text-[9px] bg-red-100 px-1 rounded ml-1">Vencido</span>}
                           </div>
                         </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => {
                        deleteBlock(reminder.projectId, reminder.id);
                        addToast("Lembrete removido.", "info");
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 rounded transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {completedReminders.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Concluídos</h2>
            <div className="grid gap-3 opacity-60">
              {completedReminders.map(reminder => (
                <div key={reminder.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleToggle(reminder.projectId, reminder.id, false)}
                      className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      <Check size={14} />
                    </button>
                    <p className="text-sm font-medium text-slate-500 line-through">{reminder.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{reminder.projectName}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default RemindersView;
