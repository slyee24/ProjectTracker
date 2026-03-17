import React from 'react';
import { Project, Task, AssessmentMetric } from '../types';
import { CheckCircle2, Clock, AlertCircle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  project: Project;
  tasks: Task[];
  metrics: AssessmentMetric[];
}

export default function Dashboard({ project, tasks, metrics }: DashboardProps) {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'review').length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const passedMetrics = metrics.filter(m => m.status === 'pass').length;
  const totalMetrics = metrics.length;
  const healthScore = totalMetrics === 0 ? 0 : Math.round((passedMetrics / totalMetrics) * 100);

  const stats = [
    { label: 'Overall Progress', value: `${progress}%`, icon: Activity, color: 'text-sky-500', bg: 'bg-sky-50' },
    { label: 'Tasks Completed', value: `${completedTasks} / ${totalTasks}`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'In Progress', value: inProgressTasks, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Assessments Passed', value: `${passedMetrics} / ${totalMetrics}`, icon: AlertCircle, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const pieData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' }, // emerald-500
    { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' }, // amber-500
    { name: 'Review', value: reviewTasks, color: '#a855f7' }, // purple-500
    { name: 'Pending', value: pendingTasks, color: '#94a3b8' }, // slate-400
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Task Status Distribution</h3>
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {totalTasks > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} Tasks`, 'Count']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 w-full flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
                No tasks available
              </div>
            )}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Manager</span>
                <span className="font-medium text-slate-900">{project.manager}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">Target Date</span>
                <span className="font-medium text-slate-900">{new Date(project.targetDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'completed' ? 'bg-emerald-500' : 
                    task.status === 'in-progress' ? 'bg-amber-500' : 
                    task.status === 'review' ? 'bg-purple-500' : 'bg-slate-300'
                  }`} />
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{task.title}</span>
                </div>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  {task.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
