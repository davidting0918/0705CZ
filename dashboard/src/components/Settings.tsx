import { currentAdmin } from '../data/dashboardData';

const Settings = () => {
  // Generate initials for avatar placeholder
  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-container">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-100 mb-2">設定</h1>
        <p className="text-gray-400 text-sm">管理您的帳戶資訊</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            {/* Admin Photo/Avatar */}
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-6">
              {currentAdmin.photo ? (
                <img 
                  src={currentAdmin.photo} 
                  alt={currentAdmin.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl font-light text-white tracking-wider">
                    {getInitials(currentAdmin.name)}
                  </span>
                </div>
              )}
            </div>

            {/* Admin Name */}
            <h2 className="text-2xl font-normal text-gray-100 mb-2 tracking-[0.05em]">
              {currentAdmin.name}
            </h2>

            {/* Admin Role */}
            <p className="text-sm text-gray-400 uppercase tracking-[0.1em]">
              {currentAdmin.role}
            </p>
          </div>

          {/* Admin Info Section */}
          <div className="border-t border-gray-700 pt-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-6 tracking-[0.05em] uppercase">
              帳戶資訊
            </h3>
            <div className="grid gap-6">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">姓名</span>
                <span className="text-gray-100 text-sm font-medium">{currentAdmin.name}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-gray-400 text-sm">職位</span>
                <span className="text-gray-100 text-sm font-medium">{currentAdmin.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
