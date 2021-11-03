const express = require('express');
const korisnikController = require('../controllers/korisnikController');
const authentifikacijskiController = require('../controllers/authentifikacijskiController');
const generalniController = require('../controllers/generalniController');

const router = express.Router();

// zastita all routes after this middleware
router.use(authentifikacijskiController.zastita);

router.get(
  '/brisanjeJednog/:id',
  generalniController.podesavanjeUrlRadiPogresaka,
  authentifikacijskiController.onemogucavanjeZaUloge('admin'),
  korisnikController.deleteKorisnik
);
router.get(
  '/vracanjeJednog/:id',
  generalniController.podesavanjeUrlRadiPogresaka,
  authentifikacijskiController.onemogucavanjeZaUloge('admin'),
  korisnikController.vratiKorisnik
);

router.get(
  '/zaposljavanjeJednog/:id',
  generalniController.podesavanjeUrlRadiPogresaka,
  authentifikacijskiController.onemogucavanjeZaUloge('admin'),
  korisnikController.zaposliKorisnika
);

router.get(
  '/otpustanjeJednog/:id',
  generalniController.podesavanjeUrlRadiPogresaka,
  authentifikacijskiController.onemogucavanjeZaUloge('admin'),
  korisnikController.otpustiKorisnika
);

router.get('/pretraga',  
generalniController.podesavanjeUrlRadiPogresaka,
    authentifikacijskiController.onemogucavanjeZaUloge('admin',"zaposlenik"),
    korisnikController.parsiranjePodudarneKorisnike,
    korisnikController.getKorisnike
    );


router.get('/', authentifikacijskiController.onemogucavanjeZaUloge('admin',"zaposlenik"), korisnikController.getSviKorisnici);

module.exports = router;
