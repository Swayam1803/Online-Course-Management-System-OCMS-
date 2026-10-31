from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/<int:uid>', methods=['PUT'])
@jwt_required()
def update_user(uid):
    current_id = int(get_jwt_identity())
    current = User.query.get(current_id)
    if current_id != uid and current.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    user = User.query.get_or_404(uid)
    data = request.get_json()
    for field in ['name', 'avatar_url']:
        if field in data:
            setattr(user, field, data[field])
    if 'role' in data and current.role == 'admin':
        user.role = data['role']
    if 'is_active' in data and current.role == 'admin':
        user.is_active = data['is_active']
    db.session.commit()
    return jsonify(user.to_dict()), 200
