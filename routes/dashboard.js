const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Mood = require('../models/Mood');

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const debutSemaine = new Date(now);
    debutSemaine.setDate(now.getDate() - 7);

    // ── Utilisateurs ──────────────────────────────────────────────
    const utilisateursTotaux = await User.countDocuments();
    const utilisateursActifs = await User.countDocuments({
      updatedAt: { $gte: debutMois }
    });
    const nouveauxUtilisateurs = await User.countDocuments({
      createdAt: { $gte: debutMois }
    });

    // ── Activités ─────────────────────────────────────────────────
    const activitesTotales = await Activity.countDocuments();
    const activitesCeMois = await Activity.countDocuments({
      createdAt: { $gte: debutMois }
    });

    // ── Taux d'engagement ─────────────────────────────────────────
    const engagement = utilisateursTotaux > 0
      ? Math.round((utilisateursActifs / utilisateursTotaux) * 100)
      : 0;

    // ── Badges débloqués ──────────────────────────────────────────
    const usersAvecBadges = await User.aggregate([
      { $project: { badgeCount: { $size: { $ifNull: ['$badges', []] } } } },
      { $group: { _id: null, total: { $sum: '$badgeCount' } } }
    ]);
    const badgesDebloques = usersAvecBadges[0]?.total ?? 0;

    // ── Activités récentes ────────────────────────────────────────
    const derniersUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('username createdAt');

    const dernieresActivites = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title category createdAt');

    const activitesRecentes = [
      ...derniersUsers.map(u => ({
        id: u._id,
        message: `Nouvel utilisateur inscrit : ${u.username}`,
        temps: _tempsRelatif(u.createdAt),
        type: 'inscription',
      })),
      ...dernieresActivites.map(a => ({
        id: a._id,
        message: `Nouvelle activité : ${a.title}`,
        temps: _tempsRelatif(a.createdAt),
        type: 'activite',
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // ── Humeurs de la semaine ─────────────────────────────────────
    const humeursStats = await Mood.aggregate([
      { $match: { createdAt: { $gte: debutSemaine } } },
      { $group: { _id: '$mood', count: { $sum: 1 } } }
    ]);

    res.json({
      utilisateursTotaux,
      utilisateursActifs,
      nouveauxUtilisateurs,
      activites: activitesTotales,
      activitesCeMois,
      engagement,
      badgesDebloques,
      activitesRecentes,
      humeursStats,
    });

  } catch (err) {
    console.error('❌ Erreur dashboard:', err);
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
});

// ── Fonction utilitaire : temps relatif ──────────────────────────────────────
function _tempsRelatif(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `Il y a ${diff} sec`;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)} jours`;
}

module.exports = router;