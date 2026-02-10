import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, ROLE_LABELS } from '../../utils/constants';
import { clsx } from 'clsx';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS.attendee;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16">
      {/* User card */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar name={`${user.first_name} ${user.last_name}`} src={user.avatar_url} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        </div>
        {user.role === 'organizer' && (
          <div className="mt-3 p-2.5 bg-primary/5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">Pro Organizer</span>
              <Badge color="primary">UPGRADE</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
              )}
            >
              <span className={clsx('material-icons-outlined text-[20px]', isActive && 'text-primary')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100">
        <Link
          to="/settings/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="material-icons-outlined text-[20px]">settings</span>
          Settings
        </Link>
      </div>
    </aside>
  );
}
