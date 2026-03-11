require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

console.log("🚀 DÉMARRAGE...");
console.log("📁 Fichier .env chargé");
console.log("🔑 MONGO_URI =", process.env.MONGO_URI);
console.log("🔑 JWT_SECRET présent =", !!process.env.JWT_SECRET);
console.log("🔑 PORT =", process.env.PORT);

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes utilisateurs (app Flutter) ───────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/activities',    require('./routes/activity.routes'));
app.use('/api/moods',         require('./routes/mood.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// ─── Routes admin ─────────────────────────────────────────────────────────────
app.use('/api/dashboard',          require('./routes/dashboard'));
app.use('/api/services',           require('./routes/services'));
app.use('/api/demandes',           require('./routes/demandes'));
app.use('/api/admin/notifications',require('./routes/adminnotification'));
app.use('/api/stats',              require('./routes/stats'));

// ─── Route test ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '🎉 WeJoy API is running !' }));

// ─── Gestion erreurs globale ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

// ─── Connexion MongoDB ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.log("❌ Erreur MongoDB :", err));

// ─── Démarrage serveur ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

// ─── Gestion port occupé ──────────────────────────────────────────────────────
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} déjà utilisé !`);
    console.error(`💡 Exécutez : netstat -ano | findstr :${PORT}`);
    console.error(`💡 Puis     : taskkill /PID <numero> /F`);
    process.exit(1);
  }
});

// ─── Arrêt propre ─────────────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n👋 Serveur arrêté proprement');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});