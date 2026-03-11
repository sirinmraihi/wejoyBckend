const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');          // ✅ bcrypt (pas bcryptjs)

const adminSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
  },
  actif: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Hash automatique du mot de passe avant sauvegarde
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Méthode pour vérifier le mot de passe
adminSchema.methods.verifierMotDePasse = async function (motDePasse) {
  return bcrypt.compare(motDePasse, this.password);
};

// Ne jamais retourner le password dans les réponses JSON
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);