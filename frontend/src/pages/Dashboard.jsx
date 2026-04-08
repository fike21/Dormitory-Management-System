import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, DoorClosed, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, rooms: 0, revenue: 0, occupancy: 0, collected: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, roomsRes, paymentStatsRes] = await Promise.all([
          api.get('/students'),
          api.get('/rooms'),
          api.get('/payments/stats')
        ]);
        
        const students = studentsRes.data;
        const rooms = roomsRes.data;
        const payStats = paymentStatsRes.data;
        
        const totalStudents = students.length;
        const totalRooms = rooms.length;
        
        const currentRevenue = rooms.reduce((acc, room) => {
          const isOccupied = room.occupants && room.occupants.length > 0;
          return isOccupied ? acc + room.price : acc;
        }, 0);

        const totalBeds = rooms.reduce((acc, room) => acc + (room.capacity || 1), 0);
        const occupiedBeds = rooms.reduce((acc, room) => acc + (room.occupants ? room.occupants.length : 0), 0);
        const availableBeds = totalBeds - occupiedBeds;

        const occupiedCount = rooms.filter(r => r.occupants && r.occupants.length > 0).length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

        setStats({ 
          students: totalStudents, 
          rooms: totalRooms,
          totalBeds,
          occupiedBeds,
          availableBeds,
          revenue: currentRevenue,
          occupancy: occupancyRate,
          collected: payStats.totalCollected || 0,
          pending: payStats.totalPending || 0,
          paidCount: payStats.paidCount || 0,
          unpaidCount: payStats.unpaidCount || 0
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: <Users />, color: '#6366f1' },
    { label: 'Total Rooms', value: stats.rooms, icon: <DoorClosed />, color: '#10b981' },
    { label: 'Occupied vs Available Beds', value: `${stats.occupiedBeds} / ${stats.availableBeds}`, icon: <TrendingUp />, color: '#8b5cf6' },
    { label: 'Paid / Unpaid Students', value: `${stats.paidCount} / ${stats.unpaidCount}`, icon: <DollarSign />, color: '#f59e0b' },
    { label: 'Fees Collected', value: `$${stats.collected.toLocaleString()}`, icon: <CheckCircle />, color: '#06b6d4' },
    { label: 'Fees Pending', value: `$${stats.pending.toLocaleString()}`, icon: <XCircle />, color: '#ef4444' },
  ];

  return (
    <div className="container animate-fade-in">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Welcome Back, Admin</h1>
      
      {/* 2.1 HIGH VALUE DASHBOARD REPORTING */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {cards.map((card, i) => (
          <div key={i} className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${card.color}` }}>
            <div style={{ background: `${card.color}15`, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              {card.icon}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h3>Recent Activity</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No recent activities to show.</p>
      </div>
    </div>
  );
};

export default Dashboard;
