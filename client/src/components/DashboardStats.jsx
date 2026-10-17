import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Layers, TrendingUp } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const {
    totalTasks = 0,
    pendingTasks = 0,
    completedTasks = 0,
    overdueTasks = 0,
    completionRate = 0
  } = stats || {};

  return (
    <div>
      {/* 4 Core Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-info">
            <span>Total Tasks</span>
            <h2>{totalTasks}</h2>
          </div>
          <div className="stat-icon-wrapper">
            <Layers size={26} />
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-info">
            <span>Pending Tasks</span>
            <h2>{pendingTasks}</h2>
          </div>
          <div className="stat-icon-wrapper">
            <Clock size={26} />
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-info">
            <span>Completed Tasks</span>
            <h2>{completedTasks}</h2>
          </div>
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={26} />
          </div>
        </div>

        <div className="stat-card overdue">
          <div className="stat-info">
            <span>Overdue Tasks</span>
            <h2>{overdueTasks}</h2>
          </div>
          <div className="stat-icon-wrapper">
            <AlertTriangle size={26} />
          </div>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="progress-banner">
        <div className="progress-banner-header">
          <div className="progress-title">
            <TrendingUp size={22} color="var(--green-500)" />
            <span>Academic Completion Progress</span>
          </div>
          <span className="progress-rate">{completionRate}%</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <span>{completedTasks} of {totalTasks} tasks completed</span>
          <span>{totalTasks - completedTasks} remaining</span>
        </div>
      </div>
    </div>
  );
}
