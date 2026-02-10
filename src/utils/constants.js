/**
 * Shared constants for the NetSync frontend.
 */

export const APP_NAME = 'NetSync';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORGANIZER: 'organizer',
  STAFF: 'staff',
  ATTENDEE: 'attendee',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  organizer: 'Organizer',
  staff: 'Staff',
  attendee: 'Attendee',
};

export const ROLE_ICONS = {
  super_admin: 'admin_panel_settings',
  organizer: 'event',
  staff: 'badge',
  attendee: 'group',
};

export const EVENT_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  LIVE: 'live',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const SESSION_TRACKS = {
  engineering: { label: 'Engineering', color: '#f47b25' },
  design: { label: 'Design', color: '#3b82f6' },
  product: { label: 'Product', color: '#10b981' },
  business: { label: 'Business', color: '#8b5cf6' },
  workshop: { label: 'Workshop', color: '#ec4899' },
  keynote: { label: 'Keynote', color: '#f59e0b' },
  social: { label: 'Social', color: '#06b6d4' },
};

export const NAV_ITEMS = {
  organizer: [
    { label: 'Dashboard', icon: 'dashboard', path: '/organizer/dashboard' },
    { label: 'Create Event', icon: 'add_circle', path: '/organizer/events/create' },
    { label: 'Sessions', icon: 'calendar_month', path: '/organizer/sessions/scheduler' },
    { label: 'Badge Designer', icon: 'badge', path: '/organizer/badges/designer' },
    { label: 'Billing', icon: 'credit_card', path: '/organizer/billing' },
    { label: 'Venue Editor', icon: 'map', path: '/venue/editor' },
    { label: 'AI Chat', icon: 'smart_toy', path: '/ai/chat' },
    { label: 'Polls & Q&A', icon: 'poll', path: '/polls' },
    { label: 'Settings', icon: 'settings', path: '/settings/profile' },
  ],
  attendee: [
    { label: 'My Hub', icon: 'dashboard', path: '/attendee/hub' },
    { label: 'Agenda', icon: 'calendar_today', path: '/attendee/agenda' },
    { label: 'Networking', icon: 'hub', path: '/ai/networking' },
    { label: 'Search', icon: 'search', path: '/ai/search' },
    { label: 'AI Chat', icon: 'smart_toy', path: '/ai/chat' },
    { label: 'Polls & Q&A', icon: 'poll', path: '/polls' },
    { label: 'PWA App', icon: 'phone_iphone', path: '/attendee/pwa' },
    { label: 'Settings', icon: 'settings', path: '/settings/profile' },
  ],
  staff: [
    { label: 'Operations', icon: 'work', path: '/staff/dashboard' },
    { label: 'AI Chat', icon: 'smart_toy', path: '/ai/chat' },
    { label: 'Settings', icon: 'settings', path: '/settings/profile' },
  ],
  super_admin: [
    { label: 'Command Center', icon: 'dashboard', path: '/admin/dashboard' },
    { label: 'Deployment', icon: 'rocket_launch', path: '/admin/deployment' },
    { label: 'AI Chat', icon: 'smart_toy', path: '/ai/chat' },
    { label: 'Settings', icon: 'settings', path: '/settings/profile' },
  ],
};
