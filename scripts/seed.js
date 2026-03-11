require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connecté');
    await Activity.deleteMany({});
  await Activity.insertMany([
  {
    title: 'Yoga du matin',
    category: 'Yoga',
    description: 'Séance de yoga pour bien démarrer la journée',
    type: 'individual',
    isDaily: true,
    timeSlot: '07:00 - 07:30',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    participants: [], currentParticipants: 12,
  },
  {
    title: 'Recette healthy',
    category: 'Cuisine',
    description: 'Préparez un smoothie bowl nutritif et délicieux',
    type: 'individual',
    isDaily: true,
    timeSlot: '09:00 - 09:30',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
    participants: [], currentParticipants: 8,
  },
  {
    title: 'Lecture mindful',
    category: 'Lecture',
    description: 'Lecture consciente pour se détendre',
    type: 'individual',
    isDaily: false,
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    participants: [], currentParticipants: 20,
  },
  {
    title: 'Jardinage zen',
    category: 'Jardinage',
    description: 'Prenez soin de vos plantes en pleine conscience',
    type: 'collective',
    isDaily: false,
    date: new Date('2026-03-16'),
    timeSlot: '10:00 - 10:45',
    maxParticipants: 15,
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    participants: [], currentParticipants: 5,
  },
  {
    title: 'Méditation & Yoga',
    category: 'Yoga',
    description: '10 minutes pour calmer l\'esprit et se recentrer',
    type: 'individual',
    isDaily: true,
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
    participants: [], currentParticipants: 34,
  },
  {
    title: 'Atelier créatif',
    category: 'Autre',
    description: 'Créez et partagez votre passion en groupe',
    type: 'collective',
    isDaily: false,
    date: new Date('2026-03-17'),
    timeSlot: '14:00 - 16:00',
    location: 'Salle communautaire',
    maxParticipants: 20,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    participants: [], currentParticipants: 11,
  },
  {
    title: 'Pilates doux',
    category: 'Sport',
    description: 'Renforcement musculaire en douceur pour tous',
    type: 'collective',
    isDaily: false,
    date: new Date('2026-03-18'),
    timeSlot: '18:00 - 19:00',
    location: 'Salle de sport',
    maxParticipants: 12,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    participants: [], currentParticipants: 9,
  },
  {
    title: 'Club lecture',
    category: 'Lecture',
    description: 'Discussion autour d\'un livre choisi ensemble',
    type: 'collective',
    isDaily: false,
    date: new Date('2026-03-20'),
    timeSlot: '19:00 - 20:30',
    location: 'Bibliothèque',
    maxParticipants: 10,
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    participants: [], currentParticipants: 7,
  },
]);
    console.log('🌱 8 activités insérées !');
    await mongoose.disconnect();
  })
  .catch(err => { console.error(err); process.exit(1); });