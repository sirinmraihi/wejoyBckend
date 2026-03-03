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

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.log("❌ Erreur MongoDB :", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});