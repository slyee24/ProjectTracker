import React from 'react';
import { Project } from '../types';
import { TabType } from '../App';
import { Building2, Briefcase, LayoutDashboard, ClipboardCheck, ListTodo, CheckSquare, X, LogOut, History, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import ResetDatabaseButton from './ResetDatabaseButton';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ projects, activeProjectId, onSelectProject, activeTab, onSelectTab, isOpen, onClose }: SidebarProps) {
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assessment', label: 'Status Assessment', icon: ClipboardCheck },
    { id: 'tasks', label: 'All Tasks', icon: ListTodo },
    { id: 'checklist', label: 'Final Checklist', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex justify-between items-center md:block">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider md:mb-4">Projects</h2>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 space-y-2">
          {projects.map(project => {
            const Icon = project.type === 'hotel' ? Building2 : Briefcase;
            const isActive = project.id === activeProjectId;
            return (
              <button
                key={project.id}
                onClick={() => { onSelectProject(project.id); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  isActive 
                    ? "bg-slate-800 text-white font-medium" 
                    : "hover:bg-slate-800/50 hover:text-slate-100"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-sky-400" : "text-slate-500")} />
                <span className="truncate">{project.name}</span>
              </button>
            );
          })}
        </div>

      <div className="px-6 py-4 flex-1">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Views</h2>
        <nav className="space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => { onSelectTab(tab.id); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  isActive 
                    ? "bg-sky-500/10 text-sky-400 font-medium" 
                    : "hover:bg-slate-800/50 hover:text-slate-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6 border-t border-slate-800 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
              PM
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">Project Manager</div>
              <div className="text-slate-500 text-xs">Prestige Tracker</div>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <ResetDatabaseButton />
      </div>
    </aside>
    </>
  );
}
