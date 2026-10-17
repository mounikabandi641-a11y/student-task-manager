import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'info', message } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color="var(--green-500)" />;
      case 'error': return <AlertCircle size={18} color="var(--pink-500)" />;
      default: return <Info size={18} color="var(--purple-500)" />;
    }
  };

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        {getIcon()}
        <span style={{ flex: 1, color: 'var(--text-primary)' }}>{message}</span>
        <button 
          className="btn-icon" 
          style={{ width: 22, height: 22, border: 'none', background: 'transparent' }}
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
