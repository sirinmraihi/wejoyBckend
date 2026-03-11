const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

router.get('/', auth, (req, res) => {
  res.json({
    utilisateursActifs: 287,
    tauxEngagement: 84,
    activitesCrees: 48,
    badgesDebloques: 156,
    tauxRetention: 92,
    tempsMoyenSession: 18,
    satisfaction: 4.7,
    croissanceUtilisateurs: [
      { mois: 'Jan', valeur: 120 },
      { mois: 'Fév', valeur: 180 },
      { mois: 'Mar', valeur: 287 },
      { mois: 'Avr', valeur: 310 },
      { mois: 'Mai', valeur: 342 },
    ],
    repartitionEngagement: [
      { label: 'Très actif', valeur: 35, couleur: '#C084FC' },
      { label: 'Actif', valeur: 49, couleur: '#3B82F6' },
      { label: 'Modéré', valeur: 13, couleur: '#F97316' },
      { label: 'Inactif', valeur: 3, couleur: '#EF4444' },
    ],
    activitesParCategorie: [
      { categorie: 'Cuisine', nombre: 45 },
      { categorie: 'Lecture', nombre: 38 },
      { categorie: 'Jardinage', nombre: 32 },
      { categorie: 'Yoga', nombre: 28 },
      { categorie: 'Sport', nombre: 22 },
      { categorie: 'Art', nombre: 15 },
    ],
    activiteHebdomadaire: [
      { jour: 'Lun', activites: 15, participants: 45 },
      { jour: 'Mar', activites: 18, participants: 67 },
      { jour: 'Mer', activites: 20, participants: 72 },
      { jour: 'Jeu', activites: 16, participants: 48 },
      { jour: 'Ven', activites: 22, participants: 95 },
      { jour: 'Sam', activites: 25, participants: 98 },
      { jour: 'Dim', activites: 23, participants: 80 },
    ]
  });
});

module.exports = router;