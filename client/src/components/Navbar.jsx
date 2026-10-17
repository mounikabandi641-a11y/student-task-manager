import React from 'react';
import { GraduationCap, Plus, LogOut, UserCheck } from 'lucide-react';
import DbStatusBadge from './DbStatusBadge';

export default function Navbar({ onAddTask, health, currentUser, onLogout }) {
  // Extract student initials
  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={26} />
          </div>
          <div className="brand-text">
            <h1>Student Task Manager</h1>
            <span>Academic Planner & Deadlines</span>
          </div>
        </div>

        <div className="navbar-actions">
          <DbStatusBadge health={health} />

          {/* Student Profile Pill */}
          {currentUser && (
            <div className="student-profile-pill" title={`Logged in as ${currentUser.email}`}>
              <div className="student-avatar-badge">{initials}</div>
              <div className="student-name-box">
                <span className="student-name">{currentUser.name}</span>
                <span className="student-role">Student</span>
              </div>
            </div>
          )}

          <button 
            id="btn-add-task" 
            className="btn btn-primary"
            onClick={onAddTask}
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button 
              id="btn-logout"
              type="button"
              className="btn btn-secondary btn-logout"
              onClick={onLogout}
              title="Sign Out of Student Account"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
