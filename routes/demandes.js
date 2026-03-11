const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

let demandes = [
  { id: 1, titre: 'Création d\'une activité yoga', type: 'Nouvelle activité', auteur: 'Marie Dupont', date: '4 février 2026', message: 'Bonjour, je souhaiterais organiser des séances de yoga hebdomadaires au parc. Pourriez-vous m\'aider à mettre en place cette activité ?', statut: 'En attente' },
  { id: 2, titre: 'Problème de connexion', type: 'Support', auteur: 'Jean Martin', date: '5 février 2026', message: 'Je n\'arrive plus à me connecter depuis 2 jours. Mon email est jean.martin@example.com', statut: 'En attente' },
  { id: 3, titre: 'Suggestion: Club photo', type: 'Suggestion', auteur: 'Sophie Laurent', date: '6 février 2026', message: 'Il serait super d\'avoir un club photo pour partager nos clichés et apprendre ensemble.', statut: 'En attente' },
  { id: 4, titre: 'Modification profil', type: 'Profil', auteur: 'Pierre Dubois', date: '3 février 2026', message: 'Je voudrais changer mon adresse email.', statut: 'Traitée' },
];

router.get('/', auth, (req, res) => {
  const total = demandes.length;
  const enAttente = demandes.filter(d => d.statut === 'En attente').length;
  const traitees = demandes.filter(d => d.statut === 'Traitée').length;
  res.json({ total, enAttente, traitees, demandes });
});

router.put('/:id/approuver', auth, (req, res) => {
  const idx = demandes.findIndex(d => d.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Demande non trouvée' });
  demandes[idx].statut = 'Traitée';
  demandes[idx].action = 'Approuvée';
  res.json(demandes[idx]);
});

router.put('/:id/rejeter', auth, (req, res) => {
  const idx = demandes.findIndex(d => d.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Demande non trouvée' });
  demandes[idx].statut = 'Traitée';
  demandes[idx].action = 'Rejetée';
  res.json(demandes[idx]);
});

module.exports = router;