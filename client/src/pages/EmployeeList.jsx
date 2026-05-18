import { useState, useEffect } from 'react';
import API from '../api';
import Toast from '../components/Toast';

const DEPARTMENTS = ['All', 'Development', 'Design', 'Marketing', 'HR', 'Finance', 'Sales', 'Operations', 'QA'];

/**
 * EmployeeList — Displays employees in card grid with search, filter, edit, and delete
 */
export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let url = '/employees';
      if (filterDept !== 'All') {
        url = `/employees/search?department=${filterDept}`;
      }
      const { data } = await API.get(url);
      setEmployees(data);
    } catch (err) {
      setToast({ message: 'Failed to fetch employees', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [filterDept]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await API.delete(`/employees/${id}`);
      setToast({ message: 'Employee removed successfully', type: 'success' });
      fetchEmployees();
    } catch (err) {
      setToast({ message: 'Failed to delete employee', type: 'error' });
    }
  };

  const openEdit = (emp) => {
    setEditForm({ name: emp.name, email: emp.email, department: emp.department, performanceScore: emp.performanceScore, experience: emp.experience, skills: emp.skills });
    setEditModal(emp._id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/employees/${editModal}`, editForm);
      setToast({ message: 'Employee updated successfully', type: 'success' });
      setEditModal(null);
      fetchEmployees();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update', type: 'error' });
    }
  };

  const getScoreClass = (score) => score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  const filtered = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div><span>Loading employees...</span></div>;
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <p className="page-subtitle">Manage your team members and track performance</p>
      </div>

      {/* Search & Filter Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search by name, email, or skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id="search-employees" />
        </div>
        <select className="form-select" style={{ width: 'auto', minWidth: 180 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)} id="filter-department">
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d === 'All' ? '🏢 All Departments' : d}</option>)}
        </select>
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">👥</div><p>No employees found</p></div>
      ) : (
        <div className="employee-grid">
          {filtered.map((emp) => (
            <div className="employee-card" key={emp._id}>
              <div className="employee-card-header">
                <div>
                  <div className="employee-name">{emp.name}</div>
                  <div className="employee-dept">📧 {emp.email}</div>
                </div>
                <span className={`badge ${emp.performanceScore >= 80 ? 'badge-success' : emp.performanceScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                  {emp.department}
                </span>
              </div>

              <div className="tags-container">
                {emp.skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}
              </div>

              <div className="employee-meta">
                <div className="employee-meta-item">
                  <span>Performance</span>
                  <div className="score-bar-container" style={{ flex: 0.6 }}>
                    <div className="score-bar"><div className={`score-bar-fill ${getScoreClass(emp.performanceScore)}`} style={{ width: `${emp.performanceScore}%` }}></div></div>
                    <span className="score-value">{emp.performanceScore}</span>
                  </div>
                </div>
                <div className="employee-meta-item">
                  <span>Experience</span>
                  <span style={{ fontWeight: 600 }}>{emp.experience} yrs</span>
                </div>
              </div>

              <div className="employee-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id, emp.name)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Edit Employee</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Performance Score: {editForm.performanceScore}</label>
                <input type="range" min="0" max="100" value={editForm.performanceScore} onChange={(e) => setEditForm({ ...editForm, performanceScore: Number(e.target.value) })} style={{ width: '100%', accentColor: '#6366f1' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                <input className="form-input" type="number" min="0" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>Save Changes</button>
                <button className="btn btn-secondary" type="button" onClick={() => setEditModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
