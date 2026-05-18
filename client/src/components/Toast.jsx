import { useEffect } from 'react';

/**
 * Toast notification component
 * Auto-dismisses after 3 seconds
 */
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        <span>{type === 'success' ? '✓' : '✕'} {message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>
          ×
        </button>
      </div>
    </div>
  );
}
