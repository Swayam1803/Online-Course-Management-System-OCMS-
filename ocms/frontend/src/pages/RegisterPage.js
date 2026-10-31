import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'instructor') navigate('/instructor');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'fixed', top: '20%', right: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,184,109,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, var(--accent), var(--gold))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', margin: '0 auto 1rem' }}>O</div>
          <h1 style={{ marginBottom: '0.25rem' }}>Create account</h1>
          <p>Join the learning community</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input name="name" className="form-input" placeholder="Your full name" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="Min 8 characters" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">I want to</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { value: 'student', label: 'Student', desc: 'Enroll in courses' },
                  { value: 'instructor', label: 'Instructor', desc: 'Create courses' },
                ].map((option) => (
                  <label key={option.value} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.15rem',
                    padding: '0.75rem', borderRadius: 'var(--radius)',
                    border: `1px solid ${form.role === option.value ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.role === option.value ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    cursor: 'pointer', transition: 'all var(--transition)'
                  }}>
                    <input type="radio" name="role" value={option.value} checked={form.role === option.value} onChange={handle} style={{ display: 'none' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: form.role === option.value ? 'var(--accent)' : 'var(--text-primary)' }}>{option.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{option.desc}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem' }}>
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
