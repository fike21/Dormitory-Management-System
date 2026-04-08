import React, { useState, useEffect } from 'react';
import api from '../api';
import { MousePointer2, Plus, ArrowRightLeft, Clock, X, CheckCircle, Search } from 'lucide-react';

const Transfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ studentId: '', newRoomId: '', reason: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [transRes, studRes, roomRes] = await Promise.all([
                api.get('/transfers'),
                api.get('/students'),
                api.get('/rooms')
            ]);
            setTransfers(transRes.data);
            setStudents(studRes.data);
            setRooms(roomRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transfers', formData);
            await fetchData();
            setIsModalOpen(false);
            setFormData({ studentId: '', newRoomId: '', reason: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Error processing transfer');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransfers = transfers.filter(t => 
        t.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ArrowRightLeft size={32} color="var(--primary)" />
                    Room Transfers
                </h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> New Transfer
                </button>
            </div>

            <div className="glass" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Search size={20} color="var(--text-muted)" />
                <input 
                    type="text" 
                    placeholder="Search by student name or ID..." 
                    style={{ border: 'none', background: 'transparent', flex: 1, color: 'var(--text-main)', outline: 'none' }} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="glass" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <tr>
                            <th style={{ padding: '1.25rem' }}>STUDENT</th>
                            <th style={{ padding: '1.25rem' }}>OLD ROOM</th>
                            <th style={{ padding: '1.25rem' }}>NEW ROOM</th>
                            <th style={{ padding: '1.25rem' }}>REASON</th>
                            <th style={{ padding: '1.25rem' }}>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransfers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No transfer history found.
                                </td>
                            </tr>
                        ) : filteredTransfers.map((t) => (
                            <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem' }}>
                                    <div style={{ fontWeight: '600' }}>{t.student?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.student?.studentId}</div>
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    {t.oldRoom ? (
                                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                                            #{t.oldRoom.roomNumber}
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                                    )}
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <span className="badge badge-primary">#{t.newRoom?.roomNumber}</span>
                                </td>
                                <td style={{ padding: '1.25rem', color: 'var(--text-muted)', maxWidth: '250px' }}>
                                    {t.reason}
                                </td>
                                <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {new Date(t.transferDate).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-up">
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '2rem' }}>Transfer Room</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Select Student</label>
                                <select 
                                    required 
                                    value={formData.studentId} 
                                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                    style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: '8px' }}
                                >
                                    <option value="">Choose Student...</option>
                                    {students.filter(s => s.status === 'Active').map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.studentId}) - Currently Room: {s.room?.roomNumber || 'None'}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Target Room</label>
                                <select 
                                    required 
                                    value={formData.newRoomId} 
                                    onChange={(e) => setFormData({...formData, newRoomId: e.target.value})}
                                    style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: '8px' }}
                                >
                                    <option value="">Choose New Room...</option>
                                    {rooms.filter(r => r.isAvailable).map(r => (
                                        <option key={r._id} value={r._id}>Room #{r.roomNumber} ({r.type}) - {r.occupants.length}/{r.capacity} Occupied</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Reason for Transfer</label>
                                <textarea 
                                    required 
                                    value={formData.reason} 
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    placeholder="e.g. Student request, Room maintenance, Better roommate match..."
                                    style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: '8px', minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {loading ? <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <ArrowRightLeft size={18} />}
                                {loading ? 'Processing...' : 'Execute Room Transfer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfers;
