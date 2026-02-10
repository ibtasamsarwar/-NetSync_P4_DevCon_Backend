import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import Avatar from '../common/Avatar';
import { useState, useRef, useEffect } from 'react';
import { eventsAPI, sessionsAPI } from '../../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const isPublic = !user;

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
      if (!e.target.closest('.user-menu-container')) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowResults(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const [evRes, sesRes] = await Promise.all([
          eventsAPI.list({ search: searchQuery, limit: 5 }),
          Promise.resolve({ data: { sessions: [] } }), // sessions need event_id
        ]);
        const events = (evRes.data.events || []).map((e) => ({ ...e, _type: 'event' }));
        setSearchResults(events);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleResultClick = (item) => {
    setShowResults(false);
    setSearchQuery('');
    if (item._type === 'event') navigate(`/organizer/events`);
    else if (item._type === 'session') navigate(`/organizer/sessions/scheduler`);
  };

  return (
    <nav className="sticky top-0 z-40 glass border-b border-gray-100 w-full">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
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
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Search */}
              <div ref={searchRef} className="relative hidden lg:block w-72">
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder="Search events, sessions..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                {showResults && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-72 overflow-auto">
                    {searching ? (
                      <div className="p-4 text-center text-sm text-gray-400">
                        <span className="material-icons text-lg animate-spin mr-1">refresh</span> Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400">No results found</div>
                    ) : (
                      searchResults.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleResultClick(item)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm border-b border-gray-50 last:border-0"
                        >
                          <span className="material-icons text-primary text-[18px]">
                            {item._type === 'event' ? 'event' : 'calendar_month'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-charcoal truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 capitalize">{item._type}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="material-icons-outlined text-gray-500 text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative user-menu-container">
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
