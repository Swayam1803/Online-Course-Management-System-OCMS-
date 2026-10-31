import { Link } from 'react-router-dom';

export default function CourseCard({ course, actionSlot }) {
  const fallbackImg = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format';

  return (
    <div className="course-card">
      <img
        src={course.thumbnail_url || fallbackImg}
        alt={course.title}
        className="course-card-img"
        onError={(e) => { e.target.src = fallbackImg; }}
      />
      <div className="course-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {course.category && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: 'var(--gold)', background: 'var(--gold-dim)',
              padding: '0.2rem 0.5rem', borderRadius: 100
            }}>{course.category}</span>
          )}
          <span className={`badge badge-${course.status}`}>{course.status}</span>
        </div>
        <div className="course-card-title">{course.title}</div>
        <p style={{ fontSize: '0.8125rem', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description}
        </p>
        {course.instructor && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            by <strong style={{ color: 'var(--text-secondary)' }}>{course.instructor.name}</strong>
          </p>
        )}
      </div>
      <div className="course-card-footer">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {parseFloat(course.price) === 0 ? 'Free' : `Rs ${course.price}`}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/courses/${course.id}`} className="btn btn-secondary btn-sm">Details</Link>
          {actionSlot}
        </div>
      </div>
    </div>
  );
}
