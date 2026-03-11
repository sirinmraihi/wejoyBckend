require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('../models/Admin');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (texte) =>
  new Promise((resolve) => rl.question(texte, resolve));

async function creerAdmin() {
  try {
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('=== Création du compte Administrateur WelJoy ===\n');

    const nom = await question('Nom complet : ');
    const email = await question('Email : ');
    const password = await question('Mot de passe (min 8 caractères) : ');
    const role = await question('Rôle (admin / superadmin) [admin] : ') || 'admin';

    // Vérifier si l'email existe déjà
    const existant = await Admin.findOne({ email });
    if (existant) {
      console.log('\n❌ Un administrateur avec cet email existe déjà.');
      process.exit(1);
    }

    if (password.length < 8) {
      console.log('\n❌ Le mot de passe doit contenir au moins 8 caractères.');
      process.exit(1);
    }

    const admin = await Admin.create({ nom, email, password, role });

    console.log('\n✅ Administrateur créé avec succès !');
    console.log(`   Nom   : ${admin.nom}`);
    console.log(`   Email : ${admin.email}`);
    console.log(`   Rôle  : ${admin.role}`);
    console.log(`   ID    : ${admin._id}\n`);

  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

creerAdmin();