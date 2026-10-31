import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: 'VID', title: 'Video & Content Delivery', desc: 'Stream lectures, upload documents, and track what students have viewed.' },
  { icon: 'ASM', title: 'Assignments & Grading', desc: 'Set deadlines, collect submissions, and give textual feedback with scores.' },
  { icon: 'ANL', title: 'Analytics & Progress', desc: 'Gradebook views for instructors, progress bars for students.' },
  { icon: 'SEC', title: 'Role-Based Access', desc: 'Admin, instructor, and student roles with fine-grained permissions.' },
  { icon: 'CAT', title: 'Course Catalog', desc: 'Browse, search, and filter public courses by category.' },
  { icon: 'ENR', title: 'Enrollment Management', desc: 'Free and paid enrollment flows with email confirmation.' },
];

export default function HomePage() {
  const { user } = useAuth();
  const dashPath = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor' : user ? '/student' : null;

  return (
    <div>
      <section style={{ position: 'relative', overflow: 'hidden', padding: '6rem 0 5rem', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(108,127,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--border-light), transparent)' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: 100, background: 'var(--accent-dim)', border: '1px solid rgba(108,127,255,0.25)', marginBottom: '1.5rem' }}>
            <span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>Version 1.0 - Open for enrollment</span>
          </div>

          <h1 style={{ maxWidth: 700, margin: '0 auto 1.25rem', lineHeight: 1.15 }}>
            The modern platform for{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              online education
            </span>
          </h1>

          <p style={{ maxWidth: 520, margin: '0 auto 2.5rem', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Create, manage, and deliver courses with a complete LMS built for instructors who mean business and students who love learning.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {dashPath ? (
              <Link to={dashPath} className="btn btn-primary btn-lg">Go to Dashboard -&gt;</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Get started free</Link>
                <Link to="/catalog" className="btn btn-secondary btn-lg">Browse courses</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', padding: '2rem 1.5rem' }}>
          {[['3+', 'Live Courses'], ['4', 'User Roles'], ['100%', 'RBAC Secured'], ['REST', 'API Driven']].map(([value, label]) => (
            <div key={label} style={{ textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Everything you need to teach and learn</h2>
            <p style={{ marginTop: '0.75rem' }}>A complete system aligned to IEEE Std 830-1998 SRS specification</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {features.map((feature) => (
              <div key={feature.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', minWidth: 40, flexShrink: 0, fontWeight: 700, color: 'var(--accent)' }}>{feature.icon}</span>
                <div>
                  <h3 style={{ marginBottom: '0.35rem', fontSize: '1rem' }}>{feature.title}</h3>
                  <p style={{ fontSize: '0.875rem' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to start?</h2>
          <p style={{ marginBottom: '2rem' }}>Sign in with a demo account to explore every role instantly.</p>
          <Link to="/login" className="btn btn-primary btn-lg">Try demo accounts -&gt;</Link>
        </div>
      </section>

      <style>{'@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }'}</style>
    </div>
  );
}
