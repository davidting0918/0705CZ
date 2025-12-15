import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { user, loading, fetchAdminProfile, isAuthenticated } = useAuth();

  // Fetch admin profile if authenticated but user data is incomplete or missing
  useEffect(() => {
    if (isAuthenticated && (!user || !user.admin_id)) {
      fetchAdminProfile();
    }
  }, [isAuthenticated, user, fetchAdminProfile]);

  // Generate initials for avatar placeholder
  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">載入中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">無法載入使用者資訊</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-100 mb-2">設定</h1>
        <p className="text-gray-400 text-sm">管理您的帳戶資訊</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center">
              {/* Admin Photo/Avatar */}
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-6">
                {user.photo_url ? (
                  <img 
                    src={user.photo_url} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-4xl font-light text-white tracking-wider">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Admin Name */}
              <h2 className="text-2xl font-normal text-gray-100 mb-2 tracking-[0.05em]">
                {user.name}
              </h2>

              {/* Admin Email */}
              <p className="text-sm text-gray-400 uppercase tracking-[0.1em]">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-6 tracking-[0.05em] uppercase">
              帳戶資訊
            </h3>
            <div className="grid gap-6">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">管理員 ID</span>
                <span className="text-gray-100 text-sm font-medium">{user.admin_id || user.user_id || '-'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">姓名</span>
                <span className="text-gray-100 text-sm font-medium">{user.name || '-'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">電子郵件</span>
                <span className="text-gray-100 text-sm font-medium">{user.email || '-'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">電話</span>
                <span className="text-gray-100 text-sm font-medium">{user.phone || '-'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">Google ID</span>
                <span className="text-gray-100 text-sm font-medium">{user.google_id || '-'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">狀態</span>
                <span className={`text-sm font-medium ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  {user.is_active ? '啟用' : '停用'}
                </span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">建立時間</span>
                <span className="text-gray-100 text-sm font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleString('zh-TW') : '-'}
                </span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">更新時間</span>
                <span className="text-gray-100 text-sm font-medium">
                  {user.updated_at ? new Date(user.updated_at).toLocaleString('zh-TW') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

