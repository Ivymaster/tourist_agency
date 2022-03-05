const express = require("express");
const ponudaController = require("../controllers/ponudaController");
const authController = require("../controllers/api/v2/authController");
const generalniController = require("../controllers/generalniController");

const router = express.Router();

router.get(
  "/pretraga",
  generalniController.podesavanjeUrlRadiPogresaka,
  ponudaController.getPodudarnePonude
);

router.get(
  "/kreiranje",
  authController.zastita,
  authController.onemogucavanjeZaUloge("admin"),
  ponudaController.ponudaForma
);

router.get(
  "/izmjena/:id",
  authController.zastita,
  authController.onemogucavanjeZaUloge("admin"),
  ponudaController.izmjenaPonudeForma
);

router
  .route("/:id")
  .get(ponudaController.getJednuPonudu)
  .patch(
    generalniController.podesavanjeUrlRadiPogresaka,
    authController.zastita,
    authController.onemogucavanjeZaUloge("admin"),
    ponudaController.ucitavanjeSlikePonude,
    ponudaController.redimenzionisanjeSlikaPonude,
    ponudaController.parsiranjeNovePonude,
    ponudaController.parsiranjePonudeZaIzmjenu,
    ponudaController.izmjenaPonude
  )
  .put(
    generalniController.podesavanjeUrlRadiPogresaka,
    authController.zastita,
    authController.onemogucavanjeZaUloge("admin"),
    ponudaController.parsiranjePonudeZaVracanje,
    ponudaController.izmjenaPonude
  )
  .delete(
    generalniController.podesavanjeUrlRadiPogresaka,
    authController.zastita,
    authController.onemogucavanjeZaUloge("admin"),
    ponudaController.kreiranjePodatakaZaBrisanje,
    ponudaController.updatePonudu
  );

router
  .route("/")
  .get(ponudaController.getSvePonude)
  .post(
    generalniController.podesavanjeUrlRadiPogresaka,
    authController.zastita,
    authController.onemogucavanjeZaUloge("admin"),
    ponudaController.parsiranjeNovePonude,
    ponudaController.kreiranjePonude
  );

/*   API tip povrata podataka */

module.exports = router;
