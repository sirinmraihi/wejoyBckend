const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');

router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const activities = await Activity.find({
      category: { $in: user.interests }
    }).limit(10);
    res.json(activities.map(a => a.toFlutter()));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'Tous') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const activities = await Activity.find(filter).sort({ date: 1 });
    res.json(activities.map(a => a.toFlutter()));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activité non trouvée' });
    if (activity.participants.includes(req.user.id))
      return res.status(400).json({ message: 'Déjà inscrit' });
    activity.participants.push(req.user.id);
    activity.currentParticipants += 1;
    await activity.save();
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 50 } });
    res.json({ message: 'Activité rejointe', activity: activity.toFlutter() });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;