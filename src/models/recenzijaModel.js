// review / rating / createdAt / ref to tour / ref to user
const mongoose = require("mongoose");
const Ponuda = require("./ponudaModel");

const recenzijaSchema = new mongoose.Schema(
  {
    komentar: {
      type: String,
      required: [true, "Recenzija mora imati komentar!"],
    },
    ocjena: {
      type: Number,
      min: 1,
      max: 5,
    },
    datumKreacije: {
      type: Date,
      default: Date.now,
    },
    ponuda: {
      type: mongoose.Schema.ObjectId,
      ref: "Ponuda",
      required: [true, "Recenzija mora odgovarati određenoj ponudi."],
    },
    rezervacija: {
      type: mongoose.Schema.ObjectId,
      ref: "Rezervacija",
      required: [true, "Recenzija mora odgovarati određenoj rezervaciji"],
    },
    korisnik: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Recenzija mora odgovarati određenom korisniku."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recenzijaSchema.statics.dobivanjeNoveOcjenePonude = async function (ponudaId) {
  const stats = await this.aggregate([
    {
      $match: { ponuda: ponudaId },
    },
    {
      $group: {
        _id: "$ponuda",
        brojRecenzija: { $sum: 1 },
        prosjecnaOcjenaRecenzija: { $avg: "$ocjena" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Ponuda.findByIdAndUpdate(ponudaId, {
      brojRecenzija: stats[0].brojRecenzija,
      ocjena: stats[0].prosjecnaOcjenaRecenzija,
    });
  } else {
    await Ponuda.findByIdAndUpdate(ponudaId, {
      brojRecenzija: 0,
      ocjena: 4,
    });
  }
};

recenzijaSchema.post("save", function () {
  this.constructor.dobivanjeNoveOcjenePonude(this.ponuda);
});

// findByIdAndUpdate
// findByIdAndDelete
recenzijaSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

recenzijaSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.dobivanjeNoveOcjenePonude(this.r.ponuda);
});
/*
recenzijaSchema.index({ tour: 1, user: 1 }, { unique: true });
*/
recenzijaSchema.pre(/^find/, function (next) {
  this.populate({
    path: "korisnik",
    select: "korisnickoIme fotografija",
  });
  next();
});
/*
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

recenzijaSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
*/
const Recenzija = mongoose.model("Recenzija", recenzijaSchema);

module.exports = Recenzija;
