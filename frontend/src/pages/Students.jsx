import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    UserPlus, Search, Trash2, Edit2, X,
    LogOut, AlertTriangle, Users, CheckCircle,
    GraduationCap, UserCheck
} from 'lucide-react';

const statusConfig = {
    Active:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: <UserCheck size={13} /> },
    Graduated:  { color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: <GraduationCap size={13} /> },
    Left:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: <LogOut size={13} /> },
};

const emptyForm = {
    name: '', studentId: '', email: '', phone: '',
    room: '', status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
    checkOutDate: ''
};

const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Students = () => {
    const [students, setStudents]           = useState([]);
    const [rooms, setRooms]                 = useState([]);
    const [searchTerm, setSearchTerm]       = useState('');
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData]           = useState(emptyForm);
    const [formError, setFormError]         = useState('');
    const [loading, setLoading]             = useState(false);
    const [deleteTarget, setDeleteTarget]   = useState(null);
    const [checkOutTarget, setCheckOutTarget] = useState(null);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/students');
            setStudents(data);
        } catch (err) { console.error('fetchStudents:', err); }
    };

    const fetchRooms = async () => {
        try {
            const { data } = await api.get('/rooms');
            setRooms(data.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })));
        } catch (err) { console.error('fetchRooms:', err); }
    };

    useEffect(() => { fetchStudents(); fetchRooms(); }, []);

    const handleOpenModal = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                name:        student.name,
                studentId:   student.studentId,
                email:       student.email,
                phone:       student.phone || '',
                room:        student.room?._id || '',
                status:      student.status,
                joiningDate: student.joiningDate  ? new Date(student.joiningDate).toISOString().split('T')[0]  : '',
                checkOutDate: student.checkOutDate ? new Date(student.checkOutDate).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingStudent(null);
            setFormData(emptyForm);
        }
        setFormError('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError('');
        try {
            if (editingStudent) {
                await api.put(`/students/${editingStudent._id}`, formData);
            } else {
                await api.post('/students', formData);
            }
            await fetchStudents();
            await fetchRooms();
            handleCloseModal();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Error saving student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/students/${deleteTarget._id}`);
            setDeleteTarget(null);
            fetchStudents();
            fetchRooms();
        } catch (err) {
            console.error('delete error:', err);
            setDeleteTarget(null);
        }
    };

    const confirmCheckOut = async () => {
        if (!checkOutTarget) return;
        try {
            await api.put(`/students/${checkOutTarget._id}`, { ...checkOutTarget, room: checkOutTarget.room?._id || '', status: 'Left' });
            setCheckOutTarget(null);
            fetchStudents();
            fetchRooms();
        } catch (err) {
            console.error('checkout error:', err);
            setCheckOutTarget(null);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalActive = students.filter(s => s.status === 'Active').length;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                        <Users size={32} color="var(--primary)" />
                        Student Management
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginLeft: '2.75rem' }}>
                        {totalActive} active resident{totalActive !== 1 ? 's' : ''} · {students.length} total records
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <UserPlus size={18} /> Add Student
                </button>
            </div>

            {/* ── Search ── */}
            <div className="glass" style={{ padding: '0.85rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderRadius: '12px' }}>
                <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                    type="text"
                    placeholder="Search by name, student ID or email..."
                    style={{ border: 'none', background: 'transparent', flex: 1, color: 'var(--text-main)', outline: 'none', fontSize: '0.95rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* ── Students Table ── */}
            <div className="glass" style={{ overflow: 'hidden', borderRadius: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Student', 'Room', 'Check-In', 'Expected Out', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: '700' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    <Users size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
                                    {searchTerm ? 'No students match your search.' : 'No student records found.'}
                                </td>
                            </tr>
                        ) : filteredStudents.map((student) => {
                            const sc = statusConfig[student.status] || statusConfig.Active;
                            return (
                                <tr
                                    key={student._id}
                                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ fontWeight: '700' }}>{student.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>#{student.studentId}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{student.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        {student.room
                                            ? <span className="badge badge-primary">#{student.room.roomNumber}</span>
                                            : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unassigned</span>
                                        }
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(student.joiningDate)}</td>
                                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(student.checkOutDate)}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: sc.color, background: sc.bg, padding: '0.28rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                                            {sc.icon} {student.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(student)}
                                                title="Edit Student"
                                                style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: 'var(--primary)', padding: '0.45rem 0.55rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {/* Check-Out */}
                                            {student.status === 'Active' && student.room && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCheckOutTarget(student)}
                                                    title="Check Out"
                                                    style={{ background: 'rgba(139,92,246,0.1)', border: 'none', color: '#8b5cf6', padding: '0.45rem 0.55rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                                                >
                                                    <LogOut size={16} />
                                                </button>
                                            )}
                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(student)}
                                                title="Move to Trash"
                                                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.45rem 0.55rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
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

            {/* ── Add / Edit Student Modal ── */}
            {isModalOpen && (
                <div
                    className="modal-overlay"
                    style={{ backdropFilter: 'blur(10px)', zIndex: 1000 }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
                >
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '580px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 1 }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <UserPlus size={22} color="var(--primary)" />
                            {editingStudent ? 'Edit Student' : 'Add Student'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Full Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Fikire Radate"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Student ID */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Student ID *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. DBU5432"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                />
                            </div>

                            {/* Email + Phone */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email *</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="student@gmail.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Phone *</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="e.g. 12345678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Check-in + Expected Out */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Check-in Date</label>
                                    <input
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Expected Out</label>
                                    <input
                                        type="date"
                                        value={formData.checkOutDate}
                                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Room */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Assign Room</label>
                                <select
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                >
                                    <option value="">No Room Assigned</option>
                                    {rooms.map(room => (
                                        <option
                                            key={room._id}
                                            value={room._id}
                                            disabled={!room.isAvailable && (!editingStudent || editingStudent.room?._id !== room._id)}
                                        >
                                            Room #{room.roomNumber} ({room.type}){!room.isAvailable && (!editingStudent || editingStudent.room?._id !== room._id) ? ' — Full' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Graduated">Graduated</option>
                                    <option value="Left">Left</option>
                                </select>
                            </div>

                            {/* ── Inline Error ── */}
                            {formError && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '10px', color: '#ef4444', fontSize: '0.88rem', fontWeight: '600' }}>
                                    <AlertTriangle size={16} /> {formError}
                                </div>
                            )}

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ flex: 1, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '420px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(239,68,68,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <AlertTriangle size={30} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Move to Trash?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                            This student record will be moved to the Recycle Bin. You can restore it later.
                        </p>
                        <p style={{ fontWeight: '700', color: '#fff', marginBottom: '2rem' }}>
                            {deleteTarget.name} — #{deleteTarget.studentId}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" onClick={() => setDeleteTarget(null)}
                                style={{ flex: 1, padding: '0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >Cancel</button>
                            <button type="button" onClick={confirmDelete}
                                style={{ flex: 1, padding: '0.9rem', background: '#ef4444', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '700', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                                onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                            >Yes, Move to Trash</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Check-Out Confirmation Modal ── */}
            {checkOutTarget && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '420px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(139,92,246,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <LogOut size={30} color="#8b5cf6" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Confirm Check-Out?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                            This will check out the student and free up their room immediately.
                        </p>
                        <p style={{ fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{checkOutTarget.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Room #{checkOutTarget.room?.roomNumber} will be marked as available.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" onClick={() => setCheckOutTarget(null)}
                                style={{ flex: 1, padding: '0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >Cancel</button>
                            <button type="button" onClick={confirmCheckOut}
                                style={{ flex: 1, padding: '0.9rem', background: '#8b5cf6', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '700', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#7c3aed'}
                                onMouseOut={e => e.currentTarget.style.background = '#8b5cf6'}
                            >Yes, Check Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;