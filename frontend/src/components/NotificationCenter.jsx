import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/notifications/${deleteTarget._id}`);
            fetchNotifications();
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            setDeleteTarget(null);
        }
    };

    const cancelDelete = () => {
        setDeleteTarget(null);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{ 
                        position: 'absolute', top: '-5px', right: '-5px', 
                        background: '#ef4444', color: 'white', fontSize: '10px', 
                        fontWeight: 'bold', width: '16px', height: '16px', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 2px var(--glass-bg)'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="glass animate-scale-up" style={{ 
                    position: 'absolute', top: '2.5rem', right: '0', 
                    width: '320px', maxHeight: '450px', overflowY: 'auto',
                    zIndex: 1000, padding: '1rem', border: '1px solid var(--glass-border)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}>
                    {deleteTarget ? (
                        <div className="animate-scale-up" style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                            <div style={{ width: '56px', height: '56px', background: 'rgba(239,68,68,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <Trash2 size={26} color="#ef4444" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '700' }}>Delete Notification?</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>This action cannot be undone. You are permanently deleting this notification.</p>
                            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                                <button
                                    onClick={cancelDelete}
                                    style={{ flex: 1, padding: '0.65rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    style={{ flex: 1, padding: '0.65rem', background: '#ef4444', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}
                                    onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                                    onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
                                <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer' }}>
                                    Mark All Read
                                </button>
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No notifications yet.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {notifications.map((n) => (
                                        <div key={n._id} style={{ 
                                            padding: '0.75rem', borderRadius: '8px', 
                                            background: n.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.08)',
                                            border: n.isRead ? '1px solid transparent' : '1px solid var(--primary)',
                                            position: 'relative'
                                        }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)' }}>
                                                {n.title}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                                {n.message}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {!n.isRead && (
                                                        <button onClick={() => markAsRead(n._id)} title="Mark as Read" style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}>
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    {n.link && (
                                                        <Link to={n.link} onClick={() => setIsOpen(false)} title="Go to Page" style={{ color: 'var(--primary)' }}>
                                                            <ExternalLink size={14} />
                                                        </Link>
                                                    )}
                                                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(n); }} title="Delete" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* View All link */}
                            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', textAlign: 'center' }}>
                                <Link
                                    to="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}
                                >
                                    View All Notifications →
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
export default NotificationCenter;
