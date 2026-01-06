
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Home as HomeIcon, PlusCircle, Bell, Search, Settings, ChevronRight, Kanban, LogOut } from 'lucide-react';
import { Logo } from './components/Logo';
import Dashboard from './views/Dashboard';
import ProjectDetail from './views/ProjectDetail';
import CreateProject from './views/CreateProject';
import RemindersView from './views/RemindersView';
import CRMBoard from './views/CRMBoard';
import Login from './views/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-right border-slate-200 bg-white flex flex-col h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink to="/" icon={HomeIcon} label="Dashboard" active={location.pathname === '/'} />
          <SidebarLink to="/crm" icon={Kanban} label="CRM de Projetos" active={location.pathname === '/crm'} />
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações</p>
          </div>
          <SidebarLink to="/new" icon={PlusCircle} label="Novo Projeto" active={location.pathname === '/new'} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings size={20} />
            <span className="text-sm">Configurações</span>
          </button>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto notion-scroll relative">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/crm" element={
            <ProtectedRoute>
              <CRMBoard />
            </ProtectedRoute>
          } />
          <Route path="/project/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="/new" element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          } />
          <Route path="/reminders" element={
            <ProtectedRoute>
              <RemindersView />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;
