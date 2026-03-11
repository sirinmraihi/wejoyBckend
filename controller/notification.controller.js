const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifs);
  } catch (err) {
    console.error('getNotifications:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Toutes les notifications lues' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Notification lue' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id, userId: req.userId,
    });
    res.json({ message: 'Notification supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};