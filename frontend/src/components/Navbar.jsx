import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, DoorOpen, LogOut, User, 
  Trash2,
  CreditCard, Wrench, Bell, Shield, ArrowRightLeft 
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user') || '{}'));

  React.useEffect(() => {
    const handleStorage = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <nav className="glass" style={{ margin: '1rem', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Dormify
      </div>
      <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
        <li>
          <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/students" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Students
          </Link>
        </li>
        <li>
          <Link to="/rooms" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DoorOpen size={18} /> Rooms
          </Link>
        </li>
        <li>
          <Link to="/payments" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} /> Payments
          </Link>
        </li>
        <li>
          <Link to="/maintenance" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={18} /> Issues
          </Link>
        </li>
        <li>
          <Link to="/notices" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} /> Notices
          </Link>
        </li>
        <li>
          <Link to="/admins" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} /> Staff
          </Link>
        </li>
        <li>
          <Link to="/transfers" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft size={18} /> Transfers
          </Link>
        </li>
        <li>
          <Link to="/recycle-bin" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={18} /> Trash
          </Link>
        </li>
        <li>
          <NotificationCenter />
        </li>
        <li>
          <Link to="/profile" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              : <User size={18} />}
            Profile
          </Link>
        </li>
      </ul>
      <button 
        onClick={handleLogout}
        className="btn-primary" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
      >
        <LogOut size={16} /> Logout
      </button>
    </nav>
  );
};

export default Navbar;
