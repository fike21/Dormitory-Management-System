const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const Student = require('../models/Student');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Get all transfers
router.get('/', auth, async (req, res) => {
    try {
        const transfers = await Transfer.find()
            .populate('student', 'name studentId')
            .populate('oldRoom', 'roomNumber')
            .populate('newRoom', 'roomNumber')
            .sort({ transferDate: -1 });
        res.json(transfers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a transfer
router.post('/', auth, async (req, res) => {
    try {
        const { studentId, newRoomId, reason } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const oldRoomId = student.room;
        const newRoom = await Room.findById(newRoomId);
        if (!newRoom) return res.status(404).json({ error: 'New room not found' });

        // Capacity check
        if (newRoom.occupants.length >= newRoom.capacity) {
            return res.status(400).json({ error: 'New room is at full capacity' });
        }

        // Logic to move student:
        // 1. Pull from old room
        if (oldRoomId) {
            await Room.findByIdAndUpdate(oldRoomId, { $pull: { occupants: studentId }, isAvailable: true });
        }

        // 2. Push to new room
        await Room.findByIdAndUpdate(newRoomId, { $push: { occupants: studentId } });
        
        // Update new room's availability if now full
        const updatedNewRoom = await Room.findById(newRoomId);
        if (updatedNewRoom.occupants.length >= updatedNewRoom.capacity) {
            await Room.findByIdAndUpdate(newRoomId, { isAvailable: false });
        }

        // 3. Update student's room
        student.room = newRoomId;
        await student.save();

        // 4. Save Transfer log
        const transfer = new Transfer({
            student: studentId,
            oldRoom: oldRoomId,
            newRoom: newRoomId,
            reason
        });
        const savedTransfer = await transfer.save();

        // Notification (Feature 2.5)
        const Notification = require('../models/Notification');
        await new Notification({
            title: 'Room Transfer Executed',
            message: `Student #${studentId} moved to Room #${newRoomId}. Reason: ${reason}`,
            type: 'info',
            link: '/transfers'
        }).save();

        res.status(201).json(savedTransfer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
