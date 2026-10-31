from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Enrollment, Course

enrollments_bp = Blueprint('enrollments', __name__)

@enrollments_bp.route('/', methods=['POST'])
@jwt_required()
def enroll():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    course_id = data.get('course_id')
    course = Course.query.get_or_404(course_id)

    existing = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if existing:
        return jsonify({'error': 'Already enrolled'}), 409

    enrollment = Enrollment(
        student_id=user_id,
        course_id=course_id,
        payment_status='free' if float(course.price) == 0 else 'pending'
    )
    db.session.add(enrollment)
    db.session.commit()
    return jsonify(enrollment.to_dict()), 201

@enrollments_bp.route('/my-enrollments', methods=['GET'])
@jwt_required()
def my_enrollments():
    user_id = int(get_jwt_identity())
    enrollments = Enrollment.query.filter_by(student_id=user_id).all()
    return jsonify([e.to_dict() for e in enrollments]), 200

@enrollments_bp.route('/<int:enrollment_id>/progress', methods=['PUT'])
@jwt_required()
def update_progress(enrollment_id):
    user_id = int(get_jwt_identity())
    enrollment = Enrollment.query.get_or_404(enrollment_id)
    if enrollment.student_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json()
    enrollment.progress = min(100.0, max(0.0, float(data.get('progress', enrollment.progress))))
    enrollment.completed = enrollment.progress >= 100.0
    db.session.commit()
    return jsonify(enrollment.to_dict()), 200

@enrollments_bp.route('/course/<int:course_id>/students', methods=['GET'])
@jwt_required()
def course_students(course_id):
    user_id = int(get_jwt_identity())
    from models import User, Course
    user = User.query.get(user_id)
    course = Course.query.get_or_404(course_id)
    if course.instructor_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    result = []
    for e in enrollments:
        student = User.query.get(e.student_id)
        result.append({**e.to_dict(), 'student': student.to_dict()})
    return jsonify(result), 200
