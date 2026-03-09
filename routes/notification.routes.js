const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id, read: false })
      .sort({ createdAt: -1 }).limit(20);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
