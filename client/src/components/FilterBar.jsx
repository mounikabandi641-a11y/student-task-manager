import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function FilterBar({ 
  filters, 
  onFilterChange, 
  subjects = [], 
  onReset 
}) {
  const isFiltered = 
    filters.search || 
    filters.status !== 'all' || 
    filters.subject !== 'all' || 
    filters.priority !== 'all' || 
    filters.deadline !== 'all';

  return (
    <div className="filter-card">
      {/* Search Input */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          id="task-search-input"
          className="search-input"
          placeholder="Search tasks by title or description..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
        {filters.search && (
          <button 
            className="btn-icon" 
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26 }}
            onClick={() => onFilterChange('search', '')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown Filters and Deadline Tabs */}
      <div className="filters-row">
        {/* Status Dropdown */}
        <select
          id="filter-status"
          className="select-custom"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Priority Dropdown */}
        <select
          id="filter-priority"
          className="select-custom"
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Subject Dropdown */}
        <select
          id="filter-subject"
          className="select-custom"
          value={filters.subject}
          onChange={(e) => onFilterChange('subject', e.target.value)}
        >
          <option value="all">All Subjects</option>
          {subjects.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        {/* Deadline Quick Tabs */}
        <div className="deadline-tabs">
          {[
            { id: 'all', label: 'All Deadlines' },
            { id: 'today', label: 'Due Today' },
            { id: 'week', label: 'Next 7 Days' },
            { id: 'overdue', label: 'Overdue' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-pill ${filters.deadline === tab.id ? 'active' : ''}`}
              onClick={() => onFilterChange('deadline', tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reset button if any filter applied */}
        {isFiltered && (
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onReset}
            style={{ marginLeft: 'auto' }}
          >
            <X size={14} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
