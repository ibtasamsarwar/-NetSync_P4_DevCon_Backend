import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isPublic = !user;

  return (
    <nav className="sticky top-0 z-40 glass border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold text-charcoal">
              Net<span className="text-primary">Sync</span>
            </span>
          </Link>

          {/* Public nav links */}
          {isPublic && (
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-gray-600 hover:text-charcoal transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          )}

          {/* Authenticated actions */}
          {user && (
            <div className="flex items-center gap-4">
              <SearchBar
                value=""
                onChange={() => {}}
                placeholder="Search events, sessions..."
                className="hidden lg:block w-64"
              />

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="material-icons-outlined text-gray-500 text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Avatar name={`${user.first_name} ${user.last_name}`} src={user.avatar_url} size="sm" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-charcoal">{user.first_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                  </div>
                  <span className="material-icons text-gray-400 text-[18px]">expand_more</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      to="/settings/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="material-icons-outlined text-[18px]">person</span>
                      Profile
                    </Link>
                    <Link
                      to="/settings/accessibility"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="material-icons-outlined text-[18px]">accessibility</span>
                      Accessibility
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <span className="material-icons-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Public CTA */}
          {isPublic && (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-charcoal transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/login"
                className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
