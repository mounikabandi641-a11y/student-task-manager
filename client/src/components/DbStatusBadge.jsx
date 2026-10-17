import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function DbStatusBadge({ health }) {
  const [showInfo, setShowInfo] = useState(false);

  const isPostgres = health?.mode === 'postgres';
  const isFallback = health?.mode === 'fallback_file';

  return (
    <>
      <div 
        className="db-badge" 
        onClick={() => setShowInfo(true)}
        title="Click to view database connection details"
      >
        <span className={`db-dot ${isPostgres ? 'online' : 'fallback'}`} />
        <Database size={15} color={isPostgres ? 'var(--green-500)' : 'var(--orange-500)'} />
        <span>{isPostgres ? 'PostgreSQL Active' : 'Local Storage Mode'}</span>
      </div>

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">
                <Database size={20} color="var(--purple-500)" />
                <h3>Database Engine Status</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowInfo(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isPostgres ? (
                  <CheckCircle size={24} color="var(--green-500)" />
                ) : (
                  <AlertCircle size={24} color="var(--orange-500)" />
                )}
                <div>
                  <h4 style={{ fontSize: '1rem', color: isPostgres ? 'var(--green-500)' : 'var(--orange-500)' }}>
                    {isPostgres ? 'Connected to PostgreSQL' : 'Active in Fallback Mode'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {health?.message || 'Database connection status'}
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Storage Engine:</span>
                  <span style={{ fontWeight: 600 }}>{health?.mode === 'postgres' ? 'PostgreSQL 14+ (pg pool)' : 'Persistent JSON File'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Database Name:</span>
                  <span style={{ fontWeight: 600 }}>{health?.database || 'student_tasks'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Host / Port:</span>
                  <span style={{ fontWeight: 600 }}>{health?.host}:{health?.port || 5432}</span>
                </div>
              </div>

              {!isPostgres && (
                <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--orange-500)' }}>
                  <strong>How to enable PostgreSQL:</strong>
                  <ol style={{ paddingLeft: 18, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li><strong>Option A (Local):</strong> Ensure PostgreSQL service is running on your machine and credentials in <code>server/.env</code> are correct.</li>
                    <li><strong>Option B (Cloud):</strong> Add your cloud connection string (e.g. Neon/Supabase) as <code>DATABASE_URL</code> in <code>server/.env</code>.</li>
                    <li>Run <code>npm run db:setup</code> in <code>server/</code> to initialize tables & migrate data.</li>
                    <li>The backend will automatically switch to PostgreSQL Active.</li>
                  </ol>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowInfo(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
