import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Lock, Moon, Sun, Shield, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            return setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            setUploading(true);
            try {
                const { data } = await api.post('/auth/update-photo', { photo: base64String });
                setUser({ ...user, profilePhoto: data.photo });
                
                // Update local storage user object if exists
                const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...localUser, profilePhoto: data.photo }));
                
                setMessage({ type: 'success', text: 'Profile photo updated!' });
                window.dispatchEvent(new Event('storage')); // Notify Navbar
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to upload photo' });
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.className = newTheme === 'light' ? 'light-theme' : '';
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }

        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
        }
    };

    if (!user) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Loading Admin Profile...</div>;

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>Account Settings</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Profile Section (Top) */}
                <div className="glass" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div 
                            onClick={() => document.getElementById('photoInput').click()}
                            style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, var(--primary), #818cf8)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'white',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: '4px solid var(--glass-border)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={56} />
                            )}
                            {uploading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            id="photoInput" 
                            hidden 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{user.name}</h2>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <Mail size={16} /> <span>{user.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <Shield size={16} /> <span>Administrator</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Section (Below Profile) */}
                <div className="glass" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Lock size={20} color="var(--primary)" />
                        <h3>Change Password</h3>
                    </div>

                    {message.text && (
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            marginBottom: '1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#10b981' : '#ef4444',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Current Password</label>
                            <input 
                                required 
                                type="password" 
                                placeholder="Enter current password"
                                value={passwordData.currentPassword} 
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>New Password</label>
                            <input 
                                required 
                                type="password" 
                                placeholder="Min. 6 characters"
                                value={passwordData.newPassword} 
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Confirm New Password</label>
                            <input 
                                required 
                                type="password" 
                                placeholder="Repeat new password"
                                value={passwordData.confirmPassword} 
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                            Update Password
                        </button>
                    </form>
                </div>

                {/* Dark/Light Mode Section (Bottom) */}
                <div className="glass" style={{ padding: '2rem 2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'var(--glass-bg)', padding: '0.75rem', borderRadius: '12px' }}>
                                {theme === 'dark' ? <Moon size={24} color="var(--primary)" /> : <Sun size={24} color="#f59e0b" />}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem' }}>Interface Theme</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Switch between dark and light modes</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleThemeToggle}
                            className="glass" 
                            style={{ 
                                padding: '0.75rem 1.5rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                fontWeight: '600'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
