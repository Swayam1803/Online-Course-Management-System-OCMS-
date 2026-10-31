from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Assignment, Submission, Course
from datetime import datetime

assignments_bp = Blueprint('assignments', __name__)

@assignments_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_assignments(course_id):
    assignments = Assignment.query.filter_by(course_id=course_id).all()
    return jsonify([a.to_dict() for a in assignments]), 200

@assignments_bp.route('/', methods=['POST'])
@jwt_required()
def create_assignment():
    user_id = int(get_jwt_identity())
    from models import User
    user = User.query.get(user_id)
    if user.role not in ('instructor', 'admin'):
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json()
    assignment = Assignment(
        course_id=data['course_id'],
        title=data['title'],
        description=data.get('description', ''),
        deadline=datetime.fromisoformat(data['deadline']),
        max_score=data.get('max_score', 100.0)
    )
    db.session.add(assignment)
    db.session.commit()
    return jsonify(assignment.to_dict()), 201

@assignments_bp.route('/<int:assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    user_id = int(get_jwt_identity())
    assignment = Assignment.query.get_or_404(assignment_id)
    if datetime.utcnow() > assignment.deadline:
        status = 'late'
    else:
        status = 'submitted'
    data = request.get_json()
    existing = Submission.query.filter_by(assignment_id=assignment_id, student_id=user_id).first()
    if existing:
        existing.file_url = data.get('file_url', existing.file_url)
        existing.submitted_at = datetime.utcnow()
        existing.status = status
        db.session.commit()
        return jsonify(existing.to_dict()), 200
    submission = Submission(
        assignment_id=assignment_id,
        student_id=user_id,
        file_url=data.get('file_url', ''),
        status=status
    )
    db.session.add(submission)
    db.session.commit()
    return jsonify(submission.to_dict()), 201

@assignments_bp.route('/<int:assignment_id>/grade/<int:submission_id>', methods=['PUT'])
@jwt_required()
def grade_submission(assignment_id, submission_id):
    user_id = int(get_jwt_identity())
    from models import User
    user = User.query.get(user_id)
    if user.role not in ('instructor', 'admin'):
        return jsonify({'error': 'Permission denied'}), 403
    submission = Submission.query.get_or_404(submission_id)
    data = request.get_json()
    submission.grade = data.get('grade')
    submission.feedback = data.get('feedback', '')
    submission.status = 'graded'
    db.session.commit()
    return jsonify(submission.to_dict()), 200

@assignments_bp.route('/<int:assignment_id>/submissions', methods=['GET'])
@jwt_required()
def get_submissions(assignment_id):
    user_id = int(get_jwt_identity())
    from models import User
    user = User.query.get(user_id)
    if user.role == 'student':
        subs = Submission.query.filter_by(assignment_id=assignment_id, student_id=user_id).all()
    else:
        subs = Submission.query.filter_by(assignment_id=assignment_id).all()
    return jsonify([s.to_dict() for s in subs]), 200
