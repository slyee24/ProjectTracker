import React, { useState } from 'react';
import { AssessmentMetric } from '../types';
import { CheckCircle2, XCircle, Clock, HelpCircle, Edit2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import AssessmentModal from './AssessmentModal';

interface AssessmentProps {
  metrics: AssessmentMetric[];
  onStatusChange: (id: string, status: AssessmentMetric['status']) => void;
  onAddMetric: (metric: Omit<AssessmentMetric, 'id' | 'projectId' | 'status'>) => void;
  onUpdateMetric: (metric: AssessmentMetric) => void;
}

export default function Assessment({ metrics, onStatusChange, onAddMetric, onUpdateMetric }: AssessmentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<AssessmentMetric | null>(null);

  const handleOpenNew = () => {
    setEditingMetric(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (metric: AssessmentMetric) => {
    setEditingMetric(metric);
    setIsModalOpen(true);
  };

  const handleSave = (metricData: any) => {
    if (editingMetric) {
      onUpdateMetric(metricData);
    } else {
      onAddMetric(metricData);
    }
    setIsModalOpen(false);
  };
  const getStatusIcon = (status: AssessmentMetric['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <HelpCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: AssessmentMetric['status']) => {
    switch (status) {
      case 'pass': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fail': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Structural': 'bg-stone-100 text-stone-800 border-stone-200',
      'Systems': 'bg-blue-100 text-blue-800 border-blue-200',
      'Safety': 'bg-red-100 text-red-800 border-red-200',
      'Aesthetics': 'bg-purple-100 text-purple-800 border-purple-200',
      'Water & Plumbing': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'HVAC & Cooling': 'bg-sky-100 text-sky-800 border-sky-200',
      'Electrical & Power': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Fire & Life Safety': 'bg-rose-100 text-rose-800 border-rose-200',
      'Kitchen & F&B': 'bg-orange-100 text-orange-800 border-orange-200',
      'Leisure & General': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return colors[category] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  // Group metrics by category
  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, AssessmentMetric[]>);

  const categories = Object.keys(groupedMetrics).sort();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Current Status Assessment</h2>
          <p className="text-sm text-slate-500 mt-1">Evaluate and track the condition of key project components.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Add Assessment
        </button>
      </div>
      
      <div className="p-4 sm:p-6 bg-slate-50/50">
        {metrics.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            No assessment metrics found for this project.
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedMetrics[category].map((metric) => (
                    <div 
                      key={metric.id} 
                      onClick={() => handleOpenEdit(metric)}
                      className="bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-sky-200 transition-all cursor-pointer flex flex-col group overflow-hidden"
                    >
                      <div className={cn("px-5 py-3 border-b flex justify-between items-start gap-3", getCategoryColor(metric.category))}>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{metric.category}</span>
                          <h3 className="font-medium mt-1">{metric.item}</h3>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={metric.status}
                            onChange={(e) => onStatusChange(metric.id, e.target.value as AssessmentMetric['status'])}
                            className={cn(
                              "text-xs font-medium border rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 py-1 pl-2 pr-6 uppercase tracking-wider cursor-pointer appearance-none bg-white",
                              getStatusBadge(metric.status)
                            )}
                          >
                            <option value="pending">PENDING</option>
                            <option value="pass">PASS</option>
                            <option value="fail">FAIL</option>
                            <option value="n/a">N/A</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        {metric.vendor && (
                          <p className="text-xs text-slate-500">Vendor: <span className="font-medium text-slate-700">{metric.vendor}</span></p>
                        )}
                        <div className="bg-slate-50 rounded-lg p-3 flex-1">
                          {metric.notesList && metric.notesList.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {metric.notesList.length} Note{metric.notesList.length !== 1 ? 's' : ''} (Latest: {new Date(metric.notesList[0].timestamp).toLocaleDateString()})
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2 italic">
                                "{metric.notesList[0].text}"
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-600 line-clamp-3 italic">
                              {metric.notes ? `"${metric.notes}"` : 'No notes provided.'}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-100">
                          {getStatusIcon(metric.status)}
                          <span className="text-sm font-medium capitalize text-slate-700">
                            {metric.status === 'n/a' ? 'Not Applicable' : `${metric.status} Status`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <AssessmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingMetric}
      />
    </div>
  );
}
