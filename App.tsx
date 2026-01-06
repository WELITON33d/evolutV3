
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Home as HomeIcon, PlusCircle, Bell, Search, Settings, ChevronRight, ChevronLeft, Kanban, LogOut } from 'lucide-react';
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
    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
    }`}
  >
    <Icon size={18} strokeWidth={active ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
    <span className="text-sm font-medium tracking-wide">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // useEffect for chat sidebar removed

  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 via-transparent to-slate-50/40 pointer-events-none"></div>

      {/* Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-6 z-50 p-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full shadow-lg shadow-slate-200/50 text-slate-500 hover:text-slate-900 transition-all duration-300 hover:scale-105 ${
          isSidebarOpen ? 'left-[260px]' : 'left-6'
        }`}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full opacity-0'
        } border-r border-slate-200/60 bg-white/80 backdrop-blur-xl flex flex-col h-full transition-all duration-300 overflow-hidden z-40 relative shadow-2xl shadow-slate-200/50`}
      >
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="transition-transform group-hover:scale-105">
               <Logo />
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {/* Chat Link Removed */}
          <SidebarLink to="/" icon={HomeIcon} label="Dashboard" active={location.pathname === '/'} />
          <SidebarLink to="/crm" icon={Kanban} label="CRM de Projetos" active={location.pathname === '/crm'} />
          <div className="pt-6 pb-3 px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ações Rápidas</p>
          </div>
          <SidebarLink to="/new" icon={PlusCircle} label="Novo Projeto" active={location.pathname === '/new'} />
        </nav>

        <div className="p-6 border-t border-slate-100/60 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors group">
            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-sm font-medium">Configurações</span>
          </button>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto notion-scroll relative z-0">
        <Routes>
          {/* Chat Route Removed */}
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
