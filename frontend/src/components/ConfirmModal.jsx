import React from 'react';
import { X, Trash2, LogOut, AlertOctagon } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', icon = 'trash' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        if (icon === 'trash') return <Trash2 size={48} color="#ef4444" />;
        if (icon === 'logout') return <LogOut size={48} color="#8b5cf6" />;
        return <AlertOctagon size={48} color="#f59e0b" />;
    };

    const getButtonStyles = () => {
        if (type === 'danger') return { background: '#ef4444', color: '#fff' };
        if (type === 'primary') return { background: 'var(--primary)', color: '#fff' };
        return { background: '#8b5cf6', color: '#fff' };
    };

    return (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-content animate-scale-up" style={{
                maxWidth: '400px', textAlign: 'center', padding: '3rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(32px) saturate(180%)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem'
                }}>
                    {getIcon()}
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>{title}</h2>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '2.5rem' }}>{message}</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '600', cursor: 'pointer'
                    }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '1rem', borderRadius: '12px', border: 'none',
                        ...getButtonStyles(), fontWeight: '700', cursor: 'pointer'
                    }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
