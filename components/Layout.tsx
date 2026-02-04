
import React from 'react';
import { LayoutDashboard, Database, Settings, MessageSquare, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">PPA</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Project Assistant</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Team Dashboard" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
          <NavItem icon={<Users size={20} />} label="Team Projects" active={activeTab === 'projects'} onClick={() => onTabChange('projects')} />
          <NavItem icon={<MessageSquare size={20} />} label="AI Insight" active={activeTab === 'chat'} onClick={() => onTabChange('chat')} />
          <NavItem icon={<Database size={20} />} label="Import Data" active={activeTab === 'import'} onClick={() => onTabChange('import')} />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-medium text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
          <button 
            onClick={() => onTabChange('import')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
          >
            <Database size={18} />
            <span className="font-medium">Update Data</span>
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Layout;
