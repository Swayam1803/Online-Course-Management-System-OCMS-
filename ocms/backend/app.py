from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.enrollments import enrollments_bp
from routes.assignments import assignments_bp
from routes.users import users_bp
from routes.analytics import analytics_bp
import os


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'ocms-dev-secret-key-2024')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 'sqlite:///ocms.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-ocms-2024')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(enrollments_bp, url_prefix='/api/enrollments')
    app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    with app.app_context():
        db.create_all()
        seed_data()

    return app


def seed_data():
    from models import User, Course, Category
    from extensions import db
    import bcrypt
    from datetime import date, timedelta

    if User.query.first():
        return

    categories = ['Programming', 'Data Science', 'Design', 'Business', 'Mathematics']
    for name in categories:
        db.session.add(Category(name=name))
    db.session.flush()

    password_hash = bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode()
    admin = User(name='Admin User', email='admin@ocms.edu', password=password_hash, role='admin')
    inst1 = User(name='Dr. Priya Sharma', email='priya@ocms.edu', password=password_hash, role='instructor')
    inst2 = User(name='Prof. Arjun Mehta', email='arjun@ocms.edu', password=password_hash, role='instructor')
    stu1 = User(name='Riya Patel', email='riya@ocms.edu', password=password_hash, role='student')
    stu2 = User(name='Aryan Singh', email='aryan@ocms.edu', password=password_hash, role='student')
    db.session.add_all([admin, inst1, inst2, stu1, stu2])
    db.session.flush()

    programming = Category.query.filter_by(name='Programming').first()
    data_science = Category.query.filter_by(name='Data Science').first()
    design = Category.query.filter_by(name='Design').first()
    today = date.today()

    course_one = Course(
        title='Full Stack Web Development with React & Flask',
        description='A comprehensive course covering React.js frontend and Python Flask backend. Build real-world projects from scratch.',
        instructor_id=inst1.id,
        category_id=programming.id,
        status='published',
        price=0,
        start_date=today,
        end_date=today + timedelta(days=90),
        thumbnail_url='https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'
    )
    course_two = Course(
        title='Machine Learning Fundamentals',
        description='Learn the core concepts of ML: supervised learning, neural networks, and model evaluation using Python and scikit-learn.',
        instructor_id=inst2.id,
        category_id=data_science.id,
        status='published',
        price=999,
        start_date=today,
        end_date=today + timedelta(days=60),
        thumbnail_url='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400'
    )
    course_three = Course(
        title='UI/UX Design Principles',
        description='Master user interface design with Figma, wireframing, prototyping, and design systems.',
        instructor_id=inst1.id,
        category_id=design.id,
        status='published',
        price=499,
        start_date=today + timedelta(days=7),
        end_date=today + timedelta(days=67),
        thumbnail_url='https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'
    )
    db.session.add_all([course_one, course_two, course_three])
    db.session.commit()
    print("Database seeded successfully.")


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
