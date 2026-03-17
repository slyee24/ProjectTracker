import React, { useState, useEffect } from 'react';
import { initialProjects, initialTasks, initialMetrics, seedMetricsData, seedTasksData } from './data';
import { officeSeedMetricsData, officeSeedTasksData } from './officeData';
import { Project, Task, AssessmentMetric, AuditLog } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import Assessment from './components/Assessment';
import Checklist from './components/Checklist';
import AuditLogList from './components/AuditLogList';
import Login from './components/Login';
import EditProjectModal from './components/EditProjectModal';
import { Menu, Loader2, Edit2 } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

export type TabType = 'overview' | 'assessment' | 'tasks' | 'checklist' | 'audit';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Removed throw new Error(JSON.stringify(errInfo)); to prevent infinite refresh loops
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const hasAttemptedBootstrap = React.useRef(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<AssessmentMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setProjects([]);
      setTasks([]);
      setMetrics([]);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      if (projectsData.length > 0 && !activeProjectId) {
        setActiveProjectId(projectsData[0].id);
      } else if (projectsData.length === 0 && !hasAttemptedBootstrap.current) {
        // Bootstrap initial data if empty
        hasAttemptedBootstrap.current = true;
        bootstrapInitialData();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects');
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    const unsubMetrics = onSnapshot(collection(db, 'assessments'), (snapshot) => {
      setMetrics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssessmentMetric)));
      setIsLoadingData(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'assessments');
    });

    const unsubLogs = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
      setAuditLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'audit_logs');
    });

    return () => {
      unsubProjects();
      unsubTasks();
      unsubMetrics();
      unsubLogs();
    };
  }, [isAuthReady, user]);

  const bootstrapInitialData = async () => {
    try {
      const batch = writeBatch(db);
      initialProjects.forEach(p => {
        batch.set(doc(db, 'projects', p.id), p);
      });
      initialTasks.forEach(t => {
        batch.set(doc(db, 'tasks', t.id), t);
      });
      initialMetrics.forEach(m => {
        batch.set(doc(db, 'assessments', m.id), m);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bootstrap');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading project data...</p>
        </div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const projectMetrics = metrics.filter(m => m.projectId === activeProjectId);
  const projectAuditLogs = auditLogs.filter(l => l.projectId === activeProjectId);

  const logAction = async (projectId: string, action: string, details: string) => {
    try {
      const newDocRef = doc(collection(db, 'audit_logs'));
      const log: AuditLog = {
        id: newDocRef.id,
        projectId,
        action,
        details,
        timestamp: new Date().toISOString(),
        user: user?.email?.split('@')[0] || 'Unknown User'
      };
      await setDoc(newDocRef, log);
    } catch (error) {
      console.error('Failed to create audit log', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      if (task) {
        await logAction(activeProjectId, 'Task Status Updated', `Task "${task.title}" status changed to ${newStatus}`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'projectId' | 'status'>) => {
    try {
      const newDocRef = doc(collection(db, 'tasks'));
      const newTask: Task = {
        ...newTaskData,
        id: newDocRef.id,
        projectId: activeProjectId,
        status: 'pending',
      };
      await setDoc(newDocRef, newTask);
      await logAction(activeProjectId, 'Task Created', `New task "${newTask.title}" was added`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', updatedTask.id), { ...updatedTask });
      await logAction(activeProjectId, 'Task Updated', `Task "${updatedTask.title}" was updated`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${updatedTask.id}`);
    }
  };

  const handleMetricStatusChange = async (metricId: string, newStatus: AssessmentMetric['status']) => {
    try {
      const metric = metrics.find(m => m.id === metricId);
      await updateDoc(doc(db, 'assessments', metricId), { status: newStatus });
      if (metric) {
        await logAction(activeProjectId, 'Assessment Updated', `Metric "${metric.item}" status changed to ${newStatus}`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assessments/${metricId}`);
    }
  };

  const handleAddMetric = async (newMetricData: Omit<AssessmentMetric, 'id' | 'projectId' | 'status'>) => {
    try {
      const newDocRef = doc(collection(db, 'assessments'));
      const newMetric: AssessmentMetric = {
        ...newMetricData,
        id: newDocRef.id,
        projectId: activeProjectId,
        status: 'pending',
      };
      await setDoc(newDocRef, newMetric);
      await logAction(activeProjectId, 'Assessment Added', `New metric "${newMetric.item}" was added`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assessments');
    }
  };

  const handleUpdateMetric = async (updatedMetric: AssessmentMetric) => {
    try {
      await updateDoc(doc(db, 'assessments', updatedMetric.id), { ...updatedMetric });
      await logAction(activeProjectId, 'Assessment Updated', `Metric "${updatedMetric.item}" was updated`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assessments/${updatedMetric.id}`);
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await updateDoc(doc(db, 'projects', updatedProject.id), { ...updatedProject });
      await logAction(activeProjectId, 'Project Updated', `Project details were updated`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${updatedProject.id}`);
    }
  };

  const handleSeedData = async () => {
    if (!activeProjectId || isSeeding) return;
    
    // Confirm before seeding
    if (!window.confirm('This will add all the assessment items and tasks from the table to the current project. Continue?')) {
      return;
    }

    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      let metricsCount = 0;
      let tasksCount = 0;
      
      const metricsToSeed = activeProject.type === 'office' ? officeSeedMetricsData : seedMetricsData;
      const tasksToSeed = activeProject.type === 'office' ? officeSeedTasksData : seedTasksData;
      
      metricsToSeed.forEach(item => {
        const newDocRef = doc(collection(db, 'assessments'));
        const newMetric: AssessmentMetric = {
          id: newDocRef.id,
          projectId: activeProjectId,
          category: item.category,
          item: item.item,
          vendor: item.vendor,
          status: 'pending',
          notes: '',
        };
        batch.set(newDocRef, newMetric);
        metricsCount++;
      });

      const defaultDueDate = new Date();
      defaultDueDate.setMonth(defaultDueDate.getMonth() + 1);
      const dueDateStr = defaultDueDate.toISOString().split('T')[0];

      tasksToSeed.forEach(item => {
        const newDocRef = doc(collection(db, 'tasks'));
        const newTask: Task = {
          id: newDocRef.id,
          projectId: activeProjectId,
          title: `[${item.originalId}] ${item.title}`,
          description: item.title,
          status: 'pending',
          priority: item.priority as any,
          phase: item.phase as any,
          dueDate: dueDateStr,
          assignee: item.assignee,
          dependencies: item.dependencies,
          isChecklistItem: item.isChecklistItem || false,
        };
        batch.set(newDocRef, newTask);
        tasksCount++;
      });
      
      await batch.commit();
      await logAction(activeProjectId, 'Data Seeded', `Seeded ${metricsCount} assessments and ${tasksCount} tasks`);
      alert(`Successfully added ${metricsCount} assessments and ${tasksCount} tasks!`);
    } catch (error) {
      console.error('Failed to seed data', error);
      alert('Failed to seed data. Check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-500 mb-4">No projects found.</p>
        <button onClick={() => auth.signOut()} className="text-sky-600 hover:underline">Sign out</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto w-full">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{activeProject.name}</h1>
                  <button 
                    onClick={() => setIsEditProjectModalOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit Project Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{activeProject.description}</p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex flex-col sm:items-end gap-2">
              <div>
                <div className="text-xs sm:text-sm font-medium text-slate-900">Target Date</div>
                <div className="text-xs sm:text-sm text-slate-500">{new Date(activeProject.targetDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <Dashboard project={activeProject} tasks={projectTasks} metrics={projectMetrics} />
          )}
          {activeTab === 'assessment' && (
            <Assessment 
              metrics={projectMetrics} 
              onStatusChange={handleMetricStatusChange} 
              onAddMetric={handleAddMetric} 
              onUpdateMetric={handleUpdateMetric}
            />
          )}
          {activeTab === 'tasks' && (
            <TaskList 
              tasks={projectTasks} 
              onStatusChange={handleTaskStatusChange} 
              onAddTask={handleAddTask} 
              onUpdateTask={handleUpdateTask}
            />
          )}
          {activeTab === 'checklist' && (
            <Checklist tasks={projectTasks.filter(t => t.isChecklistItem)} onStatusChange={handleTaskStatusChange} />
          )}
          {activeTab === 'audit' && (
            <AuditLogList logs={projectAuditLogs} />
          )}
        </div>
      </main>

      {isEditProjectModalOpen && (
        <EditProjectModal
          project={activeProject}
          isOpen={isEditProjectModalOpen}
          onClose={() => setIsEditProjectModalOpen(false)}
          onSave={handleUpdateProject}
        />
      )}
    </div>
  );
}
