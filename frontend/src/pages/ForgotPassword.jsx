import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Mail, Loader2, ArrowLeft, Send } from 'lucide-react';
import loginBuilding from '../assets/login-building.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage('A reset link has been generated. Since we are in development, check your terminal/console for the link!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset link');
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
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)', zIndex: 1 }} />

            <div className="animate-scale-up" style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px',
                background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(32px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', overflow: 'hidden',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', padding: '3.5rem'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0' }}>
                        <ArrowLeft size={18} /> Back to Login
                    </button>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>Forgot Password</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required
                                style={{
                                    width: '100%', padding: '1.1rem 1.1rem 1.1rem 3rem', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '1rem'
                                }}
                            />
                        </div>
                        {error && <div style={{ color: '#f87171', fontSize: '0.9rem' }}>{error}</div>}
                        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1.1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Reset Link</>}
                        </button>
                    </form>
                ) : (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '16px', color: '#34d399', textAlign: 'center' }}>
                        <p style={{ fontWeight: '600' }}>{message}</p>
                        <Link to="/login" style={{ color: '#fff', display: 'block', marginTop: '1rem', textDecoration: 'underline' }}>Return to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
