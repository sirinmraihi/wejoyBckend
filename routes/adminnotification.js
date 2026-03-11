const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

let notifications = [
  { id: 1, titre: 'Bienvenue sur WelJoy!', message: 'Découvrez toutes nos activités et services.', type: 'info', date: '10 Mar 2026', envoyees: 342 },
  { id: 2, titre: 'Nouvel atelier cuisine', message: 'Un atelier cuisine collaboratif est disponible le 15 février.', type: 'activite', date: '5 Mar 2026', envoyees: 287 },
];

router.get('/', auth, (req, res) => res.json(notifications));

router.post('/', auth, (req, res) => {
  const newNotif = { id: notifications.length + 1, ...req.body, date: new Date().toLocaleDateString('fr-FR'), envoyees: 342 };
  notifications.push(newNotif);
  res.status(201).json(newNotif);
});

module.exports = router;