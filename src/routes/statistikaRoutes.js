const express = require('express');
const generalniController = require('../controllers/generalniController');
const authentifikacijskiController = require('../controllers/authentifikacijskiController');
const statistikaController = require('../controllers/statistikaController');

const router = express.Router();

router
.get("/", 
    generalniController.podesavanjeUrlRadiPogresaka,
    authentifikacijskiController.zastita,
    statistikaController.zaradaPoMjesecima
)





/*   API tip povrata podataka */

 
module.exports = router;
