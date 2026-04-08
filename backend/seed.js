/**
 * Seed Script — Run once to populate initial data
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dormitory';

const seedRooms = [
    { roomNumber: '101', type: 'Single',  price: 300, capacity: 1, isAvailable: true, occupants: [] },
    { roomNumber: '102', type: 'Double',  price: 450, capacity: 2, isAvailable: true, occupants: [] },
    { roomNumber: '201', type: 'Single',  price: 300, capacity: 1, isAvailable: true, occupants: [] },
    { roomNumber: '202', type: 'Double',  price: 450, capacity: 2, isAvailable: true, occupants: [] },
    { roomNumber: '301', type: 'Triple',  price: 600, capacity: 3, isAvailable: true, occupants: [] },
    { roomNumber: '302', type: 'Single',  price: 300, capacity: 1, isAvailable: true, occupants: [] },
    { roomNumber: '305', type: 'Double',  price: 450, capacity: 2, isAvailable: true, occupants: [] },
    { roomNumber: '401', type: 'Quad',    price: 750, capacity: 4, isAvailable: true, occupants: [] },
];

async function seed() {
    console.log('🌱 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    // Seed rooms (skip if already exist)
    for (const roomData of seedRooms) {
        const exists = await Room.findOne({ roomNumber: roomData.roomNumber });
        if (!exists) {
            await Room.create(roomData);
            console.log(`   + Room #${roomData.roomNumber} created.`);
        } else {
            console.log(`   ~ Room #${roomData.roomNumber} already exists, skipping.`);
        }
    }

    // Seed admin account (skip if email exists)
    const adminEmail = 'admin@dormify.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });
        console.log(`   + Admin account created (admin@dormify.com / admin123).`);
    } else {
        console.log(`   ~ Admin already exists, skipping.`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('   Login: admin@dormify.com  |  Password: admin123');
    await mongoose.connection.close();
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
