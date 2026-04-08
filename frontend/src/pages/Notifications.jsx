import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Bell, Trash2, CheckCheck, AlertTriangle,
    CheckCircle, XCircle, Info, AlertOctagon,
    X, BellOff, Eye
} from 'lucide-react';

const typeConfig = {
    success: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  icon: <CheckCircle size={20} color="#10b981" /> },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: <AlertTriangle size={20} color="#f59e0b" /> },
    error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',   icon: <XCircle size={20} color="#ef4444" /> },
    info:    { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)',  icon: <Info size={20} color="#6366f1" /> },
};

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60)  return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter]               = useState('All');   // All | Unread | Read
    const [deleteTarget, setDeleteTarget]   = useState(null);
    const [clearAll, setClearAll]           = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('fetchNotifications error:', err);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleMarkRead = async (notification) => {
        if (notification.isRead) return;
        try {
            await api.put(`/notifications/${notification._id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('markRead error:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('markAllRead error:', err);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/notifications/${deleteTarget._id}`);
            setNotifications(prev => prev.filter(n => n._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            console.error('delete error:', err);
            setDeleteTarget(null);
        }
    };

    const confirmClearAll = async () => {
        try {
            // Delete all notifications one by one with Promise.all
            await Promise.all(notifications.map(n => api.delete(`/notifications/${n._id}`)));
            setNotifications([]);
            setClearAll(false);
        } catch (err) {
            console.error('clearAll error:', err);
            setClearAll(false);
        }
    };

    const handleNotificationClick = (notification) => {
        handleMarkRead(notification);
        if (notification.link) navigate(notification.link);
    };

    const filtered = notifications.filter(n => {
        if (filter === 'Unread') return !n.isRead;
        if (filter === 'Read')   return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '900px' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                        <Bell size={32} color="var(--primary)" />
                        Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                background: '#ef4444', color: '#fff',
                                fontSize: '0.75rem', fontWeight: '800',
                                padding: '0.2rem 0.6rem', borderRadius: '20px',
                                marginLeft: '0.25rem'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginLeft: '2.75rem' }}>
                        System alerts, payment updates and activity feeds.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.65rem 1.1rem',
                                background: 'rgba(99,102,241,0.12)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: '10px', color: 'var(--primary)',
                                cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                        >
                            <CheckCheck size={16} /> Mark All Read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setClearAll(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.65rem 1.1rem',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '10px', color: '#ef4444',
                                cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        >
                            <Trash2 size={16} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filter Tabs ── */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
                {['All', 'Unread', 'Read'].map(f => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '10px',
                            border: filter === f ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--border)',
                            background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: filter === f ? '700' : '500',
                            fontSize: '0.88rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f}
                        {f === 'Unread' && unreadCount > 0 && (
                            <span style={{ marginLeft: '0.4rem', background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: '800' }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Notifications List ── */}
            {filtered.length === 0 ? (
                <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
                    <BellOff size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, display: 'block', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        {filter === 'Unread' ? 'No unread notifications.' : filter === 'Read' ? 'No read notifications yet.' : 'No notifications yet.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.map(notification => {
                        const tc = typeConfig[notification.type] || typeConfig.info;
                        return (
                            <div
                                key={notification._id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    padding: '1.25rem 1.5rem',
                                    background: notification.isRead
                                        ? 'rgba(255,255,255,0.02)'
                                        : tc.bg,
                                    border: `1px solid ${notification.isRead ? 'var(--border)' : tc.border}`,
                                    borderRadius: '14px',
                                    borderLeft: `4px solid ${tc.color}`,
                                    transition: 'all 0.2s',
                                    cursor: notification.link ? 'pointer' : 'default',
                                    opacity: notification.isRead ? 0.7 : 1,
                                    position: 'relative'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateX(3px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}
                            >
                                {/* Type Icon */}
                                <div style={{ flexShrink: 0, marginTop: '0.1rem' }}>
                                    {tc.icon}
                                </div>

                                {/* Content */}
                                <div
                                    style={{ flex: 1 }}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ fontWeight: notification.isRead ? '600' : '700', fontSize: '0.95rem' }}>
                                            {notification.title}
                                            {!notification.isRead && (
                                                <span style={{
                                                    display: 'inline-block', width: '7px', height: '7px',
                                                    borderRadius: '50%', background: tc.color,
                                                    marginLeft: '0.5rem', verticalAlign: 'middle'
                                                }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                                            {timeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem', lineHeight: '1.5' }}>
                                        {notification.message}
                                    </p>
                                    {notification.link && (
                                        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '0.4rem', display: 'inline-block' }}>
                                            View details →
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                    {!notification.isRead && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleMarkRead(notification); }}
                                            title="Mark as Read"
                                            style={{
                                                background: 'rgba(99,102,241,0.1)',
                                                border: 'none', color: 'var(--primary)',
                                                padding: '0.4rem 0.45rem', borderRadius: '8px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                        >
                                            <Eye size={15} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(notification); }}
                                        title="Delete Notification"
                                        style={{
                                            background: 'rgba(239,68,68,0.1)',
                                            border: 'none', color: '#ef4444',
                                            padding: '0.4rem 0.45rem', borderRadius: '8px',
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
                        );
                    })}
                </div>
            )}

            {/* ── Delete Single Confirmation Modal ── */}
            {deleteTarget && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '420px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(239,68,68,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <AlertTriangle size={30} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Delete Notification?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                            This notification will be permanently removed:
                        </p>
                        <p style={{ fontWeight: '700', color: '#fff', marginBottom: '2rem', padding: '0 1rem' }}>
                            "{deleteTarget.title}"
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                style={{ flex: 1, padding: '0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{ flex: 1, padding: '0.9rem', background: '#ef4444', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                                onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Clear All Confirmation Modal ── */}
            {clearAll && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
                    <div className="modal-content animate-scale-up" style={{ maxWidth: '420px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(239,68,68,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <AlertOctagon size={30} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Clear All Notifications?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            This will permanently delete all <strong style={{ color: '#fff' }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</strong>. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setClearAll(false)}
                                style={{ flex: 1, padding: '0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmClearAll}
                                style={{ flex: 1, padding: '0.9rem', background: '#ef4444', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                                onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                            >
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
