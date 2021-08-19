const Sauce = require('../models/sauce');
const express = require('express');
const sauceCtrl = require('../controllers/sauces')
const router = express.Router();
const multer = require('../middleware/multer-config');


router.post('/', multer, sauceCtrl.createSauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.put('/:id',multer, sauceCtrl.modifySauce);
router.delete('/:id', sauceCtrl.deleteSauce);
router.use('/', sauceCtrl.getAllSauces);

module.exports = router;

// const express = require('express');
// const router = express.Router();

// const auth = require('../middleware/auth');
// const multer = require('../middleware/multer-config');

// const stuffCtrl = require('../controllers/stuff');

// router.get('/', auth, stuffCtrl.getAllStuff);
// router.post('/', auth, multer, stuffCtrl.createThing);
// router.get('/:id', auth, stuffCtrl.getOneThing);
// router.put('/:id', auth, stuffCtrl.modifyThing);
// router.delete('/:id', auth, stuffCtrl.deleteThing);

// module.exports = router;