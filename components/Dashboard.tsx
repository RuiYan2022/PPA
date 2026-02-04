
import React from 'react';
import { ProjectUpdate } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  updates: ProjectUpdate[];
}

const Dashboard: React.FC<DashboardProps> = ({ updates }) => {
  const healthStats = {
    healthy: updates.filter(u => u.health === 1).length,
    warning: updates.filter(u => u.health === 0).length,
    risk: updates.filter(u => u.health === -1).length,
  };

  const healthData = [
    { name: 'Healthy', value: healthStats.healthy, color: '#10b981' },
    { name: 'Potential Issue', value: healthStats.warning, color: '#f59e0b' },
    { name: 'Risk/Behind', value: healthStats.risk, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Group by Priority/Goal for the bar chart
  const goalMap = new Map<string, { total: number, count: number }>();
  updates.forEach(u => {
    const current = goalMap.get(u.priorityGoal) || { total: 0, count: 0 };
    const progressVal = parseInt(u.status.replace('%', '')) || 0;
    goalMap.set(u.priorityGoal, { total: current.total + progressVal, count: current.count + 1 });
  });

  const goalData = Array.from(goalMap.entries()).map(([name, stats]) => ({
    name,
    avgProgress: Math.round(stats.total / stats.count)
  }));

  const totalAvgProgress = updates.length > 0 
    ? Math.round(updates.reduce((acc, curr) => acc + (parseInt(curr.status.replace('%', '')) || 0), 0) / updates.length)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-blue-500" />} label="Team Members" value={new Set(updates.map(u => u.teamMember)).size} />
        <StatCard icon={<TrendingUp className="text-indigo-500" />} label="Avg Team Progress" value={`${totalAvgProgress}%`} />
        <StatCard icon={<CheckCircle className="text-green-500" />} label="Healthy Projects" value={healthStats.healthy} />
        <StatCard icon={<AlertTriangle className="text-red-500" />} label="At Risk" value={healthStats.risk} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-800">Team Health Index</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {healthData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {healthData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-semibold text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-800">Avg Progress by Goal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="avgProgress" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
