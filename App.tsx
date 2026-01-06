
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Home as HomeIcon, PlusCircle, Bell, Search, Settings, ChevronRight, ChevronLeft, Kanban, LogOut, MessageSquare } from 'lucide-react';
import { Logo } from './components/Logo';
import Dashboard from './views/Dashboard';
import Chat from './views/Chat';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (location.pathname === '/chat') {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [location.pathname]);

  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden relative">
      {/* Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-6 z-50 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-500 hover:text-slate-900 transition-all duration-300 ${
          isSidebarOpen ? 'left-[240px]' : 'left-4'
        }`}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'
        } border-r border-slate-200 bg-white flex flex-col h-full transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink to="/chat" icon={MessageSquare} label="Chat IA" active={location.pathname === '/chat'} />
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
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
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
