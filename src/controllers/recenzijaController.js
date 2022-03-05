const Recenzija = require('../models/recenzijaModel');
const Rezervacija = require('../models/rezervacijaModel');
const Ponuda = require('../models/ponudaModel');
const Korisnik = require('../models/korisnikModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const factory = require('./handlerFactory');



exports.podatciZaSpremanjeRecenzije = catchAsync(async (req, res, next) => {
    const { idRezervacije,ocjena, komentar } = req.body;
      let rezervacija = await Rezervacija.find({
        _id: idRezervacije, 
        korisnik: req.user.id
      }).populate("recenzija");
    rezervacija = rezervacija[0];
 
    let ponuda = await Ponuda.find({_id: rezervacija.ponuda._id, status: "aktivno"});
    ponuda = ponuda[0];
 
    if(!ponuda){
      return next( new AppError('Ponuda vise nije aktivna!', 400));
   }     

    if(rezervacija.status == "obrisano"){
       return next( new AppError('Rezervacija je obrisana!', 400));
    }    

    if(rezervacija.status == "rezervirano"){
      return next( new AppError('Rezervacija nije plaćena!', 400));
   }
 
   for(let el in ponuda.pocetniDatumi){ 
 
     if(new Date(ponuda.pocetniDatumi[el]) >= new Date(rezervacija.datumPocetkaPonude)){ 

       if(new Date(ponuda.pocetniDatumi[el]) < new Date()){
          break;
       }
       else{
        return next( new AppError('Niste jos iskusili ponudu, ne možete davati recenziju!', 400));
       }
     }
      if(el == ponuda.pocetniDatumi.length-1){
      return next( new AppError('Problem pri davanju recenzije!', 400));
     }
 
   } 

    req.body = {
      komentar: komentar.trim(),
      ocjena,
      ponuda: rezervacija.ponuda._id,
      rezervacija: idRezervacije,
      korisnik: req.user.id
  }
    if(rezervacija.recenzija){
       const doc = await Recenzija.findByIdAndUpdate( rezervacija.recenzija.id, req.body, {
       new: true,
       runValidators: true
     }); 
     if (!doc) {
       return next(new AppError('Ne postoji vasa recenzija', 404));
     }
 
     return res.status(200).json({
       status: 'success',
       data: {
         data: doc
       }
     });
    }
 
    next();
});


exports.spremanjeRecenzije = factory.createOne(Recenzija);
exports.azuriranjeRecenzije = factory.updateOne(Recenzija);
