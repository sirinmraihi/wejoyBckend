const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user.toFlutter());
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { username, interests, avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, interests, avatarUrl },
      { new: true }
    );
    res.json(user.toFlutter());
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;