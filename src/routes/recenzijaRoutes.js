const express = require("express");
const recenzijaController = require("../controllers/recenzijaController");
const generalniController = require("../controllers/generalniController");
const authController = require("../controllers/api/v2/authController");

const router = express.Router();

// ZATITCENE RUTE
router.use(authController.zastita);

router
  .route("/:id")
  .post(
    generalniController.podesavanjeUrlRadiPogresaka,
    recenzijaController.azuriranjeRecenzije
  );

router
  .route("/")
  .post(
    generalniController.podesavanjeUrlRadiPogresaka,
    recenzijaController.podatciZaSpremanjeRecenzije,
    recenzijaController.spremanjeRecenzije
  );

module.exports = router;
