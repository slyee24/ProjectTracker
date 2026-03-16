import React from 'react';
import { Task } from '../types';
import { Check, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChecklistProps {
  tasks: Task[];
  onStatusChange: (id: string, status: Task['status']) => void;
}

export default function Checklist({ tasks, onStatusChange }: ChecklistProps) {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Final Handover Checklist</h2>
          <p className="text-sm text-slate-500 mt-1">Critical items that must be verified before project completion.</p>
          
          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Checklist Progress</span>
              <span className="text-slate-500 font-medium">{completedCount} of {totalCount} completed ({progress}%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No checklist items defined for this project.</p>
          </div>
        ) : (
          tasks.map(task => {
            const isCompleted = task.status === 'completed';
            return (
              <div 
                key={task.id} 
                className={cn(
                  "bg-white p-5 rounded-xl border shadow-sm flex items-start gap-4 transition-all",
                  isCompleted ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-sky-300"
                )}
              >
                <button
                  onClick={() => onStatusChange(task.id, isCompleted ? 'pending' : 'completed')}
                  className={cn(
                    "mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500",
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "bg-white border-slate-300 text-transparent hover:border-sky-500"
                  )}
                >
                  <Check className="w-4 h-4" />
                </button>
                
                <div className="flex-1">
                  <h3 className={cn(
                    "text-base font-medium transition-colors",
                    isCompleted ? "text-slate-500 line-through" : "text-slate-900"
                  )}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                      Assignee: {task.assignee}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
