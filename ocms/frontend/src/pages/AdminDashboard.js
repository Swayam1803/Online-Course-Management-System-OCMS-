import { useState, useEffect } from 'react';
import { analyticsAPI, usersAPI, coursesAPI } from '../utils/api';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('overview');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, coursesRes] = await Promise.all([
          analyticsAPI.admin(),
          usersAPI.getAll(),
          coursesAPI.getAll({ status: '' }),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setCourses(coursesRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleUser = async (user) => {
    try {
      const res = await usersAPI.update(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((current) => (current.id === user.id ? res.data : current)));
      setMsg(`User ${res.data.is_active ? 'activated' : 'deactivated'}`);
    } catch {
      setMsg('Failed to update user');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const approveCourse = async (courseId, approve) => {
    try {
      const res = await coursesAPI.update(courseId, { status: approve ? 'published' : 'archived' });
      setCourses((prev) => prev.map((course) => (course.id === courseId ? res.data : course)));
      setMsg(`Course ${approve ? 'published' : 'archived'}`);
    } catch {
      setMsg('Failed to update course');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'users', label: 'Users' },
  ];

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const pendingCourses = courses.filter((course) => course.status === 'pending');

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1>Admin Control Panel</h1>
          <p>System-wide management and oversight</p>
        </div>

        <div className="dashboard-layout">
          <div className="sidebar">
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', padding: '0 0.5rem' }}>Navigation</div>
            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setView(item.id)} className={`sidebar-link ${view === item.id ? 'active' : ''}`}>
                  {item.label}
                  {item.id === 'courses' && pendingCourses.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--gold)', color: '#000', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 100 }}>
                      {pendingCourses.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="main-content">
            {msg && <div className={`alert ${msg.includes('activated') || msg.includes('deactivated') || msg.includes('published') || msg.includes('archived') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

            {view === 'overview' && stats && (
              <div>
                <h2 style={{ marginBottom: '1.25rem' }}>System Overview</h2>
                <div className="stats-grid">
                  <StatCard label="Total Users" value={stats.total_users} icon="USR" color="var(--accent)" />
                  <StatCard label="Students" value={stats.total_students} icon="STD" color="var(--accent)" />
                  <StatCard label="Instructors" value={stats.total_instructors} icon="INS" color="var(--gold)" />
                  <StatCard label="Total Courses" value={stats.total_courses} icon="CRS" color="var(--accent)" />
                  <StatCard label="Published" value={stats.published_courses} icon="OK" color="var(--success)" />
                  <StatCard label="Pending Approval" value={stats.pending_courses} icon="PEN" color="var(--warning)" />
                  <StatCard label="Enrollments" value={stats.total_enrollments} icon="ENR" color="var(--accent)" />
                  <StatCard label="Completed" value={stats.completed_enrollments} icon="DONE" color="var(--success)" />
                </div>

                {pendingCourses.length > 0 && (
                  <div>
                    <h3 style={{ marginBottom: '0.75rem', color: 'var(--gold)' }}>Pending Approvals</h3>
                    {pendingCourses.map((course) => (
                      <div key={course.id} className="card mb-1 flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <strong>{course.title}</strong>
                          <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>by {course.instructor?.name} - {course.category}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm" style={{ background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.25)' }} onClick={() => approveCourse(course.id, true)}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => approveCourse(course.id, false)}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'courses' && (
              <div>
                <h2 style={{ marginBottom: '1.25rem' }}>All Courses ({courses.length})</h2>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Title</th><th>Instructor</th><th>Category</th><th>Status</th><th>Students</th><th>Price</th><th>Actions</th></tr></thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td><strong style={{ fontSize: '0.875rem' }}>{course.title}</strong></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{course.instructor?.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{course.category || '-'}</td>
                          <td><span className={`badge badge-${course.status}`}>{course.status}</span></td>
                          <td style={{ color: 'var(--text-muted)' }}>{course.enrollment_count}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{parseFloat(course.price) === 0 ? 'Free' : `Rs ${course.price}`}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {course.status === 'pending' && <button className="btn btn-sm" style={{ background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.25)', fontSize: '0.75rem' }} onClick={() => approveCourse(course.id, true)}>Publish</button>}
                              {course.status === 'published' && <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => approveCourse(course.id, false)}>Archive</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === 'users' && (
              <div>
                <h2 style={{ marginBottom: '1.25rem' }}>All Users ({users.length})</h2>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: 28, height: 28, background: 'var(--accent-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                                {user.name[0].toUpperCase()}
                              </div>
                              <strong style={{ fontSize: '0.875rem' }}>{user.name}</strong>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</td>
                          <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: user.is_active ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button className={`btn btn-sm ${user.is_active ? 'btn-danger' : ''}`} style={!user.is_active ? { background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.25)' } : {}} onClick={() => toggleUser(user)}>
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
