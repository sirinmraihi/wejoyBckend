const mongoose = require('mongoose');

// ── Schéma Message (chat) ─────────────────────────────────────────────────────
const MessageSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:  { type: String, required: true },
  avatarUrl: { type: String, default: null },
  text:      { type: String, required: true },
}, { timestamps: true });

// ── Schéma Contenu (post partagé) ─────────────────────────────────────────────
const ContentSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:  { type: String, required: true },
  avatarUrl: { type: String, default: null },
  title:     { type: String, required: true },
  body:      { type: String, required: true },
  type:      { type: String, enum: ['Recette', 'Article', 'Conseil', 'Autre'], default: 'Autre' },
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:  [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username:  String,
    text:      String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// ── Schéma Activité principal ─────────────────────────────────────────────────
const ActivitySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ['Cuisine', 'Lecture', 'Jardinage', 'Yoga', 'Sport', 'Autre'] },
  description: { type: String, required: true },
  imageUrl:    { type: String, default: '' },

  isOfficial:  { type: Boolean, default: false },
  type:        { type: String, enum: ['collective', 'individual'], default: 'collective' },
  isDaily:     { type: Boolean, default: false },
  date:        { type: Date, default: null },
  timeSlot:    { type: String, default: null },
  location:    { type: String, default: null },
  maxParticipants:     { type: Number, default: null },
  currentParticipants: { type: Number, default: 0 },

  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // ✅ populate pour récupérer username du créateur
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  content: [ContentSchema],
  chat:    [MessageSchema],

}, { timestamps: true });

// ── toFlutter ─────────────────────────────────────────────────────────────────
ActivitySchema.methods.toFlutter = function () {
  return {
    _id:         this._id,
    title:       this.title,
    category:    this.category,
    description: this.description,
    imageUrl:    this.imageUrl ?? '',
    isOfficial:  this.isOfficial ?? false,
    date:        this.date
      ? this.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : null,
    timeSlot:            this.timeSlot ?? null,
    location:            this.location ?? null,
    currentParticipants: this.currentParticipants,
    maxParticipants:     this.maxParticipants,
    isIndividual:        this.type === 'individual',
    isDaily:             this.isDaily,
    membersCount:        this.participants?.length ?? 0,
    contentCount:        this.content?.length  ?? 0,
    chatCount:           this.chat?.length     ?? 0,
    createdAt:           this.createdAt,

    // ✅ createdBy peuplé si populate() a été appelé
    createdBy: this.createdBy
      ? (this.createdBy.username
          ? { id: this.createdBy._id, username: this.createdBy.username, avatarUrl: this.createdBy.avatarUrl ?? null }
          : this.createdBy)          // ObjectId brut si pas peuplé
      : null,
  };
};

module.exports = mongoose.model('Activity', ActivitySchema);