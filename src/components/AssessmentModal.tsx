import React, { useState, useEffect } from 'react';
import { AssessmentMetric, Note } from '../types';
import { X, ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metric: any) => void;
  initialData?: AssessmentMetric | null;
}

export default function AssessmentModal({ isOpen, onClose, onSave, initialData }: AssessmentModalProps) {
  const [category, setCategory] = useState('');
  const [item, setItem] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState(''); // Legacy notes field
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && initialData) {
      setCategory(initialData.category);
      setItem(initialData.item);
      setVendor(initialData.vendor || '');
      setNotes(initialData.notes);
      setNotesList(initialData.notesList || []);
    } else if (isOpen) {
      setCategory('');
      setItem('');
      setVendor('');
      setNotes('');
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
        category,
        item,
        vendor,
        notes,
        notesList: finalNotesList,
      });
    } else {
      onSave({
        category,
        item,
        vendor,
        notes,
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
            {initialData ? 'Edit Assessment' : 'Add Status Assessment'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <input 
              type="text" 
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="e.g., Structural, Safety, Systems"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Item *</label>
            <input 
              type="text" 
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="e.g., Foundation Integrity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vendor / Contact</label>
            <input 
              type="text" 
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="e.g., Internal, VP Pine Co.,Ltd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Legacy Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 min-h-[60px]"
              placeholder="Legacy notes..."
            />
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
              {initialData ? 'Save Changes' : 'Add Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
