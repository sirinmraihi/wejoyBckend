const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

let services = [
  { id: 1, titre: 'Atelier Cuisine Collaborative', description: 'Cuisinez ensemble des recettes du monde entier', statut: 'Actif', tags: ['Cuisine', 'Collectif'], date: '15 février 2026', horaire: '14h00 - 16h00', participants: 8, maxParticipants: 12 },
  { id: 2, titre: 'Club de Lecture', description: 'Partagez vos livres préférés et découvertes littéraires', statut: 'Actif', tags: ['Lecture', 'Collectif'], date: '18 février 2026', horaire: '19h00 - 21h00', participants: 15, maxParticipants: 20 },
  { id: 3, titre: 'Méditation Guidée', description: 'Séance de méditation pour débutants et avancés', statut: 'Actif', tags: ['Yoga', 'Individuel'], date: 'Tous les jours', horaire: '10 minutes', participants: 0, maxParticipants: null },
];

router.get('/', auth, (req, res) => res.json(services));

router.get('/:id', auth, (req, res) => {
  const s = services.find(s => s.id === parseInt(req.params.id));
  if (!s) return res.status(404).json({ message: 'Service non trouvé' });
  res.json(s);
});

router.post('/', auth, (req, res) => {
  const newService = { id: services.length + 1, ...req.body, participants: 0 };
  services.push(newService);
  res.status(201).json(newService);
});

router.put('/:id', auth, (req, res) => {
  const idx = services.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Service non trouvé' });
  services[idx] = { ...services[idx], ...req.body };
  res.json(services[idx]);
});

router.delete('/:id', auth, (req, res) => {
  const idx = services.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Service non trouvé' });
  services.splice(idx, 1);
  res.json({ message: 'Service supprimé' });
});

module.exports = router;