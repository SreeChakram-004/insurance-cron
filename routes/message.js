const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { Message } = require('../models/Message');

router.use(bodyParser.json());

// Route for creating a new message
router.post('/messages', async (req, res) => {
  try {
    const { message, day, time } = req.body;

    // Convert day and time to a Date object
    const scheduledTime = new Date(`${day} ${time}`);

    // Check if the scheduled time is in the future
    if (scheduledTime <= Date.now()) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }

    // Save the message and scheduled time to the database
    const newMessage = new Message({ content: message, scheduledTime });
    await newMessage.save();

    res.status(201).json({ message: 'Message scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
