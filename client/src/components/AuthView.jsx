import React, { useState } from 'react';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginStudent, registerStudent } from '../services/api';

export default function AuthView({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isRegister && !formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }
    if (isRegister && formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      let res;
      if (isRegister) {
        res = await registerStudent({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        });
      } else {
        res = await loginStudent({
          email: formData.email.trim(),
          password: formData.password
        });
      }

      if (res && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await loginStudent({
        email: 'student@example.com',
        password: 'password123'
      });
      if (res && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Brand Banner */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <GraduationCap size={36} color="var(--purple-500)" />
          </div>
          <h2>Student Task Manager</h2>
          <p>Secure Academic Organizer & Multi-Student Portal</p>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(null); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(null); }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-name-input">Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="auth-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maria Gonzalez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus={isRegister}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email-input">College Email *</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                id="auth-email-input"
                type="email"
                className="form-input"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoFocus={!isRegister}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password-input">Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-auth-submit" 
            disabled={loading}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isRegister ? 'Register Student Account' : 'Sign In to Dashboard'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Option */}
        <div className="auth-divider">
          <span>OR TEST WITH DEMO STUDENT</span>
        </div>

        <button 
          type="button" 
          className="btn-demo-quick"
          onClick={handleQuickDemoLogin}
          disabled={loading}
        >
          <Sparkles size={16} color="var(--purple-500)" />
          <span>Quick Demo: Log in as Alex Rivera (Pre-seeded tasks)</span>
        </button>

        {/* Security Feature Highlights */}
        <div className="auth-features-footer">
          <div className="auth-feature-item">
            <CheckCircle2 size={14} color="var(--green-500)" />
            <span>Strict Task Privacy</span>
          </div>
          <div className="auth-feature-item">
            <CheckCircle2 size={14} color="var(--purple-500)" />
            <span>JWT Session Security</span>
          </div>
          <div className="auth-feature-item">
            <CheckCircle2 size={14} color="var(--orange-500)" />
            <span>Encrypted Passwords</span>
          </div>
        </div>
      </div>
    </div>
  );
}
