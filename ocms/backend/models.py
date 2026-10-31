from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'instructor', 'student', 'guest'), default='student')
    avatar_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    courses_taught = db.relationship('Course', backref='instructor', lazy=True, foreign_keys='Course.instructor_id')
    enrollments = db.relationship('Enrollment', backref='student', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    courses = db.relationship('Course', backref='category', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name}

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    status = db.Column(db.Enum('draft', 'pending', 'published', 'archived'), default='draft')
    price = db.Column(db.Numeric(10, 2), default=0)
    thumbnail_url = db.Column(db.String(500))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    enrollments = db.relationship('Enrollment', backref='course', lazy=True, cascade='all, delete-orphan')
    assignments = db.relationship('Assignment', backref='course', lazy=True, cascade='all, delete-orphan')
    contents = db.relationship('Content', backref='course', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_instructor=True):
        d = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'instructor_id': self.instructor_id,
            'category_id': self.category_id,
            'category': self.category.name if self.category else None,
            'status': self.status,
            'price': float(self.price),
            'thumbnail_url': self.thumbnail_url,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat(),
            'enrollment_count': len(self.enrollments),
        }
        if include_instructor and self.instructor:
            d['instructor'] = {'id': self.instructor.id, 'name': self.instructor.name}
        return d

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.Column(db.Float, default=0.0)
    completed = db.Column(db.Boolean, default=False)
    payment_status = db.Column(db.Enum('free', 'paid', 'pending'), default='free')

    __table_args__ = (db.UniqueConstraint('student_id', 'course_id', name='unique_enrollment'),)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'enrolled_at': self.enrolled_at.isoformat(),
            'progress': self.progress,
            'completed': self.completed,
            'payment_status': self.payment_status,
            'course': self.course.to_dict() if self.course else None
        }

class Content(db.Model):
    __tablename__ = 'contents'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content_type = db.Column(db.Enum('video', 'document', 'text', 'quiz'), nullable=False)
    url = db.Column(db.String(500))
    body = db.Column(db.Text)
    order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'course_id': self.course_id,
            'title': self.title, 'content_type': self.content_type,
            'url': self.url, 'body': self.body, 'order': self.order
        }

class Assignment(db.Model):
    __tablename__ = 'assignments'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    deadline = db.Column(db.DateTime, nullable=False)
    max_score = db.Column(db.Float, default=100.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    submissions = db.relationship('Submission', backref='assignment', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'course_id': self.course_id,
            'title': self.title, 'description': self.description,
            'deadline': self.deadline.isoformat(), 'max_score': self.max_score,
            'submission_count': len(self.submissions)
        }

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_url = db.Column(db.String(500))
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    grade = db.Column(db.Float)
    feedback = db.Column(db.Text)
    status = db.Column(db.Enum('submitted', 'graded', 'late'), default='submitted')

    def to_dict(self):
        return {
            'id': self.id, 'assignment_id': self.assignment_id,
            'student_id': self.student_id, 'file_url': self.file_url,
            'submitted_at': self.submitted_at.isoformat(),
            'grade': self.grade, 'feedback': self.feedback, 'status': self.status,
            'student': User.query.get(self.student_id).to_dict() if self.student_id else None
        }
