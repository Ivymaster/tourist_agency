const multer = require('multer');
const sharp = require('sharp');
const Korisnik = require('../models/korisnikModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getSviKorisnici = catchAsync(async (req, res, next) => {
  let filter= {};

  if(req.status=="zaposlenik"){
    req.body.uloga = "turist";
    filter= {
      uloga: req.body.uloga,
    }
   }

   filter.korisnickoIme = { $ne:req.user.korisnickoIme}
  const korisnici = await Korisnik.find(filter).sort([["datumKreacije", -1],  ["korisnickoIme", 1]]);
   res.status(200).render('users', {
    korisnici,
    status: req.status
  });
});

exports.deleteKorisnik= catchAsync(async (req, res, next) => {
  const korisnici = await Korisnik.findByIdAndUpdate(req.params.id, {
    aktivnost: false
  });
  res.redirect('/korisnici');
});

exports.vratiKorisnik= catchAsync(async (req, res, next) => {
  const korisnici = await Korisnik.findByIdAndUpdate(req.params.id, {
    aktivnost: true
  });
  res.redirect('/korisnici');
});

exports.zaposliKorisnika= catchAsync(async (req, res, next) => {
  const korisnici = await Korisnik.findByIdAndUpdate(req.params.id, {
    aktivnost: true,
    uloga: "zaposlenik"
  });
  res.redirect('/korisnici');
});
exports.otpustiKorisnika= catchAsync(async (req, res, next) => {
  const korisnici = await Korisnik.findByIdAndUpdate(req.params.id, {
    aktivnost: true,
    uloga: "turist"
  });
  res.redirect('/korisnici');
});

exports.slanjeProfila = catchAsync(async (req, res) => {
  const korisnik = await Korisnik.findById(req.user.id);

  res.status(200).render('profileChange', {
    korisnik,
    status: req.status

  });
});

exports.parsiranjePodudarneKorisnike = catchAsync(async (req, res, next) => {
     
  const pocetniDatum = req.query.datumKreacije.gte;
  const krajnjiDatum = req.query.datumKreacije.lte;
   if(new Date(pocetniDatum) > new Date(krajnjiDatum)){
    return next(
      new AppError(
        'Pogreska pri unosu datuma.',
        400
      )
    );
    }
  if(req.query.korisnickoIme==""){
    req.query.korisnickoIme={$ne:req.user.korisnickoIme};
  }
  if(req.query.korisnickoIme==req.user.korisnickoIme){
    req.query.korisnickoIme="";
  }
  if(req.status=="zaposlenik"){
    req.query.uloga = "turist"; 
  } 
  req.query.sort = "datumKReacije, korisnickoIme";
  next();
});

exports.getKorisnike = factory.getAll(Korisnik);
