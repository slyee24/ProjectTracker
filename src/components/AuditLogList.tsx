import React from 'react';
import { AuditLog } from '../types';
import { History, Clock, User } from 'lucide-react';

interface AuditLogListProps {
  logs: AuditLog[];
}

export default function AuditLogList({ logs }: AuditLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No activity yet</h3>
        <p className="text-slate-500 text-sm">
          Actions taken on this project will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          Audit Log
        </h2>
      </div>
      <div className="divide-y divide-slate-100">
        {logs.map((log) => (
          <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-1">{log.action}</h4>
                <p className="text-sm text-slate-600">{log.details}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-slate-500 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                  <User className="w-3.5 h-3.5" />
                  {log.user}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
