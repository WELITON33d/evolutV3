import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, shouldMock } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Project, Block, Reminder, BlockType, ProjectStatus } from '../types';
import { useToast } from '../components/Toast';

interface StoreContextType {
  projects: Project[];
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'blocks' | 'status' | 'progress'>) => Promise<string | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addBlock: (projectId: string, block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBlock: (projectId: string, blockId: string, updates: Partial<Block>) => Promise<void>;
  deleteBlock: (projectId: string, blockId: string) => Promise<void>;
  getReminders: () => Reminder[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch blocks for all projects
      // This might be heavy if there are many blocks, but for now it mimics the previous "load all" behavior
      // A better approach would be to load blocks on demand or join them, but let's keep it simple for now
      const { data: blocksData, error: blocksError } = await supabase
        .from('blocks')
        .select('*');

      if (blocksError) throw blocksError;

      // Map blocks to projects
      const projectsWithBlocks = projectsData.map((p: any) => ({
        ...p,
        strategicFields: p.strategic_fields || {}, // Map snake_case to camelCase
        status: p.status || ProjectStatus.NOT_STARTED,
        progress: p.progress || 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        blocks: blocksData
          .filter((b: any) => b.project_id === p.id)
          .map((b: any) => ({
            ...b,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
            projectId: b.project_id // Helper for internal use if needed
          }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }));

      setProjects(projectsWithBlocks);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      addToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'blocks' | 'status' | 'progress'>) => {
    if (!user) return null;
    try {
      if (shouldMock) {
        const newProject: Project = {
          id: crypto.randomUUID(),
          user_id: user.id,
          name: project.name,
          type: project.type,
          description: project.description,
          strategicFields: project.strategicFields,
          tags: project.tags,
          status: ProjectStatus.NOT_STARTED,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blocks: []
        };
        
        setProjects(prev => [newProject, ...prev]);
        return newProject.id;
      }

      const newProject = {
        user_id: user.id,
        name: project.name,
        type: project.type,
        description: project.description,
        strategic_fields: project.strategicFields,
        tags: project.tags,
        status: ProjectStatus.NOT_STARTED,
        progress: 0,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;

      const formattedProject: Project = {
        ...data,
        strategicFields: data.strategic_fields,
        status: data.status || ProjectStatus.NOT_STARTED,
        progress: data.progress || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        blocks: []
      };

      setProjects(prev => [formattedProject, ...prev]);
      return data.id;
    } catch (error: any) {
      console.error('Error adding project:', error);
      addToast('Erro ao criar projeto', 'error');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      // Optimistic update
      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ));

      if (shouldMock) return;

      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.strategicFields) dbUpdates.strategic_fields = updates.strategicFields;
      if (updates.tags) dbUpdates.tags = updates.tags;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;

      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating project:', error);
      addToast('Erro ao atualizar projeto', 'error');
      // Revert logic could be added here if needed, but for now we assume success or user retry
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic update
    setProjects(prev => prev.filter(p => p.id !== id));

    if (shouldMock) return;

    try {

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      addToast('Erro ao excluir projeto', 'error');
      // Revert logic...
    }
  };

  const addBlock = async (projectId: string, block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    // Create temporary block for optimistic UI
    const tempId = crypto.randomUUID();
    const tempBlock: Block = {
      id: tempId,
      type: block.type,
      content: block.content,
      metadata: block.metadata || {},
      tags: block.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Optimistic update
      setProjects(prev => prev.map(p => 
        p.id === projectId ? {
          ...p,
          blocks: [tempBlock, ...p.blocks]
        } : p
      ));

      const newBlock = {
        project_id: projectId,
        user_id: user.id,
        type: block.type,
        content: block.content,
        metadata: block.metadata || {},
        tags: block.tags,
      };

      const { data, error } = await supabase
        .from('blocks')
        .insert(newBlock)
        .select()
        .single();

      if (error) throw error;

      const formattedBlock: Block = {
        ...data,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Replace temp block with real block
      setProjects(prev => prev.map(p => 
        p.id === projectId ? {
          ...p,
          blocks: p.blocks.map(b => b.id === tempId ? formattedBlock : b)
        } : p
      ));
    } catch (error: any) {
      console.error('Error adding block:', error);
      addToast('Erro ao adicionar bloco', 'error');
      // Revert optimistic update
      if (!shouldMock) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? {
            ...p,
            blocks: p.blocks.filter(b => b.id !== tempId)
          } : p
        ));
      }
    }
  };

  const updateBlock = async (projectId: string, blockId: string, updates: Partial<Block>) => {
    try {
      // Optimistic update
      setProjects(prev => prev.map(p => 
        p.id === projectId ? {
          ...p,
          blocks: p.blocks.map(b => b.id === blockId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)
        } : p
      ));

      const dbUpdates: any = {};
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.metadata) dbUpdates.metadata = updates.metadata;
      if (updates.tags) dbUpdates.tags = updates.tags;

      const { error } = await supabase
        .from('blocks')
        .update(dbUpdates)
        .eq('id', blockId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating block:', error);
      addToast('Erro ao atualizar bloco', 'error');
      // Revert logic...
    }
  };

  const deleteBlock = async (projectId: string, blockId: string) => {
    // Optimistic update
    setProjects(prev => prev.map(p => 
      p.id === projectId ? {
        ...p,
        blocks: p.blocks.filter(b => b.id !== blockId)
      } : p
    ));

    if (shouldMock) return;

    try {

      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting block:', error);
      addToast('Erro ao excluir bloco', 'error');
      // Revert logic...
    }
  };

  const getReminders = (): Reminder[] => {
    const reminders: Reminder[] = [];
    projects.forEach(p => {
      p.blocks.forEach(b => {
        if (b.type === BlockType.REMINDER && !b.metadata?.completed) {
          reminders.push({
            id: b.id,
            projectId: p.id,
            projectName: p.name,
            text: b.content,
            date: b.metadata?.dueDate || b.createdAt,
            completed: b.metadata?.completed || false
          });
        }
      });
    });
    return reminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <StoreContext.Provider value={{
      projects,
      loading,
      addProject,
      updateProject,
      deleteProject,
      addBlock,
      updateBlock,
      deleteBlock,
      getReminders
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};
