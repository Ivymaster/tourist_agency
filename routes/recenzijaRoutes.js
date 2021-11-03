const express = require('express');
const recenzijaController = require('../controllers/recenzijaController');
const generalniController = require('../controllers/generalniController');
const authentifikacijskiController = require('../controllers/authentifikacijskiController');

const router = express.Router();

// ZATITCENE RUTE
router.use(authentifikacijskiController.zastita);

router
.route("/:id")
.post( 
    generalniController.podesavanjeUrlRadiPogresaka, 
    recenzijaController.azuriranjeRecenzije
)

router
.route("/")
.post(
    generalniController.podesavanjeUrlRadiPogresaka, 
    recenzijaController.podatciZaSpremanjeRecenzije, 
    recenzijaController.spremanjeRecenzije
)
  

module.exports = router;
