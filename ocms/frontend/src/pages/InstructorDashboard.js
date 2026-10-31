import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, coursesAPI, assignmentsAPI, enrollmentsAPI } from '../utils/api';
import StatCard from '../components/StatCard';

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [msg, setMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category_id: '', price: 0, start_date: '', end_date: '', thumbnail_url: '' });
  const [aForm, setAForm] = useState({ title: '', description: '', deadline: '', max_score: 100, course_id: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, coursesRes, categoriesRes] = await Promise.all([
          analyticsAPI.instructor(),
          coursesAPI.myCourses(),
          coursesAPI.categories(),
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data);
        setCategories(categoriesRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadStudents = async (courseId) => {
    const res = await enrollmentsAPI.courseStudents(courseId);
    setStudents(res.data);
  };

  const loadAssignments = async (courseId) => {
    const res = await assignmentsAPI.byCourse(courseId);
    setAssignments(res.data);
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await coursesAPI.create(form);
      setCourses((prev) => [res.data, ...prev]);
      setMsg('Course created! Awaiting admin approval.');
      setView('courses');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to create course');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      await assignmentsAPI.create(aForm);
      setMsg('Assignment created!');
      if (aForm.course_id) {
        setSelectedCourse(aForm.course_id);
        await loadAssignments(aForm.course_id);
      }
      setAForm({ title: '', description: '', deadline: '', max_score: 100, course_id: '' });
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const navItems = [
    { id: 'courses', label: 'My Courses' },
    { id: 'create', label: 'Create Course' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'students', label: 'Students' },
  ];

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1>Instructor Hub</h1>
          <p>Manage your courses, students, and assignments</p>
        </div>

        {stats && (
          <div className="stats-grid">
            <StatCard label="Courses" value={stats.total_courses} icon="CRS" color="var(--accent)" />
            <StatCard label="Students" value={stats.total_students} icon="STD" color="var(--gold)" />
            <StatCard label="Assignments" value={stats.total_assignments} icon="ASM" color="var(--accent)" />
            <StatCard label="Submissions" value={stats.total_submissions} icon="SUB" color="var(--success)" />
            <StatCard label="Avg Progress" value={`${stats.avg_progress}%`} icon="AVG" color="var(--accent)" />
          </div>
        )}

        <div className="dashboard-layout">
          <div className="sidebar">
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', padding: '0 0.5rem' }}>Navigation</div>
            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setView(item.id)} className={`sidebar-link ${view === item.id ? 'active' : ''}`}>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="main-content">
            {msg && <div className={`alert ${msg.includes('created') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

            {view === 'courses' && (
              <div>
                <h2 style={{ marginBottom: '1.25rem' }}>My Courses</h2>
                {courses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                    <p style={{ marginBottom: '1rem' }}>No courses yet</p>
                    <button onClick={() => setView('create')} className="btn btn-primary">Create your first course</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {courses.map((course) => (
                      <div key={course.id} className="card flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.3rem' }}>{course.title}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className={`badge badge-${course.status}`}>{course.status}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.enrollment_count} students</span>
                            {course.category && <span style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>{course.category}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={async () => { setSelectedCourse(course.id); await loadStudents(course.id); setView('students'); }}>Students</button>
                          <Link to={`/courses/${course.id}`} className="btn btn-ghost btn-sm">View -&gt;</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'create' && (
              <div>
                <h2 style={{ marginBottom: '1.25rem' }}>Create New Course</h2>
                <div className="card">
                  <form onSubmit={createCourse}>
                    <div className="two-col">
                      <div className="form-group">
                        <label className="form-label">Course Title *</label>
                        <input className="form-input" required value={form.title} onChange={(e) => setForm((state) => ({ ...state, title: e.target.value }))} placeholder="e.g. Python for Beginners" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category_id} onChange={(e) => setForm((state) => ({ ...state, category_id: e.target.value }))}>
                          <option value="">Select category</option>
                          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} placeholder="What will students learn?" />
                    </div>
                    <div className="two-col">
                      <div className="form-group">
                        <label className="form-label">Price (Rs, 0 = Free)</label>
                        <input type="number" className="form-input" min="0" value={form.price} onChange={(e) => setForm((state) => ({ ...state, price: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Thumbnail URL</label>
                        <input className="form-input" value={form.thumbnail_url} onChange={(e) => setForm((state) => ({ ...state, thumbnail_url: e.target.value }))} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="two-col">
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-input" value={form.start_date} onChange={(e) => setForm((state) => ({ ...state, start_date: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-input" value={form.end_date} onChange={(e) => setForm((state) => ({ ...state, end_date: e.target.value }))} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit for Approval</button>
                  </form>
                </div>
              </div>
            )}

            {view === 'assignments' && (
              <div>
                <h2 style={{ marginBottom: '1.25rem' }}>Create Assignment</h2>
                <div className="card mb-2">
                  <form onSubmit={createAssignment}>
                    <div className="form-group">
                      <label className="form-label">Course *</label>
                      <select className="form-select" required value={aForm.course_id} onChange={(e) => setAForm((state) => ({ ...state, course_id: e.target.value }))}>
                        <option value="">Select course</option>
                        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input className="form-input" required value={aForm.title} onChange={(e) => setAForm((state) => ({ ...state, title: e.target.value }))} placeholder="Assignment title" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={aForm.description} onChange={(e) => setAForm((state) => ({ ...state, description: e.target.value }))} placeholder="Assignment instructions..." />
                    </div>
                    <div className="two-col">
                      <div className="form-group">
                        <label className="form-label">Deadline *</label>
                        <input type="datetime-local" className="form-input" required value={aForm.deadline} onChange={(e) => setAForm((state) => ({ ...state, deadline: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Max Score</label>
                        <input type="number" className="form-input" value={aForm.max_score} onChange={(e) => setAForm((state) => ({ ...state, max_score: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">View Existing Assignments</label>
                      <select
                        className="form-select"
                        value={selectedCourse || ''}
                        onChange={async (e) => {
                          const courseId = e.target.value;
                          setSelectedCourse(courseId || null);
                          if (courseId) await loadAssignments(courseId);
                          else setAssignments([]);
                        }}
                      >
                        <option value="">Select course</option>
                        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Create Assignment</button>
                  </form>
                </div>

                {selectedCourse && (
                  <div>
                    <h3 style={{ marginBottom: '0.75rem' }}>Assignments for selected course</h3>
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="card mb-1">
                        <div className="flex-between">
                          <div>
                            <strong>{assignment.title}</strong>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>Due: {new Date(assignment.deadline).toLocaleString()} - Max: {assignment.max_score}</p>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{assignment.submission_count} submissions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'students' && (
              <div>
                <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                  <h2>Enrolled Students</h2>
                  <select
                    className="form-select"
                    style={{ maxWidth: 240 }}
                    value={selectedCourse || ''}
                    onChange={async (e) => {
                      const courseId = e.target.value;
                      setSelectedCourse(courseId || null);
                      if (courseId) await loadStudents(courseId);
                      else setStudents([]);
                    }}
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                  </select>
                </div>
                {students.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Select a course to view enrolled students</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Student</th><th>Email</th><th>Progress</th><th>Enrolled</th><th>Status</th></tr></thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td><strong>{student.student?.name}</strong></td>
                            <td style={{ color: 'var(--text-muted)' }}>{student.student?.email}</td>
                            <td style={{ minWidth: 140 }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                  <div className="progress-fill" style={{ width: `${student.progress}%` }} />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: 30 }}>{Math.round(student.progress)}%</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(student.enrolled_at).toLocaleDateString()}</td>
                            <td><span className={`badge ${student.completed ? 'badge-graded' : 'badge-submitted'}`}>{student.completed ? 'Completed' : 'In Progress'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
