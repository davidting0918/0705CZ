import { NavLink } from 'react-router-dom';

const Sidebar = () => {
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
            to="/orders" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-all mb-1 ${
                isActive 
                  ? 'bg-blue-500/15 text-blue-400' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-100'
              }`
            }
          >
            <span className="text-sm font-medium tracking-[0.05em] uppercase">訂單追蹤</span>
          </NavLink>
          <NavLink 
            to="/stock" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-all mb-1 ${
                isActive 
                  ? 'bg-blue-500/15 text-blue-400' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-100'
              }`
            }
          >
            <span className="text-sm font-medium tracking-[0.05em] uppercase">庫存管理</span>
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
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-100">管理員</span>
          <span className="text-xs text-gray-500">Store Manager</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
