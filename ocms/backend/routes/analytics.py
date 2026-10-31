from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Enrollment, Submission, Assignment

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/admin/overview', methods=['GET'])
@jwt_required()
def admin_overview():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    return jsonify({
        'total_users': User.query.count(),
        'total_students': User.query.filter_by(role='student').count(),
        'total_instructors': User.query.filter_by(role='instructor').count(),
        'total_courses': Course.query.count(),
        'published_courses': Course.query.filter_by(status='published').count(),
        'pending_courses': Course.query.filter_by(status='pending').count(),
        'total_enrollments': Enrollment.query.count(),
        'completed_enrollments': Enrollment.query.filter_by(completed=True).count(),
    }), 200

@analytics_bp.route('/instructor/overview', methods=['GET'])
@jwt_required()
def instructor_overview():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ('instructor', 'admin'):
        return jsonify({'error': 'Forbidden'}), 403
    courses = Course.query.filter_by(instructor_id=user_id).all()
    course_ids = [c.id for c in courses]
    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all()
    assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
    assignment_ids = [a.id for a in assignments]
    submissions = Submission.query.filter(Submission.assignment_id.in_(assignment_ids)).all()
    graded = [s for s in submissions if s.status == 'graded']
    avg_progress = sum(e.progress for e in enrollments) / len(enrollments) if enrollments else 0
    return jsonify({
        'total_courses': len(courses),
        'total_students': len(enrollments),
        'total_assignments': len(assignments),
        'total_submissions': len(submissions),
        'graded_submissions': len(graded),
        'avg_progress': round(avg_progress, 1),
        'courses': [c.to_dict() for c in courses]
    }), 200

@analytics_bp.route('/student/overview', methods=['GET'])
@jwt_required()
def student_overview():
    user_id = int(get_jwt_identity())
    enrollments = Enrollment.query.filter_by(student_id=user_id).all()
    course_ids = [e.course_id for e in enrollments]
    from models import Assignment, Submission
    assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
    assignment_ids = [a.id for a in assignments]
    submissions = Submission.query.filter(
        Submission.assignment_id.in_(assignment_ids),
        Submission.student_id == user_id
    ).all()
    graded = [s for s in submissions if s.grade is not None]
    avg_grade = sum(s.grade for s in graded) / len(graded) if graded else 0
    avg_progress = sum(e.progress for e in enrollments) / len(enrollments) if enrollments else 0
    return jsonify({
        'enrolled_courses': len(enrollments),
        'completed_courses': sum(1 for e in enrollments if e.completed),
        'total_assignments': len(assignments),
        'submitted': len(submissions),
        'graded': len(graded),
        'avg_grade': round(avg_grade, 1),
        'avg_progress': round(avg_progress, 1),
    }), 200
