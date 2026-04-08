import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  CreditCard, Plus, Pencil, Trash2, CheckCircle, XCircle,
  Clock, Search, DollarSign, TrendingDown, FileText, AlertTriangle, X
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

const emptyForm = {
  student: '',
  amount: '',
  month: `${MONTHS[new Date().getMonth()]} ${currentYear}`,
  status: 'Unpaid',
  method: 'Cash',
  notes: ''
};

const statusConfig = {
  Paid:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: <CheckCircle size={14} /> },
  Unpaid:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: <XCircle size={14} /> },
  Partial: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={14} /> },
};

const Payments = () => {
  const [payments, setPayments]         = useState([]);
  const [students, setStudents]         = useState([]);
  const [stats, setStats]               = useState({ totalCollected: 0, totalPending: 0, paidCount: 0, unpaidCount: 0 });
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal]       = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [loading, setLoading]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // payment to confirm-delete

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [paymentsRes, studentsRes, statsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/students'),
        api.get('/payments/stats')
      ]);
      setPayments(paymentsRes.data);
      setStudents(studentsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('fetchAll error:', err);
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingPayment(null);
    setShowModal(true);
  };

  const openEdit = (payment) => {
    setForm({
      student: payment.student?._id || '',
      amount:  payment.amount,
      month:   payment.month,
      status:  payment.status,
      method:  payment.method,
      notes:   payment.notes || ''
    });
    setEditingPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id}`, form);
      } else {
        await api.post('/payments', form);
      }
      await fetchAll();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatus = async (payment, newStatus) => {
    try {
      await api.put(`/payments/${payment._id}`, { ...payment, student: payment.student?._id, status: newStatus });
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/payments/${deleteTarget._id}`);
      setDeleteTarget(null);
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete payment');
      setDeleteTarget(null);
    }
  };

  const filtered = payments.filter(p => {
    const nameMatch =
      p.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.student?.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      p.month?.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'All' || p.status === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.3rem' }}>Fee Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track and manage all student payment records.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <Plus size={18} /> Record Payment
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Collected', value: `$${stats.totalCollected.toLocaleString()}`, icon: <DollarSign size={22} />,  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Total Pending',   value: `$${stats.totalPending.toLocaleString()}`,   icon: <TrendingDown size={22} />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
          { label: 'Paid Records',    value: stats.paidCount,                              icon: <CheckCircle size={22} />,  color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
          { label: 'Unpaid Records',  value: stats.unpaidCount,                            icon: <XCircle size={22} />,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.1rem' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search by student name, ID or month..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
        </select>
      </div>

      {/* ── Payments Table ── */}
      <div className="glass" style={{ overflow: 'hidden', borderRadius: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Student', 'Month', 'Amount', 'Status', 'Method', 'Payment Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: '700' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <FileText size={36} style={{ marginBottom: '0.75rem', opacity: 0.35, display: 'block', margin: '0 auto 0.75rem' }} />
                  No payment records found.
                </td>
              </tr>
            ) : filtered.map(payment => {
              const sc = statusConfig[payment.status] || statusConfig.Unpaid;
              return (
                <tr
                  key={payment._id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: '600' }}>{payment.student?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{payment.student?.studentId}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>{payment.month}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#10b981' }}>${payment.amount.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.3rem 0.85rem', borderRadius: '20px',
                      background: sc.bg, color: sc.color,
                      fontSize: '0.78rem', fontWeight: '700'
                    }}>
                      {sc.icon} {payment.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{payment.method}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {payment.status !== 'Paid' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(payment, 'Paid')}
                          title="Mark as Paid"
                          style={{ background: 'rgba(16,185,129,0.12)', border: 'none', color: '#10b981', padding: '0.4rem 0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.25)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(payment)}
                        title="Edit Payment"
                        style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: 'var(--primary)', padding: '0.4rem 0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(payment)}
                        title="Delete Payment"
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem 0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
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

      {/* ── Add / Edit Payment Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{ backdropFilter: 'blur(10px)', zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-content animate-scale-up" style={{ maxWidth: '520px', position: 'relative' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={22} color="var(--primary)" />
              {editingPayment ? 'Edit Payment Record' : 'Record New Payment'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Student *</label>
                <select required value={form.student} onChange={e => setForm({ ...form, student: e.target.value })}>
                  <option value="">Select a Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} (#{s.studentId})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Month *</label>
                  <select required value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                    {MONTHS.map(m => YEAR_OPTIONS.map(y => (
                      <option key={`${m} ${y}`} value={`${m} ${y}`}>{m} {y}</option>
                    )))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Amount ($) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Payment Method</label>
                  <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online">Online</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Notes (optional)</label>
                <input
                  type="text"
                  placeholder="Any additional notes..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, cursor: 'pointer' }} disabled={loading}>
                  {loading ? 'Saving...' : editingPayment ? 'Update Record' : 'Save Record'}
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Delete Payment?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
              Are you sure you want to permanently delete the payment record for:
            </p>
            <p style={{ fontWeight: '700', color: '#fff', marginBottom: '2rem' }}>
              {deleteTarget.student?.name || 'Unknown'} — {deleteTarget.month} (${deleteTarget.amount?.toLocaleString()})
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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

export default Payments;
