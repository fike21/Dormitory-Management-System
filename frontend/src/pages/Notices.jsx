import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bell, Plus, Trash2, Edit2, X, Clock, AlertTriangle, Megaphone } from 'lucide-react';

const getPriorityConfig = (priority) => {
    switch (priority) {
        case 'Urgent': return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  label: '🔴 Urgent' };
        case 'High':   return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: '🟡 High' };
        default:       return { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', label: '🔵 Normal' };
    }
};

const emptyForm = { title: '', content: '', priority: 'Normal' };

const Notices = () => {
    const [notices, setNotices]           = useState([]);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [formData, setFormData]         = useState(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState(null); // notice to confirm-delete

    const fetchNotices = async () => {
        try {
            const { data } = await api.get('/notices');
            setNotices(data);
        } catch (err) {
            console.error('fetchNotices error:', err);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleOpenModal = (notice = null) => {
        if (notice) {
            setEditingNotice(notice);
            setFormData({ title: notice.title, content: notice.content, priority: notice.priority });
        } else {
            setEditingNotice(null);
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingNotice(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNotice) {
                await api.put(`/notices/${editingNotice._id}`, formData);
            } else {
                await api.post('/notices', formData);
            }
            fetchNotices();
            handleCloseModal();
        } catch (err) {
            alert(err.response?.data?.error || 'Error saving notice');
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/notices/${deleteTarget._id}`);
            setDeleteTarget(null);
            fetchNotices();
        } catch (err) {
            alert(err.response?.data?.error || 'Error deleting notice');
            setDeleteTarget(null);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                        <Bell size={32} color="var(--primary)" />
                        Announcements
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginLeft: '2.75rem' }}>Post and manage notices for all dormitory residents.</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <Plus size={18} /> New Notice
                </button>
            </div>

            {/* ── Notice Cards Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
                {notices.length === 0 ? (
                    <div className="glass" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
                        <Megaphone size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 1rem' }} />
                        No announcements posted yet.
                    </div>
                ) : notices.map(notice => {
                    const pc = getPriorityConfig(notice.priority);
                    return (
                        <div
                            key={notice._id}
                            className="glass"
                            style={{
                                padding: '1.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                position: 'relative',
                                borderRadius: '18px',
                                borderLeft: `4px solid ${pc.border}`,
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* Card Top Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Priority Badge */}
                                    <span style={{
                                        fontSize: '0.75rem', fontWeight: '700',
                                        padding: '0.28rem 0.8rem', borderRadius: '20px',
                                        color: pc.color, background: pc.bg
                                    }}>
                                        {pc.label}
                                    </span>
                                    {/* Date */}
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Clock size={13} />
                                        {new Date(notice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.4rem', zIndex: 10 }}>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal(notice)}
                                        title="Edit Notice"
                                        style={{
                                            background: 'rgba(99,102,241,0.1)',
                                            border: 'none', color: 'var(--primary)',
                                            padding: '0.4rem 0.5rem', borderRadius: '8px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(notice)}
                                        title="Delete Notice"
                                        style={{
                                            background: 'rgba(239,68,68,0.1)',
                                            border: 'none', color: '#ef4444',
                                            padding: '0.4rem 0.5rem', borderRadius: '8px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', lineHeight: '1.3', marginTop: '0.25rem' }}>
                                {notice.title}
                            </h3>

                            {/* Content */}
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '0.93rem', flexGrow: 1 }}>
                                {notice.content}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* ── Add / Edit Notice Modal ── */}
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
                            <Bell size={22} color="var(--primary)" />
                            {editingNotice ? 'Edit Notice' : 'Create Notice'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Title *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Water Supply Interruption"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Content *</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your message here..."
                                    style={{
                                        width: '100%', background: 'var(--glass-bg)',
                                        border: '1px solid var(--border)', color: 'var(--text-main)',
                                        padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none',
                                        minHeight: '130px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none', width: '100%' }}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, cursor: 'pointer' }}>
                                    {editingNotice ? 'Update Notice' : 'Post Notice'}
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Delete Notice?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                            Are you sure you want to permanently delete this notice?
                        </p>
                        <p style={{ fontWeight: '700', color: '#fff', marginBottom: '2rem', padding: '0 1rem' }}>
                            "{deleteTarget.title}"
                        </p>
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

export default Notices;
