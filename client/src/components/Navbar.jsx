import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — Sticky navigation bar with auth-aware links
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">📊</div>
          <span>EmpAnalytics</span>
        </div>

        <ul className="navbar-links">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
          <li><NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>Employees</NavLink></li>
          <li><NavLink to="/add-employee" className={({ isActive }) => isActive ? 'active' : ''}>Add Employee</NavLink></li>
          <li><NavLink to="/ai-recommendations" className={({ isActive }) => isActive ? 'active' : ''}>AI Insights</NavLink></li>
          <li><NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>Analytics</NavLink></li>
        </ul>

        <div className="navbar-user">
          <span>👤 {user.name}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
