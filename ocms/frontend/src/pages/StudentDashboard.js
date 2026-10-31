import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentsAPI, analyticsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, enrollmentsRes] = await Promise.all([
          analyticsAPI.student(),
          enrollmentsAPI.myEnrollments(),
        ]);
        setStats(statsRes.data);
        setEnrollments(enrollmentsRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p>Here's your learning overview</p>
          </div>
          <Link to="/catalog" className="btn btn-primary">Browse more courses</Link>
        </div>

        {stats && (
          <div className="stats-grid">
            <StatCard label="Enrolled" value={stats.enrolled_courses} icon="CRS" color="var(--accent)" />
            <StatCard label="Completed" value={stats.completed_courses} icon="OK" color="var(--success)" />
            <StatCard label="Submitted" value={stats.submitted} icon="SUB" color="var(--gold)" />
            <StatCard label="Avg Grade" value={stats.avg_grade ? `${stats.avg_grade}%` : '-'} icon="TOP" color="var(--gold)" />
            <StatCard label="Avg Progress" value={`${stats.avg_progress}%`} icon="AVG" color="var(--accent)" />
          </div>
        )}

        <h2 style={{ marginBottom: '1.25rem' }}>My Courses</h2>

        {enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>New</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No courses yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>Start your learning journey today</p>
            <Link to="/catalog" className="btn btn-primary">Browse courses</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={enrollment.course?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                  alt={enrollment.course?.title}
                  style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    {enrollment.course?.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {enrollment.course?.category && <span style={{ fontSize: '0.75rem', color: 'var(--gold)', background: 'var(--gold-dim)', padding: '0.15rem 0.5rem', borderRadius: 100 }}>{enrollment.course.category}</span>}
                    {enrollment.completed && <span className="badge badge-graded">Completed</span>}
                  </div>
                </div>
                <div style={{ minWidth: 180 }}>
                  <div className="flex-between mb-1" style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontWeight: 600 }}>{Math.round(enrollment.progress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${enrollment.progress}%` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </div>
                </div>
                <Link to={`/courses/${enrollment.course_id}`} className="btn btn-secondary btn-sm">
                  Continue -&gt;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
