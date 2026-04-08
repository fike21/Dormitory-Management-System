import React, { useState, useEffect } from 'react';
import api from '../api';
import { Shield, Plus, Trash2, Edit2, X, User, Eye, EyeOff, AlertTriangle, Crown, UserCog } from 'lucide-react';

const ROLES = [
    { value: 'admin',       label: 'Admin',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: '🛡️', desc: 'Full access to all features' },
    { value: 'staff',       label: 'Staff',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: '👤', desc: 'Manage students, rooms & payments' },
    { value: 'viewer',      label: 'Viewer',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '👁️', desc: 'Read-only access' },
];

const getRoleConfig = (role) => ROLES.find(r => r.value === role) || ROLES[0];

const emptyForm = { name: '', email: '', password: '', role: 'admin' };

const Admins = () => {
    const [admins, setAdmins]             = useState([]);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData]         = useState(emptyForm);
    const [showPassword, setShowPassword] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading, setLoading]           = useState(false);
    const [formError, setFormError]       = useState('');
    const [currentUser]                   = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    });

    const fetchAdmins = async () => {
        try {
            const { data } = await api.get('/users');
            setAdmins(data);
        } catch (err) {
            console.error('fetchAdmins error:', err);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const handleOpenModal = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({ name: admin.name, email: admin.email, password: '', role: admin.role || 'admin' });
        } else {
            setEditingAdmin(null);
            setFormData(emptyForm);
        }
        setShowPassword(false);
        setFormError('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAdmin(null);
        setShowPassword(false);
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError('');
        try {
            if (editingAdmin) {
                const payload = { name: formData.name, email: formData.email, role: formData.role };
                if (formData.password.trim()) payload.password = formData.password;
                await api.put(`/users/${editingAdmin._id}`, payload);
            } else {
                await api.post('/users', formData);
            }
            await fetchAdmins();
            handleCloseModal();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Error saving administrator. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/users/${deleteTarget._id}`);
            setDeleteTarget(null);
            await fetchAdmins();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete administrator');
            setDeleteTarget(null);
        }
    };

    const isSelf = (admin) => admin._id === currentUser?.id || admin._id === currentUser?._id;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                        <Shield size={32} color="var(--primary)" />
                        Admin Management
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginLeft: '2.75rem' }}>
                        Manage administrator accounts and their access roles.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add Administrator
                </button>
            </div>

            {/* ── Role Legend ── */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {ROLES.map(r => (
                    <div key={r.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: r.bg, borderRadius: '10px', border: `1px solid ${r.color}30` }}>
                        <span>{r.icon}</span>
                        <span style={{ fontWeight: '700', color: r.color, fontSize: '0.85rem' }}>{r.label}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>— {r.desc}</span>
                    </div>
                ))}
            </div>

            {/* ── Admins Table ── */}
            <div className="glass" style={{ overflow: 'hidden', borderRadius: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Administrator', 'Email Address', 'Role', 'Account Created', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: '700' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {admins.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    <UserCog size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
                                    No administrators found.
                                </td>
                            </tr>
                        ) : admins.map((admin) => {
                            const rc  = getRoleConfig(admin.role);
                            const self = isSelf(admin);
                            return (
                                <tr
                                    key={admin._id}
                                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Avatar + Name */}
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                            <div style={{
                                                width: '42px', height: '42px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', overflow: 'hidden', flexShrink: 0,
                                                boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                                            }}>
                                                {admin.profilePhoto
                                                    ? <img src={admin.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                                                    : <User size={18} />
                                                }
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {admin.name}
                                                    {self && (
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(99,102,241,0.12)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontWeight: '600' }}>
                                                            You
                                                        </span>
                                                    )}
                                                    {admin.role === 'admin' && (
                                                        <Crown size={13} color="#f59e0b" title="Administrator" />
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                                    ID: {admin._id?.slice(-8)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {admin.email}
                                    </td>

                                    {/* Role Badge */}
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{
                                            color: rc.color, background: rc.bg,
                                            padding: '0.3rem 0.85rem', borderRadius: '20px',
                                            fontSize: '0.78rem', fontWeight: '700', textTransform: 'capitalize',
                                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                                        }}>
                                            {rc.icon} {rc.label}
                                        </span>
                                    </td>

                                    {/* Created At */}
                                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {admin.createdAt
                                            ? new Date(admin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                            : '—'
                                        }
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(admin)}
                                                title="Edit Administrator"
                                                style={{
                                                    background: 'rgba(99,102,241,0.1)',
                                                    border: 'none', color: 'var(--primary)',
                                                    padding: '0.45rem 0.55rem', borderRadius: '8px',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            {!self && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(admin)}
                                                    title="Delete Administrator"
                                                    style={{
                                                        background: 'rgba(239,68,68,0.1)',
                                                        border: 'none', color: '#ef4444',
                                                        padding: '0.45rem 0.55rem', borderRadius: '8px',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}

                                            {self && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.45rem 0.55rem' }} title="Cannot delete own account">
                                                    🔒
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Add / Edit Administrator Modal ── */}
            {isModalOpen && (
                <div
                    className="modal-overlay"
                    style={{ backdropFilter: 'blur(10px)', zIndex: 1000 }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
                >
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '520px', position: 'relative' }}>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Shield size={22} color="var(--primary)" />
                            {editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Name */}
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Name *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Email */}
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Email Address *</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="e.g. admin@dormify.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    Password {editingAdmin && <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(Leave blank to keep current)</span>}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        required={!editingAdmin}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={editingAdmin ? 'Enter new password to change...' : 'Enter secure password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        style={{ paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Role &amp; Permissions *</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {ROLES.map(r => (
                                        <label
                                            key={r.value}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.85rem',
                                                padding: '0.85rem 1rem',
                                                background: formData.role === r.value ? r.bg : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${formData.role === r.value ? r.color + '60' : 'var(--border)'}`,
                                                borderRadius: '10px', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={r.value}
                                                checked={formData.role === r.value}
                                                onChange={() => setFormData({ ...formData, role: r.value })}
                                                style={{ accentColor: r.color, width: '16px', height: '16px' }}
                                            />
                                            <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: '700', color: formData.role === r.value ? r.color : 'var(--text-main)', fontSize: '0.9rem' }}>{r.label}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* ── Inline Error Message ── */}
                            {formError && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    padding: '0.85rem 1rem',
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.35)',
                                    borderRadius: '10px',
                                    color: '#ef4444',
                                    fontSize: '0.88rem',
                                    fontWeight: '600'
                                }}>
                                    <AlertTriangle size={16} />
                                    {formError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, cursor: 'pointer', opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                    {loading ? 'Creating...' : editingAdmin ? 'Update Account' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div
                    className="modal-overlay"
                    style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}
                >
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '420px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px',
                            background: 'rgba(239,68,68,0.15)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <AlertTriangle size={30} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Delete Administrator?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                            This action is <strong style={{ color: '#ef4444' }}>permanent</strong> and cannot be undone. The following account will be removed:
                        </p>
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
                            <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>{deleteTarget.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{deleteTarget.email}</div>
                            <div style={{ marginTop: '0.5rem' }}>
                                {(() => { const rc = getRoleConfig(deleteTarget.role); return <span style={{ color: rc.color, fontSize: '0.8rem', fontWeight: '600' }}>{rc.icon} {rc.label}</span>; })()}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                style={{
                                    flex: 1, padding: '0.9rem',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', color: '#fff',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{
                                    flex: 1, padding: '0.9rem',
                                    background: '#ef4444', border: 'none',
                                    borderRadius: '12px', color: '#fff',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                                onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admins;