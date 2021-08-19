const Sauce = require('../models/sauce');
const express = require('express');
const sauceCtrl = require('../controllers/sauces')
const router = express.Router();

router.post('/', sauceCtrl.createSauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.put('/:id', sauceCtrl.modifySauce);
router.delete('/:id', sauceCtrl.deleteSauce);
router.use('/', sauceCtrl.getAllSauces);

module.exports = router;