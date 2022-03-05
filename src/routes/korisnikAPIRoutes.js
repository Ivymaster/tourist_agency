const express = require('express');
const korisnikAPIController = require('../controllers/korisnikAPIController');
const authentifikacijskiController = require('../controllers/authentifikacijskiController');

const router = express.Router();


router.get('/zaboravljenaSifra', (req, res) => {
  res.render('zaboravljenaSifra');
});

router.get('/odjava', authentifikacijskiController.odjava);

router.route('/resetSifre/:token').get((req, res) => {
  res.render('novaSifraForma', {
    token: req.params.token
  });
});

/*   API tip povrata podataka */
router.post('/registracija', authentifikacijskiController.registracija);
router.post('/prijava', authentifikacijskiController.prijava);
router.post('/resetSifre/:token', authentifikacijskiController.resetSifre);
router.post('/zaboravljenaSifra', authentifikacijskiController.zaboravljenaSifra);
 

// ZASTITCENE RUTE
router.use(authentifikacijskiController.zastita);
router.get('/mojProfil', korisnikAPIController.getMe, korisnikAPIController.getKorisnik);

router.post(
  '/azuriranjeSifre',
  authentifikacijskiController.zastita,
  authentifikacijskiController.azuriranjeSifre
);
router.post(
  '/azuriranjeProfila',
  korisnikAPIController.ucitavanjeKorisnickeSlike,
  korisnikAPIController.redimenzionisanjeKorisnickeSlike,
  korisnikAPIController.updateMe
);
router.delete('/deleteMe', korisnikAPIController.deleteMe);

router.use(authentifikacijskiController.onemogucavanjeZaUloge('admin'));

router
  .route('/:id')
  .get(korisnikAPIController.getKorisnik)
  .patch(korisnikAPIController.updateKorisnik)
  .delete(korisnikAPIController.deleteKorisnik);

/*   API tip povrata podataka */



module.exports = router;
