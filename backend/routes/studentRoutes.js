const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');

// Get all active students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find({ isDeleted: { $ne: true } }).populate('room');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all deleted students (Recycle Bin)
router.get('/trash', async (req, res) => {
    try {
        const students = await Student.find({ isDeleted: true }).populate('room');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add student
router.post('/', async (req, res) => {
    try {
        const studentData = { ...req.body };
        if (studentData.room === '') delete studentData.room;

        // ── Friendly duplicate checks ──
        const existingId = await Student.findOne({ studentId: studentData.studentId.trim(), isDeleted: false });
        if (existingId) {
            return res.status(400).json({ error: `Student ID "${studentData.studentId}" is already taken. Please use a unique ID.` });
        }

        if (studentData.room) {
            const room = await Room.findById(studentData.room);
            if (!room) return res.status(400).json({ error: 'Selected room not found.' });
            if (room.occupants.length >= room.capacity) {
                return res.status(400).json({ error: 'Room is at full capacity. Please choose another room.' });
            }
        }
        
        studentData.email = studentData.email.trim().toLowerCase();
        const student = new Student(studentData);
        await student.save();
        
        if (studentData.room) {
            const updatedRoom = await Room.findByIdAndUpdate(
                studentData.room, 
                { $push: { occupants: student._id } },
                { returnDocument: 'after' }
            );
            if (updatedRoom.occupants.length >= updatedRoom.capacity) {
                await Room.findByIdAndUpdate(studentData.room, { isAvailable: false });
            }
        }
        res.status(201).json(student);
    } catch (err) {
        // Catch any remaining MongoDB E11000 duplicate errors gracefully
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ error: `A student with this ${field} already exists. Please use a different ${field}.` });
        }
        res.status(400).json({ error: err.message });
    }
});

// Restore student from Trash
router.put('/:id/restore', async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, { isDeleted: false, status: 'Active' });
        res.json({ message: 'Student restored' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permanent Delete (Purge)
router.delete('/:id/purge', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student permanently deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        const oldStudent = await Student.findById(req.params.id);
        
        if (!oldStudent) return res.status(404).json({ error: 'Student not found' });

        // Logic for Check-out (Feature 2.4)
        const isCheckingOut = (updateData.status === 'Graduated' || updateData.status === 'Left') && oldStudent.status === 'Active';
        
        if (isCheckingOut) {
            updateData.actualCheckOutDate = new Date();
            // Free the room
            if (oldStudent.room) {
                await Room.findByIdAndUpdate(oldStudent.room, { 
                    $pull: { occupants: oldStudent._id },
                    isAvailable: true // room is not full anymore
                });
                updateData.room = null; // remove room from student record

                // Notification (Feature 2.5)
                const Notification = require('../models/Notification');
                await new Notification({
                    title: 'Student Checked Out',
                    message: `Student ${oldStudent.name} (${oldStudent.studentId}) has left the dormitory. Room #${oldStudent.room} is now available.`,
                    type: 'info',
                    link: '/students'
                }).save();
            }
        }

        if (updateData.room === '') updateData.room = null;
        
        const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('room');
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Soft Delete student (Move to Trash)
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        if (student.room) {
            await Room.findByIdAndUpdate(student.room, { $pull: { occupants: student._id } });
        }
        
        await Student.findByIdAndUpdate(req.params.id, { isDeleted: true });
        
        // Notification
        const Notification = require('../models/Notification');
        await new Notification({
            title: 'Student Moved to Trash',
            message: `${student.name} has been moved to the recycle bin.`,
            type: 'warning',
            link: '/recycle-bin'
        }).save();

        res.json({ message: 'Student moved to trash' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
