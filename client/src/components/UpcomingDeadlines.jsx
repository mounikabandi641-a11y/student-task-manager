import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCheck } from 'lucide-react';

export default function UpcomingDeadlines({ deadlines = [], onToggleComplete }) {
  const getDaysLeftText = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, type: 'urgent' };
    if (diffDays === 0) return { text: 'Due Today', type: 'urgent' };
    if (diffDays === 1) return { text: 'Tomorrow', type: 'soon' };
    return { text: `In ${diffDays} days`, type: 'normal' };
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="widget-title">
          <Calendar size={18} color="var(--purple-500)" />
          <h3>Upcoming Deadlines</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Next 7 Days</span>
      </div>

      {deadlines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <CheckCheck size={32} color="var(--green-500)" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
          <p>No imminent deadlines in the next 7 days! You're all caught up.</p>
        </div>
      ) : (
        <div>
          {deadlines.map(task => {
            const { text, type } = getDaysLeftText(task.due_date);
            return (
              <div key={task.id} className={`deadline-item ${type}`}>
                <div className="deadline-info">
                  <h4>{task.title}</h4>
                  <span>{task.subject} • Priority: {task.priority}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`deadline-days ${type}`}>{text}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
