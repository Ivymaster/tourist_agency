const express = require("express");
const korisnikController = require("../controllers/korisnikController");
const authController = require("../controllers/api/v2/authController");
const generalniController = require("../controllers/generalniController");

const router = express.Router();

// zastita all routes after this middleware
router.use(authController.zastita);

router.get(
  "/brisanjeJednog/:id",
  generalniController.podesavanjeUrlRadiPogresaka,
  authController.onemogucavanjeZaUloge("admin"),
  korisnikController.deleteKorisnik
);
router.get(
  "/vracanjeJednog/:id",
  generalniController.podesavanjeUrlRadiPogresaka,
  authController.onemogucavanjeZaUloge("admin"),
  korisnikController.vratiKorisnik
);

router.get(
  "/zaposljavanjeJednog/:id",
  generalniController.podesavanjeUrlRadiPogresaka,
  authController.onemogucavanjeZaUloge("admin"),
  korisnikController.zaposliKorisnika
);

router.get(
  "/otpustanjeJednog/:id",
  generalniController.podesavanjeUrlRadiPogresaka,
  authController.onemogucavanjeZaUloge("admin"),
  korisnikController.otpustiKorisnika
);

router.get(
  "/pretraga",
  generalniController.podesavanjeUrlRadiPogresaka,
  authController.onemogucavanjeZaUloge("admin", "zaposlenik"),
  korisnikController.parsiranjePodudarneKorisnike,
  korisnikController.getKorisnike
);

router.get(
  "/",
  authController.onemogucavanjeZaUloge("admin", "zaposlenik"),
  korisnikController.getSviKorisnici
);

module.exports = router;
