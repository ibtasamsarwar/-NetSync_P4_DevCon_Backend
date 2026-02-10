import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify2FA: (data) => api.post('/auth/verify-2fa', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: (token) => api.post('/auth/refresh', { refresh_token: token }),
};

export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.post('/users/me/change-password', data),
  updateAccessibility: (data) => api.put('/users/me/accessibility', data),
  toggle2FA: (enabled) => api.post('/users/me/2fa', { enabled }),
  getSessions: () => api.get('/users/me/sessions'),
  logoutSession: (index) => api.delete(`/users/me/sessions/${index}`),
};

export const eventsAPI = {
  list: (params) => api.get('/events', { params }),
  get: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  publish: (id) => api.post(`/events/${id}/publish`),
};

export const sessionsAPI = {
  list: (eventId, params) => api.get('/sessions', { params: { event_id: eventId, ...params } }),
  get: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
};

export const ticketsAPI = {
  listTypes: (eventId) => api.get('/tickets/types', { params: { event_id: eventId } }),
  createType: (data) => api.post('/tickets/types', data),
  register: (data) => api.post('/tickets/register', data),
  myRegistrations: () => api.get('/tickets/my-registrations'),
  eventRegistrations: (eventId, params) => api.get(`/tickets/event/${eventId}/registrations`, { params }),
  checkIn: (registrationId) => api.post('/tickets/check-in', { registration_id: registrationId }),
  updateSessions: (regId, sessionIds) => api.post(`/tickets/registrations/${regId}/sessions`, sessionIds),
  getQRTicket: (registrationId) => api.get(`/tickets/my-qr/${registrationId}`),
};

export const pollsAPI = {
  create: (data) => api.post('/polls', data),
  get: (id) => api.get(`/polls/${id}`),
  eventPolls: (eventId) => api.get(`/polls/event/${eventId}`),
  launch: (id) => api.post(`/polls/${id}/launch`),
  vote: (id, optionId) => api.post(`/polls/${id}/vote`, { option_id: optionId }),
  close: (id) => api.post(`/polls/${id}/close`),
  askQuestion: (data) => api.post('/polls/questions', data),
  upvoteQuestion: (id) => api.post(`/polls/questions/${id}/upvote`),
  eventQuestions: (eventId, sort) => api.get(`/polls/questions/event/${eventId}`, { params: { sort } }),
};

export const venuesAPI = {
  eventVenues: (eventId) => api.get(`/venues/event/${eventId}`),
  create: (data) => api.post('/venues', data),
  createFloorPlan: (data) => api.post('/venues/floor-plans', data),
  getFloorPlan: (id) => api.get(`/venues/floor-plans/${id}`),
  updateFloorPlan: (id, data) => api.put(`/venues/floor-plans/${id}`, data),
};

export const badgesAPI = {
  eventBadges: (eventId) => api.get(`/badges/event/${eventId}`),
  get: (id) => api.get(`/badges/${id}`),
  create: (data) => api.post('/badges', data),
  update: (id, data) => api.put(`/badges/${id}`, data),
};

export const billingAPI = {
  plans: () => api.get('/billing/plans'),
  invoices: () => api.get('/billing/invoices'),
  invoice: (id) => api.get(`/billing/invoices/${id}`),
  paymentMethods: () => api.get('/billing/payment-methods'),
  addPaymentMethod: (data) => api.post('/billing/payment-methods', data),
  usage: () => api.get('/billing/usage'),
};

export const analyticsAPI = {
  organizerOverview: () => api.get('/analytics/organizer/overview'),
  eventAnalytics: (eventId) => api.get(`/analytics/event/${eventId}`),
  eventInsights: (eventId) => api.get(`/analytics/event/${eventId}/insights`),
};

export const networkingAPI = {
  matches: (eventId) => api.get(`/networking/matches/${eventId}`),
  allUsers: (params) => api.get('/networking/all-users', { params }),
  connect: (data) => api.post('/networking/connect', data),
  connections: (eventId) => api.get('/networking/connections', { params: { event_id: eventId } }),
  acceptConnection: (id) => api.post(`/networking/connections/${id}/accept`),
  scheduleMeeting: (data) => api.post('/networking/schedule-meeting', data),
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, null, { params: { role } }),
  toggleUserStatus: (id, active) => api.put(`/admin/users/${id}/status`, null, { params: { active } }),
  systemAlerts: () => api.get('/admin/system/alerts'),
  deployment: () => api.get('/admin/deployment'),
  exportUsers: (params) => api.get('/admin/users/export', { params, responseType: 'blob' }),
};

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  search: (data) => api.post('/ai/search', data),
  agenda: (eventId) => api.get(`/ai/agenda/${eventId}`),
  sessionSummary: (sessionId) => api.get(`/ai/summary/${sessionId}`),
};

export const uploadsAPI = {
  uploadFile: (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/uploads/file?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPresignedUrl: (key) => api.get('/uploads/presigned-url', { params: { key } }),
  getUploadUrl: (filename, contentType, folder) =>
    api.post('/uploads/presigned-upload', null, {
      params: { filename, content_type: contentType, folder },
    }),
  deleteFile: (key) => api.delete('/uploads/file', { params: { key } }),
};

export const attendanceAPI = {
  enroll: (formData) =>
    api.post('/attendance/enroll', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  enrollBulk: (formData) =>
    api.post('/attendance/enroll-bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  verify: (formData) =>
    api.post('/attendance/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  listEnrollments: (eventId, params) =>
    api.get(`/attendance/enrollments/${eventId}`, { params }),
  deleteEnrollment: (id) => api.delete(`/attendance/enrollments/${id}`),
  getLog: (eventId, params) => api.get(`/attendance/log/${eventId}`, { params }),
  getStats: (eventId) => api.get(`/attendance/stats/${eventId}`),
};
