import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { coursesAPI, enrollmentsAPI, assignmentsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState({});
  const [submitUrl, setSubmitUrl] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const courseRes = await coursesAPI.getOne(id);
        setCourse(courseRes.data);
        if (user?.role === 'student') {
          const enrollmentRes = await enrollmentsAPI.myEnrollments();
          const foundEnrollment = enrollmentRes.data.find((item) => item.course_id === parseInt(id, 10));
          setEnrollment(foundEnrollment || null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const enroll = async () => {
    try {
      const res = await enrollmentsAPI.enroll(parseInt(id, 10));
      setEnrollment(res.data);
      setMsg('Enrolled!');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to enroll');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const submitAssignment = async (assignmentId) => {
    const url = submitUrl[assignmentId];
    if (!url) return;
    setSubmitting((state) => ({ ...state, [assignmentId]: true }));
    try {
      await assignmentsAPI.submit(assignmentId, { file_url: url });
      setMsg('Assignment submitted!');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Submit failed');
    } finally {
      setSubmitting((state) => ({ ...state, [assignmentId]: false }));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const isOverdue = (deadline) => new Date(deadline) < new Date();

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!course) return <div className="page container"><p>Course not found.</p></div>;

  const isEnrolled = !!enrollment;
  const canSeeContent = isEnrolled || user?.role === 'admin' || user?.role === 'instructor';

  return (
    <div className="page">
      <div className="container">
        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border)' }}>
          <img
            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200'}
            alt={course.title}
            style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,15,20,0.9) 40%, transparent)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '2rem', transform: 'translateY(-50%)', maxWidth: 560 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {course.category && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 100, background: 'var(--gold-dim)', color: 'var(--gold)', fontWeight: 600 }}>{course.category}</span>}
              <span className={`badge badge-${course.status}`}>{course.status}</span>
            </div>
            <h1 style={{ marginBottom: '0.75rem' }}>{course.title}</h1>
            <p style={{ marginBottom: '1rem', maxWidth: 480 }}>{course.description}</p>
            {course.instructor && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>by <strong style={{ color: 'var(--text-secondary)' }}>{course.instructor.name}</strong></p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div>
            {msg && <div className={`alert ${msg.includes('Enrolled') || msg.includes('submitted') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{msg}</div>}

            {course.contents?.length > 0 && (
              <div className="card mb-2">
                <h3 style={{ marginBottom: '1rem' }}>Course Content</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {course.contents.map((content, index) => (
                    <div key={content.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <span style={{ width: 28, height: 28, background: 'var(--accent-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
                      <span style={{ flex: 1, fontSize: '0.9rem' }}>{content.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-base)', padding: '0.15rem 0.5rem', borderRadius: 100 }}>
                        {content.content_type === 'video' ? 'Video' : content.content_type === 'document' ? 'Doc' : 'Text'}
                      </span>
                      {!canSeeContent && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locked</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canSeeContent && course.assignments?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Assignments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {course.assignments.map((assignment) => (
                    <div key={assignment.id} style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{assignment.title}</strong>
                        {isOverdue(assignment.deadline) ? <span className="badge badge-late">Overdue</span> : <span className="badge badge-submitted">Open</span>}
                      </div>
                      <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>{assignment.description}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Deadline: <strong style={{ color: 'var(--text-secondary)' }}>{new Date(assignment.deadline).toLocaleString()}</strong>
                        &nbsp;-&nbsp; Max score: {assignment.max_score}
                      </p>
                      {user?.role === 'student' && isEnrolled && !isOverdue(assignment.deadline) && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <input
                            className="form-input"
                            style={{ flex: 1 }}
                            placeholder="Paste file URL or submission link..."
                            value={submitUrl[assignment.id] || ''}
                            onChange={(e) => setSubmitUrl((state) => ({ ...state, [assignment.id]: e.target.value }))}
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => submitAssignment(assignment.id)}
                            disabled={submitting[assignment.id] || !submitUrl[assignment.id]}
                          >
                            {submitting[assignment.id] ? '...' : 'Submit'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ position: 'sticky', top: '80px' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {parseFloat(course.price) === 0 ? 'Free' : `Rs ${course.price}`}
                </div>
              </div>

              {user?.role === 'student' && (
                isEnrolled ? (
                  <div>
                    <div className="alert alert-success" style={{ textAlign: 'center' }}>You are enrolled</div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="flex-between mb-1" style={{ fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={enroll}>
                    {parseFloat(course.price) === 0 ? 'Enroll for free' : 'Enroll now'}
                  </button>
                )
              )}

              {!user && <a href="/register" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'block', textAlign: 'center' }}>Sign up to enroll</a>}

              <div className="divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  ['Start', course.start_date ? new Date(course.start_date).toLocaleDateString() : 'Flexible'],
                  ['End', course.end_date ? new Date(course.end_date).toLocaleDateString() : 'Self-paced'],
                  ['Content', `${course.contents?.length || 0} items`],
                  ['Assignments', `${course.assignments?.length || 0}`],
                  ['Students', `${course.enrollment_count}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex-between" style={{ fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
