import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import loginBuilding from '../assets/login-building.png';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            // Successful registration
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Account creation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url(${loginBuilding})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Outfit', sans-serif",
            padding: '1.5rem'
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%)', zIndex: 1 }} />

            <div className="animate-scale-up" style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '1000px',
                minHeight: '650px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(32px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Branding Panel */}
                <div style={{
                    padding: '4rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '-2px', marginBottom: '1rem' }}>
                        Dormitory<br />Management<br />System
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '280px', marginBottom: '1rem' }}>Join the ultimate platform for dormitory and resident tracking.</p>
                </div>

                {/* Form Panel */}
                <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '400', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Join the Staff</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Name */}
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                required type="text" placeholder="Full Name" value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', outline: 'none'
                                }}
                            />
                        </div>

                        {/* Email */}
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                required type="email" placeholder="Email Address" value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', outline: 'none'
                                }}
                            />
                        </div>

                        {/* Password Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    required type={showPassword ? 'text' : 'password'} placeholder="New Password"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{
                                        width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', outline: 'none'
                                    }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    required type={showPassword ? 'text' : 'password'} placeholder="Verify"
                                    value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    style={{
                                        width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {error && <div style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

                        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1rem', fontWeight: '800', marginTop: '1rem' }}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                        </button>

                        <Link to="/login" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            Already have an account? <span style={{ color: '#fff', fontWeight: '600' }}>Login</span>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
