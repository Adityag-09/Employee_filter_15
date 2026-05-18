import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard — Overview with stats, top performers, and department distribution
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await API.get('/employees');
        setEmployees(data);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Compute stats
  const totalEmployees = employees.length;
  const avgScore = totalEmployees > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.performanceScore, 0) / totalEmployees)
    : 0;
  const topPerformers = [...employees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5);

  // Department distribution
  const deptCounts = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});
  const maxDeptCount = Math.max(...Object.values(deptCounts), 1);

  // High performers count (score >= 80)
  const highPerformers = employees.filter((e) => e.performanceScore >= 80).length;

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div><span>Loading dashboard...</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}! Here's your employee analytics overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalEmployees}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgScore}</div>
          <div className="stat-label">Avg Performance Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{highPerformers}</div>
          <div className="stat-label">High Performers (≥80)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(deptCounts).length}</div>
          <div className="stat-label">Departments</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏆 Top Performers</h2>
          </div>
          {topPerformers.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><p>No employees yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topPerformers.map((emp, idx) => (
                <div key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : '#64748b', minWidth: 30 }}>#{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{emp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.department}</div>
                  </div>
                  <span className={`badge ${emp.performanceScore >= 80 ? 'badge-success' : emp.performanceScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                    {emp.performanceScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏢 Departments</h2>
          </div>
          {Object.keys(deptCounts).length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🏢</div><p>No data available</p></div>
          ) : (
            <div className="bar-chart">
              {Object.entries(deptCounts).map(([dept, count]) => (
                <div className="bar-item" key={dept}>
                  <div className="bar-value">{count}</div>
                  <div className="bar" style={{ height: `${(count / maxDeptCount) * 160}px` }}></div>
                  <div className="bar-label">{dept}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
