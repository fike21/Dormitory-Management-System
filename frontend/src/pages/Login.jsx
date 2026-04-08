import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import loginBuilding from '../assets/login-building.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) navigate('/');
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShake(false);
        try {
            const { data } = await api.post('/auth/login', { email: email.trim(), password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.dispatchEvent(new Event('storage'));
            navigate('/');
        } catch (err) {
            const message = err.response ? (err.response.data.error || 'Invalid credentials') : 'Cannot connect to server. Please ensure the backend is running.';
            setError(message);
            setShake(true);
            setTimeout(() => setShake(false), 600);
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
            {/* Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.2) 100%)',
                zIndex: 1
            }} />

            {/* Main Glass Card */}
            <div
                className="animate-scale-up"
                style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    maxWidth: '1000px',
                    minHeight: '600px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(32px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
                    ...(shake ? { animation: 'shake 0.5s' } : {})
                }}
            >
                {/* Left Column: Branding */}
                <div style={{
                    padding: '4rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '900',
                        lineHeight: '1.1',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '-2px',
                        marginBottom: '1rem'
                    }}>
                        Dormitory<br />
                        Management<br />
                        System
                    </h1>
                    <div style={{ width: '60px', height: '4px', background: 'var(--primary)', borderRadius: '2px' }} />
                </div>

                {/* Right Column: Login Form */}
                <div style={{
                    padding: '4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.1)'
                }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: 'rgba(255,255,255,0.9)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            Welcome To Dormitory Management Systems Login
                        </h2>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Email Input */}
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                type="email"
                                placeholder="Email / Username"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                            />
                        </div>

                        {/* Password Input */}
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem 3.5rem 1rem 3rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && (
                            <div style={{ fontSize: '0.85rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(30, 58, 138, 0.8)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '120px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                marginTop: '1rem',
                                boxShadow: '0 10px 30px -10px rgba(30, 58, 138, 0.5)'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(30, 58, 138, 1)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(30, 58, 138, 0.8)'}
                        >
                            {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Login'}
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem' }}>
                            <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Forgot Password?</Link>
                            <Link to="/register" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Create Account</Link>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                ::placeholder { color: rgba(255,255,255,0.4) !important; }
            `}</style>
        </div>
    );
};

export default Login;
