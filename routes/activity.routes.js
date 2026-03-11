const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');

// ── GET toutes les activités ──────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, type } = req.query;
    const filter = {};
    if (category && category !== 'Tous') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (type === 'official') filter.isOfficial = true;
    if (type === 'community') filter.isOfficial = false;
    const activities = await Activity.find(filter)
      .populate('createdBy', 'username avatarUrl')
      .sort({ createdAt: -1 });
    res.json(activities.map(a => a.toFlutter()));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── GET activités recommandées ────────────────────────────────────────────────
router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const activities = await Activity.find({ category: { $in: user.interests } })
      .populate('createdBy', 'username avatarUrl')
      .limit(10);
    res.json(activities.map(a => a.toFlutter()));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── GET détail d'une activité ─────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('participants', 'username avatarUrl')
      .populate('createdBy', 'username avatarUrl')
      .populate('content.user', 'username avatarUrl')
      .populate('chat.user', 'username avatarUrl');
    if (!activity) return res.status(404).json({ message: 'Activité non trouvée' });
    res.json({
      ...activity.toFlutter(),
      members: activity.participants.map(p => ({
        id: p._id,
        username: p.username,
        avatarUrl: p.avatarUrl,
      })),
      content: activity.content.map(c => ({
        id: c._id,
        username: c.username,
        avatarUrl: c.avatarUrl,
        title: c.title,
        body: c.body,
        type: c.type,
        likes: c.likes.length,
        comments: c.comments.length,
        createdAt: c.createdAt,
      })),
      chat: activity.chat.map(m => ({
        id: m._id,
        username: m.username,
        avatarUrl: m.avatarUrl,
        text: m.text,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── POST créer une activité (user = communautaire) ────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { title, category, description, imageUrl, type, isDaily, date, timeSlot, location, maxParticipants } = req.body;
    const activity = await Activity.create({
      title, category, description, imageUrl, type, isDaily, date, timeSlot, location, maxParticipants,
      isOfficial: req.user.isAdmin ?? false,
      createdBy: req.user.id,
      participants: [req.user.id],
      currentParticipants: 1,
    });
    res.status(201).json(activity.toFlutter());
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── POST rejoindre une activité ───────────────────────────────────────────────
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

// ── POST quitter une activité ─────────────────────────────────────────────────
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activité non trouvée' });
    activity.participants = activity.participants.filter(p => p.toString() !== req.user.id);
    activity.currentParticipants = Math.max(0, activity.currentParticipants - 1);
    await activity.save();
    res.json({ message: 'Activité quittée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── POST ajouter un contenu ───────────────────────────────────────────────────
router.post('/:id/content', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activité non trouvée' });
    const user = await User.findById(req.user.id);
    const { title, body, type } = req.body;
    activity.content.push({ user: req.user.id, username: user.username, avatarUrl: user.avatarUrl, title, body, type });
    await activity.save();
    res.status(201).json({ message: 'Contenu ajouté' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── POST liker un contenu ─────────────────────────────────────────────────────
router.post('/:id/content/:contentId/like', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    const content = activity.content.id(req.params.contentId);
    if (!content) return res.status(404).json({ message: 'Contenu non trouvé' });
    const liked = content.likes.includes(req.user.id);
    if (liked) content.likes = content.likes.filter(l => l.toString() !== req.user.id);
    else content.likes.push(req.user.id);
    await activity.save();
    res.json({ liked: !liked, count: content.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── POST envoyer un message chat ──────────────────────────────────────────────
router.post('/:id/chat', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activité non trouvée' });
    const user = await User.findById(req.user.id);
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message vide' });
    activity.chat.push({ user: req.user.id, username: user.username, avatarUrl: user.avatarUrl, text: text.trim() });
    await activity.save();
    const msg = activity.chat[activity.chat.length - 1];
    res.status(201).json({ id: msg._id, username: msg.username, text: msg.text, createdAt: msg.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── DELETE supprimer une activité ─────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activité non trouvée' });
    if (activity.createdBy.toString() !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ message: 'Non autorisé' });
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activité supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ── PUT modifier une activité (admin ou créateur) ─────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activité non trouvée' });

    // Seul l'admin ou le créateur peut modifier
    if (activity.createdBy.toString() !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ message: 'Non autorisé' });

    const { title, description, imageUrl, category, date, timeSlot, maxParticipants, isOfficial } = req.body;

    if (title)            activity.title           = title;
    if (description)      activity.description     = description;
    if (imageUrl !== undefined) activity.imageUrl  = imageUrl;
    if (category)         activity.category        = category;
    if (date !== undefined)    activity.date        = date;
    if (timeSlot !== undefined) activity.timeSlot  = timeSlot;
    if (maxParticipants)  activity.maxParticipants  = maxParticipants;

    // Seul l'admin peut changer isOfficial
    if (isOfficial !== undefined && req.user.isAdmin)
      activity.isOfficial = isOfficial;

    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;