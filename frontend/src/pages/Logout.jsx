import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all session data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('theme'); // Optional: whether to keep theme or not
    
    // Notify App.jsx about the storage change
    window.dispatchEvent(new Event('storage'));

    // Redirect to login after a short delay for visual feedback
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '4rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(99, 102, 241, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 2rem',
          color: 'var(--primary)'
        }}>
          <LogOut size={40} className="animate-spin" />
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Logging Out</h2>
        <p style={{ color: 'var(--text-muted)' }}>Thank you for using Dormify. Redirecting you to the login page...</p>
        
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10b981' }}>
          <CheckCircle size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Session cleared successfully</span>
        </div>
      </div>
    </div>
  );
};

export default Logout;
