import React from 'react';
import { Calendar, Edit3, Trash2, Check, Clock, AlertTriangle } from 'lucide-react';

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) {
  const isCompleted = task.status === 'Completed';

  // Format date and check overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const dueDateStr = typeof task.due_date === 'string' 
    ? task.due_date.split('T')[0] 
    : new Date(task.due_date).toISOString().split('T')[0];
  
  const isOverdue = dueDateStr < todayStr && !isCompleted;

  const formatDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High': return 'badge-priority-high';
      case 'Medium': return 'badge-priority-medium';
      case 'Low': return 'badge-priority-low';
      default: return 'badge-priority-low';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-status-completed';
      case 'In Progress': return 'badge-status-progress';
      default: return 'badge-status-pending';
    }
  };

  return (
    <div className={`task-card ${isCompleted ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}`}>
      <div className="task-card-header">
        <div className="task-main">
          {/* Quick toggle button */}
          <button
            className={`task-checkbox-btn ${isCompleted ? 'checked' : ''}`}
            onClick={() => onToggleStatus(task)}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {isCompleted && <Check size={14} strokeWidth={3} />}
          </button>

          <div>
            <h3 className="task-title">{task.title}</h3>
            {task.description && (
              <p className="task-desc">{task.description}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="task-actions">
          <button 
            className="btn-icon" 
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Edit3 size={15} />
          </button>
          <button 
            className="btn-icon" 
            style={{ color: 'var(--pink-500)' }}
            onClick={() => onDelete(task.id)}
            title="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="task-card-footer">
        <div className="task-badges">
          {/* Subject Badge */}
          <span className="badge badge-subject">
            {task.subject}
          </span>

          {/* Priority Badge */}
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority} Priority
          </span>

          {/* Status Badge */}
          <span className={`badge ${getStatusBadgeClass(task.status)}`}>
            {task.status}
          </span>
        </div>

        {/* Due Date & Overdue Indicator */}
        <div className={`task-due ${isOverdue ? 'overdue' : ''}`}>
          {isOverdue ? <AlertTriangle size={14} color="var(--pink-500)" /> : <Calendar size={14} />}
          <span>
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {formatDate(dueDateStr)}
          </span>
        </div>
      </div>
    </div>
  );
}
