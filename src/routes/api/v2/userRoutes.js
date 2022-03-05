const express = require("express");
const userController = require("../../../controllers/api/v2/userController");
const authController = require("../../../controllers/api/v2/authController");

const router = express.Router();

router.get("/zaboravljenaSifra", (req, res) => {
  res.render("zaboravljenaSifra");
});

router.route("/resetSifre/:token").get((req, res) => {
  res.render("novaSifraForma", {
    token: req.params.token,
  });
});

/*   API tip povrata podataka */
router.post("/resetSifre/:token", authController.resetSifre);
router.post("/zaboravljenaSifra", authController.zaboravljenaSifra);

// ZASTITCENE RUTE
router.use(authController.zastita);
router.get("/mojProfil", userController.getMe, userController.getKorisnik);

router.post(
  "/azuriranjeSifre",
  authController.zastita,
  authController.azuriranjeSifre
);
router.post(
  "/azuriranjeProfila",
  userController.ucitavanjeKorisnickeSlike,
  userController.redimenzionisanjeKorisnickeSlike,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.onemogucavanjeZaUloge("admin"));

router
  .route("/:id")
  .get(userController.getKorisnik)
  .patch(userController.updateKorisnik)
  .delete(userController.deleteKorisnik);

/*   API tip povrata podataka */

module.exports = router;
