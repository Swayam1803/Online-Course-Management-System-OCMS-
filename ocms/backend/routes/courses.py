from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Course, Category, Enrollment
from datetime import datetime

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/', methods=['GET'])
def get_courses():
    status = request.args.get('status', 'published')
    category = request.args.get('category')
    search = request.args.get('search', '')
    query = Course.query
    if status:
        query = query.filter_by(status=status)
    if category:
        cat = Category.query.filter_by(name=category).first()
        if cat:
            query = query.filter_by(category_id=cat.id)
    if search:
        query = query.filter(Course.title.ilike(f'%{search}%'))
    courses = query.order_by(Course.created_at.desc()).all()
    return jsonify([c.to_dict() for c in courses]), 200

@courses_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    data = course.to_dict()
    data['assignments'] = [a.to_dict() for a in course.assignments]
    data['contents'] = [c.to_dict() for c in sorted(course.contents, key=lambda x: x.order)]
    return jsonify(data), 200

@courses_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    user_id = int(get_jwt_identity())
    from models import User
    user = User.query.get(user_id)
    if user.role not in ('instructor', 'admin'):
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json()
    course = Course(
        title=data['title'],
        description=data.get('description', ''),
        instructor_id=user_id,
        category_id=data.get('category_id'),
        status='pending' if user.role == 'instructor' else 'published',
        price=data.get('price', 0),
        thumbnail_url=data.get('thumbnail_url', ''),
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else None,
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201

@courses_bp.route('/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    user_id = int(get_jwt_identity())
    from models import User
    user = User.query.get(user_id)
    course = Course.query.get_or_404(course_id)
    if course.instructor_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json()
    for field in ['title', 'description', 'status', 'thumbnail_url', 'category_id']:
        if field in data:
            setattr(course, field, data[field])
    if 'price' in data:
        course.price = float(data['price'])
    if 'start_date' in data and data['start_date']:
        course.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    if 'end_date' in data and data['end_date']:
        course.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    db.session.commit()
    return jsonify(course.to_dict()), 200

@courses_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    user_id = int(get_jwt_identity())
    from models import User
    user = User.query.get(user_id)
    course = Course.query.get_or_404(course_id)
    if Enrollment.query.filter_by(course_id=course_id).count() > 0:
        course.status = 'archived'
        db.session.commit()
        return jsonify({'message': 'Course archived (has active enrollments)'}), 200
    if course.instructor_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Permission denied'}), 403
    db.session.delete(course)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

@courses_bp.route('/categories', methods=['GET'])
def get_categories():
    return jsonify([c.to_dict() for c in Category.query.all()]), 200

@courses_bp.route('/instructor/my-courses', methods=['GET'])
@jwt_required()
def my_courses():
    user_id = int(get_jwt_identity())
    courses = Course.query.filter_by(instructor_id=user_id).all()
    return jsonify([c.to_dict() for c in courses]), 200
