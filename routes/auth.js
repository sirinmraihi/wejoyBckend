const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifie si l'email existe déjà
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });

    const user = await User.create({ username, email, password });
    res.status(201).json({ message: 'Compte créé avec succès', user: user.toFlutter() });

  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    // Génère le token JWT (valable 7 jours)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: user.toFlutter() });

  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: err.message });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', auth, (req, res) => {
  // Le token est supprimé côté Flutter (SharedPreferences)
  // Côté serveur on peut blacklister le token si nécessaire
  res.json({ message: 'Déconnecté avec succès' });
});

module.exports = router;