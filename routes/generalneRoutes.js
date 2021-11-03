const express = require('express');
const generalniController = require('../controllers/generalniController');
const authentifikacijskiController = require('../controllers/authentifikacijskiController');
const korisnikController = require('../controllers/korisnikController');

const router = express.Router();
 
router.get('/registracija', generalniController.getRegistracijskaForma);
router.get('/prijava', generalniController.getPrijavnaForma);
router.get('/login', (req,res)=>{ res.redirect("/prijava")});
router.get('/odjava', authentifikacijskiController.odjava);

router.get('/chatAdmin', 
  authentifikacijskiController.zastita,
  authentifikacijskiController.onemogucavanjeZaUloge('admin'), 
  (req,res)=>{

    res.render("chatZaposlenik", {
      status: req.status
    });
 
 }
  );



router.get(
  '/mojProfil',
   authentifikacijskiController.zastita,
  korisnikController.slanjeProfila
);

/*  API ///////////////////////////////// */

router.post(
  '/kontaktnaPoruka',
  generalniController.podesavanjeUrlRadiPogresaka,
  generalniController.slanjeKontaktnePoruke
);

router.post(
  '/submit-user-data',
  generalniController.podesavanjeUrlRadiPogresaka,
  authentifikacijskiController.zastita,
  generalniController.updateKorisnickiPodatci
);

/*/////////////////////////////////////// */


router.get('/', 
   generalniController.getPocetna
);





module.exports = router;



