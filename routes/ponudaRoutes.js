const express = require('express');
const ponudaController = require('../controllers/ponudaController');
const authentifikacijskiController = require('../controllers/authentifikacijskiController');
const generalniController = require('../controllers/generalniController');

const router = express.Router();

 
router.get('/pretraga',  
    generalniController.podesavanjeUrlRadiPogresaka,
     ponudaController.getPodudarnePonude
    );


 router.get('/kreiranje', 
    authentifikacijskiController.zastita, 
    authentifikacijskiController.onemogucavanjeZaUloge('admin'), 
    ponudaController.ponudaForma
    );
 
router.get('/izmjena/:id', 
    authentifikacijskiController.zastita, 
    authentifikacijskiController.onemogucavanjeZaUloge('admin'), 
     ponudaController.izmjenaPonudeForma
    );


  router
  .route('/:id')
  .get(
     ponudaController.getJednuPonudu,
   )
  .patch(
    generalniController.podesavanjeUrlRadiPogresaka,
    authentifikacijskiController.zastita, 
    authentifikacijskiController.onemogucavanjeZaUloge('admin'),
    ponudaController.ucitavanjeSlikePonude,
    ponudaController.redimenzionisanjeSlikaPonude,
    ponudaController.parsiranjeNovePonude,
    ponudaController.parsiranjePonudeZaIzmjenu,
    ponudaController.izmjenaPonude
  )
  .put(
    generalniController.podesavanjeUrlRadiPogresaka,
    authentifikacijskiController.zastita, 
    authentifikacijskiController.onemogucavanjeZaUloge('admin'),
    ponudaController.parsiranjePonudeZaVracanje,
    ponudaController.izmjenaPonude
  )
  .delete(
    generalniController.podesavanjeUrlRadiPogresaka,
    authentifikacijskiController.zastita, 
     authentifikacijskiController.onemogucavanjeZaUloge('admin'),
    ponudaController.kreiranjePodatakaZaBrisanje,
    ponudaController.updatePonudu
  );

  router
  .route('/')
  .get(
     ponudaController.getSvePonude,
   )
  .post(
    generalniController.podesavanjeUrlRadiPogresaka,
    authentifikacijskiController.zastita, 
    authentifikacijskiController.onemogucavanjeZaUloge('admin'),
    ponudaController.parsiranjeNovePonude,
    ponudaController.kreiranjePonude,
  );


  /*   API tip povrata podataka */

  
module.exports = router;
