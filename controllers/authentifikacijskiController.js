const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Korisnik = require('./../models/korisnikModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

// Funkcija za kreiranje JWT tokena, uz predavanje tajne rijeci i vremena isteka
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// funkcija za slanje JWT tokena
const kreiranjeSendToken = (korisnik, statusCode, res) => {
  const token = signToken(korisnik._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  korisnik.sifra = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      korisnik
    }
  });
};

// Middleware  za registraciju novih korisnika, uz spremanje istog i slanje email dobrodoslice
exports.registracija = catchAsync(async (req, res, next) => {
  const noviKorisnik = await Korisnik.create({
    korisnickoIme: req.body.username,
    ime: req.body.firstname,
    prezime: req.body.lastname,
    email: req.body.email,
    sifra: req.body.password,
    potvrdnaSifra: req.body.passwordConfirm,
    uloga: req.body.role,
    fotografija: 'default.jpg'
  });
  // Slanje e-maila novom korisniku
  await new Email(noviKorisnik, '').slanjeDobrodosliceMaila();
  kreiranjeSendToken(noviKorisnik, 201, res);
});

// Middleware za vršenje prijave korisnika, uz predavanje sifre i korisnickog imena - provjera hashirane sifre
exports.prijava = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
 
  if (!username || !password) {
    return next(new AppError('Molimo Vas, unesite sve podatke!', 400));
  }
  const korisnik = await Korisnik.findOne({ korisnickoIme: username, aktivnost:true }).select('+sifra');

  if (!korisnik || !(await korisnik.provjeraSifre(password, korisnik.sifra))) {
    return next(new AppError('Netacno ime ili sifra!', 401));
  }
  kreiranjeSendToken(korisnik, 200, res);
});

// Middleware za odjavu korisnika, kreiranje "nevaznog" tokena, sa kratkim vremenom isteka
exports.odjava = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.redirect('/');
};

// Middleware za zastitu određenih ruta, uz provjeru postojanja tokena ili kolacica, verifikacija istog, i uspredba datuma 
// promjene sifre u odnosu na datum izdavanja tokena
exports.zastita = catchAsync(async (req, res, next) => {
  // Provjera postojanosti tokena ili kolačića
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;

  } else {
    return next(
      new AppError(
        'Niste prijavljeni. Molimo Vas da se prijavite se da biste dobili pristup!',
        401
      )
    );
  }

  // Verifikacija tokena
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Provjera postojanja korisnika u bazi
  const trenutniKorisnik = await Korisnik.findById(decoded.id);
  if (!trenutniKorisnik) {
    return next(new AppError('Korisnik s ovim tokenom vise ne postoji.', 401));
  }

  // Provjera datuma promjene sifre u odnosu na datum izdavanja tokena
  if (trenutniKorisnik.vrijemePromjeneSifre(decoded.iat)) {
    return next(
      new AppError(
        'Korisnik je promijenio sifru. Molimo Vas da se ponovo prijavite.',
        401
      )
    );
  }

  req.user = trenutniKorisnik;
  res.locals.user = trenutniKorisnik;
  next();
});

// Only for rendered pages, no errors!
exports.provjeraPrijavljenosti = async (req, res, next) => {
  // za status
  req.status = 'none';
   if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const tretnutniKorisnik = await Korisnik.findById(decoded.id);
      if (!tretnutniKorisnik) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (tretnutniKorisnik.vrijemePromjeneSifre(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      req.user = tretnutniKorisnik;
      req.status = req.user.uloga;
      res.locals.user = tretnutniKorisnik;
       return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Middleware za onemogućavanje pristupanaj rutama korisnicima specificne uloge (admin, zaposlenik, turist)
exports.onemogucavanjeZaUloge = (...uloge) => {
  return (req, res, next) => {
    if (!uloge.includes(req.user.uloga)) {
      return next(new AppError('Nemate dopustenje za ovu radnju.', 403));
    }

    next();
  };
};

// Middleware za fju obavljanja zamjene zaboravljene sifre, na osnovu predane email adrese, uz generiranje privremenog reset tokena
// i slanja istog na mail
exports.zaboravljenaSifra = catchAsync(async (req, res, next) => {
  
  const korisnik = await Korisnik.findOne({ email: req.body.email });
  if (!korisnik) {
    return next(new AppError('Ne postoji korisnik s ovom email adresom.', 404));
  }

  // Generiranje privremenog reset tokena, i spremanje nehashirane vrijednosti u bazu
  const resetToken = korisnik.kreiranjeResetTokenaZaSifru();
  await korisnik.save({ validateBeforeSave: false });

  // Slanje maila sa linkom na rutu za promjenu sifre, uz reset token u vidu parametra
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/podatci/korisnici/resetSifre/${resetToken}`;
    await new Email(korisnik, resetURL).slanjeSifraResetMaila();

    res.status(200).json({
      status: 'success',
      message: 'Token poslan na mail.'
    });
  } catch (err) {
    korisnik.resetToken = undefined;
    korisnik.datumIstekaResetTokena = undefined;
    await korisnik.save({ validateBeforeSave: false });

    return next(
      new AppError('Postoji problem sa slanjem mail-a. Pokusajte kasnije.'),
      500
    );
  }
});

// Middleware za fju promjenu zaboravljane sifre, spremanje nove finalne sifre
exports.resetSifre = catchAsync(async (req, res, next) => {
   const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
 
  // Dobivanje korisnika na osnovu privremenog tokena, i datuma izdavanja tokena veceg od danasnjeg
  const korisnik = await Korisnik.findOne({
    resetToken: hashedToken,
    datumIstekaResetTokena: { $gt: Date.now() }
  });

  if (!korisnik) {
    return next(new AppError('Tokenje nevazeci ili istekao.', 400));
  }

  // Spremanj nove sifre, i brisanje reset tokena, i datuma izdavanja reset tokena
  korisnik.sifra = req.body.password;
  korisnik.potvrdnaSifra = req.body.passwordConfirm;
  korisnik.resetToken = undefined;
  korisnik.datumIstekaResetTokena = undefined;
  await korisnik.save();
  // Slanje novog kolacica, za autentifikaciju
  kreiranjeSendToken(korisnik, 200, res);
});

// Middleware za promjenu poznate sifre, uz provjeru tacnosti trenutne sifre, i postavljanje nove
exports.azuriranjeSifre = catchAsync(async (req, res, next) => {

  const korisnik = await Korisnik.findById(req.user.id).select('+sifra');

  // provjera podudaranja trentne predane sifre putem forme, kao i sifre trenutnog korisnika na osnovu zastitnih Middlewara
  if (!(await korisnik.provjeraSifre(req.body.passwordCurrent, korisnik.sifra))) {
    return next(new AppError('Vasa trenutna sifra je netacna.', 401));
  }

  korisnik.sifra = req.body.password;
  korisnik.potvrdnaSifra = req.body.passwordConfirm;
  await korisnik.save();
  kreiranjeSendToken(korisnik, 200, res);
});
