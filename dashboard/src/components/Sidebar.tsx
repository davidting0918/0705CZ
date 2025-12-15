import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 flex flex-col z-50">
      <div className="p-6 border-b border-gray-700">
        <div className="mb-1">
          <span className="text-xl font-normal text-gray-100 tracking-[0.3em]">0705CZ</span>
        </div>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Staff Dashboard</span>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <span className="block px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            主選單
          </span>
          <NavLink 
            to="/products" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-all mb-1 ${
                isActive 
                  ? 'bg-blue-500/15 text-blue-400' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-100'
              }`
            }
          >
            <span className="text-sm font-medium tracking-[0.05em] uppercase">產品</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-all mb-1 ${
                isActive 
                  ? 'bg-blue-500/15 text-blue-400' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-100'
              }`
            }
          >
            <span className="text-sm font-medium tracking-[0.05em] uppercase">設定</span>
          </NavLink>
        </div>
      </nav>
      
      <div className="p-5 border-t border-gray-700">
        <div className="flex flex-col mb-4">
          <span className="text-sm font-semibold text-gray-100">
            {user?.name || ''}
          </span>
          <span className="text-xs text-gray-500">
            {user?.email || ''}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-gray-100 rounded-lg transition-all uppercase tracking-[0.05em]"
        >
          登出
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
