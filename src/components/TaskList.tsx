import React, { useState } from 'react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { Edit2, Clock, Filter, Lock, Link as LinkIcon, MessageSquare } from 'lucide-react';
import TaskModal from './TaskModal';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: Task['status']) => void;
  onAddTask: (task: Omit<Task, 'id' | 'projectId' | 'status'>) => void;
  onUpdateTask: (task: Task) => void;
}

export default function TaskList({ tasks, onStatusChange, onAddTask, onUpdateTask }: TaskListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<Task['phase'] | 'all'>('all');

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee))).filter(Boolean).sort();
  const phases: (Task['phase'] | 'all')[] = ['all', 'assessment', 'planning', 'renovation', 'procurement', 'staffing', 'handover'];

  const filteredTasks = tasks.filter(task => {
    const matchStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;
    const matchPhase = phaseFilter === 'all' || task.phase === phaseFilter;
    return matchStatus && matchPriority && matchAssignee && matchPhase;
  });

  const handleOpenNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSave = (taskData: any) => {
    if (editingTask) {
      onUpdateTask(taskData);
    } else {
      onAddTask(taskData);
    }
    setIsModalOpen(false);
  };
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'in-progress': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'review': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'pending': return 'text-slate-700 bg-slate-50 border-slate-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getPhaseColor = (phase: Task['phase']) => {
    switch (phase) {
      case 'assessment': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'renovation': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'procurement': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'staffing': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'handover': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Project Tasks</h2>
          <p className="text-sm text-slate-500 mt-1">Manage all tasks across different phases.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Add Task
        </button>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar bg-slate-50/50 px-4 sm:px-6">
        {phases.map(phase => (
          <button
            key={phase}
            onClick={() => setPhaseFilter(phase)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors capitalize",
              phaseFilter === phase 
                ? "border-sky-500 text-sky-600" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {phase === 'all' ? 'All Phases' : phase}
          </button>
        ))}
      </div>

      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="w-4 h-4" />
          Filters:
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Task['status'] | 'all')}
            className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 py-1.5 pl-3 pr-8"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Task['priority'] | 'all')}
            className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 py-1.5 pl-3 pr-8"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 py-1.5 pl-3 pr-8"
          >
            <option value="all">All Assignees</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 bg-slate-50/50">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            No tasks found matching the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const incompleteDependencies = task.dependencies?.filter(depId => {
                const depTask = tasks.find(t => t.id === depId);
                return depTask && depTask.status !== 'completed';
              }) || [];
              const isBlocked = incompleteDependencies.length > 0;

              return (
              <div 
                key={task.id} 
                onClick={() => handleOpenEdit(task)}
                className="bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-sky-200 transition-all cursor-pointer flex flex-col group overflow-hidden"
              >
                <div className={cn("px-5 py-3 border-b flex justify-between items-start gap-3", getPhaseColor(task.phase))}>
                  <div>
                    {phaseFilter === 'all' && (
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-80 block mb-1">
                        {task.phase}
                      </span>
                    )}
                    <h3 className="font-medium line-clamp-2">{task.title}</h3>
                  </div>
                  <div onClick={(e) => {
                    e.stopPropagation();
                    if (isBlocked) {
                      alert(`This task is blocked by ${incompleteDependencies.length} incomplete dependenc${incompleteDependencies.length > 1 ? 'ies' : 'y'}.`);
                    }
                  }}>
                    <select
                      value={task.status}
                      disabled={isBlocked}
                      onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
                      className={cn(
                        "text-xs font-medium border rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 py-1 pl-2 pr-6 uppercase tracking-wider appearance-none bg-white",
                        isBlocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                        getStatusColor(task.status)
                      )}
                    >
                      <option value="pending">PENDING</option>
                      <option value="in-progress">IN PROGRESS</option>
                      <option value="review">REVIEW</option>
                      <option value="completed">COMPLETED</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>

                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-medium mb-3">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className={isBlocked ? "text-amber-600" : "text-emerald-600"}>
                        {isBlocked ? `Blocked by ${incompleteDependencies.length} task(s)` : 'Dependencies met'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium border uppercase tracking-wider", getPriorityColor(task.priority))}>
                      {task.priority}
                    </span>
                    
                    {task.notesList && task.notesList.length > 0 && (
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {task.notesList.length}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded ml-auto">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    Assignee: <span className="font-medium text-slate-700">{task.assignee}</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
      
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingTask}
        tasks={tasks}
      />
    </div>
  );
}
