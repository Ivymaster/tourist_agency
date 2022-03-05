const express = require("express");
const generalniController = require("../controllers/generalniController");
const authController = require("../controllers/api/v2/authController");
const korisnikController = require("../controllers/korisnikController");

var Router = require("named-routes");
var expandedRouter = new Router();

const router = express.Router();

expandedRouter.extendExpress(router);

router.get("/register", "register", generalniController.register);
router.get("/login", generalniController.login);
router.post("/logout", generalniController.logout);

router.get(
  "/chatAdmin",
  authController.zastita,
  authController.onemogucavanjeZaUloge("admin"),
  (req, res) => {
    res.render("chatZaposlenik", {
      status: req.status,
    });
  }
);

router.get(
  "/mojProfil",
  authController.zastita,
  korisnikController.slanjeProfila
);

/*  API ///////////////////////////////// */

router.post(
  "/kontaktnaPoruka",
  generalniController.podesavanjeUrlRadiPogresaka,
  generalniController.slanjeKontaktnePoruke
);

router.post(
  "/submit-user-data",
  generalniController.podesavanjeUrlRadiPogresaka,
  authController.zastita,
  generalniController.updateKorisnickiPodatci
);

/*/////////////////////////////////////// */

router.get("/", generalniController.getPocetna);

module.exports = router;
