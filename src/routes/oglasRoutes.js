const express = require('express');
const oglasController = require('../controllers/oglasController');
const generalniController = require('../controllers/generalniController');
const authentifikacijskiController = require('../controllers/authentifikacijskiController');

const router = express.Router();
 

    router
   .route('/podatci')
   .get(   
    generalniController.podesavanjeUrlRadiPogresaka,
     oglasController.getPodatciOglasi,
    oglasController.getOglasi,
    )
   .post(
     generalniController.podesavanjeUrlRadiPogresaka,
    oglasController.ucitavanjeDokumenataOglasa,
    oglasController.parsiranjeOglasaSpremanje,
    oglasController.spremanjeOglasa
   );

   router
   .route('/podatci/:id')
   .delete(
    generalniController.podesavanjeUrlRadiPogresaka,
    oglasController.parsiranjeZaBrisanje,
    oglasController.brisanjeOglasa

   );

   router.route("/kreiranje")
    .get(
        oglasController.oglasForma
    )
   router
   .route('/:id')
   .get(
     oglasController.getOdredjeniOglas

   );

   


   
   router
   .route('/')
   .get(    
     oglasController.getSveOglase,
     );



 
module.exports = router;
