import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import loginBuilding from '../assets/login-building.png';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        setError('');
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed. Token may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: `url(${loginBuilding})`, backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundAttachment: 'fixed', position: 'relative', overflow: 'hidden', fontFamily: "'Outfit', sans-serif", padding: '1.5rem'
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)', zIndex: 1 }} />

            <div className="animate-scale-up" style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px',
                background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(32px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', overflow: 'hidden',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', padding: '3.5rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '18px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <KeyRound size={32} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>Reset Password</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Enter your new secure password below.</p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* New Password */}
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'} placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required
                                style={{ width: '100%', padding: '1.1rem 3.5rem 1.1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                            />
                        </div>

                        {error && <div style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1.1rem', fontSize: '1rem' }}>
                            {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Update Password'}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', color: '#34d399' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Success!</div>
                        <p style={{ color: '#fff' }}>Your password has been reset. Redirecting you to login...</p>
                        <Link to="/login" style={{ color: '#34d399', display: 'block', marginTop: '1.5rem' }}>Click here if you aren't redirected </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
