const express = require('express');
const sauceCtrl = require('../controllers/sauces')
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');


router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, multer, sauceCtrl.deleteSauce);
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