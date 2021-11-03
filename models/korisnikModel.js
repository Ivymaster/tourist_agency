const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const korisnikShema = new mongoose.Schema({
  korisnickoIme: {
    type: String,
    unique: true,
    required: [true, 'Potrebno unijeti korisnicko ime!']
  },
  ime: {
    type: String,
    required: [true, 'Potrebno unijeti ime!']
  },
  prezime: {
    type: String,
    required: [true, 'Potrebno unijeti prezime!']
  },
  email: {
    type: String,
    required: [true, 'Potrebno unijeti email adresu!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Potrebno unijeti validnu email adresu!']
  },
  fotografija: String,
  uloga: {
    type: String,
    enum: {
      values: ['admin', 'zaposlenik', 'turist'],
      message: 'Korisnik može biti: admin, zaposlenik, turist'
    },
    required: [true, 'Unesite tip korisnika!'],
    default: 'turist'
  },
  sifra: {
    type: String,
    required: [true, 'Unesite sifru!'],
    minlength: 8,
    select: false
  },
  potvrdnaSifra: {
    type: String,
    required: [true, 'Potrebna potvrda šifre!'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.sifra;
      },
      message: 'Šifre se ne podudaraju!'
    }
  },
  datumPromjeneSifre: Date,
  resetToken: String,
  datumIstekaResetTokena: Date,
  aktivnost: {
    type: Boolean,
    default: true,
   },
  
  datumKreacije: {
    type: Date,
    default: Date.now(),
   },
  
});


////// Middleware za DOKUMENTE //////
// Hashiranje sifre prije spremanja korisnika
korisnikShema.pre('save', async function(next) {
  if (!this.isModified('sifra')) 
    return next();
  this.sifra = await bcrypt.hash(this.sifra, 12);
  this.potvrdnaSifra = undefined;
  next();
});

//Spremanje datuma promjene sifre
korisnikShema.pre('save', function(next) {
  if (!this.isModified('sifra') || this.isNew) 
    return next();
  this.datumPromjeneSifre = Date.now() - 1000;
  next();
});

////// Middleware za QUERIJE //////
// Dobijanje samo aktivnih korisnika
/*korisnikShema.pre(/^find/, function(next) {
  this.find({ aktivnost: { $ne: false } });
  next();
});*/


///////// METODE ZA INSTANCU /////////////////
// Metoda na instanci za provjeru predane sifre
korisnikShema.methods.provjeraSifre = async function(
  predanaSifra,
  korisnickaSifra
) {
  return await bcrypt.compare(predanaSifra, korisnickaSifra);
};

// Metoda na instanci za provjeru vremena promjene sifre
korisnikShema.methods.vrijemePromjeneSifre = function(JWTTimestamp) {
  if (this.datumPromjeneSifre) {
    const vrijemePromjene = parseInt(
      this.datumPromjeneSifre.getTime() / 1000,
      10
    );

    return JWTTimestamp < vrijemePromjene;
  }
  return false;
};

korisnikShema.methods.kreiranjeResetTokenaZaSifru = function() {
  const noviResetToken = crypto.randomBytes(32).toString('hex');

  this.resetToken = crypto
    .createHash('sha256')
    .update(noviResetToken)
    .digest('hex');


  this.datumIstekaResetTokena = Date.now() + 10 * 60 * 1000;

  return noviResetToken;
};

const Korisnik = mongoose.model('Korisnik', korisnikShema);

module.exports = Korisnik;
