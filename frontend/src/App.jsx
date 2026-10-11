import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import EditTaskModal from './components/EditTaskModal';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Toast from './components/Toast';
import {
  getStoredUser,
  removeToken,
  getMeAPI,
  getToken,
  fetchTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI
} from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [editingTask, setEditingTask] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Sync token profile
  useEffect(() => {
    if (getToken()) {
      getMeAPI()
        .then((profile) => setUser(profile))
        .catch(() => {
          removeToken();
          setUser(null);
        });
    }
  }, []);

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }
    try {
      const data = await fetchTasksAPI({
        completed: filter === 'all' ? '' : (filter === 'completed' ? 'true' : 'false'),
        search
      });
      setTasks(data);
    } catch (err) {
      if (err.message === '401_UNAUTHORIZED') {
        setUser(null);
        setIsAuthOpen(true);
        showToast('Session expired. Please log in again.', 'error');
      } else {
        showToast(err.message, 'error');
      }
    }
  }, [user, filter, search]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    showToast(`Welcome ${authenticatedUser.name}! JWT token issued.`, 'success');
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setTasks([]);
    showToast('Logged out. Token cleared from localStorage.', 'success');
  };

  const handleCreateTask = async (taskData) => {
    await createTaskAPI(taskData);
    showToast('Task added successfully to MongoDB!', 'success');
    loadTasks();
  };

  const handleToggleComplete = async (id, completed) => {
    await updateTaskAPI(id, { completed });
    loadTasks();
  };

  const handleSaveEditedTask = async (id, updates) => {
    await updateTaskAPI(id, updates);
    showToast('Task updated successfully!', 'success');
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    await deleteTaskAPI(id);
    showToast('Task deleted successfully.', 'success');
    loadTasks();
  };

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="app-content">
        {/* Student Credentials Banner */}
        <section className="student-hero">
          <div className="hero-text">
            <h2>Practical 7: Authentication & Middleware Pipeline</h2>
            <p>
              Student Name: <strong>Maitri Sheta</strong> &bull; ID: <strong>D25CS120</strong> &bull; Department of CSE
            </p>
          </div>
          <div className="hero-specs">
            <span className="spec-badge">bcrypt Password Hashing (10 Rounds)</span>
            <span className="spec-badge">JWT Token Generation (1h Expiry)</span>
            <span className="spec-badge">Protected Express Middleware Pipeline</span>
          </div>
        </section>

        {!user ? (
          <div className="protected-gate-card">
            <div className="gate-icon">🔒</div>
            <h3>Authentication Required to Access Tasks</h3>
            <p>
              In accordance with Practical 7 objectives, all task endpoints are secured with an
              <strong> Express Authentication Middleware</strong> that requires a valid JWT token in the
              <code>Authorization: Bearer &lt;token&gt;</code> header.
            </p>
            <div className="gate-actions">
              <button className="gate-login-btn" onClick={() => setIsAuthOpen(true)}>
                Sign In / Register as Maitri Sheta
              </button>
            </div>
          </div>
        ) : (
          <div className="workspace-view">
            <div className="workspace-header">
              <div>
                <h3>My Task Dashboard</h3>
                <p>MongoDB documents linked to User ID: <code>{user._id || user.id}</code></p>
              </div>
              <div className="status-pill">
                <span className="pulse-dot"></span> Authenticated via JWT
              </div>
            </div>

            <TaskForm
              onTaskCreated={handleCreateTask}
              onError={(msg) => showToast(msg, 'error')}
            />

            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEditTask={(task) => setEditingTask(task)}
              onDeleteTask={handleDeleteTask}
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
            />
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <EditTaskModal
        isOpen={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditedTask}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default App;
