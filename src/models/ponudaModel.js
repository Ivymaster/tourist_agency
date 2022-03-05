const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require("./User");
const validator = require("validator");

const ponudaSchema = new mongoose.Schema(
  {
    naziv: {
      type: String,
      required: [true, "Ponuda mora imati naziv!"],
      unique: true,
      trim: true,
      maxlength: [40, "Naziv ponude može imati maksimalno 40 slova!"],
    },
    slug: String,
    duracija: {
      type: Number,
      required: [true, "Ponuda mora imati naznačenu duraciju!"],
    },
    velicinaGrupe: {
      type: Number,
      required: [true, "Ponuda mora imati ograničen maksimalni broj osoba!"],
    },
    brojSlobodnih: [
      {
        type: Number,
        default: this.velicinaGrupe,
        max: this.velicinaGrupe,
        min: 0,
      },
    ],
    ocjena: {
      type: Number,
      default: 4,
      min: [1, "Ocjena mora biti veća od 1!"],
      max: [5, "Ocjena mora biti manja od 5!"],
      set: (val) => Math.round(val * 10) / 10,
    },
    brojRecenzija: {
      type: Number,
      default: 0,
    },
    pocetnaCijena: {
      type: Number,
      required: [true, "Ponuda mora imati cijenu!"],
    },
    krajnjaCijena: {
      type: Number,
      required: [true, "Ponuda mora imati cijenu!"],
      default: this.pocetnaCijena,
    },
    dodatakNaCijenu: {
      type: Number,
      default: 0,
    },
    opis: [
      {
        type: String,
        trim: true,
      },
    ],
    pocetnaSlika: {
      type: String,
      required: [true, "Ponuda mora imati glavnu sliku!"],
      default: "default.jpg",
    },
    slike: [String],
    datumKreacije: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    pocetniDatumi: [Date],
    pocetnaLokacija: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      adresa: String,
      redniBroj: Number,
      dan: Number,
    },
    lokacije: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        adresa: String,
        redniBroj: Number,
        dan: Number,
      },
    ],
    vodici: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      default: "obrisano",
    },
    kljucneRijeci: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indeksiranje, za brzu i efikasniju pretragu, po određenim atributima
ponudaSchema.index({ krajnjaCijena: 1, ocjena: -1 });
ponudaSchema.index({ slug: 1 });
ponudaSchema.index({ pocetnaLokacija: "2dsphere" });

// Virtualno populiranje
ponudaSchema.virtual("recenzije", {
  ref: "Recenzija",
  foreignField: "ponuda",
  localField: "_id",
});

////// Middleware za DOKUMENTE //////
// Prije spremanja ponude krerianje sluga, mozda ce isti biti koristen za URL
ponudaSchema.pre("save", function (next) {
  this.slug = slugify(this.naziv, { lower: true });
  /*const dodatakKljucnimRijecima = this.naziv.toLowerCase().split(" ");
  console.log(dodatakKljucnimRijecima)
  this.kljucneRijeci = this.kljucneRijeci.concat(dodatakKljucnimRijecima);
  console.log(this.kljucneRijeci)
*/
  next();
});

////// Middleware za QUERIJE //////
// ponudaSchema.pre('find', function(next) {
ponudaSchema.pre(/^findByIdAnd/, function (next) {
  console.log("Bsddsadas");

  /*this.slug = slugify(this.naziv, { lower: true });
  const dodatakKljucnimRijecima = this.naziv.toLowerCase().split(" ");
  console.log(dodatakKljucnimRijecima)
  this.kljucneRijeci = this.kljucneRijeci.concat(dodatakKljucnimRijecima);
  console.log(this.kljucneRijeci)*/

  next();
});
ponudaSchema.pre(/^find/, function (next) {
  console.log("Asddsadas");

  this.populate({
    path: "vodici",
    select: "-__v ",
  });

  next();
});

const Ponuda = mongoose.model("Ponuda", ponudaSchema);

module.exports = Ponuda;
