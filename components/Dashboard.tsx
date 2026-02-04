
import React from 'react';
import { ProjectUpdate } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, AlertTriangle, CheckCircle, TrendingUp, Calendar, Zap } from 'lucide-react';

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
    { name: 'Warning', value: healthStats.warning, color: '#f59e0b' },
    { name: 'Critical', value: healthStats.risk, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const goalMap = new Map<string, { total: number, count: number }>();
  updates.forEach(u => {
    const current = goalMap.get(u.priorityGoal) || { total: 0, count: 0 };
    const progressVal = parseInt(u.status.replace('%', '')) || 0;
    goalMap.set(u.priorityGoal, { total: current.total + progressVal, count: current.count + 1 });
  });

  const goalData = Array.from(goalMap.entries()).map(([name, stats]) => ({
    name,
    avgProgress: Math.round(stats.total / stats.count)
  })).sort((a, b) => b.avgProgress - a.avgProgress);

  const totalAvgProgress = updates.length > 0 
    ? Math.round(updates.reduce((acc, curr) => acc + (parseInt(curr.status.replace('%', '')) || 0), 0) / updates.length)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="text-indigo-600" />} 
          label="Team Members" 
          value={new Set(updates.map(u => u.teamMember)).size} 
          color="indigo"
        />
        <StatCard 
          icon={<Zap className="text-violet-600" />} 
          label="Total Initiatives" 
          value={updates.length} 
          color="violet"
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-600" />} 
          label="Avg Progress" 
          value={`${totalAvgProgress}%`} 
          color="emerald"
        />
        <StatCard 
          icon={<AlertTriangle className="text-rose-600" />} 
          label="Critical Risks" 
          value={healthStats.risk} 
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Portfolio Health</h3>
            <div className="p-2 bg-slate-50 rounded-lg"><Calendar size={16} className="text-slate-400" /></div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={healthData} 
                  cx="50%" cy="50%" 
                  innerRadius={65} 
                  outerRadius={85} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {healthData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {healthData.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-bold text-gray-600">{entry.name}</span>
                </div>
                <span className="text-xs font-black text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Goal Performance</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2 py-1 rounded-md uppercase tracking-tighter">Live Aggregate</span>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalData} layout="vertical" margin={{ left: 20, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  fontSize={11} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="avgProgress" 
                  fill="#6366f1" 
                  radius={[0, 10, 10, 0]} 
                  barSize={24}
                >
                  {goalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgProgress > 70 ? '#10b981' : entry.avgProgress > 40 ? '#6366f1' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => {
  const colors = {
    indigo: 'bg-indigo-50/50 border-indigo-100',
    violet: 'bg-violet-50/50 border-violet-100',
    emerald: 'bg-emerald-50/50 border-emerald-100',
    rose: 'bg-rose-50/50 border-rose-100',
  }[color as any] || 'bg-gray-50 border-gray-100';

  return (
    <div className={`p-6 rounded-3xl border ${colors} shadow-sm transition-all hover:scale-[1.02] cursor-default`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-inherit">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
