import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ocms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ocms_token');
      localStorage.removeItem('ocms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Courses
export const coursesAPI = {
  getAll: (params) => api.get('/courses/', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses/', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  myCourses: () => api.get('/courses/instructor/my-courses'),
  categories: () => api.get('/courses/categories'),
};

// Enrollments
export const enrollmentsAPI = {
  enroll: (course_id) => api.post('/enrollments/', { course_id }),
  myEnrollments: () => api.get('/enrollments/my-enrollments'),
  updateProgress: (id, progress) => api.put(`/enrollments/${id}/progress`, { progress }),
  courseStudents: (course_id) => api.get(`/enrollments/course/${course_id}/students`),
};

// Assignments
export const assignmentsAPI = {
  byCourse: (course_id) => api.get(`/assignments/course/${course_id}`),
  create: (data) => api.post('/assignments/', data),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade: (id, sub_id, data) => api.put(`/assignments/${id}/grade/${sub_id}`, data),
  submissions: (assignment_id) => api.get(`/assignments/${assignment_id}/submissions`),
};

// Analytics
export const analyticsAPI = {
  admin: () => api.get('/analytics/admin/overview'),
  instructor: () => api.get('/analytics/instructor/overview'),
  student: () => api.get('/analytics/student/overview'),
};

// Users
export const usersAPI = {
  getAll: () => api.get('/users/'),
  update: (id, data) => api.put(`/users/${id}`, data),
};
