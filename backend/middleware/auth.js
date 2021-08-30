const jwt = require('jsonwebtoken');
require('dotenv').config();


// Middleware d'autentification
module.exports = (req, res, next) => {
  try {
      // On récupère le token pour en enlevant le premier element
      const token = req.headers.authorization.split(' ')[1];
      // On décode le token
      const decodedToken = jwt.verify(token, `${process.env.TOKEN}`);
      const userId = decodedToken.userId;
      // si les deux id ne correspondent pas, on lance une erreur
      if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid user ID';
      // sinon on passe a la suite
      } else {
        next();
      }
  } catch (error) {
    res.status(401).json({ error: error | "requête non authentifiée"});
    console.log(error);
  }
};