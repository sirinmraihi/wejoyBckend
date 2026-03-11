const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const auth    = require('../middleware/auth.middleware');

// ═══════════════════════════════════════════════════
// ROUTES UTILISATEUR (app Flutter)
// ═══════════════════════════════════════════════════

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    // ✅ Bloquer l'accès si compte bloqué
    if (user.isBlocked) return res.status(403).json({ message: 'Compte bloqué' });
    res.json(user.toFlutter());
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/users/me
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

// ═══════════════════════════════════════════════════
// ROUTES ADMIN
// ═══════════════════════════════════════════════════

// GET /api/users  (liste tous les users)
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { $or: [
        { username: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
      ]};
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json(users.map(u => ({
      id:              u._id,
      nom:             u.username,
      email:           u.email,
      // ✅ Statut tient compte du blocage
      statut:          u.isBlocked ? 'Bloqué' : (u.updatedAt > new Date(Date.now() - 30*24*60*60*1000) ? 'Actif' : 'Inactif'),
      isBlocked:       u.isBlocked ?? false,
      dateInscription: u.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      activites:       u.activitiesJoined?.length ?? 0,
      points:          u.points ?? 0,
      avatar:          u.username?.slice(0, 2).toUpperCase() ?? 'U',
    })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ PUT /api/users/:id/block  — Toggle bloquer/débloquer
router.put('/:id/block', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message:   user.isBlocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { username, email, points } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, points },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;