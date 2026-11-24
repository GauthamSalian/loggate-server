import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fadeInSlideUp, springTransition } from '../../lib/motion';
import { authApi } from '../../lib/api';

interface SignInPageProps {
  onSuccess: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSuccess }) => {
  const { login, loginDemo, loading, error: authError } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      if (tab === 'register') {
        const username = email.split('@')[0] || 'user';
        await authApi.register({
          username,
          email,
          phone: '0000000000',
          password,
        });
      }
      await login(email, password);
      onSuccess();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = () => {
    loginDemo();
    onSuccess();
  };

  const displayError = localError || authError;

  return (
    <div className="auth-bg">
      <motion.div
        className="auth-card"
        variants={fadeInSlideUp}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <div className="logo-name">LogGate</div>
            <div className="logo-sub">Observability Platform</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          {(['signin', 'register'] as const).map((t) => (
            <button
              key={t}
              className={`auth-tab ${tab === t ? 'auth-tab--active' : ''}`}
              onClick={() => {
                setTab(t);
                setLocalError(null);
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {displayError && (
          <motion.div className="auth-error" variants={fadeInSlideUp} initial="hidden" animate="visible">
            <AlertCircle size={14} />
            <span>{displayError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="auth-submit"
            disabled={loading || submitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
          >
            {loading || submitting ? 'Processing…' : (
              <>
                <span>{tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '-6px' }}>
          <button
            type="button"
            onClick={handleDemo}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', gap: '6px' }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>Explore Demo Console (No Login Required)</span>
          </button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer-text">Backend: http://localhost:8000</span>
          <span className="health-dot" />
        </div>
      </motion.div>
    </div>
  );
};
