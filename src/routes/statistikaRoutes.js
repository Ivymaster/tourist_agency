const express = require("express");
const generalniController = require("../controllers/generalniController");
const authController = require("../controllers/api/v2/authController");
const statistikaController = require("../controllers/statistikaController");

const router = express.Router();

router.get(
  "/",
  generalniController.podesavanjeUrlRadiPogresaka,
  authController.zastita,
  statistikaController.zaradaPoMjesecima
);

/*   API tip povrata podataka */

module.exports = router;
