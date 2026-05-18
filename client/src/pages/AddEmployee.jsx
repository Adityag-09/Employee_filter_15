import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Toast from '../components/Toast';

const DEPARTMENTS = ['Development', 'Design', 'Marketing', 'HR', 'Finance', 'Sales', 'Operations', 'QA'];

/**
 * AddEmployee — Employee registration form with tag-based skill input
 */
export default function AddEmployee() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'Development',
    skills: [],
    performanceScore: 75,
    experience: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'performanceScore' || name === 'experience' ? Number(value) : value }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const removeSkill = (skillToRemove) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || form.skills.length === 0) {
      setToast({ message: 'Please fill all required fields and add at least one skill', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await API.post('/employees', form);
      setToast({ message: 'Employee stored successfully!', type: 'success' });
      setTimeout(() => navigate('/employees'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to add employee', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <h1 className="page-title">Add Employee</h1>
        <p className="page-subtitle">Register a new employee in the system</p>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="emp-name">Employee Name *</label>
              <input id="emp-name" className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Aman Verma" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="emp-email">Email *</label>
              <input id="emp-email" className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="aman@gmail.com" />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="emp-department">Department *</label>
              <select id="emp-department" className="form-select" name="department" value={form.department} onChange={handleChange}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="emp-experience">Years of Experience *</label>
              <input id="emp-experience" className="form-input" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-score">Performance Score: {form.performanceScore}</label>
            <input id="emp-score" type="range" min="0" max="100" name="performanceScore" value={form.performanceScore} onChange={handleChange}
              style={{ width: '100%', accentColor: '#6366f1', height: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <span>0</span><span>50</span><span>100</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-skills">Skills * (press Enter to add)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input id="emp-skills" className="form-input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="e.g. React, Node.js" />
              <button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button>
            </div>
            <div className="tags-container">
              {form.skills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                  <button type="button" className="tag-remove" onClick={() => removeSkill(skill)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} id="add-employee-submit" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Adding...</> : '➕ Add Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}
