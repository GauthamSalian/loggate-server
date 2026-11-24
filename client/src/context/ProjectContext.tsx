import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectApi } from '../lib/api';
import type { Project } from '../lib/api';
import { useAuth } from './AuthContext';

export const DEFAULT_PROJECT: Project = {
  project_id: 'proj_default_infra',
  name: 'Production Infrastructure',
  created_at: new Date().toISOString(),
  slack_webhook_url: '',
};

interface ProjectContextType {
  projects: Project[];
  activeProject: Project;
  setActiveProject: (p: Project) => void;
  refreshProjects: () => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
  loadingProjects: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([DEFAULT_PROJECT]);
  const [activeProject, setActiveProject] = useState<Project>(DEFAULT_PROJECT);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const refreshProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingProjects(true);
    try {
      const res = await projectApi.list();
      const list = res.projects && res.projects.length > 0 ? res.projects : [DEFAULT_PROJECT];
      setProjects(list);
      setActiveProject((prev) => {
        const found = list.find((p) => p.project_id === prev.project_id);
        return found || list[0];
      });
    } catch {
      // Keep existing or default project
    } finally {
      setLoadingProjects(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;
    const load = async () => {
      setLoadingProjects(true);
      try {
        const res = await projectApi.list();
        if (!ignore) {
          const list = res.projects && res.projects.length > 0 ? res.projects : [DEFAULT_PROJECT];
          setProjects(list);
          setActiveProject((prev) => {
            const found = list.find((p) => p.project_id === prev.project_id);
            return found || list[0];
          });
        }
      } catch {
        if (!ignore) {
          setProjects([DEFAULT_PROJECT]);
          setActiveProject(DEFAULT_PROJECT);
        }
      } finally {
        if (!ignore) setLoadingProjects(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const createProject = useCallback(async (name: string): Promise<Project | null> => {
    try {
      await projectApi.create(name);
      const res = await projectApi.list();
      const list = res.projects && res.projects.length > 0 ? res.projects : [];
      if (list.length > 0) {
        setProjects(list);
        const match = list.find((p) => p.name === name) || list[list.length - 1];
        setActiveProject(match);
        return match;
      }
      return null;
    } catch (err) {
      console.error('Failed to create project:', err);
      return null;
    }
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        refreshProjects,
        createProject,
        loadingProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};
