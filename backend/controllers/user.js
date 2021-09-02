const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();


// Fonction d'inscription
exports.signup = (req, res, next) => {
  // On vérifie les inputs
  try {
    verifyInput(req);
    // On crypt le mot de passe avec bcrypt
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // On stock les identifiants avec le mot de passe chiffré dans la DB
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  }
  catch (error) {
    res.status(401).json({ error: error | "Données saisies invalides"});
  }
};

// Fonction de connection
exports.login = (req, res, next) => {
  // On vérifie les inputs
  try {
    verifyInput(req);
    // On cherche l'utilisateur dans la base de données à partir du mail
    User.findOne({ email: req.body.email })
      .then(user => {
        // renvoie une erreur si l'utilisateur n'a pas été trouvé
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        // On vérifie si le mot de passe est bien le bon
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            // renvoie une erreur si ce n'est pas le cas
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            // Si mdp ok, crée un token avec l'id, crypté avec la clé, valable 24h
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                `${process.env.TOKEN}`,
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } catch (error) {
    res.status(401).json({ error: error | "Données saisies invalides"});
  }
};


// Fonction de vérification des input
function verifyInput (req) {
  const testEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // Regex imposant au moins une lettre majuscule, une minuscule, un chiffre et un caractère spécial, et entre 5 et 20 caractères
  const testPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,20}$/;
  if ( !testEmail.test(req.body.email) || !testPassword.test(req.body.password) ) {
    throw 'Données saisies invalides';
  }
}