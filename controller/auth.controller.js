const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const ACCESS_SECRET  = process.env.JWT_SECRET         || 'wejoy_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'wejoy_refresh_secret';

const signAccess  = (id) => jwt.sign({ userId: id }, ACCESS_SECRET,  { expiresIn: '15m' });
const signRefresh = (id) => jwt.sign({ userId: id }, REFRESH_SECRET, { expiresIn: '7d'  });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: 'Tous les champs sont requis' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Mot de passe trop court (min 6 caractères)' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: username.trim(),
      email:    email.toLowerCase().trim(),
      password: hashed,
      points:   0,
      badges:   3,
      streak:   0,
      interests: [],
    });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        points:   user.points,
        badges:   user.badges,
        streak:   user.streak,
        memberSince: new Date(user.createdAt).toLocaleDateString('fr-FR', {
          month: 'long', year: 'numeric',
        }),
      },
    });
  } catch (err) {
    console.error('register:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ message: 'Identifiants incorrects' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Identifiants incorrects' });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin    = new Date();
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id:         user._id,
        username:   user.username,
        email:      user.email,
        avatarUrl:  user.avatarUrl  || null,
        points:     user.points     || 0,
        badges:     user.badges     || 0,
        streak:     user.streak     || 0,
        interests:  user.interests  || [],
        memberSince: new Date(user.createdAt).toLocaleDateString('fr-FR', {
          month: 'long', year: 'numeric',
        }),
      },
    });
  } catch (err) {
    console.error('login:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user    = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: 'Token invalide' });

    const newAccess  = signAccess(user._id);
    const newRefresh = signRefresh(user._id);

    user.refreshToken = newRefresh;
    await user.save();

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    res.status(403).json({ message: 'Token expiré ou invalide' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $unset: { refreshToken: 1 } });
    res.json({ message: 'Déconnexion réussie' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};