import React, { useState, useEffect } from 'react';
import { X, Check, BookOpen, AlertCircle } from 'lucide-react';

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null 
}) {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'Medium',
    due_date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const formattedDate = typeof initialData.due_date === 'string'
        ? initialData.due_date.split('T')[0]
        : new Date(initialData.due_date).toISOString().split('T')[0];

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        subject: initialData.subject || '',
        priority: initialData.priority || 'Medium',
        due_date: formattedDate,
        status: initialData.status || 'Pending'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        subject: '',
        priority: 'Medium',
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'Pending'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Subject or Course name is required';
    }

    if (!formData.due_date) {
      errs.due_date = 'Due date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BookOpen size={20} color="var(--purple-500)" />
            <h3>{isEditing ? 'Edit Assignment' : 'Add New Assignment'}</h3>
          </div>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && (
              <div style={{
                background: 'var(--pink-light)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--pink-500)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle size={16} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Task Title */}
            <div className="form-group">
              <label htmlFor="task-title-input">Task Title *</label>
              <input
                id="task-title-input"
                className={`form-input ${errors.title ? 'error' : ''}`}
                type="text"
                placeholder="e.g. Operating Systems Lab Assignment 4"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Subject / Course */}
            <div className="form-group">
              <label htmlFor="task-subject-input">Subject / Course *</label>
              <input
                id="task-subject-input"
                className={`form-input ${errors.subject ? 'error' : ''}`}
                type="text"
                placeholder="e.g. Operating Systems, Mathematics, CS 101"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
              {errors.subject && <span className="form-error">{errors.subject}</span>}
            </div>

            {/* Priority & Status */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority-select">Priority *</label>
                <select
                  id="task-priority-select"
                  className="form-select"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="High">🔥 High Priority</option>
                  <option value="Medium">⚡ Medium Priority</option>
                  <option value="Low">🌱 Low Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-status-select">Status *</label>
                <select
                  id="task-status-select"
                  className="form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label htmlFor="task-date-input">Due Date *</label>
              <input
                id="task-date-input"
                className={`form-input ${errors.due_date ? 'error' : ''}`}
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              />
              {errors.due_date && <span className="form-error">{errors.due_date}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="task-desc-input">Description / Notes</label>
              <textarea
                id="task-desc-input"
                className="form-textarea"
                rows={3}
                placeholder="Include assignment requirements, textbook pages, submission instructions..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              id="btn-save-task"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Check size={18} />
              <span>{isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Save Task')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
