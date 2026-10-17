import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import ChartsView from './components/ChartsView';
import TaskModal from './components/TaskModal';
import NotificationToast from './components/NotificationToast';
import AuthView from './components/AuthView';
import { 
  fetchTasks, 
  fetchDashboard, 
  fetchHealth, 
  createTask, 
  updateTask, 
  deleteTask,
  getStoredUser,
  getStoredToken,
  fetchCurrentStudent,
  clearStoredSession
} from './services/api';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Application Data State
  const [tasks, setTasks] = useState([]);
  const [allTasksForSubjects, setAllTasksForSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    subject: 'all',
    priority: 'all',
    deadline: 'all'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Verify stored session on app mount
  useEffect(() => {
    async function verifySession() {
      const token = getStoredToken();
      if (!token) {
        setCurrentUser(null);
        setIsAuthLoading(false);
        return;
      }
      try {
        const user = await fetchCurrentStudent();
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    verifySession();

    // Listen for auth expiration events
    const handleExpired = () => {
      setCurrentUser(null);
      showToast('Your session has expired. Please sign in again.', 'info');
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  // Check health periodically regardless of auth state
  useEffect(() => {
    async function checkHealth() {
      try {
        const h = await fetchHealth();
        setHealth(h);
      } catch (e) {}
    }
    checkHealth();
  }, []);

  // Load health & stats for authenticated student
  const loadStats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const statsData = await fetchDashboard();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }, [currentUser]);

  // Load tasks based on filters for authenticated student
  const loadTasks = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const data = await fetchTasks(filters);
      setTasks(data);

      if (filters.subject === 'all' && filters.status === 'all' && filters.priority === 'all' && filters.deadline === 'all' && !filters.search) {
        setAllTasksForSubjects(data);
      }
    } catch (err) {
      showToast(err.message || 'Error loading tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadStats();
      loadTasks();
    }
  }, [currentUser, loadStats, loadTasks]);

  // Handle student login / registration success
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome, ${user.name}! You are now signed in.`, 'success');
  };

  // Handle student logout
  const handleLogout = () => {
    clearStoredSession();
    setCurrentUser(null);
    setTasks([]);
    setAllTasksForSubjects([]);
    setStats(null);
    handleResetFilters();
    showToast('You have been logged out successfully.', 'info');
  };

  // Derived subjects list for filter dropdown
  const subjects = useMemo(() => {
    const source = allTasksForSubjects.length > 0 ? allTasksForSubjects : tasks;
    const set = new Set();
    source.forEach(t => {
      if (t.subject && t.subject.trim()) {
        set.add(t.subject.trim());
      }
    });
    return Array.from(set).sort();
  }, [allTasksForSubjects, tasks]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      subject: 'all',
      priority: 'all',
      deadline: 'all'
    });
  };

  // Task CRUD operations
  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
        showToast('Task updated successfully!', 'success');
      } else {
        await createTask(formData);
        showToast('Task created successfully!', 'success');
      }
      await loadTasks();
      await loadStats();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      showToast('Task deleted successfully', 'info');
      await loadTasks();
      await loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await updateTask(task.id, { status: nextStatus });
      showToast(`Task marked as ${nextStatus}`, 'success');
      await loadTasks();
      await loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const isFiltered = 
    Boolean(filters.search) || 
    filters.status !== 'all' || 
    filters.subject !== 'all' || 
    filters.priority !== 'all' || 
    filters.deadline !== 'all';

  // Loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner"></div>
        <p>Connecting to Student Task Manager...</p>
      </div>
    );
  }

  // If not authenticated, render the secure student sign-in / registration view
  if (!currentUser) {
    return (
      <div className="app-container">
        <AuthView onAuthSuccess={handleAuthSuccess} />
        <NotificationToast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navbar with Student Profile & Logout */}
      <Navbar 
        onAddTask={handleOpenAddModal} 
        health={health}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="main-content">
        {/* Dashboard Statistics & Progress */}
        <DashboardStats stats={stats} />

        {/* Content Split: Tasks and Sidebar */}
        <div className="content-grid">
          {/* Left Column: Filters and Task List */}
          <div>
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              subjects={subjects}
              onReset={handleResetFilters}
            />

            <TaskList
              tasks={tasks}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
              onAddTask={handleOpenAddModal}
              isFiltered={isFiltered}
            />
          </div>

          {/* Right Column: Deadlines and Visual Analytics */}
          <aside className="sidebar-wrapper">
            <UpcomingDeadlines 
              deadlines={stats?.upcomingDeadlines || []} 
              onToggleComplete={handleToggleStatus}
            />

            <ChartsView stats={stats} />
          </aside>
        </div>
      </main>

      {/* Modal for Add / Edit */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
      />

      {/* Notification Toast */}
      <NotificationToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
