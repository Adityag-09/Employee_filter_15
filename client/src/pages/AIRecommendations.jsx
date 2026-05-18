import { useState, useEffect } from 'react';
import API from '../api';
import Toast from '../components/Toast';

const AI_TYPES = [
  { id: 'promotion', label: '🚀 Promotion', desc: 'Assess promotion readiness' },
  { id: 'training', label: '📚 Training', desc: 'Suggest training programs' },
  { id: 'ranking', label: '🏆 Ranking', desc: 'Rank employees by performance' },
  { id: 'feedback', label: '💬 Feedback', desc: 'Generate performance feedback' },
];

/**
 * AIRecommendations — Select employees, pick an analysis type, and get AI recommendations
 */
export default function AIRecommendations() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [type, setType] = useState('promotion');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await API.get('/employees');
        setEmployees(data);
      } catch {
        setToast({ message: 'Failed to load employees', type: 'error' });
      } finally {
        setFetching(false);
      }
    };
    fetchEmployees();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(selected.length === employees.length ? [] : employees.map((e) => e._id));
  };

  const handleRecommend = async () => {
    if (selected.length === 0) {
      setToast({ message: 'Please select at least one employee', type: 'error' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await API.post('/ai/recommend', { employeeIds: selected, type });
      setResult(data);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'AI recommendation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading-overlay"><div className="spinner"></div><span>Loading...</span></div>;
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">AI Insights</h1>
        <p className="page-subtitle">Generate AI-powered recommendations for your team</p>
      </div>

      {/* AI Type Selector */}
      <div className="ai-type-selector">
        {AI_TYPES.map((t) => (
          <button key={t.id} className={`ai-type-btn ${type === t.id ? 'active' : ''}`} onClick={() => setType(t.id)} id={`ai-type-${t.id}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* Employee Selection */}
        <div className="card" style={{ maxHeight: 500, overflowY: 'auto' }}>
          <div className="card-header">
            <h2 className="card-title">Select Employees</h2>
            <button className="btn btn-secondary btn-sm" onClick={selectAll}>
              {selected.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="empty-state"><p>No employees available</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {employees.map((emp) => (
                <label key={emp._id} className="checkbox-wrapper" style={{ padding: '0.75rem', background: selected.includes(emp._id) ? 'rgba(99,102,241,0.1)' : 'transparent', borderRadius: '0.5rem', border: selected.includes(emp._id) ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent' }}>
                  <input type="checkbox" checked={selected.includes(emp._id)} onChange={() => toggleSelect(emp._id)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.department} • Score: {emp.performanceScore}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleRecommend} disabled={loading || selected.length === 0} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} id="generate-ai-btn">
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Analyzing...</> : `✨ Generate ${AI_TYPES.find((t) => t.id === type)?.label}`}
          </button>
        </div>

        {/* AI Output */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">✨ AI Recommendation</h2>
            {result && <span className={`badge badge-info`}>{type.toUpperCase()}</span>}
          </div>

          {loading ? (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <span>AI is analyzing employee data...</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>This may take a few seconds</span>
            </div>
          ) : result ? (
            <div>
              <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {result.employees.map((e) => <span key={e.id} className="tag">{e.name}</span>)}
              </div>
              <div className="ai-output">{result.recommendation}</div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🤖</div>
              <p>Select employees and click Generate to get AI-powered recommendations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
