import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const dashPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'instructor'
    ? '/instructor'
    : '/student';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 900,
      background: 'rgba(13,15,20,0.85)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      height: 64,
      display: 'flex', alignItems: 'center'
    }}>
      <div className="container flex-between" style={{ width: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <span style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--accent), var(--gold))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)'
          }}>O</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            OCMS
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/catalog" className="btn btn-ghost btn-sm">Catalog</Link>
          {user ? (
            <>
              <Link to={dashPath} className="btn btn-ghost btn-sm">Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32,
                  background: 'var(--accent-dim)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)'
                }}>
                  {user.name[0].toUpperCase()}
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">Sign out</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
