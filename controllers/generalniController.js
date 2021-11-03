const Korisnik = require('../models/korisnikModel');
const Recenzija = require('../models/recenzijaModel');
const Ponuda = require('../models/ponudaModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

exports.getPocetna = catchAsync(async (req, res, next) => {
  const brojPonuda = await Ponuda.count(Ponuda.find({status:"aktivno"}).select("_id"))
  const brojKorisnika = await Korisnik.count(Korisnik.find({uloga:"turist"}).select("_id"))
  const brojRecenzija = await Recenzija.count(Recenzija.find({ocjena: 5}).select("_id"))
  
  const brojke = {
    ponude: brojPonuda,
    korisnici: brojKorisnika,
    recenzije: brojRecenzija
  };
  const najnovijaPonuda = await Ponuda.find({status:"aktivno"}).sort([["datumKreacije", -1]]); 
  const najboljePonude = await Ponuda.find({status:"aktivno"}).sort({ocjena:-1}).limit(3);
  const zaposlenici = await Korisnik.find({uloga: {$ne: "turist"}});
    res.status(200).render('index', {
    brojke,
    najnovijaPonuda:najnovijaPonuda[0],
    najboljePonude,
    zaposlenici,
    status: req.status,
    korisnik: req.user
  });
});
 
 

exports.getRegistracijskaForma = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    return next(new AppError("Vec ste prijavljeni!", 400));
  }
  res.status(200).render('signUp',{
    status: req.status
  });
});

exports.getPrijavnaForma = (req, res) => {
  res.status(200).render('login', {
    status: req.status
  });
};
  


/////// API ///////////////////////////////////////////////////////////

exports.updateKorisnickiPodatci = catchAsync(async (req, res, next) => {
  const azuriraniKorsnik = await Korisnik.findByIdAndUpdate(
    req.user.id,
    {
      ime: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: azuriraniKorsnik,
    status: req.status

  });
});

exports.slanjeKontaktnePoruke = catchAsync(async (req, res, next) => {
  
  let kontakt = {
    ime: req.body.ime,
    tel: req.body.mob,
    email2: req.body.email,
    message: req.body.sadrzaj
  };

  await new Email(kontakt, '').sendFormMail();
  res.status(200).json({
    status: 'success',
    data: {
      data: 'Email je poslan!'
    }
  });
});

exports.podesavanjeUrlRadiPogresaka = async (req,res,next)=>{
 
  req.originalUrl = `/podatci${req.originalUrl}`;
  next();
}