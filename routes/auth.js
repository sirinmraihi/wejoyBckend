const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcrypt');          // ✅ bcrypt (pas bcryptjs)
const User    = require('../models/User');
const Admin   = require('../models/Admin');
const auth    = require('../middleware/auth.middleware');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.isBlocked)
        return res.status(403).json({ message: 'Ce compte a été bloqué par un administrateur. Inscription impossible.' });
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

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

    if (user.isBlocked)
      return res.status(403).json({ message: 'Votre compte a été bloqué. Contactez l\'administrateur.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

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
  res.json({ message: 'Déconnecté avec succès' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── POST /api/auth/admin/login ───────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    console.log('📥 Admin login attempt:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)
      return res.status(401).json({ message: 'Identifiants invalides' });

    if (!admin.actif)
      return res.status(403).json({ message: 'Compte désactivé' });

    const valide = await bcrypt.compare(password, admin.password);
    if (!valide)
      return res.status(401).json({ message: 'Identifiants invalides' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      admin: {
        id:    admin._id,
        nom:   admin.nom,
        email: admin.email,
        role:  admin.role,
      },
    });

  } catch (err) {
    console.error('❌ Erreur admin login:', err);
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
});

// ─── GET /api/auth/admin/me ───────────────────────────────────────────────────
router.get('/admin/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).lean();
    if (!admin) return res.status(404).json({ message: 'Admin non trouvé' });
    delete admin.password;
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ─── PUT /api/auth/admin/changer-mot-de-passe ────────────────────────────────
router.put('/admin/changer-mot-de-passe', auth, async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: 'Admin non trouvé' });

    const valide = await bcrypt.compare(ancienMotDePasse, admin.password);
    if (!valide)
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });

    if (nouveauMotDePasse.length < 8)
      return res.status(400).json({ message: 'Minimum 8 caractères' });

    admin.password = nouveauMotDePasse;
    await admin.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;