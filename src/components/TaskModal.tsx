import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskPhase, Note } from '../types';
import { X, ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  initialData?: Task | null;
  tasks: Task[];
}

export default function TaskModal({ isOpen, onClose, onSave, initialData, tasks }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [phase, setPhase] = useState<TaskPhase>('planning');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [isChecklistItem, setIsChecklistItem] = useState(false);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPriority(initialData.priority);
      setPhase(initialData.phase);
      setDueDate(initialData.dueDate);
      setAssignee(initialData.assignee);
      setIsChecklistItem(initialData.isChecklistItem || false);
      setDependencies(initialData.dependencies || []);
      setNotesList(initialData.notesList || []);
    } else if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setPhase('planning');
      setDueDate('');
      setAssignee('');
      setIsChecklistItem(false);
      setDependencies([]);
      setNotesList([]);
    }
    setNewNoteText('');
    setExpandedNoteIds(new Set());
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleNoteExpand = (id: string) => {
    const newSet = new Set(expandedNoteIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedNoteIds(newSet);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
      timestamp: new Date().toISOString(),
    };
    setNotesList([newNote, ...notesList]);
    setNewNoteText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's text in the new note field but they didn't click "Add Note", add it automatically
    let finalNotesList = [...notesList];
    if (newNoteText.trim()) {
      finalNotesList = [{
        id: Date.now().toString(),
        text: newNoteText.trim(),
        timestamp: new Date().toISOString(),
      }, ...finalNotesList];
    }

    if (initialData) {
      onSave({
        ...initialData,
        title,
        description,
        priority,
        phase,
        dueDate,
        assignee,
        isChecklistItem,
        dependencies,
        notesList: finalNotesList,
      });
    } else {
      onSave({
        title,
        description,
        priority,
        phase,
        dueDate,
        assignee,
        isChecklistItem,
        dependencies,
        notesList: finalNotesList,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task Title *</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="e.g., Inspect lobby lighting"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
              placeholder="Provide task details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phase</label>
              <select 
                value={phase}
                onChange={(e) => setPhase(e.target.value as TaskPhase)}
                className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="assessment">Assessment</option>
                <option value="planning">Planning</option>
                <option value="procurement">Procurement</option>
                <option value="renovation">Renovation</option>
                <option value="staffing">Staffing</option>
                <option value="handover">Handover</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
              <input 
                type="date" 
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee *</label>
              <input 
                type="text" 
                required
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                placeholder="Name or Department"
              />
            </div>
          </div>

          <div className="flex items-center mt-2">
            <input 
              type="checkbox" 
              id="isChecklistItem"
              checked={isChecklistItem}
              onChange={(e) => setIsChecklistItem(e.target.checked)}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <label htmlFor="isChecklistItem" className="ml-2 block text-sm text-slate-700">
              Include in Final Handover Checklist
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dependencies (Must be completed first)</label>
            <div className="border border-slate-300 rounded-md shadow-sm max-h-32 overflow-y-auto p-2 space-y-1">
              {tasks.filter(t => t.id !== initialData?.id).length === 0 ? (
                <div className="text-sm text-slate-500 italic px-2">No other tasks available</div>
              ) : (
                tasks.filter(t => t.id !== initialData?.id).map(task => (
                  <label key={task.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={dependencies.includes(task.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDependencies([...dependencies, task.id]);
                        } else {
                          setDependencies(dependencies.filter(id => id !== task.id));
                        }
                      }}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                    />
                    <span className="text-sm text-slate-700 truncate">{task.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            
            <div className="flex gap-2 mb-4">
              <textarea 
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 min-h-[40px] resize-y"
                placeholder="Add a new note..."
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="px-3 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 h-fit"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {notesList.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {notesList.map((note) => {
                  const isExpanded = expandedNoteIds.has(note.id);
                  const lines = note.text.split('\n');
                  const isMultiline = lines.length > 1 || note.text.length > 60;
                  const displayLine = lines[0].length > 60 ? lines[0].substring(0, 60) + '...' : lines[0];

                  return (
                    <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-md p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 mb-1">
                            {new Date(note.timestamp).toLocaleString()}
                          </div>
                          <div className={`text-sm text-slate-700 whitespace-pre-wrap ${!isExpanded && isMultiline ? 'line-clamp-1' : ''}`}>
                            {isExpanded ? note.text : (isMultiline ? displayLine : note.text)}
                          </div>
                        </div>
                        {isMultiline && (
                          <button
                            type="button"
                            onClick={() => toggleNoteExpand(note.id)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              {initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
