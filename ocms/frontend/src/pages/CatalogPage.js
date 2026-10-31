import { useState, useEffect, useCallback } from 'react';
import { coursesAPI, enrollmentsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

export default function CatalogPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        coursesAPI.getAll({ status: 'published', search, category }),
        coursesAPI.categories(),
      ]);
      setCourses(coursesRes.data);
      setCategories(categoriesRes.data);
      if (user?.role === 'student') {
        const enrollmentsRes = await enrollmentsAPI.myEnrollments();
        setEnrolledIds(new Set(enrollmentsRes.data.map((enrollment) => enrollment.course_id)));
      }
    } finally {
      setLoading(false);
    }
  }, [search, category, user]);

  useEffect(() => {
    load();
  }, [load]);

  const enroll = async (courseId) => {
    try {
      await enrollmentsAPI.enroll(courseId);
      setEnrolledIds((prev) => new Set([...prev, courseId]));
      setMsg('Enrolled successfully!');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Enrollment failed');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Course Catalog</h1>
            <p style={{ marginTop: '0.25rem' }}>{courses.length} courses available</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ maxWidth: 300 }}
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-select" style={{ maxWidth: 200 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((currentCategory) => <option key={currentCategory.id} value={currentCategory.name}>{currentCategory.name}</option>)}
          </select>
          {(search || category) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); }}>
              Clear filters
            </button>
          )}
        </div>

        {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>?</div>
            <p>No courses found. Try adjusting filters.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                actionSlot={
                  user?.role === 'student' ? (
                    enrolledIds.has(course.id) ? (
                      <span className="badge badge-published">Enrolled</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => enroll(course.id)}>
                        Enroll
                      </button>
                    )
                  ) : !user ? (
                    <a href="/register" className="btn btn-primary btn-sm">Enroll</a>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
