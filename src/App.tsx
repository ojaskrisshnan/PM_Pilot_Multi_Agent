import { useState, useEffect } from 'react';
import { ProjectStateStore } from './engine/ProjectState';
import { api, type User, type ProjectDto } from './api/client';
import { AuthGate } from './components/AuthGate';
import { ProjectsDashboard } from './components/ProjectsDashboard';
import { WorkflowWorkspace } from './components/WorkflowWorkspace';
import { EmployeeDashboard } from './components/EmployeeDashboard';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then((user) => {
          setCurrentUser(user);
          ProjectStateStore.initFromBackend();
        })
        .catch(() => {
          api.setToken(null);
          setCurrentUser(null);
        })
        .finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleSignOut = () => {
    api.setToken(null);
    setCurrentUser(null);
    setSelectedProject(null);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-zinc-400">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Authenticating Session...
        </span>
      </div>
    );
  }

  // Gate 1: If not signed in, show Auth Gate
  if (!currentUser) {
    return (
      <AuthGate
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          ProjectStateStore.initFromBackend();
        }}
      />
    );
  }

  // Gate 2: If logged in as an Employee, show Employee Domain Workspace
  if (currentUser.role === 'employee') {
    return (
      <EmployeeDashboard
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />
    );
  }

  // Gate 3: If logged in as a Manager / Administrator
  if (!selectedProject) {
    return (
      <ProjectsDashboard
        currentUser={currentUser}
        onSelectProject={(project) => setSelectedProject(project)}
        onSignOut={handleSignOut}
      />
    );
  }

  // Gate 4: Project Workflow & Multi-Agent Execution Workspace
  return (
    <WorkflowWorkspace
      project={selectedProject}
      onBackToProjects={() => setSelectedProject(null)}
    />
  );
}
export default App;
