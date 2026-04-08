import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, RotateCcw, User, DoorOpen, AlertTriangle, ShieldAlert } from 'lucide-react';

const RecycleBin = () => {
    const [deletedStudents, setDeletedStudents] = useState([]);
    const [deletedRooms, setDeletedRooms] = useState([]);
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(false);
    const [purgeTarget, setPurgeTarget] = useState(null);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const [studentRes, roomRes] = await Promise.all([
                api.get('/students/trash'),
                api.get('/rooms/trash')
            ]);
            setDeletedStudents(studentRes.data);
            setDeletedRooms(roomRes.data);
        } catch (err) {
            console.error('Error fetching trash:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id, type) => {
        try {
            await api.put(`/${type}/${id}/restore`);
            fetchTrash();
        } catch (err) {
            alert('Error restoring item');
        }
    };

    const handlePurgeClick = (item, type) => {
        setPurgeTarget({ ...item, type });
    };

    const confirmPurge = async () => {
        if (!purgeTarget) return;
        try {
            await api.delete(`/${purgeTarget.type}/${purgeTarget._id}/purge`);
            setPurgeTarget(null);
            fetchTrash();
        } catch (err) {
            alert('Error purging item');
            setPurgeTarget(null);
        }
    };

    const cancelPurge = () => {
        setPurgeTarget(null);
    };

    const renderStudents = () => (
        <div className="glass" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '1rem' }}>Student Name</th>
                        <th style={{ padding: '1rem' }}>Student ID</th>
                        <th style={{ padding: '1rem' }}>Last Room</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {deletedStudents.length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students in trash</td></tr>
                    ) : deletedStudents.map(student => (
                        <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem' }}>{student.name}</td>
                            <td style={{ padding: '1rem' }}>{student.studentId}</td>
                            <td style={{ padding: '1rem' }}>{student.room?.roomNumber || 'None'}</td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => handleRestore(student._id, 'students')} title="Restore" style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}><RotateCcw size={18} /></button>
                                    <button onClick={() => handlePurgeClick(student, 'students')} title="Purge" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderRooms = () => (
        <div className="glass" style={{ overflow: 'hidden' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '1rem' }}>Room #</th>
                        <th style={{ padding: '1rem' }}>Type</th>
                        <th style={{ padding: '1rem' }}>Capacity</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {deletedRooms.length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No rooms in trash</td></tr>
                    ) : deletedRooms.map(room => (
                        <tr key={room._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem' }}>{room.roomNumber}</td>
                            <td style={{ padding: '1rem' }}>{room.type}</td>
                            <td style={{ padding: '1rem' }}>{room.capacity}</td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => handleRestore(room._id, 'rooms')} title="Restore" style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}><RotateCcw size={18} /></button>
                                    <button onClick={() => handlePurgeClick(room, 'rooms')} title="Purge" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <ShieldAlert size={40} color="#ef4444" />
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Recycle Bin</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage deleted records. Restore them or purge them permanently.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <button 
                    onClick={() => setActiveTab('students')}
                    className={activeTab === 'students' ? 'btn-primary' : 'glass'}
                    style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <User size={18} /> Students ({deletedStudents.length})
                </button>
                <button 
                    onClick={() => setActiveTab('rooms')}
                    className={activeTab === 'rooms' ? 'btn-primary' : 'glass'}
                    style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <DoorOpen size={18} /> Rooms ({deletedRooms.length})
                </button>
            </div>

            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <AlertTriangle color="#ef4444" />
                <p style={{ fontSize: '0.9rem', color: '#fca5a5' }}>
                    <strong>Warning:</strong> Purging an item will remove it from the database forever. This cannot be undone.
                </p>
            </div>

            {loading ? <p>Loading trash...</p> : (activeTab === 'students' ? renderStudents() : renderRooms())}

            {/* ── Purge Confirmation Modal ── */}
            {purgeTarget && (
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
                            <Trash2 size={30} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Permanently Delete?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Are you sure you want to permanently delete this {purgeTarget.type === 'students' ? 'student' : 'room'}? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={cancelPurge}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmPurge}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '0.95rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                                onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                            >
                                Yes, Purge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecycleBin;
