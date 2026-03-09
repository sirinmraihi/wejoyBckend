const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Cuisine', 'Lecture', 'Jardinage', 'Yoga', 'Sport', 'Autre'],
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  // Type : collectif ou individuel
  type: {
    type: String,
    enum: ['collective', 'individual'],
    default: 'collective',
  },
  // Pour les activités individuelles répétables
  isDaily: {
    type: Boolean,
    default: false,
  },
  // Pour les activités collectives
  date: {
    type: Date,
    default: null,
  },
  timeSlot: {
    type: String, // ex: "14h00 - 16h00"
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  maxParticipants: {
    type: Number,
    default: null,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// ─── Formate l'activité pour Flutter ─────────────────────────────────────────
ActivitySchema.methods.toFlutter = function () {
  return {
    _id: this._id,
    title: this.title,
    category: this.category,
    description: this.description,
    imageUrl: this.imageUrl ?? '',
    date: this.date
      ? this.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : null,
    timeSlot: this.timeSlot ?? null,
    location: this.location ?? null,
    currentParticipants: this.currentParticipants,
    maxParticipants: this.maxParticipants,
    isIndividual: this.type === 'individual',
    isDaily: this.isDaily,
  };
};

module.exports = mongoose.model('Activity', ActivitySchema);