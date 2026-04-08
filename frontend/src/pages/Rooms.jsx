import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, CheckCircle, XCircle, Trash2, Edit2, X, Users, AlertTriangle } from 'lucide-react';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null); // room to be deleted
    const [formData, setFormData] = useState({
        roomNumber: '',
        type: 'Single',
        price: '',
        capacity: 1,
        isAvailable: true
    });

    const fetchRooms = async () => {
        try {
            const { data } = await api.get('/rooms');
            const sorted = data.sort((a, b) =>
                a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' })
            );
            setRooms(sorted);
        } catch (err) {
            console.error('Fetch rooms error:', err);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                roomNumber: room.roomNumber,
                type: room.type,
                price: room.price,
                capacity: room.capacity,
                isAvailable: room.isAvailable
            });
        } else {
            setEditingRoom(null);
            setFormData({ roomNumber: '', type: 'Single', price: '', capacity: 1, isAvailable: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await api.put(`/rooms/${editingRoom._id}`, formData);
            } else {
                await api.post('/rooms', formData);
            }
            fetchRooms();
            handleCloseModal();
        } catch (err) {
            alert(err.response?.data?.error || 'Error saving room');
        }
    };

    const handleDeleteClick = (room) => {
        if (room.occupants && room.occupants.length > 0) {
            alert(`Cannot delete Room #${room.roomNumber} — it still has ${room.occupants.length} occupant(s)!`);
            return;
        }
        setDeleteTarget(room);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/rooms/${deleteTarget._id}`);
            setDeleteTarget(null);
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.error || 'Error deleting room');
            setDeleteTarget(null);
        }
    };

    const cancelDelete = () => {
        setDeleteTarget(null);
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Dormitory Rooms</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage your dormitory space and occupancy.</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add New Room
                </button>
            </div>

            {/* Room Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {rooms.map((room) => (
                    <div
                        key={room._id}
                        className="glass"
                        style={{ padding: '2rem', position: 'relative', borderRadius: '20px', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {/* Edit / Delete Buttons */}
                        <div style={{
                            position: 'absolute',
                            top: '1.2rem',
                            right: '1.2rem',
                            display: 'flex',
                            gap: '0.5rem',
                            zIndex: 20
                        }}>
                            <button
                                type="button"
                                title="Edit Room"
                                onClick={() => handleOpenModal(room)}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '10px',
                                    color: 'rgba(255,255,255,0.7)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s, color 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                            >
                                <Edit2 size={16} />
                            </button>

                            <button
                                type="button"
                                title="Delete Room"
                                onClick={() => handleDeleteClick(room)}
                                style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '10px',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Room Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                    #{room.roomNumber}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                                    <Users size={13} />
                                    <span style={{ fontSize: '0.88rem' }}>{room.type} Suite</span>
                                </div>
                            </div>
                            {room.isAvailable
                                ? <CheckCircle size={26} color="#10b981" />
                                : <XCircle size={26} color="#ef4444" />
                            }
                        </div>

                        {/* Price & Occupancy */}
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Rate</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                                    <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff' }}>${room.price}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mo</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupancy</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                    {room.occupants?.length || 0} / {room.capacity}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div
                                className={`badge ${room.isAvailable ? 'badge-success' : 'badge-primary'}`}
                                style={{ width: '100%', textAlign: 'center', padding: '0.65rem', fontSize: '0.88rem' }}
                            >
                                {room.isAvailable ? '🟢 Available for New Entry' : '🔴 Room is at Full Capacity'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Add / Edit Room Modal ── */}
            {isModalOpen && (
                <div
                    className="modal-overlay"
                    style={{ backdropFilter: 'blur(10px)', zIndex: 1000 }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
                >
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '500px', position: 'relative' }}>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>
                            {editingRoom ? 'Edit Room' : 'Add New Room'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="input-group">
                                <label>Room Number</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., 101"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Room Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="Single">Single</option>
                                        <option value="Double">Double</option>
                                        <option value="Triple">Triple</option>
                                        <option value="Quad">Quad</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Capacity</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Monthly Price ($)</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    placeholder="e.g., 500"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    checked={formData.isAvailable}
                                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                />
                                <label htmlFor="isAvailable" style={{ cursor: 'pointer' }}>Set as Available for Booking</label>
                            </div>
                            <button type="submit" className="btn-primary" style={{ padding: '1.1rem', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem' }}>
                                {editingRoom ? 'Save Changes' : 'Create Room'}
                            </button>
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Delete Room?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Are you sure you want to move <strong style={{ color: '#fff' }}>Room #{deleteTarget.roomNumber}</strong> to the Recycle Bin?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={cancelDelete}
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
                                onClick={confirmDelete}
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
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;
