import React, { useState, useEffect } from 'react';
import api from '../api';
import { Wrench, Plus, Trash2, Edit2, X, AlertCircle, Filter, AlertTriangle } from 'lucide-react';

const categories = ['All', 'Water', 'Electricity', 'Noise', 'Cleaning', 'Furniture', 'Other'];
const statuses   = ['All', 'Pending', 'In Progress', 'Resolved'];

const emptyForm = {
    title:       '',
    description: '',
    room:        '',
    reportedBy:  '',
    status:      'Pending',
    category:    'Other',
    priority:    'Medium'
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High':   return '#ef4444';
        case 'Medium': return '#f59e0b';
        case 'Low':    return '#10b981';
        default:       return 'var(--text-muted)';
    }
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'Resolved':    return { color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
        case 'In Progress': return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
        default:            return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    }
};

const Maintenance = () => {
    const [requests, setRequests]         = useState([]);
    const [rooms, setRooms]               = useState([]);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [formData, setFormData]         = useState(emptyForm);
    const [filter, setFilter]             = useState({ status: 'All', category: 'All' });
    const [deleteTarget, setDeleteTarget] = useState(null); // issue to confirm-delete

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/maintenance');
            setRequests(data);
        } catch (err) {
            console.error('fetchRequests error:', err);
        }
    };

    const fetchRooms = async () => {
        try {
            const { data } = await api.get('/rooms');
            setRooms(data);
        } catch (err) {
            console.error('fetchRooms error:', err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchRooms();
    }, []);

    const handleOpenModal = (request = null) => {
        if (request) {
            setEditingRequest(request);
            setFormData({
                title:       request.title,
                description: request.description,
                room:        request.room?._id || '',
                reportedBy:  request.reportedBy,
                status:      request.status,
                category:    request.category || 'Other',
                priority:    request.priority || 'Medium'
            });
        } else {
            setEditingRequest(null);
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRequest(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRequest) {
                await api.put(`/maintenance/${editingRequest._id}`, formData);
            } else {
                await api.post('/maintenance', formData);
            }
            fetchRequests();
            handleCloseModal();
        } catch (err) {
            alert(err.response?.data?.error || 'Error saving issue');
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/maintenance/${deleteTarget._id}`);
            setDeleteTarget(null);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.error || 'Error deleting issue');
            setDeleteTarget(null);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchStatus   = filter.status   === 'All' || req.status   === filter.status;
        const matchCategory = filter.category === 'All' || req.category === filter.category;
        return matchStatus && matchCategory;
    });

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                        <AlertCircle size={32} color="var(--primary)" />
                        Complaints &amp; Maintenance
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginLeft: '2.75rem' }}>Track and resolve all reported dormitory issues.</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <Plus size={18} /> New Issue
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="glass" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Filter By:</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</label>
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        style={{ padding: '0.4rem 0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category:</label>
                    <select
                        value={filter.category}
                        onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                        style={{ padding: '0.4rem 0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {filteredRequests.length} issue{filteredRequests.length !== 1 ? 's' : ''} found
                </div>
            </div>

            {/* ── Issues Table ── */}
            <div className="glass" style={{ overflow: 'hidden', borderRadius: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Issue / Category', 'Room', 'Priority', 'Reported By', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: '700' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    <Wrench size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
                                    No issues found matching your filters.
                                </td>
                            </tr>
                        ) : filteredRequests.map((req) => {
                            const st = getStatusStyle(req.status);
                            const pc = getPriorityColor(req.priority);
                            return (
                                <tr
                                    key={req._id}
                                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1.1rem 1.25rem' }}>
                                        <div style={{ fontWeight: '600' }}>{req.title}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{req.category}</div>
                                    </td>
                                    <td style={{ padding: '1.1rem 1.25rem' }}>
                                        {req.room
                                            ? <span className="badge badge-primary">#{req.room.roomNumber}</span>
                                            : <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                                        }
                                    </td>
                                    <td style={{ padding: '1.1rem 1.25rem' }}>
                                        <span style={{
                                            color: pc,
                                            background: `${pc}20`,
                                            padding: '0.28rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.78rem',
                                            fontWeight: '700'
                                        }}>
                                            {req.priority || 'Medium'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{req.reportedBy}</td>
                                    <td style={{ padding: '1.1rem 1.25rem' }}>
                                        <span style={{
                                            color: st.color,
                                            background: st.bg,
                                            padding: '0.28rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.78rem',
                                            fontWeight: '600'
                                        }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(req)}
                                                title="Edit Issue"
                                                style={{
                                                    background: 'rgba(99,102,241,0.1)',
                                                    border: 'none',
                                                    color: 'var(--primary)',
                                                    padding: '0.45rem 0.55rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(req)}
                                                title="Delete Issue"
                                                style={{
                                                    background: 'rgba(239,68,68,0.1)',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    padding: '0.45rem 0.55rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Add / Edit Issue Modal ── */}
            {isModalOpen && (
                <div
                    className="modal-overlay"
                    style={{ backdropFilter: 'blur(10px)', zIndex: 1000 }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
                >
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '560px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Wrench size={22} color="var(--primary)" />
                            {editingRequest ? 'Update Issue' : 'Report New Issue'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Subject *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Broken water pipe"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none' }}
                                    >
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none' }}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Provide more details about the issue..."
                                    style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Room *</label>
                                <select
                                    required
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                    style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none' }}
                                >
                                    <option value="">Select a Room</option>
                                    {rooms.map(room => (
                                        <option key={room._id} value={room._id}>Room #{room.roomNumber}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Reported By *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Your name or ID"
                                        value={formData.reportedBy}
                                        onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none' }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>
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
                                    {editingRequest ? 'Update Issue' : 'Submit Issue'}
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Delete Issue?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                            Are you sure you want to permanently delete this issue?
                        </p>
                        <p style={{ fontWeight: '700', color: '#fff', marginBottom: '0.35rem' }}>{deleteTarget.title}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Category: {deleteTarget.category} &nbsp;|&nbsp; Priority: {deleteTarget.priority}
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

export default Maintenance;