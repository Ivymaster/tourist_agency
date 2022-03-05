const express = require("express");
const generalniController = require("../controllers/generalniController");
const rezervacijaController = require("../controllers/rezervacijaController");
const authController = require("../controllers/api/v2/authController");

const router = express.Router();

// ZASTITCENE RUTE
router.use(authController.zastita);
//korisnickoIme={{this.korisnik.korisnickoIme}}
router.get(
  "/vlasnikRezervacije",
  authController.provjeraPrijavljenosti,
  rezervacijaController.getVlasnikRezervacije
);
router.route("/mojeRezervacije").get(rezervacijaController.getMojeRezervacije);

router
  .route("/kupovinska-sesija/:podatciKupovine")
  .get(rezervacijaController.getProdajnaSesija);

router
  .route("/:id")
  .post(
    generalniController.podesavanjeUrlRadiPogresaka,
    rezervacijaController.podatciZaKreacijuRezervacije,
    rezervacijaController.kreirajRezervaciju
  )
  .delete(
    generalniController.podesavanjeUrlRadiPogresaka,
    rezervacijaController.azuriranjeSlobodnihMjestaPonude,
    rezervacijaController.podatciZaBrisanjeRezervacije,
    rezervacijaController.obrisiRezervaciju
  );

router
  .route("/podatci")
  .get(
    generalniController.podesavanjeUrlRadiPogresaka,
    authController.provjeraPrijavljenosti,
    authController.onemogucavanjeZaUloge("admin", "zaposlenik"),
    rezervacijaController.getPodatciRezervacije,
    rezervacijaController.getSpecificneRezervacije
  );
router
  .route("/personalniPodatci")
  .get(
    generalniController.podesavanjeUrlRadiPogresaka,
    authController.provjeraPrijavljenosti,
    authController.onemogucavanjeZaUloge("admin", "zaposlenik", "turist"),
    rezervacijaController.getPodatciPersonalneRezervacije,
    rezervacijaController.getSpecificneRezervacije
  );
router
  .route("/")
  .get(
    authController.onemogucavanjeZaUloge("admin", "zaposlenik"),
    rezervacijaController.getSveRezervacije
  );

module.exports = router;
