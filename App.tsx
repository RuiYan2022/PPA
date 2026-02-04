
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ProjectCard from './components/ProjectCard';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import { ProjectUpdate } from './types';
import { Upload, Database, Download, FileText } from 'lucide-react';

const MOCK_DATA: ProjectUpdate[] = [
  { id: '1', teamMember: 'ManagerA', title: 'Mgr, Program Mgmt Office', date: '2026-02-03', priorityGoal: 'Engagement', initiative: 'Elevate Team engagement', description: 'Kicked off new rewards program and team socials.', health: 1, status: '20%', dueDate: '2026-03-01', feedback: '' },
  { id: '2', teamMember: 'ManagerA', title: 'Mgr, Program Mgmt Office', date: '2026-02-03', priorityGoal: 'Infrastructure', initiative: 'Cloud Migration', description: 'Staging environment is 80% ready, slight delay in DB sync.', health: 0, status: '45%', dueDate: '2026-04-15', feedback: '' },
  { id: '3', teamMember: 'Sarah Jenkins', title: 'Sr. Product Manager', date: '2026-02-01', priorityGoal: 'Customer Growth', initiative: 'Referral Program v2', description: 'Legal approval pending, critical risk for launch date.', health: -1, status: '10%', dueDate: '2026-02-28', feedback: '' },
  { id: '4', teamMember: 'Sarah Jenkins', title: 'Sr. Product Manager', date: '2026-02-01', priorityGoal: 'Engagement', initiative: 'Q1 Newsletter', description: 'Content drafted and ready for review.', health: 1, status: '90%', dueDate: '2026-02-10', feedback: '' },
  { id: '5', teamMember: 'David Chen', title: 'Lead Engineer', date: '2026-02-02', priorityGoal: 'Technical Excellence', initiative: 'API Rate Limiting', description: 'Successfully deployed to production, monitoring results.', health: 1, status: '100%', dueDate: '2026-02-01', feedback: '' },
  { id: '6', teamMember: 'David Chen', title: 'Lead Engineer', date: '2026-02-02', priorityGoal: 'Technical Excellence', initiative: 'Service Mesh Upgrade', description: 'Compatibility issues found during integration testing.', health: 0, status: '30%', dueDate: '2026-03-20', feedback: '' },
  { id: '7', teamMember: 'Elena Rodriguez', title: 'HR Director', date: '2026-01-30', priorityGoal: 'Engagement', initiative: 'Hybrid Work Policy', description: 'Finalizing draft for leadership sign-off.', health: 1, status: '85%', dueDate: '2026-02-15', feedback: '' },
  { id: '8', teamMember: 'Elena Rodriguez', title: 'HR Director', date: '2026-01-30', priorityGoal: 'Hiring', initiative: 'Engineering Pipeline', description: 'Recruiting agency underperforming, falling behind target.', health: -1, status: '15%', dueDate: '2026-03-30', feedback: '' },
  { id: '9', teamMember: 'Tom Baker', title: 'Ops Lead', date: '2026-02-04', priorityGoal: 'Efficiency', initiative: 'Logistics Optimization', description: 'Route algorithms showing 5% fuel savings.', health: 1, status: '60%', dueDate: '2026-05-01', feedback: '' },
  { id: '10', teamMember: 'Tom Baker', title: 'Ops Lead', date: '2026-02-04', priorityGoal: 'Infrastructure', initiative: 'Warehouse expansion', description: 'Zoning permits delayed indefinitely.', health: -1, status: '5%', dueDate: '2026-08-01', feedback: '' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [updates, setUpdates] = useState<ProjectUpdate[]>(() => {
    const saved = localStorage.getItem('ppa_team_data');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });

  useEffect(() => {
    localStorage.setItem('ppa_team_data', JSON.stringify(updates));
  }, [updates]);

  const loadMockData = () => {
    if (window.confirm("Overwrite current data with mockup team data?")) {
      setUpdates(MOCK_DATA);
    }
  };

  const handleFeedbackChange = (id: string, feedback: string) => {
    setUpdates(prev => prev.map(u => u.id === id ? { ...u, feedback } : u));
  };

  const downloadCSV = () => {
    const headers = ["Team Member", "Title", "Date", "Priority/Goal", "Initiative", "Update Description", "Health", "Status", "Due Date", "Meeting Feedback"];
    const rows = updates.map(u => [
      u.teamMember,
      u.title,
      u.date,
      u.priorityGoal,
      u.initiative,
      u.description.replace(/,/g, ';'), // Sanitize commas for CSV
      u.health,
      u.status,
      u.dueDate,
      (u.feedback || '').replace(/,/g, ';').replace(/\n/g, ' ') // Sanitize feedback
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PPA_Meeting_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const newUpdates: ProjectUpdate[] = lines.slice(1).map((line: string, i: number) => {
        const parts: string[] = line.split('\t');
        if (parts.length < 2) return null; // Skip malformed lines
        const [member, title, date, goal, initiative, desc, health, status, due, feedback] = parts.map(s => s?.trim());
        return {
          id: `csv-${i}-${Date.now()}`,
          teamMember: member || 'Unknown',
          title: title || '',
          date: date || new Date().toISOString().split('T')[0],
          priorityGoal: goal || 'Other',
          initiative: initiative || 'Unnamed Project',
          description: desc || '',
          health: parseInt(health || '0') || 0,
          status: status || '0%',
          dueDate: due || '',
          feedback: feedback || ''
        };
      }).filter(Boolean) as ProjectUpdate[];
      
      if (newUpdates.length > 0) {
        setUpdates(newUpdates);
        alert(`${newUpdates.length} updates imported successfully.`);
      }
    };
    reader.readAsText(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard updates={updates} />;
      case 'projects':
        const grouped = updates.reduce((acc, curr) => {
          if (!acc[curr.teamMember]) acc[curr.teamMember] = [];
          acc[curr.teamMember].push(curr);
          return acc;
        }, {} as Record<string, ProjectUpdate[]>);

        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold text-gray-900">Project Review List</h3>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 font-bold"
              >
                <Download size={20} />
                Export Meeting Report
              </button>
            </div>
            {(Object.entries(grouped) as [string, ProjectUpdate[]][]).map(([member, projects]) => (
              <div key={member} className="bg-white/50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-indigo-100 text-lg">
                    {member.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member}</h3>
                    <p className="text-sm text-gray-500 font-medium">{projects[0].title}</p>
                  </div>
                  <div className="ml-auto bg-white px-4 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-500">
                    {projects.length} Updates
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(p => (
                    <ProjectCard 
                      key={p.id} 
                      update={p} 
                      onFeedbackChange={handleFeedbackChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'import':
        return (
          <div className="max-w-xl mx-auto space-y-8 py-12">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Import Team Data</h2>
              <p className="text-gray-500 mb-8">Upload your Excel export (Tab-separated CSV format) to populate the dashboard.</p>
              
              <div className="space-y-4">
                <label className="block w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-100">
                  Choose File
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold tracking-widest">or</span></div>
                </div>

                <button 
                  onClick={loadMockData}
                  className="w-full bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-600 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Database size={20} />
                  Load Sample Data
                </button>
              </div>

              <div className="mt-8 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Format Guide</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
                  Team Member	Title	Date	Project Priority/Goal	Key Initiatives	Update Description	Healthy (-1, 1)	Status	Due Date
                </p>
              </div>
            </div>
          </div>
        );
      case 'chat':
        return <AIChat updates={updates} />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <Layout activeTab={activeTab === 'project-detail' ? 'projects' : activeTab} onTabChange={(tab) => {
      if (tab === 'new-project') setActiveTab('import');
      else setActiveTab(tab);
    }}>
      {renderContent()}
    </Layout>
  );
};

export default App;
