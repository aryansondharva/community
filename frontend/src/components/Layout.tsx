import { Link, Outlet, useLocation } from 'react-router-dom';
import { Database, Search, Calendar, Zap, LayoutDashboard } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sources', label: 'Data Sources', icon: Database },
  { path: '/jobs', label: 'Jobs', icon: Zap },
  { path: '/schedules', label: 'Schedules', icon: Calendar },
  { path: '/search', label: 'Search', icon: Search },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <Zap size={28} />
          <span>Info Hunter</span>
        </div>
        <nav>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
