const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // console.log(req.headers);
    // if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
      const userId = decodedToken.userId;
      if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid user ID';
      } else {
        // console.log('requête authentifiée');
        next();
      }
    // } else {
    //   console.log(req.headers);
    // }
  } catch (error) {
    res.status(401).json({ error: error | "requête non authentifiée"});
    console.log(error);
  }
};