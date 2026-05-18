import { useState, useEffect } from 'react';
import API from '../api';

/**
 * Analytics — Employee rankings, department analytics, skills distribution
 */
export default function Analytics() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await API.get('/employees');
        setEmployees(data);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Rankings — sorted by performance score
  const ranked = [...employees].sort((a, b) => b.performanceScore - a.performanceScore);

  // Department stats
  const deptStats = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) acc[emp.department] = { count: 0, totalScore: 0, totalExp: 0 };
    acc[emp.department].count++;
    acc[emp.department].totalScore += emp.performanceScore;
    acc[emp.department].totalExp += emp.experience;
    return acc;
  }, {});

  // Skills distribution
  const skillCounts = employees.reduce((acc, emp) => {
    emp.skills.forEach((s) => { acc[s] = (acc[s] || 0) + 1; });
    return acc;
  }, {});
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const maxSkillCount = topSkills.length > 0 ? topSkills[0][1] : 1;

  // Score distribution
  const scoreBuckets = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
  employees.forEach((emp) => {
    if (emp.performanceScore <= 25) scoreBuckets['0-25']++;
    else if (emp.performanceScore <= 50) scoreBuckets['26-50']++;
    else if (emp.performanceScore <= 75) scoreBuckets['51-75']++;
    else scoreBuckets['76-100']++;
  });
  const maxBucket = Math.max(...Object.values(scoreBuckets), 1);

  const getScoreClass = (score) => score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div><span>Loading analytics...</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Performance insights and team analytics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Score Distribution */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">📊 Score Distribution</h2></div>
          <div className="bar-chart">
            {Object.entries(scoreBuckets).map(([range, count]) => (
              <div className="bar-item" key={range}>
                <div className="bar-value">{count}</div>
                <div className="bar" style={{ height: `${(count / maxBucket) * 140}px`, background: range === '76-100' ? 'linear-gradient(to top, #10b981, #34d399)' : range === '51-75' ? 'linear-gradient(to top, #6366f1, #818cf8)' : range === '26-50' ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 'linear-gradient(to top, #ef4444, #f87171)' }}></div>
                <div className="bar-label">{range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">🛠️ Top Skills</h2></div>
          {topSkills.length === 0 ? (
            <div className="empty-state"><p>No data</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topSkills.map(([skill, count]) => (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ minWidth: 80, fontSize: '0.8rem', color: '#94a3b8' }}>{skill}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / maxSkillCount) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 999, transition: 'width 0.6s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: 20 }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Analytics */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h2 className="card-title">🏢 Department Analytics</h2></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Department</th><th>Employees</th><th>Avg Score</th><th>Avg Experience</th><th>Performance</th></tr></thead>
            <tbody>
              {Object.entries(deptStats).sort((a, b) => (b[1].totalScore / b[1].count) - (a[1].totalScore / a[1].count)).map(([dept, stats]) => {
                const avgScore = Math.round(stats.totalScore / stats.count);
                const avgExp = (stats.totalExp / stats.count).toFixed(1);
                return (
                  <tr key={dept}>
                    <td style={{ fontWeight: 600 }}>{dept}</td>
                    <td>{stats.count}</td>
                    <td><span className={`badge ${avgScore >= 70 ? 'badge-success' : avgScore >= 40 ? 'badge-warning' : 'badge-danger'}`}>{avgScore}</span></td>
                    <td>{avgExp} yrs</td>
                    <td><div className="score-bar-container"><div className="score-bar"><div className={`score-bar-fill ${getScoreClass(avgScore)}`} style={{ width: `${avgScore}%` }}></div></div></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="card">
        <div className="card-header"><h2 className="card-title">🏆 Employee Rankings</h2></div>
        {ranked.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><p>No employees</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Rank</th><th>Name</th><th>Department</th><th>Skills</th><th>Score</th><th>Experience</th></tr></thead>
              <tbody>
                {ranked.map((emp, idx) => (
                  <tr key={emp._id}>
                    <td style={{ fontWeight: 800, color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : '#64748b' }}>#{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td><div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>{emp.skills.slice(0, 3).map((s) => <span key={s} className="tag">{s}</span>)}{emp.skills.length > 3 && <span className="tag">+{emp.skills.length - 3}</span>}</div></td>
                    <td><div className="score-bar-container"><div className="score-bar" style={{ width: 80 }}><div className={`score-bar-fill ${getScoreClass(emp.performanceScore)}`} style={{ width: `${emp.performanceScore}%` }}></div></div><span className="score-value">{emp.performanceScore}</span></div></td>
                    <td>{emp.experience} yrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
