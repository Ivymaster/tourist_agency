const multer = require("multer");
const sharp = require("sharp");
const Oglas = require("../models/oglasModel");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const path = require("path");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const Email = require("./../utils/email");

// cuvanje predane datoteke direktno u direktorij
var multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/dokumenti/oglasi");
  },
  filename: function (req, file, cb) {
    let filePath = `${Date.now()}-${file.originalname}`;
    req.body.dokumentiPutanje = `${req.body.dokumentiPutanje}**${filePath}`;
    cb(null, filePath);
  },
});

// kreiranje funkcije modula multer, preko kojeg je definiran nacina spremanja predanih datoteka
const upload = multer({
  storage: multerStorage,
});

// Middleware za omogucavanje fajlova predanih putem forme
exports.ucitavanjeDokumenataOglasa = upload.array("dokumenti");

exports.getSveOglase = catchAsync(async (req, res, next) => {
  const oglasi = await Oglas.find({ status: "generalni" }).sort([
    ["datumKreacije", -1],
  ]);
  res.status(200).render("oglasi", {
    oglasi,
    status: req.status,
  });
});

exports.getPodatciOglasi = catchAsync(async (req, res, next) => {
  const pocetniDatum = req.query.datumKreacije.gte;
  const krajnjiDatum = req.query.datumKreacije.lte;
  if (new Date(pocetniDatum) > new Date(krajnjiDatum)) {
    return next(new AppError("Pogreska pri unosu datuma.", 400));
  }
  if (req.query.status == "specificni") {
    if (req.status != "admin") {
      req.query.zaposlenikTrenutni = req.user.id;
    }
  }
  if (req.query.status == "agencijski") {
    if (req.user.uloga == "turist")
      return next(new AppError("Niste autorizirani za ove oglase!", 400));
  }

  next();
});

exports.parsiranjeOglasaSpremanje = catchAsync(async (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  req.body.sazetak = req.body.sazetak.split("<br>");
  req.body.sadrzaj = req.body.sadrzaj.split("<br>");
  req.body.dokumenti = req.body.dokumentiPutanje
    .split("**")
    .slice(1, req.body.dokumentiPutanje.length);
  req.body.zaposlenik = JSON.parse(req.body.zaposlenik);

  const oglasURL = `${req.protocol}://${req.get("host")}/oglasi`;

  if (req.body.status == "specificni") {
    req.body.zaposlenik.forEach(async (n, i) => {
      const korisnik = await User.findById(n);
      await new Email(korisnik, oglasURL).slanjeSpecificnogOglasa();
    });
  }
  if (req.body.status == "agencijski") {
    const zaposlenici = await User.find({ uloga: "korisnik" });
    zaposlenici.forEach(async (n, i) => {
      const korisnik = await User.findById(n);
      await new Email(korisnik, oglasURL).slanjeAgencijskogOglasa();
    });
  }
  if (req.body.status == "generalni") {
    const zaposlenici = await User.find();
    zaposlenici.forEach(async (n, i) => {
      const korisnik = await User.findById(n);
      await new Email(korisnik, oglasURL).slanjeGeneralnogOglasa();
    });
  }
  req.body.zaposlenikTrenutni = req.body.zaposlenik;
  next();
});

exports.oglasForma = catchAsync(async (req, res, next) => {
  const vodici = await User.find({ uloga: "zaposlenik" });
  res.status(200).render("kreiranjeOglasaForma", {
    vodici,
    status: req.status,
  });
});

exports.getOdredjeniOglas = catchAsync(async (req, res, next) => {
  const oglas = await Oglas.findById(req.params.id);

  if (oglas.status == "agencijski" && req.user.status == "turist") {
    return next(new AppError("Povjerljivi podatci!", 400));
  }
  if (
    oglas.status == "specificni" &&
    !oglas.zaposlenikTrenutni.includes(req.user.id) &&
    req.status != "admin"
  ) {
    return next(new AppError("Povjerljivi podatci!", 400));
  }

  res.status(200).render("prikazJednogOglasa", {
    oglas,
    status: req.status,
  });
});

exports.parsiranjeZaBrisanje = catchAsync(async (req, res, next) => {
  if (req.status === "admin") {
    return next();
  }

  const oglas = await Oglas.findById(req.params.id);
  if (!oglas) {
    return next(new AppError("Nepostojeći oglas", 400));
  }
  let zaposlenikTrenutni = [];

  for (let el in oglas.zaposlenikTrenutni) {
    if (oglas.zaposlenikTrenutni[el] == req.user.id) {
    } else {
      zaposlenikTrenutni.push(oglas.zaposlenikTrenutni[el]);
    }
  }
  req.body.zaposlenikTrenutni = zaposlenikTrenutni;
  const doc = await Oglas.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
exports.spremanjeOglasa = factory.createOne(Oglas);
exports.getOglasi = factory.getAll(Oglas);
exports.brisanjeOglasa = factory.deleteOne(Oglas);
