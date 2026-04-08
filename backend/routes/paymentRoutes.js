const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// Get all payments (with student info populated)
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('student', 'name studentId room')
            .populate({ path: 'student', populate: { path: 'room', select: 'roomNumber' } })
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get payment summary stats
router.get('/stats', async (req, res) => {
    try {
        const payments = await Payment.find();
        const totalCollected = payments
            .filter(p => p.status === 'Paid')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalPending = payments
            .filter(p => p.status === 'Unpaid')
            .reduce((sum, p) => sum + p.amount, 0);
        const paidCount = payments.filter(p => p.status === 'Paid').length;
        const unpaidCount = payments.filter(p => p.status === 'Unpaid').length;
        res.json({ totalCollected, totalPending, paidCount, unpaidCount, total: payments.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a payment record
router.post('/', async (req, res) => {
    try {
        const payment = new Payment(req.body);
        if (req.body.status === 'Paid' && !req.body.paymentDate) {
            payment.paymentDate = new Date();
        }
        await payment.save();
        const populated = await Payment.findById(payment._id)
            .populate('student', 'name studentId room');
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a payment record
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        // Auto-set paymentDate when marking as Paid
        if (updateData.status === 'Paid' && !updateData.paymentDate) {
            updateData.paymentDate = new Date();
        }
        const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' })
            .populate('student', 'name studentId room');

        // Notification (Feature 2.5)
        if (updateData.status === 'Paid') {
            const Notification = require('../models/Notification');
            await new Notification({
                title: 'Payment Received',
                message: `Payment of $${payment.amount} received from ${payment.student?.name}. Status updated to Paid.`,
                type: 'success',
                link: '/payments'
            }).save();
        }

        res.json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a payment record
router.delete('/:id', async (req, res) => {
    try {
        await Payment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Payment record deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
