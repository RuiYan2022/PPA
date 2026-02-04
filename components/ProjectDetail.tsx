
import React, { useState } from 'react';
import { Project, Task } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Calendar, 
  StickyNote,
  Save,
  Loader2
} from 'lucide-react';
import { getProjectSuggestions } from '../services/geminiService';

interface ProjectDetailProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onUpdate, onDelete, onBack }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [editingNotes, setEditingNotes] = useState(project.notes);

  const toggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdate({ ...project, tasks: updatedTasks });
  };

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      completed: false,
    };
    onUpdate({ ...project, tasks: [...project.tasks, newTask] });
    setNewTaskTitle('');
  };

  const removeTask = (taskId: string) => {
    const updatedTasks = project.tasks.filter(t => t.id !== taskId);
    onUpdate({ ...project, tasks: updatedTasks });
  };

  const handleAISuggestions = async () => {
    setIsSuggesting(true);
    try {
      const suggestions = await getProjectSuggestions(project);
      const newTasks: Task[] = suggestions.map(title => ({
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false
      }));
      onUpdate({ ...project, tasks: [...project.tasks, ...newTasks] });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const saveNotes = () => {
    onUpdate({ ...project, notes: editingNotes });
  };

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const progressPercent = project.tasks.length === 0 ? 0 : Math.round((completedTasks / project.tasks.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to projects</span>
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (window.confirm('Delete this project?')) onDelete(project.id);
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-indigo-50/50 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">{project.name}</h1>
            <select 
              value={project.status}
              onChange={(e) => onUpdate({ ...project, status: e.target.value as any })}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">{project.description}</p>
          
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-indigo-700">Project Progress</span>
                <span className="text-sm font-bold text-gray-900">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-700 ease-out" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
            <div className="flex items-center gap-6 px-6 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Tasks</p>
                <p className="text-xl font-bold text-gray-900">{project.tasks.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Done</p>
                <p className="text-xl font-bold text-green-600">{completedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          <TabButton 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')} 
            icon={<CheckCircle2 size={18} />} 
            label="Tasks" 
          />
          <TabButton 
            active={activeTab === 'notes'} 
            onClick={() => setActiveTab('notes')} 
            icon={<StickyNote size={18} />} 
            label="Notes" 
          />
        </div>

        <div className="p-8">
          {activeTab === 'tasks' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-xl">Task List</h3>
                <button 
                  onClick={handleAISuggestions}
                  disabled={isSuggesting}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm bg-indigo-50 px-4 py-2 rounded-lg transition-all border border-indigo-100 disabled:opacity-50"
                >
                  {isSuggesting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Suggest with AI
                </button>
              </div>

              <form onSubmit={addTask} className="flex gap-2">
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Plus size={24} />
                </button>
              </form>

              <div className="space-y-3">
                {project.tasks.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-medium">No tasks yet. Start by adding one or use AI suggestions!</p>
                  </div>
                ) : (
                  project.tasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                        task.completed 
                          ? 'bg-gray-50 border-gray-100 grayscale-[0.5] opacity-80' 
                          : 'bg-white border-gray-200 hover:border-indigo-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                        <div className={`transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-indigo-400'}`}>
                          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                        <span className={`text-lg transition-all ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                          {task.title}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-xl">Project Notes</h3>
                <button 
                  onClick={saveNotes}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium"
                >
                  <Save size={18} />
                  Save Notes
                </button>
              </div>
              <textarea 
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Write down any ideas, research links, or technical details here..."
                className="w-full h-80 bg-gray-50 border border-gray-200 rounded-2xl p-6 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-gray-700 leading-relaxed font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-all font-semibold ${
      active 
        ? 'border-indigo-500 text-indigo-600 bg-indigo-50/20' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default ProjectDetail;
