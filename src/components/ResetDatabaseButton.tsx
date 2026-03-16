import React, { useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function ResetDatabaseButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setIsDeleting(true);
    try {
      const collectionsToDelete = ['projects', 'tasks', 'assessments', 'audit_logs'];
      
      for (const collectionName of collectionsToDelete) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const batch = writeBatch(db);
        
        querySnapshot.docs.forEach((document) => {
          batch.delete(document.ref);
        });
        
        await batch.commit();
      }
      
      // Reload the page to trigger the bootstrap process again if needed
      window.location.reload();
    } catch (error) {
      console.error("Error clearing database:", error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-md transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        Reset Database
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Reset Database</h3>
                <p className="text-sm text-slate-400 mt-1">
                  This will permanently delete all projects, tasks, assessments, and audit logs. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
