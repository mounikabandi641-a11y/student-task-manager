import React from 'react';
import TaskCard from './TaskCard';
import { ClipboardList, PlusCircle } from 'lucide-react';

export default function TaskList({ 
  tasks = [], 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onAddTask,
  isFiltered 
}) {
  return (
    <div>
      <div className="tasks-section-header">
        <div className="section-title">
          <h2>Assignments & Tasks</h2>
          <span className="tasks-count-pill">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ClipboardList size={32} />
          </div>
          <h3>{isFiltered ? 'No tasks match your filters' : 'No tasks created yet'}</h3>
          <p>
            {isFiltered 
              ? 'Try adjusting your search query, priority, or deadline filters to view tasks.'
              : 'Keep track of college projects, labs, homework, and exams by adding your first task!'}
          </p>
          {!isFiltered && (
            <button className="btn btn-primary" onClick={onAddTask}>
              <PlusCircle size={18} />
              <span>Create First Task</span>
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
