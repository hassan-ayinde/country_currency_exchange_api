// src/routes/countries.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/countriesController');

router.post('/refresh', ctrl.postRefresh);
router.get('/', ctrl.getCountries);
router.get('/image', ctrl.getImage);
router.get('/status', ctrl.getStatus);
router.get('/:name', ctrl.getCountryByName);
router.delete('/:name', ctrl.deleteCountryByName);

module.exports = router;
