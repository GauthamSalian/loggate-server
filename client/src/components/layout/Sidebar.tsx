import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LayoutDashboard, Search, Server, Key, Settings,
  ChevronDown, Plus, CheckCircle2, Cpu, FlaskConical
} from 'lucide-react';
import { projectApi } from '../../lib/api';
import { useProject } from '../../context/ProjectContext';
import { springTransition, fadeInSlideUp } from '../../lib/motion';

export type ActiveTab = 'dashboard' | 'triage' | 'triage-sandbox' | 'agents' | 'tokens' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'triage', label: 'Triage & Patterns', icon: <Search size={16} /> },
  { id: 'triage-sandbox', label: 'Triage Testing', icon: <FlaskConical size={16} /> },
  { id: 'agents', label: 'Fleet & Agents', icon: <Server size={16} /> },
  { id: 'tokens', label: 'API Keys & Setup', icon: <Key size={16} /> },
  { id: 'settings', label: 'Project Settings', icon: <Settings size={16} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { projects, activeProject, setActiveProject, refreshProjects } = useProject();
  const [showProjects, setShowProjects] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await projectApi.create(newName.trim());
      await refreshProjects();
      setShowNewProject(false);
      setNewName('');
    } catch {
      // ignore
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <div className="sidebar-name">LogGate</div>
          <div className="sidebar-sub">Log Intelligence</div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="project-selector">
        <button
          className="project-trigger"
          onClick={() => setShowProjects(!showProjects)}
        >
          <div className="project-dot" />
          <span className="project-name">{activeProject?.name ?? 'Select Project'}</span>
          <motion.span animate={{ rotate: showProjects ? 180 : 0 }} transition={springTransition}>
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {showProjects && (
            <motion.div
              className="project-dropdown"
              variants={fadeInSlideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {(projects || []).map((p) => (
                <button
                  key={p.project_id}
                  className={`project-option ${activeProject?.project_id === p.project_id ? 'project-option--active' : ''}`}
                  onClick={() => { setActiveProject(p); setShowProjects(false); }}
                >
                  <div className="project-dot project-dot--sm" />
                  <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  {activeProject?.project_id === p.project_id && <CheckCircle2 size={12} className="ml-auto text-emerald-600" />}
                </button>
              ))}

              {showNewProject ? (
                <form onSubmit={handleCreateProject} className="new-project-form">
                  <input
                    className="new-project-input"
                    placeholder="Project name…"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="new-project-submit">Create</button>
                </form>
              ) : (
                <button
                  className="new-project-btn"
                  onClick={() => setShowNewProject(true)}
                >
                  <Plus size={13} />
                  New Project
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="active-nav-pill"
                  className="active-pill"
                  transition={springTransition}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Health */}
      <div className="sidebar-health">
        <div className="health-row">
          <Cpu size={12} />
          <span>System Status</span>
          <span className="health-badge health-badge--ok">Operational</span>
        </div>
        <div className="health-endpoint">http://localhost:8000</div>
      </div>
    </aside>
  );
};
