const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est requis'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  interests: {
    type: [String],
    default: [],
  },
  points: {
    type: Number,
    default: 0,
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
  }],
  activitiesJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
  }],
}, {
  timestamps: true,
});

// ✅ Corrigé — sans next
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ✅ Comparer le mot de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Formate pour Flutter
UserSchema.methods.toFlutter = function () {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    memberSince: this.createdAt.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    }),
    points: this.points,
    badgeCount: this.badges?.length ?? 0,
    interests: this.interests,
    avatarUrl: this.avatarUrl,
  };
};

module.exports = mongoose.model('User', UserSchema);