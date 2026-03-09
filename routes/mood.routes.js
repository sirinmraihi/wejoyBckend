const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, async (req, res) => {
  try {
    const { mood } = req.body;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    await Mood.findOneAndUpdate(
      { userId: req.user.id, date: { $gte: startOfDay } },
      { userId: req.user.id, mood, date: new Date() },
      { upsert: true, new: true }
    );
    res.json({ message: 'Humeur enregistrée', mood });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;