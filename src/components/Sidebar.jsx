import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building2, 
  DoorOpen, 
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Sidebar({ isOpen, className, onNavigate }) {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  const navItemClass = ({ isActive }) => twMerge(
    clsx(
      'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 group',
      isActive 
        ? 'bg-blue-500/20 text-blue-300 font-medium ring-1 ring-blue-400/40 shadow-[0_0_24px_rgba(59,130,246,0.2)]'
        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
    )
  );

  if (!isOpen) return null;

  return (
    <aside className={clsx("w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-600/60 bg-slate-900/75 shadow-[0_22px_60px_rgba(2,6,23,0.6)] backdrop-blur-xl", className)}>
      <div className="flex flex-col py-4">
      {/* Navigation */}
      <nav className="px-4 space-y-2">
        <div>
          <button 
            onClick={() => setIsDashboardOpen(!isDashboardOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3 text-slate-200 hover:bg-slate-800/70 transition-all"
          >
            <div className="flex items-center">
              <span className="font-semibold tracking-wide">Dashboard</span>
            </div>
            {isDashboardOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Sub menu */}
          <div className={clsx("mt-2 ml-4 pl-4 border-l border-slate-600/50 space-y-1 transition-all duration-300", 
            isDashboardOpen ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden")}>
            
            <NavLink to="/dashboard/owlytics" className={navItemClass} onClick={onNavigate}>
              <Eye className="w-4 h-4" />
              Owlytics
            </NavLink>
            
            <NavLink to="/dashboard/entrance" className={navItemClass} onClick={onNavigate}>
              <DoorOpen className="w-4 h-4" />
              Entrance
            </NavLink>
            
            <NavLink to="/dashboard/workspace" className={navItemClass} onClick={onNavigate}>
              <Building2 className="w-4 h-4" />
              Workspace
            </NavLink>
            
          </div>
        </div>
        
        {/* Further items can go here */}
      </nav>

    </div>
    </aside>
  );
}
