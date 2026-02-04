
import React from 'react';
import { ProjectUpdate } from '../types';
import { Calendar, User, Info, AlertCircle, MessageSquareQuote } from 'lucide-react';

interface ProjectCardProps {
  update: ProjectUpdate;
  onFeedbackChange?: (id: string, feedback: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ update, onFeedbackChange }) => {
  const healthColors = {
    1: { bg: 'bg-green-100', text: 'text-green-700', label: 'Healthy', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
    0: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Potential Issue', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> },
    '-1': { bg: 'bg-red-100', text: 'text-red-700', label: 'Risk/Behind', icon: <AlertCircle size={12} className="text-red-500" /> },
  };

  const health = healthColors[update.health as keyof typeof healthColors] || healthColors[0];
  const progressVal = parseInt(update.status.replace('%', '')) || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-indigo-500 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className={`flex items-center gap-2 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${health.bg} ${health.text}`}>
          {health.icon}
          {health.label}
        </span>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
          {update.priorityGoal}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">{update.initiative}</h3>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <User size={14} className="text-gray-400" />
        <span className="font-semibold text-gray-700">{update.teamMember}</span>
        <span className="text-gray-300">•</span>
        <span>{update.title}</span>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4 italic flex-grow">"{update.description}"</p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Progress</span>
          <span className="font-bold text-gray-900">{update.status}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: update.status }} />
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={14} />
            <span>Due: {update.dueDate}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-300 uppercase font-bold">
            <Info size={12} />
            {update.date}
          </div>
        </div>
      </div>

      {/* Meeting Feedback Section */}
      <div className="mt-auto">
        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          <MessageSquareQuote size={12} className="text-indigo-400" />
          Meeting Feedback
        </label>
        <textarea
          value={update.feedback || ''}
          onChange={(e) => onFeedbackChange?.(update.id, e.target.value)}
          placeholder="Add comments or action items..."
          className="w-full h-24 text-xs p-3 bg-amber-50/50 border border-amber-100 rounded-xl resize-none focus:bg-amber-50 focus:ring-1 focus:ring-amber-200 outline-none transition-all placeholder:italic text-gray-700 leading-relaxed font-medium"
        />
      </div>
    </div>
  );
};

export default ProjectCard;
