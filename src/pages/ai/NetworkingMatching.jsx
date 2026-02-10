import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { networkingAPI } from '../../api';
import toast from 'react-hot-toast';

export default function NetworkingMatching() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.role = filter;
      if (search.trim()) params.search = search.trim();
      const res = await networkingAPI.allUsers(params);
      setUsers(res.data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => { if (search !== undefined) loadUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleConnect = async (user) => {
    setConnecting(user.user_id);
    try {
      await networkingAPI.connect({
        target_user_id: user.user_id,
        event_id: 'platform',
        message: `Hi ${user.name}, I'd like to connect!`,
      });
      toast.success(`Connection request sent to ${user.name}`);
      setUsers((prev) =>
        prev.map((u) => u.user_id === user.user_id ? { ...u, connection_status: 'pending' } : u)
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send connection');
    } finally {
      setConnecting(null);
    }
  };

  const roleColors = { organizer: 'primary', staff: 'blue', attendee: 'green', super_admin: 'red' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <span className="material-icons text-primary">hub</span>
              Networking & Connections
            </h1>
            <p className="text-sm text-gray-500">
              Discover and connect with attendees, organizers, and staff on the platform
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="material-icons text-gray-400 text-lg">people</span>
            <span className="text-gray-500">{users.length} users found</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, job title..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'attendee', 'organizer', 'staff'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-icons text-primary text-4xl animate-spin">refresh</span>
          </div>
        ) : users.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="material-icons text-gray-300 text-5xl mb-3">person_search</span>
            <p className="text-gray-500">No users found. Try a different search or filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card
                key={user.user_id}
                className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={user.name} src={user.avatar_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-charcoal truncate">{user.name}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {user.job_title ? `${user.job_title}` : ''}
                      {user.job_title && user.company ? ' @ ' : ''}
                      {user.company || ''}
                    </p>
                    {user.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{user.bio}</p>}
                  </div>
                  <Badge color={roleColors[user.role] || 'gray'} className="shrink-0 capitalize text-[10px]">
                    {user.role?.replace('_', ' ')}
                  </Badge>
                </div>
                {(user.interests?.length > 0 || user.skills?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {[...(user.interests || []), ...(user.skills || [])].slice(0, 4).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {user.connection_status === 'connected' ? (
                    <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
                      <span className="material-icons text-xs mr-1">check_circle</span>
                      Connected
                    </Button>
                  ) : user.connection_status === 'pending' ? (
                    <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
                      <span className="material-icons text-xs mr-1">schedule</span>
                      Pending
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      loading={connecting === user.user_id}
                      onClick={() => handleConnect(user)}
                    >
                      <span className="material-icons text-xs mr-1">person_add</span>
                      Connect
                    </Button>
                  )}
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <span className="material-icons text-gray-400 text-base">chat_bubble_outline</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* User Detail Modal */}
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Profile" size="md">
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={selectedUser.name} src={selectedUser.avatar_url} size="lg" />
                <div>
                  <h3 className="text-lg font-bold text-charcoal">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedUser.job_title}{selectedUser.company ? ` @ ${selectedUser.company}` : ''}
                  </p>
                  <Badge color={roleColors[selectedUser.role] || 'gray'} className="mt-1 capitalize">
                    {selectedUser.role?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {selectedUser.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-charcoal mb-1">About</h4>
                  <p className="text-sm text-gray-600">{selectedUser.bio}</p>
                </div>
              )}
              {selectedUser.industry && (
                <div>
                  <h4 className="text-sm font-semibold text-charcoal mb-1">Industry</h4>
                  <p className="text-sm text-gray-600">{selectedUser.industry}</p>
                </div>
              )}
              {(selectedUser.interests?.length > 0 || selectedUser.skills?.length > 0) && (
                <div>
                  <h4 className="text-sm font-semibold text-charcoal mb-2">Interests & Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...(selectedUser.interests || []), ...(selectedUser.skills || [])].map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                {selectedUser.connection_status === 'connected' ? (
                  <Button variant="outline" className="flex-1" disabled>
                    <span className="material-icons text-sm mr-1">check_circle</span>
                    Already Connected
                  </Button>
                ) : selectedUser.connection_status === 'pending' ? (
                  <Button variant="outline" className="flex-1" disabled>
                    <span className="material-icons text-sm mr-1">schedule</span>
                    Request Pending
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    loading={connecting === selectedUser.user_id}
                    onClick={() => handleConnect(selectedUser)}
                  >
                    <span className="material-icons text-sm mr-1">person_add</span>
                    Send Connection Request
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
